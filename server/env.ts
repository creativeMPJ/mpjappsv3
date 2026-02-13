import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(12).default("change-this-jwt-secret"),
  API_PORT: z.coerce.number().int().positive().default(3001),
});

export const env = envSchema.parse(process.env);
