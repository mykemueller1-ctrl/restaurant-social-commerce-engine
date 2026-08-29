import Link from "next/link";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

interface MenuItem {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
}

interface Order {
  id: string;
  tiktokOrderId: string;
  status: string;
  totalCents: number;
  currency: string;
}

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export default async function DashboardPage() {
  const { menuItems } = await safeFetch<{ menuItems: MenuItem[] }>("/menu-items", { menuItems: [] });
  const { orders } = await safeFetch<{ orders: Order[] }>("/orders", { orders: [] });

  return (
    <main>
      <h1>Restaurant Social Commerce Dashboard</h1>
      <p>
        Create a menu item, push it to TikTok Shop so it appears with an in-feed shopping bag, and
        watch orders flow in from the webhook. See <Link href="/menu-items/new">Add menu item</Link>.
      </p>

      <section>
        <h2>Menu Items</h2>
        {menuItems.length === 0 ? (
          <p>No menu items yet.</p>
        ) : (
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                {item.name} — {(item.priceCents / 100).toFixed(2)} {item.currency}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Orders</h2>
        {orders.length === 0 ? (
          <p>No orders yet. They will appear here once TikTok Shop sends a webhook.</p>
        ) : (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                {order.tiktokOrderId} — {order.status} — {(order.totalCents / 100).toFixed(2)} {order.currency}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
