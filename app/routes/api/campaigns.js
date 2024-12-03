import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

export const action = async ({ request }) => {
  await authenticate.admin(request);

  try {
    const body = await request.json();
    
    switch (request.method) {
      case "POST":
        // Create new campaign
        const campaign = await prisma.campaign.create({
          data: body,
        });
        return json({ campaign });
        
      case "PUT":
        // Update campaign
        const updatedCampaign = await prisma.campaign.update({
          where: { id: body.id },
          data: body,
        });
        return json({ campaign: updatedCampaign });
        
      case "DELETE":
        // Delete campaign
        await prisma.campaign.delete({
          where: { id: body.id },
        });
        return json({ success: true });
        
      default:
        return json({ error: "Method not allowed" }, { status: 405 });
    }
  } catch (error) {
    console.error("Campaign API Error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
