import { AppRole, ClaimStatus, RegistrationType } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const initialDataSchema = z.object({
  namaPesantren: z.string().min(1),
  namaPengasuh: z.string().min(1),
  alamatLengkap: z.string().min(1),
  cityId: z.string().uuid(),
  kecamatan: z.string().min(1),
  namaPengelola: z.string().min(1),
  emailPengelola: z.string().email(),
  noWhatsapp: z.string().min(8),
  dokumenBuktiUrl: z.string().nullable().optional(),
});

const locationSchema = z.object({
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
});

export async function institutionRoutes(app: FastifyInstance) {
  app.get("/ownership", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };

    const claim = await prisma.pesantrenClaim.findFirst({
      where: { userId: payload.sub },
      orderBy: { createdAt: "desc" },
    });

    if (!claim) return { claim: null };

    return {
      claim: {
        id: claim.id,
        status: claim.status,
        pesantren_name: claim.pesantrenName,
        jenis_pengajuan: claim.jenisPengajuan,
      },
    };
  });

  app.post("/upload-registration-document", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };

    const file = await request.file();
    if (!file) {
      return reply.status(400).send({ message: "File is required" });
    }

    const allowed = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
    if (!allowed.has(file.mimetype)) {
      return reply.status(400).send({ message: "File type is not supported" });
    }

    const buffer = await file.toBuffer();
    if (buffer.byteLength > 350 * 1024) {
      return reply.status(400).send({ message: "File size exceeds 350KB" });
    }

    const ext = (file.filename.split(".").pop() || "bin").toLowerCase();
    const safeExt = ext.replace(/[^a-z0-9]/g, "") || "bin";
    const relativePath = `registration-documents/${payload.sub}/${Date.now()}.${safeExt}`;

    // save under ./uploads
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const outputPath = path.join(process.cwd(), "uploads", relativePath);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, buffer);

    return {
      path: `/uploads/${relativePath}`,
    };
  });

  app.post("/initial-data", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const body = initialDataSchema.parse(request.body);

    const city = await prisma.city.findUnique({
      where: { id: body.cityId },
      include: { region: true },
    });

    if (!city) {
      throw new Error("City not found");
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: payload.sub },
        data: {
          role: AppRole.user,
          namaPesantren: body.namaPesantren,
          namaPengasuh: body.namaPengasuh,
          alamatSingkat: body.alamatLengkap,
          cityId: city.id,
          regionId: city.regionId,
          noWaPendaftar: body.noWhatsapp,
          statusAccount: "pending",
        },
      });

      const existing = await tx.pesantrenClaim.findFirst({ where: { userId: payload.sub } });

      if (existing) {
        await tx.pesantrenClaim.update({
          where: { id: existing.id },
          data: {
            pesantrenName: body.namaPesantren,
            status: ClaimStatus.pending,
            jenisPengajuan: RegistrationType.pesantren_baru,
            regionId: city.regionId,
            kecamatan: body.kecamatan,
            namaPengelola: body.namaPengelola,
            emailPengelola: body.emailPengelola,
            dokumenBuktiUrl: body.dokumenBuktiUrl ?? null,
          },
        });
      } else {
        await tx.pesantrenClaim.create({
          data: {
            userId: payload.sub,
            pesantrenName: body.namaPesantren,
            status: ClaimStatus.pending,
            jenisPengajuan: RegistrationType.pesantren_baru,
            regionId: city.regionId,
            kecamatan: body.kecamatan,
            namaPengelola: body.namaPengelola,
            emailPengelola: body.emailPengelola,
            dokumenBuktiUrl: body.dokumenBuktiUrl ?? null,
          },
        });
      }
    });

    return {
      success: true,
      region: {
        id: city.region.id,
        name: city.region.name,
        code: city.region.code,
      },
    };
  });

  app.post("/location", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const body = locationSchema.parse(request.body);

    await prisma.profile.update({
      where: { id: payload.sub },
      data: {
        latitude: body.latitude ?? undefined,
        longitude: body.longitude ?? undefined,
      },
    });

    return { success: true };
  });

  app.get("/pending-status", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };

    const claim = await prisma.pesantrenClaim.findFirst({
      where: { userId: payload.sub },
      include: { region: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    if (!claim) {
      return { claim: null, region: null };
    }

    return {
      claim: {
        pesantren_name: claim.pesantrenName,
        nama_pengelola: claim.namaPengelola,
        region_id: claim.regionId,
        status: claim.status,
        jenis_pengajuan: claim.jenisPengajuan,
      },
      region: claim.region
        ? {
            name: claim.region.name,
            admin_phone: "6281234567890",
          }
        : null,
    };
  });
}
