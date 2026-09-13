# Buy Now ad landing — Community Tap & Pizza, Fort Dodge

Pilot store: Community Tap & Pizza, 2026 5th Avenue South, Fort Dodge, IA 50501.
TikTok organic handle already in brand config: `@community.tap`.
Channel priority: **TikTok ads first**, Meta second.
Destination: **this site**, not TikTok Shop.

## Launch surface

| Piece | Value |
|---|---|
| Repo | `mykemueller1-ctrl/restaurant-social-commerce-engine` |
| Branch | `feat/buy-now-ad-landing` (draft PR only) |
| Store slug | `community-tap-pizza` |
| Public path | `/o/community-tap-pizza` |
| Default fulfillment | Pickup at CTap Fort Dodge |
| Hero item (seed) | Community Cheese — $14.00 — **Unverified starter menu, not a live POS price** |

Vercel project inventory from the connected team `myke-muellers-projects` returned **zero projects**. Do not point paid traffic at an unknown Vercel demo. Confirm which Vercel project this repo deploys to before any ad spend.

Existing first-party ordering URL in brand config: `https://community.pizzamico.com/` — keep as fallback, do not send TikTok ads there once Buy Now is live.

## URL contract

```
/o/{storeSlug}?item={itemSlug}&offer={offerId}&utm_source=tiktok|meta&utm_campaign={id}&utm_content={ad_id}
```

Pilot example:

```
/o/community-tap-pizza?item=community-cheese&utm_source=tiktok&utm_campaign=ncentiv-pilot&utm_content={ad_id}
```

Unknown slug → 404. Only `community-tap-pizza` is valid in v1.

## Events (hooks only — do not run ads)

TikTok Events API / Pixel: `ViewContent`, `AddToCart`, `CompletePayment`.
Meta Pixel / CAPI: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`.
Deduplicate with the same `event_id` client + server.

Env vars required (names only):

- `TIKTOK_PIXEL_ID`
- `TIKTOK_EVENTS_ACCESS_TOKEN`
- `META_PIXEL_ID`
- `META_CAPI_ACCESS_TOKEN`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `DATABASE_URL`

Missing vars → page still renders; pay stays sandbox / disabled. Never invent pixel IDs.

## Platform locks

- Do **not** create a TikTok Shop for hot pizza. US Shop is shippable goods. Homemade food is prohibited. Prepared meals are invite-only packaged.
- Ads may run on TikTok. Checkout stays on `/o/community-tap-pizza`.
- No production merge, DNS cutover, or live Stripe charges without Myke Yes.
- Do not email Christopher Sebes / Seth Temko from this branch.

## Kitchen handoff

v1 order is `status=needs_pos_write`. Do not replace PDQ/Toast.
Ticket JSON must carry: store slug, item name, cents, guest name + phone, fulfillment=pickup, channel=`never86_tiktok` or `never86_meta`, campaign_id, ad_id, stripe_payment_intent.

## Myke Yes required before

1. Merge this branch
2. Point a production domain at this path
3. Turn on live Stripe charges
4. Spend TikTok or Meta dollars
5. Hand the URL to nCentiv
