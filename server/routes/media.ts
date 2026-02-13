import type { FastifyInstance } from "fastify";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";
import { z } from "zod";

const createCrewSchema = z.object({
  nama: z.string().min(1),
  jabatanCodeId: z.string().uuid().optional().nullable(),
  jabatan: z.string().optional().nullable(),
});

const updateCrewSchema = z.object({
  nama: z.string().min(1),
  jabatan: z.string().optional().nullable(),
});

export async function mediaRoutes(app: FastifyInstance) {
  app.get("/jabatan-codes", { preHandler: authenticate }, async () => {
    const codes = await prisma.jabatanCode.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, description: true },
    });

    return {
      jabatan_codes: codes,
    };
  });

  app.get("/crew", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };

    const crews = await prisma.crew.findMany({
      where: { profileId: payload.sub },
      include: {
        jabatanCode: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      crews: crews.map((crew) => ({
        id: crew.id,
        nama: crew.nama,
        jabatan: crew.jabatan,
        niam: crew.niam,
        xp_level: crew.xpLevel,
        jabatan_code_id: crew.jabatanCodeId,
        jabatan_code: crew.jabatanCode,
      })),
    };
  });

  app.post("/crew", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const body = createCrewSchema.parse(request.body);

    const profile = await prisma.profile.findUnique({
      where: { id: payload.sub },
      include: { region: true },
    });
    if (!profile) {
      return reply.status(404).send({ message: "Profile tidak ditemukan" });
    }

    let niAm: string | null = null;
    let jabatanName = body.jabatan || null;

    if (body.jabatanCodeId) {
      const code = await prisma.jabatanCode.findUnique({ where: { id: body.jabatanCodeId } });
      if (code) {
        jabatanName = code.name;

        if (profile.nip && profile.region?.code) {
          const crewCount = await prisma.crew.count({ where: { profileId: payload.sub } });
          const crewSeq = String(crewCount + 1).padStart(2, "0");
          niAm = `${code.code}${profile.nip}${crewSeq}`;
        }
      }
    }

    const created = await prisma.crew.create({
      data: {
        profileId: payload.sub,
        nama: body.nama,
        jabatan: jabatanName,
        jabatanCodeId: body.jabatanCodeId ?? null,
        niam: niAm,
      },
      include: {
        jabatanCode: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return {
      crew: {
        id: created.id,
        nama: created.nama,
        jabatan: created.jabatan,
        niam: created.niam,
        xp_level: created.xpLevel,
        jabatan_code_id: created.jabatanCodeId,
        jabatan_code: created.jabatanCode,
      },
    };
  });

  app.put("/crew/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });
    const body = updateCrewSchema.parse(request.body);

    const crew = await prisma.crew.findUnique({ where: { id: params.id } });
    if (!crew || crew.profileId !== payload.sub) {
      return reply.status(404).send({ message: "Kru tidak ditemukan" });
    }

    const updated = await prisma.crew.update({
      where: { id: params.id },
      data: {
        nama: body.nama,
        jabatan: body.jabatan ?? null,
      },
    });

    return {
      crew: {
        id: updated.id,
        nama: updated.nama,
        jabatan: updated.jabatan,
        niam: updated.niam,
        xp_level: updated.xpLevel,
      },
    };
  });

  app.delete("/crew/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });

    const crew = await prisma.crew.findUnique({ where: { id: params.id } });
    if (!crew || crew.profileId !== payload.sub) {
      return reply.status(404).send({ message: "Kru tidak ditemukan" });
    }

    await prisma.crew.delete({ where: { id: params.id } });
    return { success: true };
  });

  app.get("/dashboard-context", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };

    const [claim, koordinator] = await Promise.all([
      prisma.pesantrenClaim.findFirst({
        where: { userId: payload.sub },
        select: {
          regionalApprovedAt: true,
          approvedAt: true,
          status: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.crew.findFirst({
        where: {
          profileId: payload.sub,
          jabatan: "Koordinator",
        },
        select: {
          nama: true,
          niam: true,
          jabatan: true,
          xpLevel: true,
        },
      }),
    ]);

    return {
      regionalApprovedAt: claim?.regionalApprovedAt || null,
      pusatApprovedAt: claim?.approvedAt || null,
      koordinator: koordinator
        ? {
            nama: koordinator.nama,
            niam: koordinator.niam,
            jabatan: koordinator.jabatan || "Koordinator",
            xp_level: koordinator.xpLevel || 0,
          }
        : null,
    };
  });
}
