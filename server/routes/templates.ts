import { AppRole, LetterDocumentType, LetterScope } from "@prisma/client";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const templateScopeSchema = z.nativeEnum(LetterScope);
const documentTypeSchema = z.nativeEnum(LetterDocumentType);

const listTemplatesSchema = z.object({
  scope: templateScopeSchema.optional(),
  regionId: z.string().uuid().optional(),
  documentType: documentTypeSchema.optional(),
});

const createTemplateSchema = z.object({
  scope: templateScopeSchema.optional(),
  regionId: z.string().uuid().nullable().optional(),
  documentType: documentTypeSchema,
  numberX: z.number(),
  numberY: z.number(),
  signatureX: z.number(),
  signatureY: z.number(),
  qrX: z.number(),
  qrY: z.number(),
  fontSize: z.number().int().positive(),
  targetPage: z.number().int().positive().optional(),
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

async function resolveListWhere(userId: string, query: z.infer<typeof listTemplatesSchema>, reply: FastifyReply) {
  const actor = await getActor(userId);

  if (!actor || (actor.role !== AppRole.admin_pusat && actor.role !== AppRole.admin_regional)) {
    reply.status(403).send({ message: "Forbidden" });
    return null;
  }

  const where: { scope?: LetterScope; regionId?: string | null; documentType?: LetterDocumentType } = {};

  if (query.documentType) where.documentType = query.documentType;

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

export async function templateRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const query = listTemplatesSchema.parse(request.query);
    const where = await resolveListWhere(payload.sub, query, reply);
    if (!where) return reply;

    const templates = await prisma.templatePosition.findMany({
      where,
      include: {
        region: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, templates };
  });

  app.post("/", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const body = createTemplateSchema.parse(request.body);
    const scoped = await resolveCreateScope(payload.sub, body.scope, body.regionId, reply);
    if (!scoped) return reply;

    const template = await prisma.$transaction(async (tx) => {
      if (body.isActive ?? true) {
        await tx.templatePosition.updateMany({
          where: {
            scope: scoped.scope,
            regionId: scoped.regionId,
            documentType: body.documentType,
            isActive: true,
          },
          data: { isActive: false, updatedById: payload.sub },
        });
      }

      return tx.templatePosition.create({
        data: {
          scope: scoped.scope,
          regionId: scoped.regionId,
          documentType: body.documentType,
          numberX: body.numberX,
          numberY: body.numberY,
          signatureX: body.signatureX,
          signatureY: body.signatureY,
          qrX: body.qrX,
          qrY: body.qrY,
          fontSize: body.fontSize,
          targetPage: body.targetPage ?? 1,
          isActive: body.isActive ?? true,
          createdById: payload.sub,
        },
      });
    });

    return { success: true, template };
  });
}
