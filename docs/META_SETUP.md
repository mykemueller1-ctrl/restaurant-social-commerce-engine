# Meta keys for Community Tap and Pizza

Use this checklist to issue Facebook / Instagram credentials for **Community Tap and Pizza** (Facebook Page) and Reels publishing. Put values in `.env.local` — never commit them.

TikTok handle for this brand: **@community.tap**

## What you need

| Env var | Where it comes from |
| --- | --- |
| `META_APP_ID` | developers.facebook.com → your app → Settings → Basic |
| `META_APP_SECRET` | Same screen (show + copy; store in secret manager) |
| `META_PAGE_ID` | Facebook Page → About → Page ID, or Graph `me/accounts` |
| `META_PAGE_ACCESS_TOKEN` | Long-lived Page token (not a short-lived User token) |
| `META_IG_USER_ID` | Instagram professional account linked to the Page |
| `META_WEBHOOK_VERIFY_TOKEN` | Any strong random string you invent for webhook verify |

## Steps (Ops)

1. **Confirm the Facebook Page**  
   Use the Page named **Community Tap and Pizza** (or the exact Page your team owns). Note the Page ID.

2. **Link Instagram (Business)**  
   In Meta Business Suite / Instagram Professional tools, link the IG account to that Page. Switch to **Business** if you need API Reels publish.

3. **Create a Meta app**  
   Go to [developers.facebook.com](https://developers.facebook.com/) → Create App → type that supports Pages + Instagram (e.g. Business).  
   Add products: **Facebook Login for Business**, **Webhooks**, **Instagram Graph API**.

4. **Request permissions** (App Review as needed)  
   Minimum for our engine (see `brand.meta.requiredPermissions` in code):
   - `pages_show_list`, `pages_read_engagement`, `pages_manage_posts`, `pages_manage_metadata`
   - `instagram_basic`, `instagram_content_publish`, `instagram_manage_comments`
   - `business_management`

5. **Generate a long-lived Page access token**  
   - Use Graph API Explorer or Login for Business to get a User token with Page roles.  
   - Exchange for a long-lived User token, then get the Page token via `GET /me/accounts`.  
   - Prefer a system user token from Business Manager for production.

6. **Copy IDs into `.env.local`**  
   ```bash
   META_APP_ID=...
   META_APP_SECRET=...
   META_PAGE_ID=...
   META_PAGE_ACCESS_TOKEN=...
   META_IG_USER_ID=...
   META_WEBHOOK_VERIFY_TOKEN=$(openssl rand -hex 24)
   ```

7. **Wire the webhook**  
   Callback URL (prod): `https://<api-host>/webhooks/meta`  
   Verify token: same as `META_WEBHOOK_VERIFY_TOKEN`.  
   Subscribe the Page to relevant fields (feed, mentions, etc. as needed).

8. **Order Food button**  
   On the Instagram business profile: Edit profile → Action buttons → **Order Food** → paste  
   `https://community.pizzamico.com/`

9. **Smoke test**  
   With the API running and env loaded:
   ```bash
   curl -s localhost:3001/integrations/meta/status
   ```
   Expect `configured: true` and the Page name when the token works.

## Facebook Reels vs Instagram Reels

- **Facebook Page Reels** use the Page ID + Page token (`META_PAGE_ID` / `META_PAGE_ACCESS_TOKEN`).
- **Instagram Reels** need `META_IG_USER_ID` and content-publish permissions.
- Publishing stays behind human approval in this engine (ContentDraft → APPROVED).

## TikTok (separate from Meta)

TikTok Shop keys (`TIKTOK_*`) come from Partner Center for the shop tied to **@community.tap**. See README → TikTok Shop setup.
