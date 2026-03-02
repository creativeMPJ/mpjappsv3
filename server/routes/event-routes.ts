import { FastifyInstance } from "fastify";
import { AppRole } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma";
import { authenticate } from "../auth-guard";

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

export async function eventRoutes(app: FastifyInstance) {
    // CREATE EVENT
    app.post("/", { preHandler: [authenticate] }, async (req, reply) => {
        const schema = z.object({
            name: z.string(),
            description: z.string().optional(),
            date: z.coerce.date(),
            location: z.string().optional(),
            status: z.string().default("upcoming"),
        });

        const data = schema.parse(req.body);
        const event = await prisma.event.create({ data });
        return event;
    });

    // LIST EVENTS
    app.get("/", { preHandler: [authenticate] }, async (req, reply) => {
        const events = await prisma.event.findMany({
            orderBy: { date: "desc" },
        });
        return events;
    });

    // GET EVENT REPORTS (With Region Info)
    app.get("/:id/reports", { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params as { id: string };

        const event = await prisma.event.findUnique({
            where: { id },
        });

        if (!event) return reply.status(404).send({ message: "Event not found" });

        // Get all regions to verify which ones have submitted
        const regions = await prisma.region.findMany({
            orderBy: { name: "asc" },
            include: {
                _count: {
                    select: { cities: true }
                }
            }
        });

        // Get existing reports
        const reports = await prisma.eventReport.findMany({
            where: { eventId: id },
        });

        // Combine data
        const result = regions.map((region) => {
            const report = reports.find((r) => r.regionId === region.id);
            return {
                regionId: region.id,
                regionName: region.name,
                status: report ? "Submitted" : "Pending",
                report: report || null,
            };
        });

        return { event, reports: result };
    });

    // SUBMIT REPORT (For seed/testing or regional admin later)
    app.post("/:id/report", { preHandler: [authenticate] }, async (req, reply) => {
        const { id } = req.params as { id: string };
        const schema = z.object({
            regionId: z.string(),
            participationCount: z.number(),
            notes: z.string().optional(),
            photoUrl: z.string().optional(),
        });

        const data = schema.parse(req.body);

        const existingReport = await prisma.eventReport.findFirst({
            where: { eventId: id, regionId: data.regionId },
        });

        if (existingReport) {
            return await prisma.eventReport.update({
                where: { id: existingReport.id },
                data: {
                    participationCount: data.participationCount,
                    notes: data.notes,
                    photoUrl: data.photoUrl,
                    submittedAt: new Date(),
                },
            });
        } else {
            return await prisma.eventReport.create({
                data: {
                    eventId: id,
                    regionId: data.regionId,
                    participationCount: data.participationCount,
                    notes: data.notes,
                    photoUrl: data.photoUrl,
                },
            });
        }
    });

    // ══════════════════════════════════════════════
    // REGIONAL EVENT ENDPOINTS
    // ══════════════════════════════════════════════

    // LIST EVENTS (for regional dashboard)
    app.get("/regional", { preHandler: [authenticate] }, async (req) => {
        const payload = req.user as { sub: string };
        const regionId = await assertRegional(payload.sub);

        const events = await prisma.event.findMany({
            orderBy: { date: "desc" },
            include: {
                report: {
                    where: { regionId },
                    select: {
                        id: true,
                        participationCount: true,
                        notes: true,
                        submittedAt: true,
                    },
                },
                _count: {
                    select: { report: true },
                },
            },
        });

        return {
            events: events.map((e) => ({
                id: e.id,
                name: e.name,
                description: e.description,
                date: e.date,
                location: e.location,
                status: e.status,
                created_at: e.createdAt,
                report_count: e._count.report,
                my_report: e.report[0] ?? null,
            })),
        };
    });

    // CREATE EVENT (from regional)
    app.post("/regional", { preHandler: [authenticate] }, async (req) => {
        const payload = req.user as { sub: string };
        await assertRegional(payload.sub);

        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            date: z.coerce.date(),
            location: z.string().optional(),
        });

        const data = schema.parse(req.body);
        const event = await prisma.event.create({
            data: {
                name: data.name,
                description: data.description,
                date: data.date,
                location: data.location,
                status: "upcoming",
            },
        });

        return { success: true, event };
    });

    // UPDATE EVENT (from regional)
    app.put("/regional/:id", { preHandler: [authenticate] }, async (req, reply) => {
        const payload = req.user as { sub: string };
        await assertRegional(payload.sub);
        const params = req.params as { id?: string };
        if (!params.id) return reply.status(400).send({ message: "ID tidak valid" });

        const schema = z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            date: z.coerce.date().optional(),
            location: z.string().optional(),
            status: z.string().optional(),
        });

        const data = schema.parse(req.body);
        const event = await prisma.event.update({
            where: { id: params.id },
            data,
        });

        return { success: true, event };
    });

    // SUBMIT REPORT (from regional)
    app.post("/regional/:id/report", { preHandler: [authenticate] }, async (req, reply) => {
        const payload = req.user as { sub: string };
        const regionId = await assertRegional(payload.sub);
        const params = req.params as { id?: string };
        if (!params.id) return reply.status(400).send({ message: "ID tidak valid" });

        const schema = z.object({
            participationCount: z.number().int().min(0),
            notes: z.string().optional(),
        });

        const data = schema.parse(req.body);

        const existingReport = await prisma.eventReport.findFirst({
            where: { eventId: params.id, regionId },
        });

        if (existingReport) {
            const report = await prisma.eventReport.update({
                where: { id: existingReport.id },
                data: {
                    participationCount: data.participationCount,
                    notes: data.notes,
                    submittedAt: new Date(),
                },
            });
            return { success: true, report };
        } else {
            const report = await prisma.eventReport.create({
                data: {
                    eventId: params.id,
                    regionId,
                    participationCount: data.participationCount,
                    notes: data.notes,
                },
            });
            return { success: true, report };
        }
    });
}

