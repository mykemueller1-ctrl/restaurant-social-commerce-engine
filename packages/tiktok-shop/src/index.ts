// TikTok Shop client — wraps the official Partner Center Node SDK.
// Install the generated SDK from Partner Center (App & Service → API SDK)
// and point TTS_SDK_PATH at it. This module normalizes the calls we need.

import { createHmac } from "node:crypto";
import type { TikTokShop } from "@rsc/db";

export interface TikTokConfig {
  appKey: string;
  appSecret: string;
  baseUrl?: string; // default sandbox or region prod
}

export interface CreateProductInput {
  menuItemId: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  imageUrls: string[];
  categoryId: string;
  isPerishable: boolean;
  fulfillment: "PICKUP" | "LOCAL_DELIVERY" | "SHIPPING";
}

/**
 * Signs a TikTok Shop request per Partner Center spec.
 * sign = HMAC-SHA256(app_secret, sorted_query + body)
 */
export function signRequest(
  params: Record<string, string>,
  body: string,
  appSecret: string
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join("");
  return createHmac("sha256", appSecret)
    .update(sorted + body)
    .digest("hex");
}

export class TikTokShopClient {
  constructor(private readonly shop: TikTokShop, private readonly config: TikTokConfig) {}

  /** Create or update a product from a menu item. Returns TikTok product_id. */
  async upsertProduct(input: CreateProductInput): Promise<string> {
    // TODO: call official SDK createProduct / updateProduct.
    // Sandbox first. Map fulfillment → TikTok shipping/pickup terms.
    void input;
    throw new Error("Wire official SDK: partner.tiktokshop.com → App & Service → API SDK");
  }

  /** Search orders by status + time window (POST /order/202309/orders/search). */
  async searchOrders(opts: { status?: string; since?: Date; page?: number }) {
    void opts;
    throw new Error("Wire official SDK order search");
  }

  /** Verify webhook signature from TikTok. */
  static verifyWebhook(rawBody: string, signature: string, appSecret: string): boolean {
    const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
    return signature === expected;
  }
}
