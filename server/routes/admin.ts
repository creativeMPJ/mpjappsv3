import { AppRole, ClaimStatus, PaymentVerificationStatus, ProfileLevel } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const priceSettingsSchema = z.object({
  registrationPrice: z.number().int().positive(),
  claimPrice: z.number().int().positive(),
});

const rejectPaymentSchema = z.object({
  reason: z.string().min(1),
});

const regionParamsSchema = z.object({
  id: z.string().uuid(),
});

const userUpdateSchema = z.object({
  role: z.nativeEnum(AppRole),
  statusAccount: z.enum(["pending", "active", "rejected"]),
  statusPayment: z.enum(["paid", "unpaid"]),
});

const bankSettingsSchema = z.object({
  bankName: z.string().min(1),
  bankAccountNumber: z.string().min(1),
  bankAccountName: z.string().min(1),
});

const addRegionSchema = z.object({
  name: z.string().min(1),
  code: z.string().regex(/^\d{2}$/),
});

const addCitySchema = z.object({
  name: z.string().min(1),
  regionId: z.string().uuid(),
});

const assignRegionalAdminSchema = z.object({
  userId: z.string().uuid(),
  regionId: z.string().uuid(),
});

const jabatanCodeSchema = z.object({
  code: z.string().regex(/^[A-Z]{2,3}$/),
  name: z.string().min(1),
  description: z.string().nullable().optional(),
});

const globalSearchQuerySchema = z.object({
  query: z.string().min(1),
});

const addPusatAssistantSchema = z.object({
  crewId: z.string().uuid(),
});

const adminSettingsAssignSchema = z.object({
  profileId: z.string().uuid(),
  role: z.nativeEnum(AppRole),
  regionId: z.string().uuid().optional().nullable(),
});

const masterDataProfileUpdateSchema = z.object({
  nama_pesantren: z.string().optional(),
  nama_pengasuh: z.string().optional(),
  alamat_singkat: z.string().optional(),
  nama_media: z.string().optional(),
  no_wa_pendaftar: z.string().optional(),
});

const masterDataCrewUpdateSchema = z.object({
  nama: z.string().optional(),
  jabatan: z.string().optional(),
});

const clearingRejectSchema = z.object({
  reason: z.string().min(1).optional(),
});

async function assertAdminPusat(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { id: userId } });
  if (!profile || profile.role !== AppRole.admin_pusat) {
    const error = new Error("Forbidden");
    (error as any).statusCode = 403;
    throw error;
  }
}

