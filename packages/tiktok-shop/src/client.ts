import { request } from "undici";
import { signTikTokShopRequest } from "./signing.js";

export interface TikTokShopClientConfig {
  appKey: string;
  appSecret: string;
  accessToken: string;
  shopCipher?: string;
  baseUrl?: string;
}

export interface TikTokShopProductInput {
  productName: string;
  description?: string;
  priceCents: number;
  currency: string;
  images?: string[];
}

export interface TikTokShopProduct {
  id: string;
  status: string;
  productName: string;
}

export interface TikTokShopOrder {
  id: string;
  status: string;
  totalCents: number;
  currency: string;
}

/**
 * Thin, typed wrapper around the TikTok Shop Open API (Partner Center).
 * Every request is signed per {@link signTikTokShopRequest}.
 */
export class TikTokShopClient {
  private readonly config: Required<Omit<TikTokShopClientConfig, "shopCipher">> & {
    shopCipher?: string;
  };

  constructor(config: TikTokShopClientConfig) {
    this.config = {
      baseUrl: "https://open-api.tiktokglobalshop.com",
      ...config,
    };
  }

  private buildQuery(extra: Record<string, string | number | boolean | undefined> = {}) {
    const query: Record<string, string | number | boolean | undefined> = {
      app_key: this.config.appKey,
      timestamp: Math.floor(Date.now() / 1000),
      ...extra,
    };
    if (this.config.shopCipher) query.shop_cipher = this.config.shopCipher;
    return query;
  }

  private async call<T>(
    method: "GET" | "POST",
    path: string,
    query: Record<string, string | number | boolean | undefined>,
    body?: unknown,
  ): Promise<T> {
    const bodyString = body ? JSON.stringify(body) : undefined;
    const sign = signTikTokShopRequest({
      path,
      query,
      body: bodyString,
      appSecret: this.config.appSecret,
    });

    const fullQuery = { ...query, sign };
    const url = new URL(this.config.baseUrl + path);
    for (const [key, value] of Object.entries(fullQuery)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }

    const response = await request(url, {
      method,
      headers: {
        "content-type": "application/json",
        "x-tts-access-token": this.config.accessToken,
      },
      body: bodyString,
    });

    const json = (await response.body.json()) as { code?: number; message?: string; data?: T };
    if (response.statusCode >= 400 || (json.code && json.code !== 0)) {
      throw new Error(`TikTok Shop API error (${json.code ?? response.statusCode}): ${json.message ?? "unknown"}`);
    }
    return json.data as T;
  }

  /** Creates a new product listing in the connected TikTok Shop. */
  async createProduct(input: TikTokShopProductInput): Promise<TikTokShopProduct> {
    return this.call<TikTokShopProduct>("POST", "/product/202309/products", this.buildQuery(), {
      product_name: input.productName,
      description: input.description,
      price: { currency: input.currency, amount: (input.priceCents / 100).toFixed(2) },
      images: input.images,
    });
  }

  /** Updates an existing product listing. */
  async updateProduct(productId: string, input: Partial<TikTokShopProductInput>): Promise<TikTokShopProduct> {
    return this.call<TikTokShopProduct>(
      "POST",
      `/product/202309/products/${productId}`,
      this.buildQuery(),
      {
        product_name: input.productName,
        description: input.description,
        ...(input.priceCents !== undefined
          ? { price: { currency: input.currency ?? "USD", amount: (input.priceCents / 100).toFixed(2) } }
          : {}),
        images: input.images,
      },
    );
  }

  /** Searches orders, optionally filtered by status or time window. */
  async searchOrders(params: { pageSize?: number; orderStatus?: string } = {}): Promise<TikTokShopOrder[]> {
    const data = await this.call<{ orders: TikTokShopOrder[] }>(
      "POST",
      "/order/202309/orders/search",
      this.buildQuery({ page_size: params.pageSize ?? 20 }),
      { order_status: params.orderStatus },
    );
    return data.orders;
  }

  /** Fetches full detail for a single order. */
  async getOrderDetail(orderId: string): Promise<TikTokShopOrder> {
    return this.call<TikTokShopOrder>(
      "GET",
      "/order/202309/orders",
      this.buildQuery({ ids: orderId }),
    );
  }
}
