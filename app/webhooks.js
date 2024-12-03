import { authenticate } from "./shopify.server";
import { prisma } from "./db.server";

/**
 * @param {Request} request
 * @param {string} topic
 */
export async function handleWebhook(request, topic) {
  const { payload, shop } = await authenticate.webhook(request);

  switch (topic) {
    case "APP_UNINSTALLED":
      await handleAppUninstalled(shop, payload);
      break;
      
    case "SHOP_UPDATE":
      await handleShopUpdate(shop, payload);
      break;
  }

  return new Response();
}

async function handleAppUninstalled(shop, payload) {
  // Clean up shop data when app is uninstalled
  await prisma.campaign.deleteMany({
    where: {
      shop: {
        shopDomain: shop
      }
    }
  });
  
  await prisma.shop.delete({
    where: {
      shopDomain: shop
    }
  });
}

async function handleShopUpdate(shop, payload) {
  // Update shop information if needed
  await prisma.shop.update({
    where: {
      shopDomain: shop
    },
    data: {
      // Add any relevant shop data updates
    }
  });
}
