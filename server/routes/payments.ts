import type { FastifyInstance } from "fastify";
import { ClaimStatus, PaymentVerificationStatus } from "@prisma/client";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const submitProofSchema = z.object({
  paymentId: z.string().uuid(),
  senderName: z.string().min(1),
});

function parseSettingNumber(value: unknown, fallback: number): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export async function paymentRoutes(app: FastifyInstance) {
  app.get("/current", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };

    const claim = await prisma.pesantrenClaim.findFirst({
      where: { userId: payload.sub },
      orderBy: { createdAt: "desc" },
    });

    if (!claim) {
      return {
        accessDeniedReason: "Anda belum mendaftarkan pesantren.",
      };
    }

    if (claim.status === ClaimStatus.pending) {
      return {
        accessDeniedReason: "Menunggu verifikasi dari Admin Wilayah. Silakan tunggu proses validasi dokumen Anda.",
      };
    }

    if (claim.status === ClaimStatus.rejected) {
      return {
        accessDeniedReason: "Pengajuan Anda ditolak oleh Admin Wilayah. Silakan hubungi admin untuk informasi lebih lanjut.",
      };
    }

    if (claim.status === ClaimStatus.approved || claim.status === ClaimStatus.pusat_approved) {
      return { redirectTo: "/user" };
    }

    if (claim.status !== ClaimStatus.regional_approved) {
      return {
        accessDeniedReason: "Status pengajuan tidak valid untuk pembayaran.",
      };
    }

    const priceKey = claim.jenisPengajuan === "klaim" ? "claim_base_price" : "registration_base_price";
    const priceSetting = await prisma.systemSetting.findFirst({ where: { key: priceKey } });
    const baseAmount = parseSettingNumber(priceSetting?.value, 50000);

    const bankName = await prisma.systemSetting.findFirst({ where: { key: "bank_name" } });
    const bankAccountNumber = await prisma.systemSetting.findFirst({ where: { key: "bank_account_number" } });
    const bankAccountName = await prisma.systemSetting.findFirst({ where: { key: "bank_account_name" } });

    let payment = await prisma.payment.findFirst({
      where: {
        userId: payload.sub,
        pesantrenClaimId: claim.id,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!payment) {
      const uniqueCode = Math.floor(Math.random() * 900) + 100;
      payment = await prisma.payment.create({
        data: {
          userId: payload.sub,
          pesantrenClaimId: claim.id,
          baseAmount,
          uniqueCode,
          totalAmount: baseAmount + uniqueCode,
          status: PaymentVerificationStatus.pending_payment,
        },
      });
    }

    if (payment.status === PaymentVerificationStatus.pending_verification) {
      return { redirectTo: "/payment-pending" };
    }

    if (payment.status === PaymentVerificationStatus.verified) {
      return { redirectTo: "/user" };
    }

    return {
      payment: {
        id: payment.id,
        baseAmount: payment.baseAmount,
        uniqueCode: payment.uniqueCode,
        totalAmount: payment.totalAmount,
        status: payment.status,
        rejectionReason: payment.rejectionReason,
      },
      claim: {
        id: claim.id,
        pesantren_name: claim.pesantrenName,
        jenis_pengajuan: claim.jenisPengajuan,
        status: claim.status,
      },
      bankInfo: {
        bank: String(bankName?.value || "Bank Syariah Indonesia (BSI)"),
        accountNumber: String(bankAccountNumber?.value || "7171234567890"),
        accountName: String(bankAccountName?.value || "MEDIA PONDOK JAWA TIMUR"),
      },
    };
  });

  app.post("/submit-proof", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const fields: Record<string, string> = {};
    let filePart: Awaited<ReturnType<typeof request.file>> | null = null;

    for await (const part of request.parts()) {
      if (part.type === "field") {
        fields[part.fieldname] = String(part.value || "");
      } else if (part.type === "file") {
        filePart = part;
      }
    }

    if (!filePart) {
      return reply.status(400).send({ message: "File bukti transfer wajib diupload" });
    }

    const parsed = submitProofSchema.safeParse({
      paymentId: fields.paymentId,
      senderName: fields.senderName,
    });

    if (!parsed.success) {
      return reply.status(400).send({ message: "Data pembayaran tidak valid" });
    }

    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
    if (!allowed.has(filePart.mimetype)) {
      return reply.status(400).send({ message: "Format file tidak didukung" });
    }

    const buffer = await filePart.toBuffer();
    if (buffer.byteLength > 350 * 1024) {
      return reply.status(400).send({ message: "Ukuran file melebihi 350KB" });
    }

    const payment = await prisma.payment.findUnique({ where: { id: parsed.data.paymentId } });
    if (!payment || payment.userId !== payload.sub) {
      return reply.status(404).send({ message: "Pembayaran tidak ditemukan" });
    }

    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const ext = (filePart.filename.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
    const relativePath = `payment-proofs/${payload.sub}/${Date.now()}.${ext}`;
    const outputPath = path.join(process.cwd(), "uploads", relativePath);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, buffer);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        proofFileUrl: `/uploads/${relativePath}`,
        status: PaymentVerificationStatus.pending_verification,
        rejectionReason: null,
      },
    });

    return { success: true };
  });
}
