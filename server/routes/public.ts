import type { FastifyInstance } from "fastify";
import { prisma } from "../prisma";

export async function publicRoutes(app: FastifyInstance) {
  app.get("/regions", async () => {
    const regions = await prisma.region.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    return { regions };
  });

  app.get("/cities", async () => {
    const cities = await prisma.city.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return { cities };
  });

  app.get("/cities/:id/region", async (request, reply) => {
    const params = request.params as { id: string };

    const city = await prisma.city.findUnique({
      where: { id: params.id },
      include: { region: true },
    });

    if (!city) {
      return reply.status(404).send({ message: "City not found" });
    }

    return {
      city: { id: city.id, name: city.name },
      region: {
        id: city.region.id,
        name: city.region.name,
        code: city.region.code,
      },
    };
  });

  app.get("/directory", async (request) => {
    const query = request.query as { search?: string; regionId?: string };
    const search = (query.search || "").trim();
    const regionId = (query.regionId || "").trim();

    const profiles = await prisma.profile.findMany({
      where: {
        statusAccount: "active",
        nip: { not: null },
        ...(search
          ? {
              OR: [
                { namaPesantren: { contains: search, mode: "insensitive" } },
                { nip: { contains: search.replace(/\./g, "") } },
              ],
            }
          : {}),
        ...(regionId && regionId !== "all" ? { regionId } : {}),
      },
      select: {
        id: true,
        namaPesantren: true,
        logoUrl: true,
        nip: true,
        profileLevel: true,
        regionId: true,
        region: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: { namaPesantren: "asc" },
      take: 300,
    });

    return {
      pesantren: profiles.map((p) => ({
        id: p.id,
        nama_pesantren: p.namaPesantren,
        logo_url: p.logoUrl,
        nip: p.nip,
        profile_level: p.profileLevel,
        region_id: p.regionId,
        region: p.region
          ? {
              name: p.region.name,
              code: p.region.code,
            }
          : null,
      })),
    };
  });

  app.get("/pesantren", async (request) => {
    const query = request.query as { search?: string };
    const search = (query.search || "").trim();

    if (!search) {
      return { pesantren: [] };
    }

    const claims = await prisma.pesantrenClaim.findMany({
      where: {
        status: { in: ["approved", "pusat_approved"] },
        pesantrenName: { contains: search, mode: "insensitive" },
      },
      include: {
        region: { select: { name: true } },
        user: { select: { alamatSingkat: true } },
      },
      take: 20,
      orderBy: { pesantrenName: "asc" },
    });

    return {
      pesantren: claims.map((item) => ({
        id: item.id,
        name: item.pesantrenName,
        region: item.region?.name || "-",
        alamat: item.user?.alamatSingkat || "-",
      })),
    };
  });

  app.get("/pesantren/:nip/profile", async (request, reply) => {
    const params = request.params as { nip: string };
    const cleanNip = params.nip.replace(/\./g, "");

    const profile = await prisma.profile.findFirst({
      where: {
        nip: cleanNip,
        statusAccount: "active",
      },
      select: {
        id: true,
        namaPesantren: true,
        namaPengasuh: true,
        namaMedia: true,
        logoUrl: true,
        nip: true,
        profileLevel: true,
        regionId: true,
        statusAccount: true,
        socialLinks: true,
        region: {
          select: { name: true },
        },
      },
    });

    if (!profile) {
      return reply.status(404).send({ message: "Pesantren tidak ditemukan" });
    }

    const crews = await prisma.crew.findMany({
      where: {
        profileId: profile.id,
        niam: { not: null },
      },
      select: {
        id: true,
        nama: true,
        niam: true,
        jabatan: true,
      },
      orderBy: { niam: "asc" },
    });

    return {
      pesantren: {
        id: profile.id,
        nama_pesantren: profile.namaPesantren,
        nama_pengasuh: profile.namaPengasuh,
        nama_media: profile.namaMedia,
        logo_url: profile.logoUrl,
        nip: profile.nip,
        profile_level: profile.profileLevel,
        region_id: profile.regionId,
        status_account: profile.statusAccount,
        social_links: profile.socialLinks,
        region: profile.region ? { name: profile.region.name } : null,
      },
      crews: crews.map((crew) => ({
        id: crew.id,
        nama: crew.nama,
        niam: crew.niam,
        jabatan: crew.jabatan,
      })),
    };
  });

  app.get("/pesantren/:nip/crew/:niamSuffix", async (request, reply) => {
    const params = request.params as { nip: string; niamSuffix: string };
    const cleanNip = params.nip.replace(/\./g, "");
    const suffix = params.niamSuffix.padStart(2, "0");

    const profile = await prisma.profile.findFirst({
      where: {
        nip: cleanNip,
        statusAccount: "active",
      },
      select: {
        id: true,
        namaPesantren: true,
        nip: true,
        logoUrl: true,
      },
    });

    if (!profile) {
      return reply.status(404).send({ message: "Pesantren tidak ditemukan" });
    }

    const crews = await prisma.crew.findMany({
      where: {
        profileId: profile.id,
        niam: { not: null },
      },
      select: {
        id: true,
        nama: true,
        niam: true,
        jabatan: true,
        xpLevel: true,
      },
    });

    const crew = crews.find((item) => item.niam?.endsWith(suffix) || item.niam === params.niamSuffix);
    if (!crew) {
      return reply.status(404).send({ message: "Kru tidak ditemukan" });
    }

    return {
      crew: {
        id: crew.id,
        nama: crew.nama,
        niam: crew.niam,
        jabatan: crew.jabatan,
        xp_level: crew.xpLevel,
        profile: {
          id: profile.id,
          nama_pesantren: profile.namaPesantren,
          nip: profile.nip,
          logo_url: profile.logoUrl,
        },
      },
    };
  });
}
