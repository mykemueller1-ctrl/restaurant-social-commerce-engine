/**
 * Community Tap & Pizza — primary tenant for this engine.
 * TikTok: @community.tap | Ordering: community.pizzamico.com
 */
export const brand = {
  name: "Community Tap & Pizza",
  shortName: "C Tap",
  slug: "community-tap-pizza",
  city: "Fort Dodge",
  state: "IA",
  zip: "50501",
  addressLine1: "2026 5th Avenue South",
  phone: "(515) 955-8202",
  cuisineTags: ["pizza", "taproom", "craft-beer", "local"],
  orderingUrl: "https://community.pizzamico.com/",
  websiteUrl: "https://www.ctappizza.com/",
  social: {
    tiktokHandle: "community.tap",
    tiktokUrl: "https://www.tiktok.com/@community.tap",
    /** Facebook Page display name — confirm exact Page ID when Meta keys are issued. */
    facebookPageName: "Community Tap and Pizza",
    /** Set once the Page vanity URL / numeric ID is confirmed in Meta Business Suite. */
    facebookPageUrl: null as string | null,
    /** Fill once Meta Business / IG professional account is linked. */
    instagramHandle: null as string | null,
  },
  meta: {
    /** Required Meta Graph permissions for Order Food + Reels publishing. */
    requiredPermissions: [
      "pages_show_list",
      "pages_read_engagement",
      "pages_manage_posts",
      "pages_manage_metadata",
      "instagram_basic",
      "instagram_content_publish",
      "instagram_manage_comments",
      "business_management",
    ] as const,
    graphApiVersion: "v21.0",
  },
} as const;

export type Brand = typeof brand;
