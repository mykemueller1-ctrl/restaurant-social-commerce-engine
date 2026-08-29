import { getPrismaClient } from "@restaurant/db";
import type { MenuItemRecord, OrderRecord, Store, TikTokProductRecord } from "./store.js";

/** Prisma/Postgres-backed implementation of {@link Store} for production use. */
export class PrismaStore implements Store {
  private readonly prisma = getPrismaClient();

  async createMenuItem(input: Omit<MenuItemRecord, "id">): Promise<MenuItemRecord> {
    const created = await this.prisma.menuItem.create({
      data: {
        restaurantId: input.restaurantId,
        name: input.name,
        description: input.description,
        priceCents: input.priceCents,
        currency: input.currency,
        imageUrl: input.imageUrl,
      },
    });
    return toMenuItemRecord(created);
  }

  async getMenuItem(id: string): Promise<MenuItemRecord | undefined> {
    const found = await this.prisma.menuItem.findUnique({ where: { id } });
    return found ? toMenuItemRecord(found) : undefined;
  }

  async listMenuItems(): Promise<MenuItemRecord[]> {
    const items = await this.prisma.menuItem.findMany();
    return items.map(toMenuItemRecord);
  }

  async upsertTikTokProduct(
    record: Omit<TikTokProductRecord, "id"> & { id?: string },
  ): Promise<TikTokProductRecord> {
    const upserted = await this.prisma.tikTokProduct.upsert({
      where: { menuItemId: record.menuItemId },
      create: {
        menuItemId: record.menuItemId,
        tiktokProductId: record.tiktokProductId,
        status: record.status,
        syncError: record.syncError,
        lastSyncedAt: new Date(),
      },
      update: {
        tiktokProductId: record.tiktokProductId,
        status: record.status,
        syncError: record.syncError,
        lastSyncedAt: new Date(),
      },
    });
    return toTikTokProductRecord(upserted);
  }

  async getTikTokProductByMenuItemId(menuItemId: string): Promise<TikTokProductRecord | undefined> {
    const found = await this.prisma.tikTokProduct.findUnique({ where: { menuItemId } });
    return found ? toTikTokProductRecord(found) : undefined;
  }

  async getTikTokProductByExternalId(tiktokProductId: string): Promise<TikTokProductRecord | undefined> {
    const found = await this.prisma.tikTokProduct.findUnique({ where: { tiktokProductId } });
    return found ? toTikTokProductRecord(found) : undefined;
  }

  async recordOrder(order: Omit<OrderRecord, "id">): Promise<OrderRecord> {
    const upserted = await this.prisma.order.upsert({
      where: { tiktokOrderId: order.tiktokOrderId },
      create: {
        tiktokOrderId: order.tiktokOrderId,
        tiktokProductId: order.tiktokProductId,
        status: order.status as never,
        totalCents: order.totalCents,
        currency: order.currency,
        rawPayload: order.rawPayload as never,
      },
      update: {
        status: order.status as never,
        totalCents: order.totalCents,
        currency: order.currency,
        rawPayload: order.rawPayload as never,
      },
    });
    return toOrderRecord(upserted);
  }

  async findOrderByTikTokId(tiktokOrderId: string): Promise<OrderRecord | undefined> {
    const found = await this.prisma.order.findUnique({ where: { tiktokOrderId } });
    return found ? toOrderRecord(found) : undefined;
  }

  async listOrders(): Promise<OrderRecord[]> {
    const orders = await this.prisma.order.findMany();
    return orders.map(toOrderRecord);
  }
}

// The following converters normalize Prisma's generated shapes (which include
// `null` instead of `undefined`, and extra fields like timestamps) to the
// plain `Store` record types used across the API layer.
function toMenuItemRecord(item: {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
}): MenuItemRecord {
  return {
    id: item.id,
    restaurantId: item.restaurantId,
    name: item.name,
    description: item.description ?? undefined,
    priceCents: item.priceCents,
    currency: item.currency,
    imageUrl: item.imageUrl ?? undefined,
  };
}

function toTikTokProductRecord(product: {
  id: string;
  menuItemId: string;
  tiktokProductId: string | null;
  status: string;
  syncError: string | null;
}): TikTokProductRecord {
  return {
    id: product.id,
    menuItemId: product.menuItemId,
    tiktokProductId: product.tiktokProductId,
    status: product.status as TikTokProductRecord["status"],
    syncError: product.syncError,
  };
}

function toOrderRecord(order: {
  id: string;
  tiktokOrderId: string;
  tiktokProductId: string | null;
  status: string;
  totalCents: number;
  currency: string;
  rawPayload: unknown;
}): OrderRecord {
  return {
    id: order.id,
    tiktokOrderId: order.tiktokOrderId,
    tiktokProductId: order.tiktokProductId,
    status: order.status,
    totalCents: order.totalCents,
    currency: order.currency,
    rawPayload: order.rawPayload,
  };
}
