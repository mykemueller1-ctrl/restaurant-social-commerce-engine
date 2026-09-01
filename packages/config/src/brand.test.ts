import { describe, it, expect } from "vitest";
import { brand, hasMetaCredentials, hasTikTokCredentials } from "./index.js";

describe("Community Tap & Pizza brand", () => {
  it("pins TikTok handle to community.tap", () => {
    expect(brand.social.tiktokHandle).toBe("community.tap");
    expect(brand.slug).toBe("community-tap-pizza");
    expect(brand.social.facebookPageName).toBe("Community Tap and Pizza");
  });
});

describe("credential helpers", () => {
  it("reports Meta missing until all Page keys exist", () => {
    expect(
      hasMetaCredentials({
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://localhost/rsc",
        META_APP_ID: "1",
      })
    ).toBe(false);
    expect(
      hasMetaCredentials({
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://localhost/rsc",
        META_APP_ID: "1",
        META_APP_SECRET: "2",
        META_PAGE_ID: "3",
        META_PAGE_ACCESS_TOKEN: "4",
      })
    ).toBe(true);
  });

  it("reports TikTok missing until shop trio exists", () => {
    expect(
      hasTikTokCredentials({
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://localhost/rsc",
        TIKTOK_APP_KEY: "k",
      })
    ).toBe(false);
  });
});
