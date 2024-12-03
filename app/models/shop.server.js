import { prisma } from "../db.server";

export async function getOrCreateShop(shopDomain, accessToken) {
  return prisma.shop.upsert({
    where: {
      shopDomain,
    },
    create: {
      shopDomain,
      accessToken,
    },
    update: {
      accessToken,
    },
  });
}
