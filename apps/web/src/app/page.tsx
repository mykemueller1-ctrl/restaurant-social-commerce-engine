import { brand } from "@rsc/config";
import "./home.css";

export default function Home() {
  return (
    <main className="stage">
      <div className="glow" aria-hidden />
      <div className="grain" aria-hidden />

      <section className="hero">
        <p className="brand">{brand.name}</p>
        <h1 className="headline">Sell pizza in the scroll.</h1>
        <p className="lede">
          TikTok Shop for @{brand.social.tiktokHandle} and Facebook Reels for {brand.social.facebookPageName} — orders
          without leaving the feed.
        </p>
        <div className="cta-row">
          <a className="cta primary" href={brand.orderingUrl} target="_blank" rel="noreferrer">
            Order food
          </a>
          <a className="cta ghost" href={brand.social.tiktokUrl} target="_blank" rel="noreferrer">
            @{brand.social.tiktokHandle}
          </a>
        </div>
      </section>

      <section className="setup" aria-labelledby="keys-heading">
        <h2 id="keys-heading">Keys still needed</h2>
        <p className="setup-lede">Ops checklist before live sync — secrets stay in .env.local.</p>
        <ul className="key-list">
          <li>
            <span>TikTok Shop</span>
            <code>TIKTOK_APP_KEY / SECRET / SHOP_ID</code> for @{brand.social.tiktokHandle}
          </li>
          <li>
            <span>Meta App</span>
            <code>META_APP_ID + META_APP_SECRET</code> for Facebook &amp; Reels
          </li>
          <li>
            <span>Facebook Page</span>
            <code>META_PAGE_ID + META_PAGE_ACCESS_TOKEN</code> — {brand.social.facebookPageName}
          </li>
          <li>
            <span>Instagram</span>
            <code>META_IG_USER_ID</code> once the professional account is linked
          </li>
        </ul>
        <p className="docs">
          Full walkthrough: <code>docs/META_SETUP.md</code>
        </p>
      </section>
    </main>
  );
}
