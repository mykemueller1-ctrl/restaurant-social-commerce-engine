import { z } from "zod";

export { brand } from "./brand.js";
export type { Brand } from "./brand.js";

/**
 * Secrets for Community Tap & Pizza social commerce.
 * TikTok Shop + Meta (Facebook Page / Reels / Instagram) live here.
 * Never commit real values — use .env.local or a secret manager.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),

  // TikTok Shop (Partner Center app for @community.tap commerce)
  TIKTOK_APP_KEY: z.string().min(1).optional(),
  TIKTOK_APP_SECRET: z.string().min(1).optional(),
  TIKTOK_SHOP_ID: z.string().min(1).optional(),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),

  // Meta / Facebook — Community Tap and Pizza Page + linked IG
  META_APP_ID: z.string().min(1).optional(),
  META_APP_SECRET: z.string().min(1).optional(),
  META_PAGE_ID: z.string().min(1).optional(),
  META_PAGE_ACCESS_TOKEN: z.string().optional(),
  META_IG_USER_ID: z.string().optional(),
  META_WEBHOOK_VERIFY_TOKEN: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  GROK_BOT_WEBHOOK_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  return envSchema.parse(source);
}

/** True when Meta App ID + secret + page token are present for Graph calls. */
export function hasMetaCredentials(env: Env): boolean {
  return Boolean(env.META_APP_ID && env.META_APP_SECRET && env.META_PAGE_ACCESS_TOKEN && env.META_PAGE_ID);
}

/** True when TikTok Partner Center app credentials are present. */
export function hasTikTokCredentials(env: Env): boolean {
  return Boolean(env.TIKTOK_APP_KEY && env.TIKTOK_APP_SECRET && env.TIKTOK_SHOP_ID);
}
