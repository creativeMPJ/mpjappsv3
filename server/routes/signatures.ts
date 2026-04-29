import { AppRole, LetterScope } from "@prisma/client";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const signatureScopeSchema = z.nativeEnum(LetterScope);

const listSignaturesSchema = z.object({
  scope: signatureScopeSchema.optional(),
  regionId: z.string().uuid().optional(),
});

const createSignatureSchema = z.object({
  scope: signatureScopeSchema.optional(),
  regionId: z.string().uuid().nullable().optional(),
  leaderName: z.string().min(1),
  positionName: z.string().min(1),
  imageUrl: z.string().min(1),
  isActive: z.boolean().optional(),
});

async function getActor(userId: string) {
  return prisma.profile.findUnique({
    where: { id: userId },
    select: { role: true, regionId: true },
  });
}

async function resolveCreateScope(
  userId: string,
  requestedScope: LetterScope | undefined,
  requestedRegionId: string | null | undefined,
  reply: FastifyReply,
) {
  const actor = await getActor(userId);

  if (!actor || (actor.role !== AppRole.admin_pusat && actor.role !== AppRole.admin_regional)) {
    reply.status(403).send({ message: "Forbidden" });
    return null;
  }

  if (actor.role === AppRole.admin_regional) {
    if (!actor.regionId) {
      reply.status(403).send({ message: "Admin regional belum memiliki region" });
      return null;
    }

    return { scope: LetterScope.regional, regionId: actor.regionId };
  }

  if (requestedScope && requestedScope !== LetterScope.pusat) {
    reply.status(403).send({ message: "Admin pusat hanya membuat data scope pusat pada endpoint ini" });
    return null;
  }

  if (requestedRegionId) {
    reply.status(400).send({ message: "regionId harus kosong untuk scope pusat" });
    return null;
  }

  return { scope: LetterScope.pusat, regionId: null };
}

async function resolveListWhere(userId: string, query: z.infer<typeof listSignaturesSchema>, reply: FastifyReply) {
  const actor = await getActor(userId);

  if (!actor || (actor.role !== AppRole.admin_pusat && actor.role !== AppRole.admin_regional)) {
    reply.status(403).send({ message: "Forbidden" });
    return null;
  }

  const where: { scope?: LetterScope; regionId?: string | null } = {};

  if (actor.role === AppRole.admin_regional) {
    if (!actor.regionId) {
      reply.status(403).send({ message: "Admin regional belum memiliki region" });
      return null;
    }

    where.scope = LetterScope.regional;
    where.regionId = actor.regionId;
    return where;
  }

  if (query.scope) {
    where.scope = query.scope;
    if (query.scope === LetterScope.pusat) where.regionId = null;
  }

  if (query.regionId && query.scope !== LetterScope.pusat) {
    where.regionId = query.regionId;
  }

  return where;
}

export async function signatureRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const query = listSignaturesSchema.parse(request.query);
    const where = await resolveListWhere(payload.sub, query, reply);
    if (!where) return reply;

    const signatures = await prisma.signature.findMany({
      where,
      include: {
        region: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, signatures };
  });

  app.post("/", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const body = createSignatureSchema.parse(request.body);
    const scoped = await resolveCreateScope(payload.sub, body.scope, body.regionId, reply);
    if (!scoped) return reply;

    const signature = await prisma.$transaction(async (tx) => {
      if (body.isActive ?? true) {
        await tx.signature.updateMany({
          where: {
            scope: scoped.scope,
            regionId: scoped.regionId,
            positionName: body.positionName,
            isActive: true,
          },
          data: { isActive: false, updatedById: payload.sub },
        });
      }

      return tx.signature.create({
        data: {
          scope: scoped.scope,
          regionId: scoped.regionId,
          leaderName: body.leaderName,
          positionName: body.positionName,
          imageUrl: body.imageUrl,
          isActive: body.isActive ?? true,
          createdById: payload.sub,
        },
      });
    });

    return { success: true, signature };
  });
}
