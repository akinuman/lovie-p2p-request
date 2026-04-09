import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  PLAYWRIGHT_BASE_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(16),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (cachedEnv) {
    return cachedEnv;
  }

  cachedEnv = serverEnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    PLAYWRIGHT_BASE_URL: process.env.PLAYWRIGHT_BASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
  });

  return cachedEnv;
}
