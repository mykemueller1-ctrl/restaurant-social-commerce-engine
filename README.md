# Restaurant Social Commerce Engine

Commercial-grade stack for **Community Tap & Pizza** (Fort Dodge, IA) to sell food **without customers leaving the TikTok or Instagram/Facebook scroll**.

## Brand
- Restaurant: **Community Tap & Pizza**
- TikTok: [@community.tap](https://www.tiktok.com/@community.tap)
- Facebook Page: **Community Tap and Pizza** (Meta keys required — see below)
- Online ordering: https://community.pizzamico.com/

## What it does
- Lists menu items as **TikTok Shop products** → in-feed shopping-bag buy button on your videos.
- Sets the **Instagram Order Food** action button on your business profile.
- Publishes / receives events for **Facebook Reels** via Meta Graph (once keys are issued).
- Ingests TikTok order webhooks into Postgres.
- Hands off to the **Grok Bot Restaurant Scout** (sibling repo) for trend scouting + shoppable scripts.

## Quick start
```bash
pnpm install
cp .env.example .env.local   # fill in secrets
pnpm db:generate && pnpm db:push
pnpm --filter @rsc/db seed   # Community Tap & Pizza + starter menu
pnpm dev
```

## Meta keys (Facebook + Reels)
You need Meta App + Page credentials for **Community Tap and Pizza**. Follow the Ops checklist:

→ **[docs/META_SETUP.md](docs/META_SETUP.md)**

Required env vars: `META_APP_ID`, `META_APP_SECRET`, `META_PAGE_ID`, `META_PAGE_ACCESS_TOKEN`, optional `META_IG_USER_ID`, `META_WEBHOOK_VERIFY_TOKEN`.

Smoke test after fill: `GET /integrations/meta/status`

## TikTok Shop setup (do once)
1. Register at https://seller-us.tiktok.com (business docs + bank).
2. Create an app at Partner Center → App & Service → download the **Node SDK**.
3. Put `app_key`, `app_secret`, `shop_id` in `.env.local`.
4. Confirm the shop is tied to **@community.tap**.
5. Post a video in the TikTok app → Add Link → pick the product → shopping bag appears in-feed.

## Instagram Order Food
Switch to a business profile linked to the Facebook Page → Edit Profile → Action Buttons → Order Food → paste `https://community.pizzamico.com/`.

## Grok Bot
See sibling repo `grok-bot-restaurant-scout` for the agent config, skills, routines, and MCP connectors.

## Safety
- No secrets in git. Use a secret manager in prod.
- All publish/spend actions gated behind human approval.
- Follow TikTok Commerce policies + food labeling rules.
