// Instagram Business — Order Food action button + content publish via Meta Graph API.

export interface InstagramConfig {
  pageAccessToken: string;
  igUserId: string;
  graphVersion?: string; // default v20.0
}

export class InstagramClient {
  constructor(private readonly config: InstagramConfig) {}

  /** Set the Order Food action button on the business profile. */
  async setOrderFoodButton(orderingUrl: string): Promise<void> {
    // POST /{ig-user-id}/?action_buttons=[{"type":"ORDER_FOOD","url":...}]
    void orderingUrl;
    throw new Error("Wire Meta Graph API set action button");
  }

  /** Publish a shoppable reel/video with product tag. */
  async publishShoppableVideo(opts: { videoUrl: string; caption: string; productIds: string[] }) {
    void opts;
    throw new Error("Wire Meta Graph API media publish + product tags");
  }
}
