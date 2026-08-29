# Restaurant Social Commerce Engine

Commercial-grade stack for a restaurant brand to sell food **without customers leaving the TikTok or Instagram scroll**.

## What it does
- Lists menu items as **TikTok Shop products** → in-feed shopping-bag buy button on your videos.
- Sets the **Instagram Order Food** action button on your business profile.
- Ingests TikTok order webhooks into Postgres.
- Hands off to the **Grok Bot Restaurant Scout** (sibling repo) for trend scouting + shoppable scripts.

## Quick start
```bash
pnpm install
cp .env.example .env.local   # fill in secrets
pnpm db:generate && pnpm db:push
pnpm dev
```

## TikTok Shop setup (do once)
1. Register at https://seller-us.tiktok.com (business docs + bank).
2. Create an app at Partner Center → App & Service → download the **Node SDK**.
3. Put `app_key`, `app_secret`, `shop_id` in `.env.local`.
4. Post a video in the TikTok app → Add Link → pick the product → shopping bag appears in-feed.

## Instagram
Switch to a business profile → Edit Profile → Action Buttons → Order Food → paste your ordering URL.

## Grok Bot
See sibling repo `grok-bot-restaurant-scout` for the agent config, skills, routines, and MCP connectors.

## Safety
- No secrets in git. Use a secret manager in prod.
- All publish/spend actions gated behind human approval.
- Follow TikTok Commerce policies + food labeling rules.
