/**
 * Seed Community Tap & Pizza as the primary restaurant tenant.
 * Run: pnpm --filter @rsc/db seed  (requires DATABASE_URL)
 */
import { PrismaClient } from "@prisma/client";
import { brand } from "@rsc/config";

const prisma = new PrismaClient();

const starterMenu = [
  {
    name: "Community Cheese",
    description: "House dough, tomato, mozzarella — the Fort Dodge classic.",
    priceCents: 1400,
  },
  {
    name: "Pepperoni Tap",
    description: "Cupped pepperoni, mozzarella, oregano.",
    priceCents: 1600,
  },
  {
    name: "Supreme Community",
    description: "Pepperoni, sausage, peppers, onion, mushrooms.",
    priceCents: 1900,
  },
  {
    name: "White Garlic",
    description: "Garlic cream, mozzarella, ricotta, parsley.",
    priceCents: 1700,
  },
] as const;

async function main() {
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: brand.slug },
    create: {
      name: brand.name,
      slug: brand.slug,
      city: brand.city,
      state: brand.state,
      addressLine1: brand.addressLine1,
      phone: brand.phone,
      cuisineTags: [...brand.cuisineTags],
      orderingUrl: brand.orderingUrl,
      websiteUrl: brand.websiteUrl,
      tiktokHandle: brand.social.tiktokHandle,
      facebookPageName: brand.social.facebookPageName,
      instagramHandle: brand.social.instagramHandle,
    },
    update: {
      name: brand.name,
      city: brand.city,
      state: brand.state,
      addressLine1: brand.addressLine1,
      phone: brand.phone,
      cuisineTags: [...brand.cuisineTags],
      orderingUrl: brand.orderingUrl,
      websiteUrl: brand.websiteUrl,
      tiktokHandle: brand.social.tiktokHandle,
      facebookPageName: brand.social.facebookPageName,
      instagramHandle: brand.social.instagramHandle,
    },
  });

  for (const item of starterMenu) {
    const existing = await prisma.menuItem.findFirst({
      where: { restaurantId: restaurant.id, name: item.name },
    });
    if (existing) continue;
    await prisma.menuItem.create({
      data: {
        restaurantId: restaurant.id,
        name: item.name,
        description: item.description,
        priceCents: item.priceCents,
        fulfillment: "PICKUP",
        isPerishable: true,
      },
    });
  }

  // Meta Page row is created once META_PAGE_ID is known — placeholders skipped.
  console.log(`Seeded ${brand.name} (${restaurant.slug}) with starter menu.`);
  console.log(`TikTok handle: @${brand.social.tiktokHandle}`);
  console.log(`Facebook Page: ${brand.social.facebookPageName}`);
  console.log(`Next: fill META_* keys — see docs/META_SETUP.md`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
