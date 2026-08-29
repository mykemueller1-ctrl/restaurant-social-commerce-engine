"use client";

import { useState, type FormEvent } from "react";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000";

export default function NewMenuItemPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("Creating menu item...");

    const res = await fetch(`${API_BASE_URL}/menu-items`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        restaurantId: String(form.get("restaurantId")),
        name: String(form.get("name")),
        description: String(form.get("description") ?? ""),
        priceCents: Math.round(Number(form.get("price")) * 100),
        currency: "USD",
      }),
    });

    if (!res.ok) {
      setStatus("Failed to create menu item.");
      return;
    }

    const { menuItem } = (await res.json()) as { menuItem: { id: string } };
    setStatus(`Created menu item ${menuItem.id}. Pushing to TikTok Shop...`);

    const pushRes = await fetch(`${API_BASE_URL}/menu-items/${menuItem.id}/tiktok-product`, {
      method: "POST",
    });

    setStatus(
      pushRes.ok
        ? `Menu item ${menuItem.id} is now syncing to TikTok Shop as a product.`
        : `Menu item ${menuItem.id} created, but TikTok Shop sync failed (requires sandbox credentials).`,
    );
  }

  return (
    <main>
      <h1>Add a menu item</h1>
      <form onSubmit={onSubmit}>
        <label>
          Restaurant ID
          <input name="restaurantId" required defaultValue="demo-restaurant" />
        </label>
        <br />
        <label>
          Name
          <input name="name" required />
        </label>
        <br />
        <label>
          Description
          <input name="description" />
        </label>
        <br />
        <label>
          Price (USD)
          <input name="price" type="number" step="0.01" required />
        </label>
        <br />
        <button type="submit">Create &amp; push to TikTok Shop</button>
      </form>
      {status && <p>{status}</p>}
    </main>
  );
}
