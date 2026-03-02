import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { ZodError } from "zod";
import path from "node:path";
import { env } from "./env";
import { authRoutes } from "./routes/auth";
import { adminRoutes } from "./routes/admin";
import { institutionRoutes } from "./routes/institution";
import { publicRoutes } from "./routes/public";
import { paymentRoutes } from "./routes/payments";
import { claimRoutes } from "./routes/claims";
import { mediaRoutes } from "./routes/media";
import { regionalRoutes } from "./routes/regional";
import { eventRoutes } from "./routes/event-routes";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
});
await app.register(multipart, { limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB to accommodate 1MB files + multipart overhead
await app.register(fastifyStatic, {
  root: path.join(process.cwd(), "uploads"),
  prefix: "/uploads/",
});

app.get("/api/health", async () => ({ ok: true }));

await app.register(authRoutes, { prefix: "/api/auth" });
await app.register(adminRoutes, { prefix: "/api/admin" });
await app.register(institutionRoutes, { prefix: "/api/institutions" });
await app.register(publicRoutes, { prefix: "/api/public" });
await app.register(paymentRoutes, { prefix: "/api/payments" });
await app.register(claimRoutes, { prefix: "/api/claims" });
await app.register(mediaRoutes, { prefix: "/api/media" });
await app.register(regionalRoutes, { prefix: "/api/regional" });
await app.register(eventRoutes, { prefix: "/api/events" });

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: "Validation failed",
      issues: error.issues,
    });
  }

  app.log.error(error);
  return reply.status(500).send({ message: "Internal server error" });
});

const start = async () => {
  try {
    await app.listen({ port: env.API_PORT, host: "0.0.0.0" });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

await start();
