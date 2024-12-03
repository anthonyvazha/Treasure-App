import { sessionStorage } from "../shopify.server";

export async function getShopSession(session) {
  const currentSession = await sessionStorage.findSessionsByShop(session.shop);
  
  if (!currentSession || currentSession.length === 0) {
    throw new Error("Invalid session");
  }

  return currentSession[0];
}
