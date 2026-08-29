import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  TIKTOK_APP_KEY: z.string().min(1),
  TIKTOK_APP_SECRET: z.string().min(1),
  TIKTOK_SHOP_ID: z.string().min(1),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  META_PAGE_ACCESS_TOKEN: z.string().optional(),
  META_IG_USER_ID: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  GROK_BOT_WEBHOOK_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}
