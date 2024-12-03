import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { 
  Page, 
  Layout, 
  Card, 
  Button, 
  DataTable, 
  EmptyState,
  BlockStack,
} from "@shopify/polaris";
import { authenticate } from "../../../shopify.server";
import { getShopSession } from "../../../lib/session.server";
import { getOrCreateShop } from "../../../models/shop.server";
import { getCampaigns } from "../../../models/campaign.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  try {
    const shopSession = await getShopSession(session);
    const shop = await getOrCreateShop(session.shop, shopSession.accessToken);
    const campaigns = await getCampaigns(shop.id);
    
    return json({ campaigns });
  } catch (error) {
    return json({ campaigns: [] });
  }
};

export default function CampaignsIndex() {
  const { campaigns } = useLoaderData();

  const rows = campaigns.map((campaign) => [
    campaign.name,
    campaign.type,
    new Date(campaign.startDate).toLocaleDateString(),
    new Date(campaign.endDate).toLocaleDateString(),
    campaign.isActive ? 'Active' : 'Inactive',
  ]);

  return (
    <Page
      title="Treasure Hunt Campaigns"
      primaryAction={
        <Button primary url="/app/campaigns/new">
          Create Campaign
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          {campaigns.length === 0 ? (
            <Card>
              <EmptyState
                heading="Create your first treasure hunt campaign"
                action={{
                  content: 'Create Campaign',
                  url: '/app/campaigns/new',
                }}
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>Start engaging your customers with fun treasure hunts!</p>
              </EmptyState>
            </Card>
          ) : (
            <Card>
              <BlockStack gap="400">
                <DataTable
                  columnContentTypes={['text', 'text', 'text', 'text', 'text']}
                  headings={['Name', 'Type', 'Start Date', 'End Date', 'Status']}
                  rows={rows}
                />
              </BlockStack>
            </Card>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
