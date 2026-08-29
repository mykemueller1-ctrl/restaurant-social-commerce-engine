import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { loadEnv } from "@restaurant/config";
import { buildApp } from "../src/app.js";
import { InMemoryStore } from "../src/store.js";

const env = loadEnv({
  NODE_ENV: "test",
  TIKTOK_SHOP_APP_KEY: "key",
  TIKTOK_SHOP_APP_SECRET: "secret",
  TIKTOK_SHOP_ACCESS_TOKEN: "token",
  TIKTOK_SHOP_WEBHOOK_SECRET: "webhook-secret",
});

async function makeApp() {
  const store = new InMemoryStore();
  const createProduct = vi.fn(async (input: { productName: string }) => ({
    id: "tt-prod-1",
    status: "PENDING_REVIEW",
    productName: input.productName,
  }));
  const app = await buildApp({
    store,
    env,
    logger: false,
    tiktokClientFactory: () =>
      ({ createProduct, updateProduct: vi.fn(), searchOrders: vi.fn(), getOrderDetail: vi.fn() }) as never,
  });
  return { app, store, createProduct };
}

describe("api app", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports healthy", async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toMatchObject({ status: "ok" });
  });

  it("creates a menu item and pushes it to TikTok Shop as a product", async () => {
    const { app, createProduct } = await makeApp();

    const createRes = await app.inject({
      method: "POST",
      url: "/menu-items",
      payload: { restaurantId: "r1", name: "Spicy Ramen", priceCents: 1299 },
    });
    expect(createRes.statusCode).toBe(201);
    const { menuItem } = createRes.json();
    expect(menuItem.name).toBe("Spicy Ramen");

    const pushRes = await app.inject({
      method: "POST",
      url: `/menu-items/${menuItem.id}/tiktok-product`,
    });

    expect(pushRes.statusCode).toBe(200);
    expect(createProduct).toHaveBeenCalledWith(
      expect.objectContaining({ productName: "Spicy Ramen", priceCents: 1299 }),
    );
    const { tiktokProduct } = pushRes.json();
    expect(tiktokProduct.tiktokProductId).toBe("tt-prod-1");
    expect(tiktokProduct.status).toBe("PENDING_REVIEW");
  });

  it("returns 404 pushing a nonexistent menu item", async () => {
    const { app } = await makeApp();
    const res = await app.inject({ method: "POST", url: "/menu-items/does-not-exist/tiktok-product" });
    expect(res.statusCode).toBe(404);
  });

  it("verifies webhook signature and records a valid order", async () => {
    const { app, store } = await makeApp();

    const payload = {
      type: "ORDER_STATUS_CHANGE",
      data: { order_id: "ord-1", order_status: "AWAITING_SHIPMENT", total_amount: 1500, currency: "USD" },
    };
    const rawBody = JSON.stringify(payload);
    const signature = createHmac("sha256", "webhook-secret").update(rawBody, "utf8").digest("hex");

    const res = await app.inject({
      method: "POST",
      url: "/webhooks/tiktok",
      headers: { "content-type": "application/json", "x-tts-signature": signature },
      payload: rawBody,
    });

    expect(res.statusCode).toBe(200);
    const orders = await store.listOrders();
    expect(orders).toHaveLength(1);
    expect(orders[0]).toMatchObject({ tiktokOrderId: "ord-1", status: "AWAITING_SHIPMENT", totalCents: 1500 });
  });

  it("rejects a webhook with an invalid signature", async () => {
    const { app, store } = await makeApp();

    const payload = { type: "ORDER_STATUS_CHANGE", data: { order_id: "ord-2" } };
    const res = await app.inject({
      method: "POST",
      url: "/webhooks/tiktok",
      headers: { "content-type": "application/json", "x-tts-signature": "not-a-real-signature" },
      payload: JSON.stringify(payload),
    });

    expect(res.statusCode).toBe(401);
    expect(await store.listOrders()).toHaveLength(0);
  });
});
