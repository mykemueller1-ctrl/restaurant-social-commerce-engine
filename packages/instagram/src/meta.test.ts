import { createHmac } from "node:crypto";
import { describe, it, expect } from "vitest";
import { MetaClient } from "./index.js";

describe("MetaClient.verifyWebhookChallenge", () => {
  it("returns challenge when token matches", () => {
    const challenge = MetaClient.verifyWebhookChallenge(
      { "hub.mode": "subscribe", "hub.verify_token": "ctap-secret", "hub.challenge": "12345" },
      "ctap-secret"
    );
    expect(challenge).toBe("12345");
  });

  it("rejects bad token", () => {
    expect(
      MetaClient.verifyWebhookChallenge(
        { "hub.mode": "subscribe", "hub.verify_token": "nope", "hub.challenge": "12345" },
        "ctap-secret"
      )
    ).toBeNull();
  });
});

describe("MetaClient.verifyWebhookSignature", () => {
  it("accepts a matching sha256 signature", () => {
    const body = '{"object":"page"}';
    const secret = "app-secret";
    const sig = "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
    expect(MetaClient.verifyWebhookSignature(body, sig, secret)).toBe(true);
  });
});

describe("MetaClient.fromEnv", () => {
  it("returns null when Meta keys are missing", () => {
    expect(MetaClient.fromEnv({})).toBeNull();
  });

  it("builds a client when Page keys are present", () => {
    const client = MetaClient.fromEnv({
      META_APP_ID: "1",
      META_APP_SECRET: "2",
      META_PAGE_ID: "3",
      META_PAGE_ACCESS_TOKEN: "4",
    });
    expect(client).toBeInstanceOf(MetaClient);
  });
});
