/** Legacy shape kept so older Instantiation sites still type-check. */
export interface InstagramConfig {
  pageAccessToken: string;
  igUserId: string;
  graphVersion?: string;
}
