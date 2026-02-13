import { AppRole } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8),
  namaPesantren: z.string().min(1).optional(),
  namaPengasuh: z.string().min(1).optional(),
});

const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

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

    const token = app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: profile?.role ?? AppRole.user,
    });

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role ?? AppRole.user,
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

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        role: user.profile?.role ?? AppRole.user,
        statusAccount: user.profile?.statusAccount ?? null,
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
}
