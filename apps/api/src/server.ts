import Fastify from "fastify";
import { brand, hasMetaCredentials, hasTikTokCredentials, loadEnv } from "@rsc/config";
import { prisma } from "@rsc/db";
import { MetaClient } from "@rsc/instagram";
import { TikTokShopClient } from "@rsc/tiktok";

const env = loadEnv();
const app = Fastify({ logger: true });

app.get("/health", async () => ({
  ok: true,
  brand: brand.name,
  ts: Date.now(),
}));

/** Brand + social handles for Community Tap & Pizza. */
app.get("/brand", async () => ({
  ...brand,
  credentials: {
    tiktok: hasTikTokCredentials(env),
    meta: hasMetaCredentials(env),
  },
}));

/** Meta integration status — does not expose secrets. */
app.get("/integrations/meta/status", async () => {
  const configured = hasMetaCredentials(env);
  if (!configured) {
    return {
      configured: false,
      brand: brand.name,
      facebookPageName: brand.social.facebookPageName,
      docs: "docs/META_SETUP.md",
      missing: ["META_APP_ID", "META_APP_SECRET", "META_PAGE_ID", "META_PAGE_ACCESS_TOKEN"].filter(
        (k) => !(env as Record<string, string | undefined>)[k]
      ),
    };
  }

  const client = MetaClient.fromEnv(env)!;
  try {
    const page = await client.getPage();
    return {
      configured: true,
      brand: brand.name,
      page,
      igUserIdSet: Boolean(env.META_IG_USER_ID),
    };
  } catch (err) {
    return {
      configured: true,
      brand: brand.name,
      error: err instanceof Error ? err.message : "Meta Graph error",
    };
  }
});

/** Meta webhook verify (GET) + event receive (POST). */
app.get("/webhooks/meta", async (req, reply) => {
  const q = req.query as {
    "hub.mode"?: string;
    "hub.verify_token"?: string;
    "hub.challenge"?: string;
  };
  const challenge = MetaClient.verifyWebhookChallenge(q, env.META_WEBHOOK_VERIFY_TOKEN ?? "");
  if (challenge == null) {
    reply.code(403);
    return { error: "verification failed" };
  }
  reply.type("text/plain");
  return challenge;
});

app.post("/webhooks/meta", async (req, reply) => {
  const signature = (req.headers["x-hub-signature-256"] as string) ?? "";
  const raw = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  if (!env.META_APP_SECRET || !MetaClient.verifyWebhookSignature(raw, signature, env.META_APP_SECRET)) {
    reply.code(401);
    return { error: "invalid signature" };
  }
  app.log.info({ event: req.body }, "meta webhook received");
  return { received: true };
});

/** TikTok Shop webhook — order status, product review. */
app.post("/webhooks/tiktok", async (req, reply) => {
  if (!env.TIKTOK_APP_SECRET) {
    reply.code(503);
    return { error: "TikTok credentials not configured" };
  }
  const signature = (req.headers["x-tts-signature"] as string) ?? "";
  const raw = JSON.stringify(req.body);
  if (!TikTokShopClient.verifyWebhook(raw, signature, env.TIKTOK_APP_SECRET)) {
    reply.code(401);
    return { error: "invalid signature" };
  }
  app.log.info({ event: req.body }, "tiktok webhook received");
  return { received: true };
});

/** Push a menu item to TikTok Shop as a product (sandbox). */
app.post("/products/sync", async (req, reply) => {
  if (!hasTikTokCredentials(env)) {
    reply.code(503);
    return { error: "TikTok credentials not configured — set TIKTOK_APP_KEY/SECRET/SHOP_ID" };
  }
  const body = req.body as { menuItemId: string };
  const item = await prisma.menuItem.findUniqueOrThrow({
    where: { id: body.menuItemId },
    include: { restaurant: true },
  });
  const shop = await prisma.tikTokShop.findUniqueOrThrow({ where: { restaurantId: item.restaurantId } });
  const client = new TikTokShopClient(shop, {
    appKey: env.TIKTOK_APP_KEY!,
    appSecret: env.TIKTOK_APP_SECRET!,
  });
  const tiktokProductId = await client.upsertProduct({
    menuItemId: item.id,
    name: item.name,
    ...(item.description ? { description: item.description } : {}),
    priceCents: item.priceCents,
    currency: item.currency,
    imageUrls: item.imageUrl ? [item.imageUrl] : [],
    categoryId: "food_placeholder",
    isPerishable: item.isPerishable,
    fulfillment: item.fulfillment,
  });
  await prisma.tikTokProduct.upsert({
    where: { menuItemId: item.id },
    create: { shopId: shop.id, menuItemId: item.id, tiktokProductId, status: "PENDING_REVIEW" },
    update: { tiktokProductId, status: "PENDING_REVIEW", lastSyncedAt: new Date() },
  });
  return { tiktokProductId };
});

const port = Number(process.env.PORT ?? 3001);
app.listen({ port, host: "0.0.0.0" }).then(() => {
  app.log.info(`${brand.name} API on :${port}`);
});
