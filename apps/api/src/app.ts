import Fastify, { type FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import { verifyTikTokShopWebhookSignature, TikTokShopClient } from "@restaurant/tiktok-shop";
import type { Env } from "@restaurant/config";
import type { Store } from "./store.js";

export interface BuildAppOptions {
  store: Store;
  env: Env;
  logger?: boolean;
  /** Optional override, used in tests to avoid real TikTok Shop API calls. */
  tiktokClientFactory?: () => TikTokShopClient;
}

export async function buildApp({ store, env, logger, tiktokClientFactory }: BuildAppOptions): Promise<FastifyInstance> {
  const app = Fastify({ logger: logger ?? true });

  await app.register(rateLimit, {
    global: false,
    max: 60,
    timeWindow: "1 minute",
  });

  // Preserve the raw JSON body string so TikTok Shop webhook signatures can be
  // verified byte-for-byte before the payload is parsed/used.
  app.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => {
    try {
      done(null, body);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  app.get("/health", async () => ({ status: "ok", uptime: process.uptime() }));

  app.post<{ Body: { restaurantId: string; name: string; description?: string; priceCents: number; currency?: string; imageUrl?: string } }>(
    "/menu-items",
    async (req, reply) => {
      const parsedBody =
        typeof req.body === "string" ? (JSON.parse(req.body || "{}") as typeof req.body) : req.body;
      const { restaurantId, name, description, priceCents, currency, imageUrl } = parsedBody ?? {};
      if (!restaurantId || !name || typeof priceCents !== "number") {
        return reply.code(400).send({ error: "restaurantId, name, and priceCents are required" });
      }
      const menuItem = await store.createMenuItem({
        restaurantId,
        name,
        description,
        priceCents,
        currency: currency ?? "USD",
        imageUrl,
      });
      return reply.code(201).send({ menuItem });
    },
  );

  app.get("/menu-items", async () => ({ menuItems: await store.listMenuItems() }));

  app.post<{ Params: { id: string } }>(
    "/menu-items/:id/tiktok-product",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (req, reply) => {
    const menuItem = await store.getMenuItem(req.params.id);
    if (!menuItem) {
      return reply.code(404).send({ error: "menu item not found" });
    }

    if (!env.TIKTOK_SHOP_APP_KEY || !env.TIKTOK_SHOP_APP_SECRET || !env.TIKTOK_SHOP_ACCESS_TOKEN) {
      return reply.code(503).send({ error: "TikTok Shop credentials are not configured" });
    }

    const client =
      tiktokClientFactory?.() ??
      new TikTokShopClient({
        appKey: env.TIKTOK_SHOP_APP_KEY,
        appSecret: env.TIKTOK_SHOP_APP_SECRET,
        accessToken: env.TIKTOK_SHOP_ACCESS_TOKEN,
        shopCipher: env.TIKTOK_SHOP_SHOP_CIPHER,
        baseUrl: env.TIKTOK_SHOP_API_BASE_URL,
      });

    try {
      const existing = await store.getTikTokProductByMenuItemId(menuItem.id);
      const product = existing?.tiktokProductId
        ? await client.updateProduct(existing.tiktokProductId, {
            productName: menuItem.name,
            description: menuItem.description,
            priceCents: menuItem.priceCents,
            currency: menuItem.currency,
            images: menuItem.imageUrl ? [menuItem.imageUrl] : undefined,
          })
        : await client.createProduct({
            productName: menuItem.name,
            description: menuItem.description,
            priceCents: menuItem.priceCents,
            currency: menuItem.currency,
            images: menuItem.imageUrl ? [menuItem.imageUrl] : undefined,
          });

      const tiktokProduct = await store.upsertTikTokProduct({
        menuItemId: menuItem.id,
        tiktokProductId: product.id,
        status: mapTikTokProductStatus(product.status),
        syncError: null,
      });

      return reply.code(200).send({ tiktokProduct });
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      const failed = await store.upsertTikTokProduct({
        menuItemId: menuItem.id,
        tiktokProductId: null,
        status: "REJECTED",
        syncError: message,
      });
      return reply.code(502).send({ error: message, tiktokProduct: failed });
    }
    },
  );

  app.get("/orders", async () => ({ orders: await store.listOrders() }));

  app.post(
    "/webhooks/tiktok",
    { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const rawBody =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
      const signature = req.headers["x-tts-signature"] as string | undefined;

      if (!env.TIKTOK_SHOP_WEBHOOK_SECRET) {
        return reply.code(503).send({ error: "webhook secret not configured" });
      }

      const valid = verifyTikTokShopWebhookSignature({
        rawBody,
        signature,
        webhookSecret: env.TIKTOK_SHOP_WEBHOOK_SECRET,
      });

      if (!valid) {
        return reply.code(401).send({ error: "invalid signature" });
      }

      const payload = JSON.parse(rawBody) as {
        type?: string;
        data?: {
          order_id?: string;
          order_status?: string;
          product_id?: string;
          total_amount?: number;
          currency?: string;
        };
      };

      if (payload.type !== "ORDER_STATUS_CHANGE" || !payload.data?.order_id) {
        return reply.code(200).send({ received: true, ignored: true });
      }

      const tiktokProduct = payload.data.product_id
        ? await store.getTikTokProductByExternalId(payload.data.product_id)
        : undefined;

      const order = await store.recordOrder({
        tiktokOrderId: payload.data.order_id,
        tiktokProductId: tiktokProduct?.id ?? null,
        status: payload.data.order_status ?? "UNPAID",
        totalCents: payload.data.total_amount ?? 0,
        currency: payload.data.currency ?? "USD",
        rawPayload: payload,
      });

      return reply.code(200).send({ received: true, order });
    },
  );

  return app;
}

function mapTikTokProductStatus(status: string): "DRAFT" | "PENDING_REVIEW" | "LIVE" | "REJECTED" | "DELISTED" {
  const normalized = status?.toUpperCase();
  if (normalized === "LIVE" || normalized === "PENDING_REVIEW" || normalized === "REJECTED" || normalized === "DELISTED") {
    return normalized;
  }
  return "PENDING_REVIEW";
}
