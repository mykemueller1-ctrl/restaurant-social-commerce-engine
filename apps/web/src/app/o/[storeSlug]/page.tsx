import { brand } from "@rsc/config";
import { notFound } from "next/navigation";
import "./buy-now.css";

const PILOT_SLUG = brand.slug;

const starterMenu = [
  {
    slug: "community-cheese",
    name: "Community Cheese",
    description: "House dough, tomato, mozzarella — the Fort Dodge classic.",
    priceCents: 1400,
    available: true,
  },
  {
    slug: "pepperoni-tap",
    name: "Pepperoni Tap",
    description: "Cupped pepperoni, mozzarella, oregano.",
    priceCents: 1600,
    available: true,
  },
  {
    slug: "supreme-community",
    name: "Supreme Community",
    description: "Pepperoni, sausage, peppers, onion, mushrooms.",
    priceCents: 1900,
    available: true,
  },
  {
    slug: "white-garlic",
    name: "White Garlic",
    description: "Garlic cream, mozzarella, ricotta, parsley.",
    priceCents: 1700,
    available: true,
  },
] as const;

function dollars(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function BuyNowPage({
  params,
  searchParams,
}: {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { storeSlug } = await params;
  const query = await searchParams;
  if (storeSlug !== PILOT_SLUG) notFound();

  const itemSlug = typeof query.item === "string" ? query.item : "community-cheese";
  const source = typeof query.utm_source === "string" ? query.utm_source : "tiktok";
  const campaign = typeof query.utm_campaign === "string" ? query.utm_campaign : "";
  const adId = typeof query.utm_content === "string" ? query.utm_content : "";

  const hero = starterMenu.find((item) => item.slug === itemSlug) ?? starterMenu[0];
  const stripeReady = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  return (
    <main className="buy">
      <p className="kicker">
        {brand.name} · {brand.city}, {brand.state}
      </p>
      <h1>{hero.name}</h1>
      <p className="price">{dollars(hero.priceCents)}</p>
      <p className="desc">{hero.description}</p>
      <p className="meta">
        Pickup at {brand.addressLine1}. No app. No login. TikTok ads land here — not TikTok Shop.
      </p>
      <p className="warn">Starter menu price — Unverified vs live POS. Do not take live charges until Myke Yes.</p>

      <form className="ticket" action="#" method="post">
        <label>
          Name
          <input name="name" autoComplete="name" required placeholder="Name for the ticket" />
        </label>
        <label>
          Phone
          <input name="phone" type="tel" autoComplete="tel" required placeholder="515-555-0100" />
        </label>
        <fieldset>
          <legend>How you want it</legend>
          <label className="choice">
            <input type="radio" name="fulfillment" value="pickup" defaultChecked />
            Pickup · ~20 min · {brand.addressLine1}
          </label>
          <label className="choice muted">
            <input type="radio" name="fulfillment" value="delivery" disabled />
            Delivery — stub only this sprint
          </label>
        </fieldset>
        <input type="hidden" name="item" value={hero.slug} />
        <input type="hidden" name="utm_source" value={source} />
        <input type="hidden" name="utm_campaign" value={campaign} />
        <input type="hidden" name="utm_content" value={adId} />
        <button type="submit" className="pay" disabled={!stripeReady}>
          {stripeReady ? `Pay ${dollars(hero.priceCents)} · Apple Pay / card` : "Pay locked — Stripe keys not set"}
        </button>
      </form>

      <ul className="menu">
        {starterMenu.map((item) => (
          <li key={item.slug}>
            <a href={`/o/${PILOT_SLUG}?item=${item.slug}&utm_source=${encodeURIComponent(source)}`}>
              {item.name} · {dollars(item.priceCents)}
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
