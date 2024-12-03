import { useEffect } from "react";
import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  Text,
  BlockStack,
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({});
};

export default function Index() {
  const navigate = useNavigate();
  
  return (
    <Page title="Treasure Hunt Dashboard">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Welcome to Treasure Hunt
              </Text>
              <Text as="p">
                Create engaging treasure hunt campaigns to boost customer engagement and sales.
              </Text>
              <Box>
                <Button primary onClick={() => navigate("/app/campaigns")}>
                  Manage Campaigns
                </Button>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
        
        <Layout.Section secondary>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Quick Stats
                </Text>
                <Text as="p" color="subdued">
                  Start your first campaign to see statistics
                </Text>
              </BlockStack>
            </Card>
            
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">
                  Getting Started
                </Text>
                <Text as="p">
                  1. Create a new campaign
                  <br />
                  2. Add treasures to your campaign
                  <br />
                  3. Configure display rules
                  <br />
                  4. Launch your campaign!
                </Text>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
