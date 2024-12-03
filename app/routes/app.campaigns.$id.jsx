import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Tabs,
  DataTable,
  Text,
  BlockStack,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";
import { useState, useCallback } from "react";

export const loader = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  
  const shop = await prisma.shop.findUnique({
    where: { shopDomain: session.shop }
  });

  if (!shop) {
    throw new Response("Shop not found", { status: 404 });
  }

  const campaign = await prisma.campaign.findFirst({
    where: {
      id: params.id,
      shopId: shop.id,
    },
    include: {
      treasures: true,
    },
  });

  if (!campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  return json({ campaign });
};

export const action = async ({ request, params }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const action = formData.get("action");

  if (action === "add_treasure") {
    const treasure = await prisma.treasure.create({
      data: {
        campaignId: params.id,
        name: formData.get("name"),
        description: formData.get("description"),
        reward: {
          type: formData.get("rewardType"),
          value: formData.get("rewardValue"),
        },
        targetPages: formData.get("targetPages").split(",").map(p => p.trim()),
        timeToShow: parseInt(formData.get("timeToShow")) || null,
        pageViews: parseInt(formData.get("pageViews")) || null,
        isRandom: formData.get("isRandom") === "true",
        maxClaims: parseInt(formData.get("maxClaims")) || null,
      },
    });
    return json({ treasure });
  }

  throw new Error("Invalid action");
};

export default function CampaignDetails() {
  const { campaign } = useLoaderData();
  const [selectedTab, setSelectedTab] = useState(0);
  const [isAddingTreasure, setIsAddingTreasure] = useState(false);

  const tabs = [
    {
      id: "treasures",
      content: "Treasures",
      accessibilityLabel: "Treasures",
      panelID: "treasures-panel",
    },
    {
      id: "settings",
      content: "Settings",
      accessibilityLabel: "Settings",
      panelID: "settings-panel",
    },
    {
      id: "analytics",
      content: "Analytics",
      accessibilityLabel: "Analytics",
      panelID: "analytics-panel",
    },
  ];

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelectedTab(selectedTabIndex),
    [],
  );

  const treasureRows = campaign.treasures.map((treasure) => [
    treasure.name,
    treasure.description || "-",
    JSON.stringify(treasure.reward),
    treasure.maxClaims || "Unlimited",
    treasure.isRandom ? "Random" : "Fixed",
  ]);

  return (
    <Page
      title={campaign.name}
      backAction={{ content: "Campaigns", url: "/app/campaigns" }}
      primaryAction={{
        content: "Add Treasure",
        onAction: () => setIsAddingTreasure(true),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange}>
              <BlockStack gap="400">
                {selectedTab === 0 && (
                  <DataTable
                    columnContentTypes={[
                      "text",
                      "text",
                      "text",
                      "numeric",
                      "text",
                    ]}
                    headings={[
                      "Name",
                      "Description",
                      "Reward",
                      "Max Claims",
                      "Display Type",
                    ]}
                    rows={treasureRows}
                  />
                )}

                {selectedTab === 1 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Campaign Settings
                    </Text>
                    <Text as="p">
                      Start Date: {new Date(campaign.startDate).toLocaleDateString()}
                      <br />
                      End Date: {new Date(campaign.endDate).toLocaleDateString()}
                      <br />
                      Status: {campaign.isActive ? "Active" : "Inactive"}
                    </Text>
                  </BlockStack>
                )}

                {selectedTab === 2 && (
                  <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                      Campaign Analytics
                    </Text>
                    <Text as="p">
                      Analytics features coming soon!
                    </Text>
                  </BlockStack>
                )}
              </BlockStack>
            </Tabs>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={isAddingTreasure}
        onClose={() => setIsAddingTreasure(false)}
        title="Add New Treasure"
        primaryAction={{
          content: "Add Treasure",
          submit: true,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setIsAddingTreasure(false),
          },
        ]}
      >
        <Modal.Section>
          <Form method="post">
            <input type="hidden" name="action" value="add_treasure" />
            <FormLayout>
              <TextField
                label="Name"
                name="name"
                type="text"
                required
                autoComplete="off"
              />
              
              <TextField
                label="Description"
                name="description"
                type="text"
                multiline={3}
                autoComplete="off"
              />

              <Select
                label="Reward Type"
                name="rewardType"
                options={[
                  { label: "Discount Code", value: "discount" },
                  { label: "Free Product", value: "product" },
                  { label: "Custom Message", value: "message" },
                ]}
              />

              <TextField
                label="Reward Value"
                name="rewardValue"
                type="text"
                helpText="For discounts, enter percentage or amount. For products, enter product ID."
                required
              />

              <TextField
                label="Target Pages"
                name="targetPages"
                type="text"
                helpText="Comma-separated list of page URLs where this treasure can appear"
                required
              />

              <TextField
                label="Time to Show (seconds)"
                name="timeToShow"
                type="number"
                min="0"
              />

              <TextField
                label="Required Page Views"
                name="pageViews"
                type="number"
                min="0"
              />

              <Select
                label="Display Type"
                name="isRandom"
                options={[
                  { label: "Fixed Location", value: "false" },
                  { label: "Random Location", value: "true" },
                ]}
              />

              <TextField
                label="Maximum Claims"
                name="maxClaims"
                type="number"
                min="0"
                helpText="Leave empty for unlimited claims"
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
