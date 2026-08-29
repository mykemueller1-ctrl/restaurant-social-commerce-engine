import { createHmac, timingSafeEqual } from "node:crypto";

export interface TikTokShopSignParams {
  /** The absolute request path, e.g. `/product/202309/products`. */
  path: string;
  /** Query string parameters, excluding `sign` and `access_token`. */
  query: Record<string, string | number | boolean | undefined>;
  /** Raw JSON request body, omitted for GET requests. */
  body?: string;
  appSecret: string;
}

/**
 * Implements the TikTok Shop Partner Center request signing algorithm:
 * https://partner.tiktokshop.com/docv2/page/tts-developer-guide
 *
 * sign = HMAC_SHA256(appSecret, appSecret + path + sortedParams + body + appSecret)
 */
export function signTikTokShopRequest({ path, query, body, appSecret }: TikTokShopSignParams): string {
  const sortedKeys = Object.keys(query)
    .filter((key) => key !== "sign" && key !== "access_token" && query[key] !== undefined)
    .sort();

  const paramString = sortedKeys.map((key) => `${key}${String(query[key])}`).join("");

  let base = `${path}${paramString}`;
  if (body && !isMultipartLike(body)) {
    base += body;
  }
  base = `${appSecret}${base}${appSecret}`;

  return createHmac("sha256", appSecret).update(base, "utf8").digest("hex");
}

function isMultipartLike(body: string): boolean {
  return body.trim().startsWith("--");
}

export interface VerifyWebhookSignatureParams {
  /** Raw request body as received (must not be re-serialized). */
  rawBody: string;
  /** Value of the `X-Tts-Signature` (or equivalent) header. */
  signature: string | undefined;
  webhookSecret: string;
}

/**
 * Verifies a TikTok Shop webhook payload signature using constant-time comparison.
 */
export function verifyTikTokShopWebhookSignature({
  rawBody,
  signature,
  webhookSecret,
}: VerifyWebhookSignatureParams): boolean {
  if (!signature) return false;

  const expected = createHmac("sha256", webhookSecret).update(rawBody, "utf8").digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== actualBuf.length) return false;
  return timingSafeEqual(expectedBuf, actualBuf);
}
