import { z } from "zod";

/**
 * Shared environment schema for all apps/services.
 * Every field is optional at parse-time (with safe defaults) so that
 * `pnpm build` / unit tests can run without a fully provisioned `.env`.
 * Required values are enforced at runtime by the service that needs them.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.string().default("info"),

  DATABASE_URL: z.string().default("file:./dev.db"),

  TIKTOK_SHOP_APP_KEY: z.string().optional(),
  TIKTOK_SHOP_APP_SECRET: z.string().optional(),
  TIKTOK_SHOP_ACCESS_TOKEN: z.string().optional(),
  TIKTOK_SHOP_SHOP_CIPHER: z.string().optional(),
  TIKTOK_SHOP_API_BASE_URL: z.string().default("https://open-api.tiktokglobalshop.com"),
  TIKTOK_SHOP_WEBHOOK_SECRET: z.string().optional(),

  META_APP_ID: z.string().optional(),
  META_APP_SECRET: z.string().optional(),
  META_GRAPH_API_BASE_URL: z.string().default("https://graph.facebook.com/v19.0"),
  META_PAGE_ACCESS_TOKEN: z.string().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  SENTRY_DSN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Parses `process.env`-shaped input, applying defaults for optional fields. */
export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  return envSchema.parse(source);
}
