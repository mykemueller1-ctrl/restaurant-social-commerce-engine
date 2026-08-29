export interface MenuItemRecord {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  priceCents: number;
  currency: string;
  imageUrl?: string;
}

export interface TikTokProductRecord {
  id: string;
  menuItemId: string;
  tiktokProductId: string | null;
  status: "DRAFT" | "PENDING_REVIEW" | "LIVE" | "REJECTED" | "DELISTED";
  syncError: string | null;
}

export interface OrderRecord {
  id: string;
  tiktokOrderId: string;
  tiktokProductId: string | null;
  status: string;
  totalCents: number;
  currency: string;
  rawPayload: unknown;
}

/**
 * Storage abstraction so the API can run against Prisma/Postgres in
 * production while unit/integration tests use a fast in-memory store.
 */
export interface Store {
  createMenuItem(input: Omit<MenuItemRecord, "id">): Promise<MenuItemRecord>;
  getMenuItem(id: string): Promise<MenuItemRecord | undefined>;
  listMenuItems(): Promise<MenuItemRecord[]>;

  upsertTikTokProduct(record: Omit<TikTokProductRecord, "id"> & { id?: string }): Promise<TikTokProductRecord>;
  getTikTokProductByMenuItemId(menuItemId: string): Promise<TikTokProductRecord | undefined>;
  getTikTokProductByExternalId(tiktokProductId: string): Promise<TikTokProductRecord | undefined>;

  recordOrder(order: Omit<OrderRecord, "id">): Promise<OrderRecord>;
  findOrderByTikTokId(tiktokOrderId: string): Promise<OrderRecord | undefined>;
  listOrders(): Promise<OrderRecord[]>;
}

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

/** Simple in-memory implementation used for tests and local dev without Postgres. */
export class InMemoryStore implements Store {
  private menuItems = new Map<string, MenuItemRecord>();
  private tiktokProducts = new Map<string, TikTokProductRecord>();
  private orders = new Map<string, OrderRecord>();

  async createMenuItem(input: Omit<MenuItemRecord, "id">): Promise<MenuItemRecord> {
    const record: MenuItemRecord = { ...input, id: nextId("menu") };
    this.menuItems.set(record.id, record);
    return record;
  }

  async getMenuItem(id: string): Promise<MenuItemRecord | undefined> {
    return this.menuItems.get(id);
  }

  async listMenuItems(): Promise<MenuItemRecord[]> {
    return [...this.menuItems.values()];
  }

  async upsertTikTokProduct(
    record: Omit<TikTokProductRecord, "id"> & { id?: string },
  ): Promise<TikTokProductRecord> {
    const existing = await this.getTikTokProductByMenuItemId(record.menuItemId);
    const merged: TikTokProductRecord = {
      id: existing?.id ?? record.id ?? nextId("ttp"),
      menuItemId: record.menuItemId,
      tiktokProductId: record.tiktokProductId,
      status: record.status,
      syncError: record.syncError,
    };
    this.tiktokProducts.set(merged.id, merged);
    return merged;
  }

  async getTikTokProductByMenuItemId(menuItemId: string): Promise<TikTokProductRecord | undefined> {
    return [...this.tiktokProducts.values()].find((p) => p.menuItemId === menuItemId);
  }

  async getTikTokProductByExternalId(tiktokProductId: string): Promise<TikTokProductRecord | undefined> {
    return [...this.tiktokProducts.values()].find((p) => p.tiktokProductId === tiktokProductId);
  }

  async recordOrder(order: Omit<OrderRecord, "id">): Promise<OrderRecord> {
    const existing = await this.findOrderByTikTokId(order.tiktokOrderId);
    const record: OrderRecord = { ...order, id: existing?.id ?? nextId("order") };
    this.orders.set(record.id, record);
    return record;
  }

  async findOrderByTikTokId(tiktokOrderId: string): Promise<OrderRecord | undefined> {
    return [...this.orders.values()].find((o) => o.tiktokOrderId === tiktokOrderId);
  }

  async listOrders(): Promise<OrderRecord[]> {
    return [...this.orders.values()];
  }
}
