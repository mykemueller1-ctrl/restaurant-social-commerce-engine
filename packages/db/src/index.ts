import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";

let prismaSingleton: PrismaClient | undefined;

/**
 * Returns a lazily-created, process-wide singleton `PrismaClient`.
 * Avoids exhausting DB connections when hot-reloaded in dev.
 */
export function getPrismaClient(): PrismaClient {
  if (!prismaSingleton) {
    prismaSingleton = new PrismaClient();
  }
  return prismaSingleton;
}
