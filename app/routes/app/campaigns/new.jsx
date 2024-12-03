import { json, redirect } from "@remix-run/node";
import { useActionData, useNavigate, useSubmit } from "@remix-run/react";
import { Page, Layout, Card, BlockStack, Box, InlineError } from "@shopify/polaris";
import { authenticate } from "../../../shopify.server";
import { getShopSession } from "../../../lib/session.server";
import { getOrCreateShop } from "../../../models/shop.server";
import { createCampaign } from "../../../models/campaign.server";
import { CampaignForm } from "../../../components/CampaignForm";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();

  try {
    const shopSession = await getShopSession(session);
    const shop = await getOrCreateShop(session.shop, shopSession.accessToken);
    
    const campaignData = {
      shopId: shop.id,
      name: formData.get("name"),
      type: formData.get("type"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      visitCount: formData.get("visitCount"),
      timeSpent: formData.get("timeSpent"),
      pageTypes: formData.get("pageTypes"),
      rewardValue: formData.get("rewardValue"),
      rewardCode: formData.get("rewardCode"),
    };

    await createCampaign(campaignData);
    return redirect("/app/campaigns");
  } catch (error) {
    return json(
      { error: "Failed to create campaign: " + error.message },
      { status: 400 }
    );
  }
};

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function NewCampaign() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const submit = useSubmit();

  const handleSubmit = (formData) => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value);
    });
    submit(form, { method: "post" });
  };

  return (
    <Page
      title="Create New Campaign"
      backAction={{ content: "Campaigns", onAction: () => navigate("/app/campaigns") }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              {actionData?.error && (
                <Box paddingBlock="400">
                  <InlineError message={actionData.error} />
                </Box>
              )}
              <CampaignForm onSubmit={handleSubmit} submitText="Create Campaign" />
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
