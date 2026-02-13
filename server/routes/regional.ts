import { AppRole, ClaimStatus, PaymentVerificationStatus } from "@prisma/client";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const rejectSchema = z.object({
  reason: z.string().min(1),
});

async function assertRegional(userId: string) {
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

export async function regionalRoutes(app: FastifyInstance) {
  app.get("/master-data", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);

    const [profiles, crews] = await Promise.all([
      prisma.profile.findMany({
        where: { regionId },
        select: {
          id: true,
          namaPesantren: true,
          namaPengasuh: true,
          statusAccount: true,
          statusPayment: true,
          profileLevel: true,
          noWaPendaftar: true,
          nip: true,
        },
        orderBy: { namaPesantren: "asc" },
      }),
      prisma.crew.findMany({
        where: {
          profile: { regionId },
        },
        select: {
          id: true,
          nama: true,
          jabatan: true,
          niam: true,
          xpLevel: true,
          profile: {
            select: {
              namaPesantren: true,
            },
          },
        },
        orderBy: { nama: "asc" },
      }),
    ]);

    return {
      profiles: profiles.map((p) => ({
        id: p.id,
        nama_pesantren: p.namaPesantren,
        nama_pengasuh: p.namaPengasuh,
        status_account: p.statusAccount,
        status_payment: p.statusPayment,
        profile_level: p.profileLevel,
        no_wa_pendaftar: p.noWaPendaftar,
        nip: p.nip,
      })),
      crews: crews.map((c) => ({
        id: c.id,
        nama: c.nama,
        jabatan: c.jabatan,
        niam: c.niam,
        xp_level: c.xpLevel,
        pesantren_name: c.profile.namaPesantren,
      })),
    };
  });

  app.get("/pending-claims", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);

    const claims = await prisma.pesantrenClaim.findMany({
      where: {
        regionId,
        status: ClaimStatus.pending,
      },
      include: {
        user: {
          select: {
            namaPengasuh: true,
            alamatSingkat: true,
            noWaPendaftar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      claims: claims.map((c) => ({
        id: c.id,
        user_id: c.userId,
        pesantren_name: c.pesantrenName,
        status: c.status,
        region_id: c.regionId,
        kecamatan: c.kecamatan,
        nama_pengelola: c.namaPengelola,
        email_pengelola: c.emailPengelola,
        dokumen_bukti_url: c.dokumenBuktiUrl,
        notes: c.notes,
        claimed_at: c.claimedAt,
        created_at: c.createdAt,
        jenis_pengajuan: c.jenisPengajuan,
        nama_pengasuh: c.user.namaPengasuh,
        alamat_singkat: c.user.alamatSingkat,
        no_wa_pendaftar: c.user.noWaPendaftar,
      })),
    };
  });

  app.post("/claims/:id/approve", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });

    const claim = await prisma.pesantrenClaim.findUnique({ where: { id: params.id } });
    if (!claim || claim.regionId !== regionId) {
      return reply.status(404).send({ message: "Claim tidak ditemukan" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pesantrenClaim.update({
        where: { id: claim.id },
        data: {
          status: ClaimStatus.regional_approved,
          regionalApprovedAt: new Date(),
          updatedAt: new Date(),
          notes: null,
        },
      });

      if (claim.jenisPengajuan === "klaim") {
        await tx.profile.update({
          where: { id: claim.userId },
          data: {
            statusAccount: "active",
          },
        });
      } else {
        const existingPayment = await tx.payment.findFirst({
          where: { pesantrenClaimId: claim.id },
        });

        if (!existingPayment) {
          const settings = await tx.systemSetting.findMany({
            where: { key: { in: ["registration_base_price", "claim_base_price"] } },
          });

          const registration = settings.find((s) => s.key === "registration_base_price");
          const claimSetting = settings.find((s) => s.key === "claim_base_price");
          const baseAmount =
            claim.jenisPengajuan === "klaim"
              ? Number(claimSetting?.value ?? 20000)
              : Number(registration?.value ?? 50000);
          const uniqueCode = Math.floor(1 + Math.random() * 999);

          await tx.payment.create({
            data: {
              userId: claim.userId,
              pesantrenClaimId: claim.id,
              baseAmount,
              uniqueCode,
              totalAmount: baseAmount + uniqueCode,
              status: PaymentVerificationStatus.pending_payment,
            },
          });
        }
      }
    });

    return { success: true };
  });

  app.post("/claims/:id/reject", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);
    const params = request.params as { id?: string };
    if (!params.id) return reply.status(400).send({ message: "id tidak valid" });
    const body = rejectSchema.parse(request.body);

    const claim = await prisma.pesantrenClaim.findUnique({ where: { id: params.id } });
    if (!claim || claim.regionId !== regionId) {
      return reply.status(404).send({ message: "Claim tidak ditemukan" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pesantrenClaim.update({
        where: { id: claim.id },
        data: {
          status: ClaimStatus.rejected,
          notes: body.reason,
          updatedAt: new Date(),
        },
      });

      await tx.profile.update({
        where: { id: claim.userId },
        data: { statusAccount: "rejected" },
      });
    });

    return { success: true };
  });

  app.get("/late-payments", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const claims = await prisma.pesantrenClaim.findMany({
      where: {
        regionId,
        status: ClaimStatus.regional_approved,
        regionalApprovedAt: { not: null, lt: sevenDaysAgo },
      },
      include: {
        user: {
          select: { noWaPendaftar: true },
        },
      },
      orderBy: { regionalApprovedAt: "asc" },
    });

    const claimIds = claims.map((c) => c.id);
    const payments = claimIds.length
      ? await prisma.payment.findMany({
          where: {
            pesantrenClaimId: { in: claimIds },
          },
          select: { pesantrenClaimId: true, status: true },
        })
      : [];
    const paymentMap = new Map(payments.map((p) => [p.pesantrenClaimId, p.status]));

    return {
      claims: claims
        .filter((c) => paymentMap.get(c.id) !== PaymentVerificationStatus.verified)
        .map((c) => {
          const daysOverdue = c.regionalApprovedAt
            ? Math.floor(
                (Date.now() - (c.regionalApprovedAt.getTime() + 7 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)
              )
            : 0;
          return {
            id: c.id,
            user_id: c.userId,
            pesantren_name: c.pesantrenName,
            nama_pengelola: c.namaPengelola,
            regional_approved_at: c.regionalApprovedAt,
            jenis_pengajuan: c.jenisPengajuan,
            no_wa_pendaftar: c.user.noWaPendaftar,
            days_overdue: Math.max(0, daysOverdue),
          };
        }),
    };
  });

  app.post("/late-payments/:claimId/follow-up", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);
    const params = request.params as { claimId?: string };
    if (!params.claimId) return reply.status(400).send({ message: "claimId tidak valid" });

    await prisma.followUpLog.create({
      data: {
        adminId: payload.sub,
        claimId: params.claimId,
        regionId,
        actionType: "whatsapp_followup",
      },
    });

    return { success: true };
  });

  app.get("/performance", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [approvedClaims, paidProfiles, lateClaims, weeklyFollowUps] = await Promise.all([
      prisma.pesantrenClaim.count({
        where: {
          regionId,
          status: { in: [ClaimStatus.approved, ClaimStatus.pusat_approved] },
        },
      }),
      prisma.profile.count({
        where: {
          regionId,
          statusPayment: "paid",
        },
      }),
      prisma.pesantrenClaim.findMany({
        where: {
          regionId,
          status: ClaimStatus.regional_approved,
          regionalApprovedAt: { not: null },
        },
        select: { regionalApprovedAt: true },
      }),
      prisma.followUpLog.count({
        where: {
          regionId,
          createdAt: { gte: weekAgo },
        },
      }),
    ]);

    const pendingFollowUp = lateClaims.filter((c) => {
      if (!c.regionalApprovedAt) return false;
      return c.regionalApprovedAt.getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;
    }).length;

    const stuckOver14Days = lateClaims.filter((c) => {
      if (!c.regionalApprovedAt) return false;
      return c.regionalApprovedAt.getTime() < Date.now() - 14 * 24 * 60 * 60 * 1000;
    }).length;

    return {
      totalVerified: approvedClaims,
      premiumConverted: paidProfiles,
      conversionRate: approvedClaims > 0 ? Number(((paidProfiles / approvedClaims) * 100).toFixed(1)) : 0,
      pendingFollowUp,
      weeklyFollowUps,
      stuckOver14Days,
    };
  });

  app.get("/leaderboard", { preHandler: authenticate }, async (request) => {
    const payload = request.user as { sub: string };
    const regionId = await assertRegional(payload.sub);

    const regions = await prisma.region.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    const stats = await Promise.all(
      regions.map(async (r) => {
        const [verified, paid] = await Promise.all([
          prisma.pesantrenClaim.count({
            where: {
              regionId: r.id,
              status: { in: [ClaimStatus.approved, ClaimStatus.pusat_approved] },
            },
          }),
          prisma.profile.count({
            where: {
              regionId: r.id,
              statusPayment: "paid",
            },
          }),
        ]);

        return {
          region_id: r.id,
          region_name: r.name,
          total_verified: verified,
          total_paid: paid,
          conversion_rate: verified > 0 ? Number(((paid / verified) * 100).toFixed(1)) : 0,
        };
      })
    );

    stats.sort((a, b) => b.conversion_rate - a.conversion_rate || b.total_paid - a.total_paid);

    return {
      leaderboard: stats,
      user_region_id: regionId,
    };
  });
}
