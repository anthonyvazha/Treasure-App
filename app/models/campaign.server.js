import { prisma } from "../db.server";

export async function getCampaigns(shopId) {
  return prisma.campaign.findMany({
    where: {
      shopId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      rules: true,
      rewards: true,
    },
  });
}

export async function createCampaign(data) {
  return prisma.campaign.create({
    data: {
      shopId: data.shopId,
      name: data.name,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isActive: true,
      rules: {
        create: {
          visitCount: parseInt(data.visitCount) || 1,
          timeSpent: parseInt(data.timeSpent) || 0,
          pageTypes: data.pageTypes.split(","),
        }
      },
      rewards: {
        create: {
          type: "DISCOUNT",
          value: data.rewardValue,
          code: data.rewardCode,
        }
      }
    },
    include: {
      rules: true,
      rewards: true,
    },
  });
}
