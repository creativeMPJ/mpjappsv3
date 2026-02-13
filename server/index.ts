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

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
  credentials: true,
});

await app.register(jwt, {
  secret: env.JWT_SECRET,
});
await app.register(multipart);
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
