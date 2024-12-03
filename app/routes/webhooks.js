import { authenticate } from "../shopify.server";
import { handleWebhook } from "../webhooks";

export const action = async ({ request }) => {
  const topic = request.headers.get("X-Shopify-Topic");
  
  try {
    await handleWebhook(request, topic);
    return new Response();
  } catch (error) {
    console.error(`Failed to process webhook: ${topic}`, error);
    return new Response(error.message, { status: 500 });
  }
};
