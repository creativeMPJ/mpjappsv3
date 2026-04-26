import { AppRole } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6),
  namaPesantren: z.string().min(1).optional(),
  namaPengasuh: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

function generateRoleAkses(role: string): Record<string, any> {
  const FULL = { view: true, create: true, update: true, delete: true };
  const VIEW = { view: true, create: false, update: false, delete: false };

  switch (role) {
    case "admin_pusat":
      return {
        'admin-pusat-dashboard': VIEW,
        'administrasi':                   FULL,
        'master-data':                    FULL,
        'master-regional':                FULL,
        'admin-pusat-manajemen-event':    FULL,
        'admin-pusat-event-narasumber':   FULL,
        'admin-pusat-event-peserta':      FULL,
        'admin-pusat-event-master-data':  FULL,
        'admin-pusat-event-scan':         FULL,
        'militansi': VIEW,
        'mpj-hub':   VIEW,
        'pengaturan': FULL,
        'hak-akses':  FULL,
      };
    case "admin_regional":
      return {
        'admin-regional-dashboard': VIEW,
        'data-master':              FULL,
        'validasi-pendaftar':       FULL,
        'admin-regional-manajemen-event': FULL,
        'laporan':                  VIEW,
        'late-payment':             FULL,
        'download-center':          VIEW,
        'pengaturan':               FULL,
      };
    case "admin_finance":
      return {
        'admin-finance-dashboard': VIEW,
        'verifikasi':              FULL,
        'laporan-keuangan':        VIEW,
        'harga':                   FULL,
        'clearing':                FULL,
        'regional-monitoring':     VIEW,
        'pengaturan':              FULL,
      };
    default:
      return {
        'user-beranda':  VIEW,
        'identitas':     FULL,
        'pembayaran':    VIEW,
        'tim':           FULL,
        'eid':           VIEW,
        'user-event':    VIEW,
        'hub':           VIEW,
        'pengaturan':    FULL,
      };
  }
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) {
      return reply.status(409).send({ message: "Email already registered" });
    }

    const passwordHash = await hash(body.password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: body.email,
          passwordHash,
        },
      });

      await tx.profile.create({
        data: {
          id: createdUser.id,
          role: AppRole.user,
          statusAccount: "active",
          namaPesantren: body.namaPesantren,
          namaPengasuh: body.namaPengasuh,
        },
      });

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          role: AppRole.user,
        },
      });

      return createdUser;
    });

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: profile?.role ?? AppRole.user,
    });

    return reply.status(201).send({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role ?? AppRole.user,
      },
    });
  });

  app.post("/login", async (request, reply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { email: body.email } });
    if (!user) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const ok = await compare(body.password, user.passwordHash);
    if (!ok) {
      return reply.status(401).send({ message: "Invalid credentials" });
    }

    const profile = await prisma.profile.findUnique({ where: { id: user.id } });

    const role = profile?.role ?? AppRole.user;
    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: role,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: role,
        akses: generateRoleAkses(role),
      },
    });
  });

  app.get("/me", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const role = user.profile?.role ?? AppRole.user;

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        role,
        akses: generateRoleAkses(role),
        isSuperAdmin: false,
        statusAccount: user.profile?.statusAccount ?? null,
        statusPayment: user.profile?.statusPayment ?? "unpaid",
        profileLevel: user.profile?.profileLevel ?? "basic",
        nip: user.profile?.nip ?? null,
        namaPesantren: user.profile?.namaPesantren ?? null,
        namaPengasuh: user.profile?.namaPengasuh ?? null,
        namaMedia: user.profile?.namaMedia ?? null,
        alamatSingkat: user.profile?.alamatSingkat ?? null,
        regionId: user.profile?.regionId ?? null,
        logoUrl: user.profile?.logoUrl ?? null,
      },
    });
  });

  app.post("/change-password", { preHandler: authenticate }, async (request, reply) => {
    const payload = request.user as { sub: string };
    const body = changePasswordSchema.parse(request.body);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return reply.status(404).send({ message: "User not found" });
    }

    const ok = await compare(body.currentPassword, user.passwordHash);
    if (!ok) {
      return reply.status(401).send({ message: "Current password is invalid" });
    }

    const nextHash = await hash(body.newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: nextHash },
    });

    return reply.send({ success: true });
  });

  // Forgot Password - creates a reset request for admin to process
  app.post("/forgot-password", async (request, reply) => {
    const body = z.object({
      email: z.string().min(1).toLowerCase(),
    }).parse(request.body);

    // Check if user exists (but always return success for security)
    const user = await prisma.user.findUnique({ where: { email: body.email } });

    if (user) {
      // Check for recent pending request to prevent spam (within last hour)
      const recentRequest = await prisma.passwordResetRequest.findFirst({
        where: {
          email: body.email,
          status: "pending",
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
        },
      });

      if (!recentRequest) {
        await prisma.passwordResetRequest.create({
          data: {
            email: body.email,
          },
        });
      }
    }

    // Always return success to prevent email enumeration
    return reply.send({
      success: true,
      message: "Jika akun terdaftar, permintaan reset password telah dikirim ke admin.",
    });
  });
}
