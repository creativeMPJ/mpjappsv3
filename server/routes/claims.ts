import type { FastifyInstance } from "fastify";
import { AppRole, ClaimStatus } from "@prisma/client";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const searchSchema = z.object({
  query: z.string().min(1),
});

const sendOtpSchema = z.object({
  claimId: z.string().uuid(),
});

const verifyOtpSchema = z.object({
  otpCode: z.string().regex(/^\d{6}$/),
  otpId: z.string().uuid().optional(),
  claimId: z.string().uuid().optional(),
});

const contactParamsSchema = z.object({
  claimId: z.string().uuid(),
});

async function assertRegionalAdmin(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, regionId: true },
  });

  if (!profile || profile.role !== AppRole.admin_regional || !profile.regionId) {
    const error = new Error("Forbidden");
    (error as any).statusCode = 403;
    throw error;
  }

  return profile.regionId;
}

const MAX_OTP_PER_HOUR = 3;

function maskPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length < 4) return "***";
  return `***${clean.slice(-4)}`;
}

export async function claimRoutes(app: FastifyInstance) {
  app.get("/pending-count", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegionalAdmin(payload.sub);

    const count = await prisma.pesantrenClaim.count({
      where: {
        regionId,
        status: ClaimStatus.pending,
      },
    });

    return { count };
  });

  app.get("/search", async (request) => {
    const parsed = searchSchema.safeParse({ query: (request.query as any)?.query || "" });
    if (!parsed.success) {
      return { results: [] };
    }

    const q = parsed.data.query.trim();
    if (!q) return { results: [] };

    const results = await prisma.pesantrenClaim.findMany({
      where: {
        OR: [
          { pesantrenName: { contains: q, mode: "insensitive" } },
          { emailPengelola: { contains: q, mode: "insensitive" } },
        ],
        status: { notIn: [ClaimStatus.approved, ClaimStatus.pusat_approved] },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    return {
      results: results.map((r) => ({
        id: r.id,
        pesantren_name: r.pesantrenName,
        kecamatan: r.kecamatan,
        nama_pengelola: r.namaPengelola,
        email_pengelola: r.emailPengelola,
        region_id: r.regionId,
        user_id: r.userId,
        status: r.status,
      })),
    };
  });

  app.post("/send-otp", async (request, reply) => {
    const body = sendOtpSchema.parse(request.body);

    const claim = await prisma.pesantrenClaim.findUnique({ where: { id: body.claimId } });
    if (!claim) return reply.status(404).send({ message: "Claim tidak ditemukan" });

    const profile = await prisma.profile.findUnique({
      where: { id: claim.userId },
      select: { noWaPendaftar: true },
    });

    const phone = profile?.noWaPendaftar?.trim();
    if (!phone) {
      return reply.status(400).send({ message: "Nomor WhatsApp tidak tersedia untuk akun ini" });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const count = await prisma.otpVerification.count({
      where: {
        userPhone: phone,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (count >= MAX_OTP_PER_HOUR) {
      return reply.status(429).send({ message: "Terlalu banyak permintaan OTP. Coba lagi dalam 1 jam." });
    }

    await prisma.otpVerification.updateMany({
      where: { userPhone: phone, isVerified: false },
      data: { isVerified: true },
    });

    const otpCode = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otp = await prisma.otpVerification.create({
      data: {
        userPhone: phone,
        otpCode,
        pesantrenClaimId: claim.id,
        expiresAt,
      },
    });

    return {
      success: true,
      message: "Kode OTP telah dikirim ke nomor WhatsApp yang terdaftar",
      otp_id: otp.id,
      expires_at: expiresAt.toISOString(),
      phone_masked: maskPhone(phone),
      // local testing only; remove when real WA gateway is integrated
      debug_otp: otpCode,
    };
  });

  app.post("/verify-otp", async (request, reply) => {
    const body = verifyOtpSchema.parse(request.body);

    const queryWhere: any = {
      isVerified: false,
      expiresAt: { gt: new Date() },
    };

    if (body.otpId) {
      queryWhere.id = body.otpId;
    }

    if (body.claimId) {
      queryWhere.pesantrenClaimId = body.claimId;
    }

    const otp = await prisma.otpVerification.findFirst({
      where: queryWhere,
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return reply.status(400).send({
        error: "Kode OTP tidak ditemukan atau sudah kadaluarsa",
        expired: true,
      });
    }

    if (otp.attempts >= 5) {
      return reply.status(400).send({
        error: "Terlalu banyak percobaan. Silakan minta kode OTP baru.",
        max_attempts: true,
      });
    }

    if (otp.otpCode !== body.otpCode) {
      await prisma.otpVerification.update({
        where: { id: otp.id },
        data: { attempts: otp.attempts + 1 },
      });

      return reply.status(400).send({
        error: "Kode OTP salah",
        attempts_remaining: 5 - (otp.attempts + 1),
      });
    }

    await prisma.otpVerification.update({
      where: { id: otp.id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    if (otp.pesantrenClaimId) {
      await prisma.pesantrenClaim.update({
        where: { id: otp.pesantrenClaimId },
        data: {
          status: ClaimStatus.pending,
          updatedAt: new Date(),
        },
      });
    }

    return {
      success: true,
      message: "Verifikasi berhasil",
      pesantren_claim_id: otp.pesantrenClaimId,
    };
  });

  app.get("/contact/:claimId", async (request, reply) => {
    const parsed = contactParamsSchema.safeParse(request.params);
    if (!parsed.success) {
      return reply.status(400).send({ message: "claimId tidak valid" });
    }

    const claim = await prisma.pesantrenClaim.findUnique({
      where: { id: parsed.data.claimId },
      select: {
        id: true,
        regionId: true,
        namaPengelola: true,
        pesantrenName: true,
      },
    });

    if (!claim) {
      return reply.status(404).send({ message: "Claim tidak ditemukan" });
    }

    let adminPhone = "6281234567890";
    if (claim.regionId) {
      const regionalAdmin = await prisma.profile.findFirst({
        where: {
          role: "admin_regional",
          regionId: claim.regionId,
          noWaPendaftar: { not: null },
        },
        select: { noWaPendaftar: true },
        orderBy: { updatedAt: "desc" },
      });

      if (regionalAdmin?.noWaPendaftar) {
        adminPhone = regionalAdmin.noWaPendaftar;
      }
    }

    return {
      claim: {
        id: claim.id,
        pesantren_name: claim.pesantrenName,
        nama_pengaju: claim.namaPengelola,
      },
      region: {
        admin_phone: adminPhone,
      },
    };
  });
}
