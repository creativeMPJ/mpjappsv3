import { AppRole, LetterDirection, LetterDocumentType, LetterScope } from "@prisma/client";
import type { FastifyInstance, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate } from "../auth-guard";
import { prisma } from "../prisma";

const letterScopeSchema = z.nativeEnum(LetterScope);
const letterTypeSchema = z.nativeEnum(LetterDirection);
const documentTypeSchema = z.nativeEnum(LetterDocumentType);

const listLettersSchema = z.object({
  type: letterTypeSchema.optional(),
  scope: letterScopeSchema.optional(),
  regionId: z.string().uuid().optional(),
});

const outgoingLetterSchema = z.object({
  scope: letterScopeSchema.optional(),
  regionId: z.string().uuid().nullable().optional(),
  subject: z.string().min(1),
  documentType: documentTypeSchema,
  recipientName: z.string().nullable().optional(),
  signerName: z.string().nullable().optional(),
  signerPosition: z.string().nullable().optional(),
  letterDate: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const incomingLetterSchema = z.object({
  scope: letterScopeSchema.optional(),
  regionId: z.string().uuid().nullable().optional(),
  originNumber: z.string().nullable().optional(),
  senderName: z.string().nullable().optional(),
  subject: z.string().min(1),
  documentType: documentTypeSchema,
  letterDate: z.coerce.date().nullable().optional(),
  receivedAt: z.coerce.date().nullable().optional(),
  scanFileUrl: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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

async function resolveListWhere(userId: string, query: z.infer<typeof listLettersSchema>, reply: FastifyReply) {
  const actor = await getActor(userId);

  if (!actor || (actor.role !== AppRole.admin_pusat && actor.role !== AppRole.admin_regional)) {
    reply.status(403).send({ message: "Forbidden" });
    return null;
  }

  const where: {
    direction?: LetterDirection;
    scope?: LetterScope;
    regionId?: string | null;
  } = {};

  if (query.type) where.direction = query.type;

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
    if (query.scope === LetterScope.pusat) {
      where.regionId = null;
    }
  }

  if (query.regionId && query.scope !== LetterScope.pusat) {
    where.regionId = query.regionId;
  }

  return where;
}

export async function letterRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const query = listLettersSchema.parse(request.query);
    const where = await resolveListWhere(payload.sub, query, reply);
    if (!where) return reply;

    const letters = await prisma.letter.findMany({
      where,
      include: {
        region: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, letters };
  });

  app.post("/", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const body = outgoingLetterSchema.parse(request.body);
    const scoped = await resolveCreateScope(payload.sub, body.scope, body.regionId, reply);
    if (!scoped) return reply;

    const letter = await prisma.letter.create({
      data: {
        direction: LetterDirection.outgoing,
        scope: scoped.scope,
        regionId: scoped.regionId,
        subject: body.subject,
        documentType: body.documentType,
        recipientName: body.recipientName,
        signerName: body.signerName,
        signerPosition: body.signerPosition,
        letterDate: body.letterDate,
        notes: body.notes,
        status: "draft",
        createdById: payload.sub,
      },
    });

    return { success: true, letter };
  });

  app.post("/incoming", { preHandler: authenticate }, async (request, reply) => {
    const payload = (request as any).user as { sub: string };
    const body = incomingLetterSchema.parse(request.body);
    const scoped = await resolveCreateScope(payload.sub, body.scope, body.regionId, reply);
    if (!scoped) return reply;

    const letter = await prisma.letter.create({
      data: {
        direction: LetterDirection.incoming,
        scope: scoped.scope,
        regionId: scoped.regionId,
        originNumber: body.originNumber,
        senderName: body.senderName,
        subject: body.subject,
        documentType: body.documentType,
        letterDate: body.letterDate,
        receivedAt: body.receivedAt,
        scanFileUrl: body.scanFileUrl,
        notes: body.notes,
        status: "registered",
        createdById: payload.sub,
      },
    });

    return { success: true, letter };
  });
}
