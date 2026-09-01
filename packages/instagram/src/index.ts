// Meta Graph API — Facebook Page Reels + Instagram Business for Community Tap & Pizza.
// Tokens come from env (META_*), never from the DB.

import { createHmac, timingSafeEqual } from "node:crypto";

export interface MetaConfig {
  appId: string;
  appSecret: string;
  pageId: string;
  pageAccessToken: string;
  igUserId?: string;
  graphVersion?: string; // default v21.0
}

export interface PublishReelInput {
  videoUrl: string;
  caption: string;
  /** Publish to the Facebook Page video/Reels surface. */
  target: "facebook" | "instagram";
  productIds?: string[];
}

function graphBase(version: string) {
  return `https://graph.facebook.com/${version}`;
}

/**
 * Meta / Instagram client for Community Tap and Pizza.
 * Wire real publish calls once META_* keys are in .env.local.
 */
export class MetaClient {
  private readonly version: string;

  constructor(private readonly config: MetaConfig) {
    this.version = config.graphVersion ?? "v21.0";
  }

  /** Convenience alias used by older call sites. */
  static fromEnv(env: {
    META_APP_ID?: string | undefined;
    META_APP_SECRET?: string | undefined;
    META_PAGE_ID?: string | undefined;
    META_PAGE_ACCESS_TOKEN?: string | undefined;
    META_IG_USER_ID?: string | undefined;
  }): MetaClient | null {
    if (!env.META_APP_ID || !env.META_APP_SECRET || !env.META_PAGE_ID || !env.META_PAGE_ACCESS_TOKEN) {
      return null;
    }
    return new MetaClient({
      appId: env.META_APP_ID,
      appSecret: env.META_APP_SECRET,
      pageId: env.META_PAGE_ID,
      pageAccessToken: env.META_PAGE_ACCESS_TOKEN,
      ...(env.META_IG_USER_ID ? { igUserId: env.META_IG_USER_ID } : {}),
    });
  }

  /** Fetch Page metadata to verify the token works for Community Tap and Pizza. */
  async getPage(): Promise<{ id: string; name: string; link?: string }> {
    const url = new URL(`${graphBase(this.version)}/${this.config.pageId}`);
    url.searchParams.set("fields", "id,name,link");
    url.searchParams.set("access_token", this.config.pageAccessToken);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Meta getPage failed: ${res.status} ${await res.text()}`);
    }
    return (await res.json()) as { id: string; name: string; link?: string };
  }

  /** Set the Order Food action button on the linked Instagram business profile. */
  async setOrderFoodButton(orderingUrl: string): Promise<void> {
    if (!this.config.igUserId) {
      throw new Error("META_IG_USER_ID required to set Instagram Order Food button");
    }
    // Graph does not expose a single stable "action_buttons" write for all IG account types;
    // operators still confirm Order Food in the IG app / Professional dashboard.
    // This endpoint is the placeholder for the supported Page CTA / IG shopping CTA path.
    void orderingUrl;
    throw new Error(
      "Confirm Order Food CTA in Instagram Professional tools, then wire the Graph CTA endpoint for this Page type"
    );
  }

  /**
   * Publish a Reel to Facebook Page or Instagram.
   * Flow: create container → poll status → media_publish (IG) or video publish (FB).
   */
  async publishReel(opts: PublishReelInput): Promise<{ containerId: string }> {
    if (opts.target === "instagram") {
      if (!this.config.igUserId) {
        throw new Error("META_IG_USER_ID required for Instagram Reels");
      }
      void opts;
      throw new Error("Wire IG Reels: POST /{ig-user-id}/media (REELS) then /media_publish");
    }
    void opts;
    throw new Error("Wire Facebook Page Reels: POST /{page-id}/video_reels + finish upload");
  }

  /** Publish a shoppable reel/video with product tag (Instagram Shopping). */
  async publishShoppableVideo(opts: { videoUrl: string; caption: string; productIds: string[] }) {
    return this.publishReel({ ...opts, target: "instagram" });
  }

  /** Verify Meta webhook signature (X-Hub-Signature-256). */
  static verifyWebhookSignature(rawBody: string, signatureHeader: string, appSecret: string): boolean {
    const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex");
    const a = Buffer.from(expected);
    const b = Buffer.from(signatureHeader || "");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  }

  /** Respond to Meta webhook challenge (hub.mode / hub.verify_token / hub.challenge). */
  static verifyWebhookChallenge(
    query: { "hub.mode"?: string; "hub.verify_token"?: string; "hub.challenge"?: string },
    verifyToken: string
  ): string | null {
    if (query["hub.mode"] === "subscribe" && query["hub.verify_token"] === verifyToken) {
      return query["hub.challenge"] ?? null;
    }
    return null;
  }
}

/** @deprecated Use MetaClient — kept for import compatibility. */
export class InstagramClient extends MetaClient {
  constructor(config: { pageAccessToken: string; igUserId: string; graphVersion?: string }) {
    super({
      appId: "legacy",
      appSecret: "legacy",
      pageId: "legacy",
      pageAccessToken: config.pageAccessToken,
      igUserId: config.igUserId,
      ...(config.graphVersion ? { graphVersion: config.graphVersion } : {}),
    });
  }
}

export type { InstagramConfig } from "./legacy-types.js";