export async function adminRoutes(app: FastifyInstance) {
  app.get("/home-summary", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const [totalPesantren, totalKru, totalWilayah, pendingPayments, verifiedPayments, activeProfiles, recentProfiles] =
      await Promise.all([
        prisma.profile.count({ where: { statusAccount: "active" } }),
        prisma.crew.count(),
        prisma.region.count(),
        prisma.payment.count({ where: { status: PaymentVerificationStatus.pending_verification } }),
        prisma.payment.findMany({
          where: { status: PaymentVerificationStatus.verified },
          select: { totalAmount: true },
        }),
        prisma.profile.findMany({
          where: { statusAccount: "active" },
          select: { profileLevel: true },
        }),
        prisma.profile.findMany({
          select: {
            id: true,
            namaPesantren: true,
            nip: true,
            statusAccount: true,
            profileLevel: true,
            createdAt: true,
            region: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 8,
        }),
      ]);

    const levelStats = { basic: 0, silver: 0, gold: 0, platinum: 0 };
    activeProfiles.forEach((p) => {
      if (p.profileLevel in levelStats) {
        levelStats[p.profileLevel as keyof typeof levelStats]++;
      }
    });

    return {
      stats: {
        totalPesantren,
        totalKru,
        totalWilayah,
        pendingPayments,
        totalIncome: verifiedPayments.reduce((sum, p) => sum + p.totalAmount, 0),
      },
      levelStats,
      recentUsers: recentProfiles.map((item) => ({
        id: item.id,
        nama_pesantren: item.namaPesantren,
        nip: item.nip,
        region_name: item.region?.name || "-",
        status_account: item.statusAccount,
        profile_level: item.profileLevel,
        created_at: item.createdAt,
      })),
    };
  });

  app.get("/clearing-house/pending", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const pendingProfiles = await prisma.profile.findMany({
      where: { statusAccount: "pending" },
      include: { city: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
    });

    return {
      profiles: pendingProfiles.map((p) => ({
        id: p.id,
        nama_pesantren: p.namaPesantren,
        nama_pengasuh: p.namaPengasuh,
        city_id: p.cityId,
        created_at: p.createdAt,
        city: p.city ? { name: p.city.name } : null,
      })),
    };
  });

  app.post("/clearing-house/:id/approve", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });

    const profile = await prisma.profile.findUnique({
      where: { id: params.id },
      select: { id: true, region: { select: { code: true } } },
    });
    if (!profile) return reply.status(404).send({ message: "Profil tidak ditemukan" });

    const year = new Date().getFullYear().toString().slice(-2);
    const rr = profile.region?.code || "00";
    const seq = String(Math.floor(100 + Math.random() * 900));
    const nip = `${year}${rr}${seq}`;

    await prisma.profile.update({
      where: { id: params.id },
      data: {
        statusAccount: "active",
        statusPayment: "paid",
        nip,
      },
    });

    return { success: true, nip };
  });

  app.post("/clearing-house/:id/reject", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });
    clearingRejectSchema.parse(request.body);

    await prisma.profile.update({
      where: { id: params.id },
      data: { statusAccount: "rejected" },
    });
    return { success: true };
  });

  app.get("/pending-profiles", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const profiles = await prisma.profile.findMany({
      where: { statusAccount: "pending" },
      include: { region: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return {
      pending_profiles: profiles.map((item) => ({
        id: item.id,
        nama_pesantren: item.namaPesantren,
        region_name: item.region?.name || "Unknown",
        no_wa_pendaftar: item.noWaPendaftar,
        created_at: item.createdAt,
        status_account: item.statusAccount,
      })),
    };
  });

  app.get("/admin-settings/data", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const [admins, regions] = await Promise.all([
      prisma.crew.findMany({
        where: {
          profile: {
            role: { in: [AppRole.admin_pusat, AppRole.admin_regional, AppRole.admin_finance] },
          },
        },
        include: {
          profile: {
            select: {
              id: true,
              role: true,
              regionId: true,
              region: { select: { name: true } },
            },
          },
        },
      }),
      prisma.region.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      admins: admins.map((item) => ({
        id: item.id,
        user_id: item.profile.id,
        nama: item.nama,
        niam: item.niam,
        jabatan: item.jabatan,
        region_id: item.profile.regionId,
        region_name: item.profile.region?.name || null,
        role: item.profile.role,
      })),
      regions,
    };
  });

  app.get("/admin-settings/search-crew", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const parsed = globalSearchQuerySchema.safeParse(request.query);
    if (!parsed.success) return { crews: [] };
    const query = parsed.data.query.trim();
    if (query.length < 2) return { crews: [] };

    const crews = await prisma.crew.findMany({
      where: {
        nama: { contains: query, mode: "insensitive" },
      },
      include: {
        profile: {
          select: {
            id: true,
            namaPesantren: true,
            regionId: true,
            role: true,
            region: { select: { name: true } },
            user: { select: { email: true } },
          },
        },
      },
      take: 10,
      orderBy: { nama: "asc" },
    });

    return {
      crews: crews.map((item) => ({
        id: item.id,
        profile_id: item.profile.id,
        nama: item.nama,
        niam: item.niam,
        jabatan: item.jabatan,
        pesantren_name: item.profile.namaPesantren,
        region_id: item.profile.regionId,
        region_name: item.profile.region?.name || null,
        email: item.profile.user?.email || null,
        current_role: item.profile.role,
      })),
    };
  });

  app.post("/admin-settings/assign", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = adminSettingsAssignSchema.parse(request.body);

    await prisma.$transaction(async (tx) => {
      if (body.role === AppRole.admin_regional && body.regionId) {
        await tx.profile.updateMany({
          where: {
            role: AppRole.admin_regional,
            regionId: body.regionId,
            id: { not: body.profileId },
          },
          data: { role: AppRole.user },
        });
      }

      await tx.profile.update({
        where: { id: body.profileId },
        data: {
          role: body.role,
          regionId: body.role === AppRole.admin_regional ? body.regionId || null : undefined,
        },
      });

      const existingRole = await tx.userRole.findFirst({
        where: { userId: body.profileId },
        orderBy: { createdAt: "desc" },
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { role: body.role },
        });
      } else {
        await tx.userRole.create({
          data: {
            userId: body.profileId,
            role: body.role,
          },
        });
      }
    });

    return { success: true };
  });

  app.delete("/admin-settings/:userId", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { userId?: string };
    if (!params.userId) {
      return reply.status(400).send({ message: "userId tidak valid" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: params.userId! },
        data: { role: AppRole.user },
      });

      const existingRole = await tx.userRole.findFirst({
        where: { userId: params.userId! },
        orderBy: { createdAt: "desc" },
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { role: AppRole.user },
        });
      } else {
        await tx.userRole.create({
          data: {
            userId: params.userId!,
            role: AppRole.user,
          },
        });
      }
    });

    return { success: true };
  });

  app.get("/master-data", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const [profiles, crews, regions] = await Promise.all([
      prisma.profile.findMany({
        include: {
          region: { select: { name: true } },
          city: { select: { name: true } },
        },
        orderBy: { namaPesantren: "asc" },
      }),
      prisma.crew.findMany({
        include: {
          profile: {
            select: {
              namaPesantren: true,
              regionId: true,
              region: { select: { name: true } },
            },
          },
        },
        orderBy: { nama: "asc" },
      }),
      prisma.region.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { code: "asc" },
      }),
    ]);

    return {
      profiles: profiles.map((item) => ({
        id: item.id,
        nama_pesantren: item.namaPesantren,
        nama_media: item.namaMedia,
        nip: item.nip,
        region_id: item.regionId,
        region_name: item.region?.name || null,
        city_name: item.city?.name || null,
        status_account: item.statusAccount,
        profile_level: item.profileLevel,
        alamat_singkat: item.alamatSingkat,
        nama_pengasuh: item.namaPengasuh,
        no_wa_pendaftar: item.noWaPendaftar,
      })),
      crews: crews.map((item) => ({
        id: item.id,
        nama: item.nama,
        niam: item.niam,
        jabatan: item.jabatan,
        xp_level: item.xpLevel,
        profile_id: item.profileId,
        pesantren_name: item.profile.namaPesantren,
        region_id: item.profile.regionId,
        region_name: item.profile.region?.name || null,
      })),
      regions,
    };
  });

  app.put("/master-data/pesantren/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });
    const body = masterDataProfileUpdateSchema.parse(request.body);

    await prisma.profile.update({
      where: { id: params.id },
      data: {
        namaPesantren: body.nama_pesantren,
        namaPengasuh: body.nama_pengasuh,
        alamatSingkat: body.alamat_singkat,
      },
    });
    return { success: true };
  });

  app.put("/master-data/media/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });
    const body = masterDataProfileUpdateSchema.parse(request.body);

    await prisma.profile.update({
      where: { id: params.id },
      data: {
        namaPesantren: body.nama_pesantren,
        namaMedia: body.nama_media,
        noWaPendaftar: body.no_wa_pendaftar,
      },
    });
    return { success: true };
  });

  app.put("/master-data/crew/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });
    const body = masterDataCrewUpdateSchema.parse(request.body);

    await prisma.crew.update({
      where: { id: params.id },
      data: {
        nama: body.nama,
        jabatan: body.jabatan,
      },
    });
    return { success: true };
  });

  app.delete("/master-data/crew/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });

    await prisma.crew.delete({ where: { id: params.id } });
    return { success: true };
  });

  app.get("/jabatan-codes", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const items = await prisma.jabatanCode.findMany({
      orderBy: { code: "asc" },
    });

    return {
      jabatan_codes: items.map((item) => ({
        id: item.id,
        code: item.code,
        name: item.name,
        description: item.description,
        created_at: item.createdAt,
      })),
    };
  });

  app.post("/jabatan-codes", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = jabatanCodeSchema.parse(request.body);

    const created = await prisma.jabatanCode.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      },
    });

    return {
      jabatan_code: {
        id: created.id,
        code: created.code,
        name: created.name,
        description: created.description,
        created_at: created.createdAt,
      },
    };
  });

  app.put("/jabatan-codes/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) {
      return reply.status(400).send({ message: "ID tidak valid" });
    }
    const body = jabatanCodeSchema.parse(request.body);

    const updated = await prisma.jabatanCode.update({
      where: { id: params.id },
      data: {
        code: body.code,
        name: body.name,
        description: body.description || null,
      },
    });

    return {
      jabatan_code: {
        id: updated.id,
        code: updated.code,
        name: updated.name,
        description: updated.description,
        created_at: updated.createdAt,
      },
    };
  });

  app.delete("/jabatan-codes/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) {
      return reply.status(400).send({ message: "ID tidak valid" });
    }

    await prisma.jabatanCode.delete({ where: { id: params.id } });
    return { success: true };
  });

  app.get("/global-search", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const parsed = globalSearchQuerySchema.safeParse(request.query);
    if (!parsed.success) return { results: [] };
    const query = parsed.data.query.trim();
    if (!query) return { results: [] };

    const [claims, crews] = await Promise.all([
      prisma.pesantrenClaim.findMany({
        where: {
          mpjIdNumber: { contains: query, mode: "insensitive" },
        },
        include: {
          region: { select: { name: true } },
        },
        take: 10,
      }),
      prisma.crew.findMany({
        where: {
          niam: { contains: query, mode: "insensitive" },
        },
        include: {
          profile: {
            select: {
              namaPesantren: true,
              statusAccount: true,
            },
          },
        },
        take: 10,
      }),
    ]);

    return {
      results: [
        ...claims
          .filter((item) => !!item.mpjIdNumber)
          .map((item) => ({
            type: "pesantren",
            id: item.id,
            nomorId: item.mpjIdNumber!,
            nama: item.pesantrenName,
            status: item.status,
            region: item.region?.name || null,
          })),
        ...crews
          .filter((item) => !!item.niam)
          .map((item) => ({
            type: "crew",
            id: item.id,
            nomorId: item.niam!,
            nama: item.nama,
            jabatan: item.jabatan,
            lembagaInduk: item.profile.namaPesantren,
            status: item.profile.statusAccount,
          })),
      ],
    };
  });

  app.get("/pusat-assistants", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const [assistantsData, availableCrewsData] = await Promise.all([
      prisma.crew.findMany({
        where: {
          profile: { role: AppRole.admin_pusat },
        },
        include: {
          profile: {
            select: {
              id: true,
              namaPesantren: true,
              region: { select: { name: true } },
              user: { select: { email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.crew.findMany({
        where: {
          profile: { role: { not: AppRole.admin_pusat } },
        },
        include: {
          profile: {
            select: {
              id: true,
              namaPesantren: true,
              region: { select: { name: true } },
              user: { select: { email: true } },
            },
          },
        },
        orderBy: { nama: "asc" },
      }),
    ]);

    return {
      assistants: assistantsData.map((item) => ({
        id: item.id,
        crew_id: item.id,
        nama: item.nama,
        email: item.profile.user?.email || "",
        niam: item.niam,
        pesantren_name: item.profile.namaPesantren || "-",
        region_name: item.profile.region?.name || "-",
        appointed_at: item.updatedAt,
        appointed_by: "Admin Pusat",
      })),
      available_crews: availableCrewsData.map((item) => ({
        id: item.id,
        nama: item.nama,
        niam: item.niam,
        pesantren_name: item.profile.namaPesantren || "-",
        region_name: item.profile.region?.name || "-",
        email: item.profile.user?.email || "",
        profile_id: item.profile.id,
      })),
    };
  });

  app.post("/pusat-assistants", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = addPusatAssistantSchema.parse(request.body);

    const crew = await prisma.crew.findUnique({
      where: { id: body.crewId },
      select: { id: true, profileId: true },
    });
    if (!crew) {
      return reply.status(404).send({ message: "Kru tidak ditemukan" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: crew.profileId },
        data: { role: AppRole.admin_pusat },
      });

      const existingRole = await tx.userRole.findFirst({
        where: { userId: crew.profileId },
        orderBy: { createdAt: "desc" },
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { role: AppRole.admin_pusat },
        });
      } else {
        await tx.userRole.create({
          data: {
            userId: crew.profileId,
            role: AppRole.admin_pusat,
          },
        });
      }
    });

    return { success: true };
  });

  app.delete("/pusat-assistants/:crewId", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { crewId?: string };
    if (!params.crewId) {
      return reply.status(400).send({ message: "crewId tidak valid" });
    }

    const crew = await prisma.crew.findUnique({
      where: { id: params.crewId },
      select: { profileId: true },
    });
    if (!crew) {
      return reply.status(404).send({ message: "Kru tidak ditemukan" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: crew.profileId },
        data: { role: AppRole.user },
      });

      const existingRole = await tx.userRole.findFirst({
        where: { userId: crew.profileId },
        orderBy: { createdAt: "desc" },
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { role: AppRole.user },
        });
      } else {
        await tx.userRole.create({
          data: {
            userId: crew.profileId,
            role: AppRole.user,
          },
        });
      }
    });

    return { success: true };
  });

  app.get("/regional-management/data", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const [regions, cities, users] = await Promise.all([
      prisma.region.findMany({
        select: { id: true, name: true, code: true },
        orderBy: { name: "asc" },
      }),
      prisma.city.findMany({
        select: { id: true, name: true, regionId: true },
        orderBy: { name: "asc" },
      }),
      prisma.profile.findMany({
        select: {
          id: true,
          namaPesantren: true,
          namaPengasuh: true,
          regionId: true,
          role: true,
          statusAccount: true,
          region: { select: { name: true } },
        },
        orderBy: { namaPesantren: "asc" },
      }),
    ]);

    return {
      regions: regions.map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
      })),
      cities: cities.map((c) => ({
        id: c.id,
        name: c.name,
        region_id: c.regionId,
      })),
      users: users.map((u) => ({
        id: u.id,
        nama_pesantren: u.namaPesantren,
        nama_pengasuh: u.namaPengasuh,
        region_id: u.regionId,
        region_name: u.region?.name || null,
        role: u.role,
        status_account: u.statusAccount,
      })),
    };
  });

  app.post("/regional-management/regions", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = addRegionSchema.parse(request.body);

    const duplicate = await prisma.region.findFirst({ where: { code: body.code } });
    if (duplicate) {
      return reply.status(409).send({ message: "Kode regional sudah digunakan" });
    }

    const region = await prisma.region.create({
      data: { name: body.name, code: body.code },
      select: { id: true, name: true, code: true },
    });

    return {
      region: {
        id: region.id,
        name: region.name,
        code: region.code,
      },
    };
  });

  app.delete("/regional-management/regions/:id", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = regionParamsSchema.parse(request.params);

    await prisma.region.delete({ where: { id: params.id } });
    return { success: true };
  });

  app.post("/regional-management/cities", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = addCitySchema.parse(request.body);

    const city = await prisma.city.create({
      data: {
        name: body.name,
        regionId: body.regionId,
      },
      select: {
        id: true,
        name: true,
        regionId: true,
      },
    });

    return {
      city: {
        id: city.id,
        name: city.name,
        region_id: city.regionId,
      },
    };
  });

  app.delete("/regional-management/cities/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) {
      return reply.status(400).send({ message: "City id tidak valid" });
    }

    await prisma.city.delete({ where: { id: params.id } });
    return { success: true };
  });

  app.post("/regional-management/assign-admin", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = assignRegionalAdminSchema.parse(request.body);

    const region = await prisma.region.findUnique({
      where: { id: body.regionId },
      select: { id: true, name: true },
    });
    if (!region) {
      return reply.status(404).send({ message: "Regional tidak ditemukan" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: body.userId },
        data: {
          role: AppRole.admin_regional,
          regionId: body.regionId,
        },
      });

      const existingRole = await tx.userRole.findFirst({
        where: { userId: body.userId },
        orderBy: { createdAt: "desc" },
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { role: AppRole.admin_regional },
        });
      } else {
        await tx.userRole.create({
          data: {
            userId: body.userId,
            role: AppRole.admin_regional,
          },
        });
      }
    });

    return {
      success: true,
      region: { id: region.id, name: region.name },
    };
  });

  app.get("/users-management", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const users = await prisma.profile.findMany({
      select: {
        id: true,
        namaPesantren: true,
        namaPengasuh: true,
        role: true,
        statusAccount: true,
        statusPayment: true,
        regionId: true,
        region: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      users: users.map((user) => ({
        id: user.id,
        nama_pesantren: user.namaPesantren,
        nama_pengasuh: user.namaPengasuh,
        role: user.role,
        status_account: user.statusAccount,
        status_payment: user.statusPayment,
        region_id: user.regionId,
        region_name: user.region?.name || "-",
      })),
    };
  });

  app.post("/users/:id", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const params = request.params as { id?: string };
    if (!params.id) {
      return reply.status(400).send({ message: "User id tidak valid" });
    }

    const body = userUpdateSchema.parse(request.body);

    await prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: params.id! },
        data: {
          role: body.role,
          statusAccount: body.statusAccount,
          statusPayment: body.statusPayment,
        },
      });

      const existingRole = await tx.userRole.findFirst({
        where: { userId: params.id! },
        orderBy: { createdAt: "desc" },
      });

      if (existingRole) {
        await tx.userRole.update({
          where: { id: existingRole.id },
          data: { role: body.role },
        });
      } else {
        await tx.userRole.create({
          data: {
            userId: params.id!,
            role: body.role,
          },
        });
      }
    });

    return { success: true };
  });

  app.get("/bank-settings", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["bank_name", "bank_account_number", "bank_account_name"] },
      },
    });

    const bankName = settings.find((s) => s.key === "bank_name");
    const bankAccountNumber = settings.find((s) => s.key === "bank_account_number");
    const bankAccountName = settings.find((s) => s.key === "bank_account_name");

    return {
      bankName: String(bankName?.value ?? ""),
      bankAccountNumber: String(bankAccountNumber?.value ?? ""),
      bankAccountName: String(bankAccountName?.value ?? ""),
    };
  });

  app.post("/bank-settings", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);
    const body = bankSettingsSchema.parse(request.body);

    const updates: Array<{ key: string; value: string; description: string }> = [
      { key: "bank_name", value: body.bankName, description: "Nama bank untuk pembayaran" },
      {
        key: "bank_account_number",
        value: body.bankAccountNumber,
        description: "Nomor rekening bank untuk pembayaran",
      },
      {
        key: "bank_account_name",
        value: body.bankAccountName,
        description: "Nama pemilik rekening bank",
      },
    ];

    await prisma.$transaction(async (tx) => {
      for (const item of updates) {
        const existing = await tx.systemSetting.findFirst({ where: { key: item.key } });
        if (existing) {
          await tx.systemSetting.update({
            where: { id: existing.id },
            data: { value: item.value, description: item.description },
          });
        } else {
          await tx.systemSetting.create({
            data: {
              key: item.key,
              value: item.value,
              description: item.description,
            },
          });
        }
      }
    });

    return { success: true };
  });

  app.get("/super-stats", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const [totalUsers, totalPesantren, paidUsers] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({
        where: { namaPesantren: { not: null } },
      }),
      prisma.profile.count({
        where: { statusPayment: "paid" },
      }),
    ]);

    const revenue = paidUsers * 350000;

    return {
      total_users: totalUsers,
      total_pesantren: totalPesantren,
      paid_users: paidUsers,
      estimated_revenue: revenue,
    };
  });

  app.get("/regions/:id/detail", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const parsedParams = regionParamsSchema.safeParse(request.params);
    if (!parsedParams.success) {
      return reply.status(400).send({ message: "Region id tidak valid" });
    }

    const regionId = parsedParams.data.id;
    const region = await prisma.region.findUnique({
      where: { id: regionId },
      select: {
        id: true,
        name: true,
        code: true,
        cities: {
          select: { name: true },
          orderBy: { name: "asc" },
        },
      },
    });

    if (!region) {
      return reply.status(404).send({ message: "Regional tidak ditemukan" });
    }

    const [memberCount, pesantrenCount, adminCount, recentProfiles] = await Promise.all([
      prisma.profile.count({
        where: {
          regionId,
          role: AppRole.user,
        },
      }),
      prisma.profile.count({
        where: {
          regionId,
          namaPesantren: { not: null },
        },
      }),
      prisma.profile.count({
        where: {
          regionId,
          role: AppRole.admin_regional,
        },
      }),
      prisma.profile.findMany({
        where: {
          regionId,
          namaPesantren: { not: null },
        },
        select: {
          id: true,
          namaPesantren: true,
          namaPengasuh: true,
          statusAccount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      region: {
        id: region.id,
        name: region.name,
        code: region.code,
        cities: region.cities.map((city) => ({ name: city.name })),
      },
      stats: {
        member_count: memberCount,
        pesantren_count: pesantrenCount,
        admin_count: adminCount,
      },
      recent_pesantren: recentProfiles.map((profile) => ({
        id: profile.id,
        nama_pesantren: profile.namaPesantren,
        nama_pengasuh: profile.namaPengasuh,
        status_account: profile.statusAccount,
        created_at: profile.createdAt,
      })),
    };
  });

  app.get("/price-settings", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const settings = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["registration_base_price", "claim_base_price"] },
      },
    });

    const registration = settings.find((s) => s.key === "registration_base_price");
    const claim = settings.find((s) => s.key === "claim_base_price");

    return {
      registrationPrice: Number(registration?.value ?? 50000),
      claimPrice: Number(claim?.value ?? 20000),
    };
  });

  app.post("/price-settings", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const body = priceSettingsSchema.parse(request.body);

    await prisma.$transaction(async (tx) => {
      const reg = await tx.systemSetting.findFirst({ where: { key: "registration_base_price" } });
      const claim = await tx.systemSetting.findFirst({ where: { key: "claim_base_price" } });

      if (reg) {
        await tx.systemSetting.update({
          where: { id: reg.id },
          data: { value: body.registrationPrice },
        });
      } else {
        await tx.systemSetting.create({
          data: {
            key: "registration_base_price",
            value: body.registrationPrice,
            description: "Harga dasar pendaftaran pesantren baru",
          },
        });
      }

      if (claim) {
        await tx.systemSetting.update({
          where: { id: claim.id },
          data: { value: body.claimPrice },
        });
      } else {
        await tx.systemSetting.create({
          data: {
            key: "claim_base_price",
            value: body.claimPrice,
            description: "Harga dasar klaim akun lama",
          },
        });
      }
    });

    return { success: true };
  });

  app.get("/late-payment-count", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const lateClaims = await prisma.pesantrenClaim.findMany({
      where: {
        status: ClaimStatus.regional_approved,
        regionalApprovedAt: { not: null, lt: sevenDaysAgo },
      },
      select: { userId: true },
    });

    if (lateClaims.length === 0) {
      return { count: 0 };
    }

    const userIds = lateClaims.map((c) => c.userId);
    const count = await prisma.profile.count({
      where: {
        id: { in: userIds },
        statusPayment: "unpaid",
      },
    });

    return { count };
  });

  app.get("/claims", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const claims = await prisma.pesantrenClaim.findMany({
      where: {
        status: { in: [ClaimStatus.regional_approved, ClaimStatus.pusat_approved] },
      },
      include: { region: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return {
      claims: claims.map((item) => ({
        id: item.id,
        user_id: item.userId,
        pesantren_name: item.pesantrenName,
        nama_pengelola: item.namaPengelola,
        jenis_pengajuan: item.jenisPengajuan,
        status: item.status,
        created_at: item.createdAt,
        region_id: item.regionId,
        mpj_id_number: item.mpjIdNumber,
        region_name: item.region?.name || "-",
      })),
    };
  });

  app.get("/payments", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const payments = await prisma.payment.findMany({
      include: {
        claim: {
          select: {
            pesantrenName: true,
            namaPengelola: true,
            jenisPengajuan: true,
            regionId: true,
            mpjIdNumber: true,
          },
        },
        user: { select: { noWaPendaftar: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      payments: payments.map((p) => ({
        id: p.id,
        user_id: p.userId,
        pesantren_claim_id: p.pesantrenClaimId,
        base_amount: p.baseAmount,
        unique_code: p.uniqueCode,
        total_amount: p.totalAmount,
        proof_file_url: p.proofFileUrl,
        status: p.status,
        created_at: p.createdAt,
        rejection_reason: p.rejectionReason,
        verified_by: p.verifiedBy,
        verified_at: p.verifiedAt,
        pesantren_claims: {
          pesantren_name: p.claim.pesantrenName,
          nama_pengelola: p.claim.namaPengelola,
          jenis_pengajuan: p.claim.jenisPengajuan,
          region_id: p.claim.regionId,
          mpj_id_number: p.claim.mpjIdNumber,
        },
        profiles: {
          no_wa_pendaftar: p.user?.noWaPendaftar || null,
        },
      })),
    };
  });

  app.post("/payments/:id/reject", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const params = request.params as { id: string };
    const body = rejectPaymentSchema.parse(request.body);

    await prisma.payment.update({
      where: { id: params.id },
      data: {
        status: PaymentVerificationStatus.pending_payment,
        rejectionReason: body.reason,
        proofFileUrl: null,
      },
    });

    return { success: true };
  });

  app.post("/payments/:id/approve", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const params = request.params as { id: string };

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: {
        claim: true,
        user: { select: { noWaPendaftar: true } },
      },
    });

    if (!payment) {
      const error = new Error("Payment not found");
      (error as any).statusCode = 404;
      throw error;
    }

    if (!payment.claim.regionId) {
      throw new Error("Region ID tidak ditemukan");
    }

    const nip = await prisma.$transaction(async (tx) => {
      const region = await tx.region.findUnique({ where: { id: payment.claim.regionId! } });
      if (!region || !/^\d{2}$/.test(region.code)) {
        throw new Error("Kode RR Belum Valid");
      }

      const count = await tx.pesantrenClaim.count({
        where: {
          regionId: payment.claim.regionId!,
          mpjIdNumber: { not: null },
        },
      });

      const year = new Date().getFullYear().toString().slice(-2);
      const sequence = String(count + 1).padStart(3, "0");
      const generatedNip = `${year}${region.code}${sequence}`;

      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentVerificationStatus.verified,
          verifiedBy: payload.sub,
          verifiedAt: new Date(),
          rejectionReason: null,
        },
      });

      await tx.pesantrenClaim.update({
        where: { id: payment.pesantrenClaimId },
        data: {
          status: ClaimStatus.approved,
          approvedBy: payload.sub,
          approvedAt: new Date(),
          mpjIdNumber: generatedNip,
        },
      });

      await tx.profile.update({
        where: { id: payment.userId },
        data: {
          statusAccount: "active",
          statusPayment: "paid",
          nip: generatedNip,
        },
      });

      return generatedNip;
    });

    return {
      success: true,
      nip,
      phoneNumber: payment.user?.noWaPendaftar || null,
      pesantrenName: payment.claim.pesantrenName,
    };
  });

  app.get("/leveling-profiles", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const profiles = await prisma.profile.findMany({
      where: {
        statusAccount: "active",
        profileLevel: { in: [ProfileLevel.silver, ProfileLevel.gold] },
      },
      include: { region: { select: { name: true } } },
      orderBy: { namaPesantren: "asc" },
    });

    return {
      profiles: profiles.map((item) => ({
        id: item.id,
        nama_pesantren: item.namaPesantren,
        nip: item.nip,
        profile_level: item.profileLevel,
        sejarah: item.sejarah,
        visi_misi: item.visiMisi,
        logo_url: item.logoUrl,
        foto_pengasuh_url: item.fotoPengasuhUrl,
        region_name: item.region?.name || "-",
      })),
    };
  });

  app.post("/leveling/:id/promote-platinum", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    await assertAdminPusat(payload.sub);

    const params = request.params as { id: string };

    await prisma.profile.update({
      where: { id: params.id },
      data: { profileLevel: ProfileLevel.platinum },
    });

    return { success: true };
  });
}
