# restaurant-social-commerce-engine

Industry-grade commercial build for restaurant social commerce: TikTok Shop in-feed buy buttons, Grok Bot agent for trend scouting and shoppable content, Instagram Order Food integration, and checkout without leaving the scroll.

## Stack

- **TypeScript / Node 20+**, strict mode, ESM, pnpm workspaces.
- `apps/api` — Fastify service: menu-item → TikTok Shop product sync, TikTok webhook (order ingest), health check, pino logging.
- `apps/web` — Next.js 15 App Router dashboard: create menu items, view TikTok Shop sync status and incoming orders.
- `packages/db` — Prisma schema (Postgres): `Restaurant`, `MenuItem`, `TikTokProduct`, `Order`, `CreatorLead`, `ContentDraft`, `Approval`.
- `packages/tiktok-shop` — signed-request client for the TikTok Shop Open API (product create/update, order search/detail) and webhook signature verification.
- `packages/instagram` — Meta Graph API client stub for the "Order Food" Action Button and Reels publishing.
- `packages/config` — shared, zod-validated environment schema.
- `grok-bot/` — exported agent config (identity, skills, MCP connector spec) consumed by the sibling `grok-bot-restaurant-scout` repo.

## Getting started

```bash
pnpm install
cp .env.example .env      # fill in real TikTok Shop / Meta / DB values
pnpm build
pnpm test
```

Run the API and web app locally (requires a Postgres database reachable via `DATABASE_URL`):

```bash
pnpm --filter @restaurant/db db:push   # sync Prisma schema to Postgres
pnpm --filter @restaurant/api dev      # http://localhost:4000
pnpm --filter @restaurant/web dev      # http://localhost:3000
```

## Environment variables

See `.env.example` for the full list. Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string used by `packages/db` (Prisma). |
| `TIKTOK_SHOP_APP_KEY` / `TIKTOK_SHOP_APP_SECRET` | Partner Center app credentials, used to sign every TikTok Shop API request. |
| `TIKTOK_SHOP_ACCESS_TOKEN` / `TIKTOK_SHOP_SHOP_CIPHER` | Shop-level authorization obtained via TikTok Shop OAuth. |
| `TIKTOK_SHOP_API_BASE_URL` | Sandbox (`https://open-api-sandbox.tiktokglobalshop.com`) or production Open API host. |
| `TIKTOK_SHOP_WEBHOOK_SECRET` | Used to verify the `X-Tts-Signature` header on incoming webhooks. |
| `META_APP_ID` / `META_APP_SECRET` / `META_PAGE_ACCESS_TOKEN` | Instagram Graph API access for the Order Food Action Button and content publishing. |
| `STRIPE_SECRET_KEY` | Direct checkout fallback only — TikTok Shop handles in-app checkout itself. |

Never commit a real `.env` file; `.gitignore` already excludes it.

## TikTok Seller Center + Partner Center setup

1. Create a TikTok Shop **Partner Center** developer app to get `app_key` / `app_secret`. Start in the **sandbox** environment.
2. In **TikTok Seller Center** (sandbox), authorize your Partner Center app for a test shop. Complete the OAuth flow to obtain `access_token` and `shop_cipher`; store them as `TIKTOK_SHOP_ACCESS_TOKEN` / `TIKTOK_SHOP_SHOP_CIPHER`.
3. Register a webhook subscription for `ORDER_STATUS_CHANGE` (and `PRODUCT_STATUS_CHANGE` if desired) pointing at `POST /webhooks/tiktok` on your deployed `apps/api`. Set the shared secret as `TIKTOK_SHOP_WEBHOOK_SECRET`.
4. From the dashboard (`apps/web`), create a menu item and click **"Create & push to TikTok Shop"**. This calls `POST /menu-items/:id/tiktok-product`, which signs and sends a `product/202309/products` create/update request via `packages/tiktok-shop`.
5. Once the product is approved in the sandbox Seller Center, **attach the product to a TikTok video**: open the video composer (or an existing post) in TikTok Shop / Seller Center, choose *Add products*, and select the product you just created. TikTok automatically renders the in-feed shopping-bag icon / buy button on that video — checkout happens inside the app.
6. Move to production only after sandbox end-to-end (create → attach to video → webhook order) is verified, per TikTok Commerce policies and food safety labeling requirements.

## Runbook

- **Health check:** `GET /health` on `apps/api`.
- **Push a product:** `POST /menu-items/:id/tiktok-product` — retries are safe; it upserts by `menuItemId`.
- **Webhook failures:** requests with a missing/invalid `X-Tts-Signature` are rejected with `401` and never written to the database; check `TIKTOK_SHOP_WEBHOOK_SECRET` matches Seller Center's configured secret.
- **Grok Bot:** all bot-authored `ContentDraft`/`CreatorLead` rows land with `PENDING_APPROVAL`/no status; a human must approve via the dashboard before anything is published or spent. See `grok-bot/README.md`.

## Testing

- Unit tests: `pnpm test` (Vitest) — covers TikTok Shop request signing, webhook signature verification, and the API's menu-item → product → order flow.
- CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, and build on every PR.

## Constraints honored

- Food is perishable: the sample flow assumes pickup/local delivery; add shelf-stable SKU flags (`MenuItem.isShelfStable`) before enabling shipping.
- No code path here posts, publishes, or spends without an explicit API call gated by a human action in the dashboard — the Grok Bot only ever writes `PENDING`/`PENDING_APPROVAL` records.

