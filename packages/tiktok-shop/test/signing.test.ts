import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signTikTokShopRequest, verifyTikTokShopWebhookSignature } from "../src/signing.js";

describe("signTikTokShopRequest", () => {
  it("produces a deterministic signature for the same inputs", () => {
    const params = {
      path: "/product/202309/products",
      query: { app_key: "key123", timestamp: 1700000000 },
      body: JSON.stringify({ product_name: "Spicy Ramen" }),
      appSecret: "supersecret",
    };

    const sign1 = signTikTokShopRequest(params);
    const sign2 = signTikTokShopRequest(params);

    expect(sign1).toBe(sign2);
    expect(sign1).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes when the query params change", () => {
    const base = {
      path: "/product/202309/products",
      appSecret: "supersecret",
    };

    const signA = signTikTokShopRequest({ ...base, query: { app_key: "a" } });
    const signB = signTikTokShopRequest({ ...base, query: { app_key: "b" } });

    expect(signA).not.toBe(signB);
  });

  it("ignores sign and access_token when present in query", () => {
    const base = {
      path: "/order/202309/orders/search",
      appSecret: "supersecret",
    };

    const signA = signTikTokShopRequest({ ...base, query: { app_key: "a" } });
    const signB = signTikTokShopRequest({
      ...base,
      query: { app_key: "a", sign: "ignored", access_token: "ignored-too" },
    });

    expect(signA).toBe(signB);
  });

  it("is independent of key ordering in the input object", () => {
    const signA = signTikTokShopRequest({
      path: "/p",
      appSecret: "s",
      query: { b: "2", a: "1" },
    });
    const signB = signTikTokShopRequest({
      path: "/p",
      appSecret: "s",
      query: { a: "1", b: "2" },
    });

    expect(signA).toBe(signB);
  });
});

describe("verifyTikTokShopWebhookSignature", () => {
  const webhookSecret = "webhook-secret";
  const rawBody = JSON.stringify({ order_id: "123", status: "AWAITING_SHIPMENT" });

  function computeExpectedSignature(): string {
    return createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("hex");
  }

  it("accepts a valid signature", () => {
    const signature = computeExpectedSignature();
    expect(verifyTikTokShopWebhookSignature({ rawBody, signature, webhookSecret })).toBe(true);
  });

  it("rejects a tampered payload", () => {
    const signature = computeExpectedSignature();
    const tamperedBody = JSON.stringify({ order_id: "123", status: "CANCELLED" });
    expect(
      verifyTikTokShopWebhookSignature({ rawBody: tamperedBody, signature, webhookSecret }),
    ).toBe(false);
  });

  it("rejects a missing signature", () => {
    expect(
      verifyTikTokShopWebhookSignature({ rawBody, signature: undefined, webhookSecret }),
    ).toBe(false);
  });

  it("rejects an incorrect secret", () => {
    const signature = computeExpectedSignature();
    expect(
      verifyTikTokShopWebhookSignature({ rawBody, signature, webhookSecret: "wrong-secret" }),
    ).toBe(false);
  });
});
