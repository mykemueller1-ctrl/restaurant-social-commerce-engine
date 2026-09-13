import { brand } from "@rsc/config";
import "./home.css";

const buyNow = `/o/${brand.slug}?item=community-cheese&utm_source=tiktok`;

export default function Home() {
  return (
    <main className="stage">
      <div className="glow" aria-hidden />
      <div className="grain" aria-hidden />

      <section className="hero">
        <p className="brand">{brand.name}</p>
        <h1 className="headline">TikTok ads land on our screen. Pickup in Fort Dodge.</h1>
        <p className="lede">
          @{brand.social.tiktokHandle} traffic stays on Never86 Buy Now — no TikTok Shop, no extra login, no app.
          Kitchen ticket is pickup at {brand.addressLine1}.
        </p>
        <div className="cta-row">
          <a className="cta primary" href={buyNow}>
            Buy Community Cheese
          </a>
          <a className="cta ghost" href={brand.social.tiktokUrl} target="_blank" rel="noreferrer">
            @{brand.social.tiktokHandle}
          </a>
        </div>
      </section>

      <section className="setup" aria-labelledby="keys-heading">
        <h2 id="keys-heading">Not live until Myke Yes</h2>
        <p className="setup-lede">Pay is locked until Stripe keys exist. Ads stay off until this URL is on a known Vercel project.</p>
        <ul className="key-list">
          <li>
            <span>Buy Now</span>
            <code>{buyNow}</code>
          </li>
          <li>
            <span>Stripe</span>
            <code>STRIPE_SECRET_KEY / NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
          </li>
          <li>
            <span>TikTok events</span>
            <code>TIKTOK_PIXEL_ID / TIKTOK_EVENTS_ACCESS_TOKEN</code> — ads later, not Shop
          </li>
          <li>
            <span>Meta events</span>
            <code>META_PIXEL_ID / META_CAPI_ACCESS_TOKEN</code>
          </li>
        </ul>
        <p className="docs">
          Contract: <code>docs/buy-now-ad-landing.md</code>
        </p>
      </section>
    </main>
  );
}
