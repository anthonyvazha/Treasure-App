import { json } from "@remix-run/node";
import { prisma } from "../db.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  
  if (!shop) {
    return json({ error: "Shop parameter is required" }, { status: 400 });
  }

  // Get active campaigns for the shop
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      shop: {
        shopDomain: shop,
      },
      isActive: true,
      startDate: {
        lte: new Date(),
      },
      endDate: {
        gte: new Date(),
      },
    },
    include: {
      treasures: true,
    },
  });

  // Return only the necessary data for the frontend
  const treasures = activeCampaigns.flatMap(campaign => 
    campaign.treasures.map(treasure => ({
      id: treasure.id,
      name: treasure.name,
      targetPages: treasure.targetPages,
      timeToShow: treasure.timeToShow,
      pageViews: treasure.pageViews,
      isRandom: treasure.isRandom,
      campaignType: campaign.type,
    }))
  );

  return json({ treasures }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};

export const action = async ({ request }) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const data = await request.json();
  const { treasureId, email, name, additionalData } = data;

  if (!treasureId || !email) {
    return json({ error: "Missing required fields" }, { status: 400 });
  }

  const treasure = await prisma.treasure.findUnique({
    where: { id: treasureId },
    include: { campaign: true },
  });

  if (!treasure) {
    return json({ error: "Treasure not found" }, { status: 404 });
  }

  // Check if treasure can still be claimed
  if (treasure.maxClaims) {
    const claimCount = await prisma.userProgress.count({
      where: {
        treasureId,
        claimed: true,
      },
    });

    if (claimCount >= treasure.maxClaims) {
      return json({ error: "Treasure no longer available" }, { status: 400 });
    }
  }

  // Create or update user collection and progress
  const user = await prisma.userCollection.upsert({
    where: {
      shopId_email: {
        shopId: treasure.campaign.shopId,
        email,
      },
    },
    create: {
      shopId: treasure.campaign.shopId,
      email,
      name,
      additionalData,
    },
    update: {
      name,
      additionalData,
    },
  });

  const progress = await prisma.userProgress.create({
    data: {
      treasureId,
      userId: user.id,
      claimed: true,
      claimedAt: new Date(),
    },
  });

  return json({
    success: true,
    reward: treasure.reward,
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
