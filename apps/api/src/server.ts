import Fastify from "fastify";
import { loadEnv } from "@rsc/config";
import { prisma } from "@rsc/db";
import { TikTokShopClient } from "@rsc/tiktok";

const env = loadEnv();
const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true, ts: Date.now() }));

/** TikTok Shop webhook — order status, product review. */
app.post("/webhooks/tiktok", async (req, reply) => {
  const signature = (req.headers["x-tts-signature"] as string) ?? "";
  const raw = JSON.stringify(req.body);
  if (!TikTokShopClient.verifyWebhook(raw, signature, env.TIKTOK_APP_SECRET)) {
    reply.code(401);
    return { error: "invalid signature" };
  }
  // Persist order / update product status via prisma.
  app.log.info({ event: req.body }, "tiktok webhook received");
  return { received: true };
});

/** Push a menu item to TikTok Shop as a product (sandbox). */
app.post("/products/sync", async (req) => {
  const body = req.body as { menuItemId: string };
  const item = await prisma.menuItem.findUniqueOrThrow({ where: { id: body.menuItemId }, include: { restaurant: true } });
  const shop = await prisma.tikTokShop.findUniqueOrThrow({ where: { restaurantId: item.restaurantId } });
  const client = new TikTokShopClient(shop, { appKey: env.TIKTOK_APP_KEY, appSecret: env.TIKTOK_APP_SECRET });
  const tiktokProductId = await client.upsertProduct({
    menuItemId: item.id,
    name: item.name,
    description: item.description ?? undefined,
    priceCents: item.priceCents,
    currency: item.currency,
    imageUrls: item.imageUrl ? [item.imageUrl] : [],
    categoryId: "food_placeholder", // map to real TikTok category
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
  app.log.info(`API on :${port}`);
});
