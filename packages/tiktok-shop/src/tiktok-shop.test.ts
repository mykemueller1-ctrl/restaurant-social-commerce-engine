import { describe, it, expect } from "vitest";
import { signRequest, TikTokShopClient } from "./index.js";

describe("signRequest", () => {
  it("is deterministic for sorted params", () => {
    const a = signRequest({ b: "2", a: "1" }, "{}", "secret");
    const b = signRequest({ a: "1", b: "2" }, "{}", "secret");
    expect(a).toBe(b);
  });
});

describe("TikTokShopClient.verifyWebhook", () => {
  it("accepts a matching signature", () => {
    const body = '{"order_id":"1"}';
    const secret = "s3cr3t";
    const sig = signRequest({}, body, secret); // simplified; real uses header hmac
    expect(TikTokShopClient.verifyWebhook(body, sig, secret)).toBe(true);
  });
});
