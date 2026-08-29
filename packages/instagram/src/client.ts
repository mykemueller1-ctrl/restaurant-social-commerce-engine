import { request } from "undici";

export interface InstagramClientConfig {
  pageAccessToken: string;
  igBusinessAccountId: string;
  graphApiBaseUrl?: string;
}

/**
 * Minimal Meta Graph API wrapper for the Instagram "Order Food" Action
 * Button and content publishing. See:
 * https://developers.facebook.com/docs/instagram-platform/instagram-graph-api
 */
export class InstagramClient {
  private readonly baseUrl: string;

  constructor(private readonly config: InstagramClientConfig) {
    this.baseUrl = config.graphApiBaseUrl ?? "https://graph.facebook.com/v19.0";
  }

  /**
   * Configures the profile's Action Button to deep-link to an ordering
   * destination (e.g. the TikTok Shop / Linkin.bio food ordering page).
   */
  async setOrderFoodActionButton(orderUrl: string): Promise<{ success: boolean }> {
    const url = new URL(`${this.baseUrl}/${this.config.igBusinessAccountId}`);
    url.searchParams.set("access_token", this.config.pageAccessToken);

    const response = await request(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action_button: { type: "ORDER_FOOD", url: orderUrl },
      }),
    });

    const json = (await response.body.json()) as { success?: boolean; error?: { message: string } };
    if (response.statusCode >= 400 || json.error) {
      throw new Error(`Instagram Graph API error: ${json.error?.message ?? response.statusCode}`);
    }
    return { success: json.success ?? true };
  }

  /** Publishes a video (Reel) referencing a hosted media URL, with an optional caption/CTA. */
  async publishVideo(params: { videoUrl: string; caption: string }): Promise<{ id: string }> {
    const url = new URL(`${this.baseUrl}/${this.config.igBusinessAccountId}/media`);
    url.searchParams.set("access_token", this.config.pageAccessToken);

    const response = await request(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        media_type: "REELS",
        video_url: params.videoUrl,
        caption: params.caption,
      }),
    });

    const json = (await response.body.json()) as { id?: string; error?: { message: string } };
    if (response.statusCode >= 400 || json.error || !json.id) {
      throw new Error(`Instagram Graph API error: ${json.error?.message ?? response.statusCode}`);
    }
    return { id: json.id };
  }
}
