import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, TextField, BlockStack } from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  
  // Get the app URL from the request
  const url = new URL(request.url);
  const appUrl = `${url.protocol}//${url.host}`;
  
  return json({ 
    scriptTag: `<script src="${appUrl}/treasure-hunt.js" defer></script>` 
  });
};

export default function ScriptTag() {
  const { scriptTag } = useLoaderData();

  return (
    <Page
      title="Installation"
      subtitle="Add this script tag to your store's theme.liquid file"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Script Tag
              </Text>
              <Text as="p">
                Copy and paste this script tag into your theme.liquid file, just before the closing &lt;/head&gt; tag:
              </Text>
              <TextField
                label="Script Tag"
                value={scriptTag}
                readOnly
                autoComplete="off"
                multiline={3}
              />
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                Installation Instructions
              </Text>
              <Text as="p">
                1. Go to your Shopify admin
                <br />
                2. Click on "Online Store" → "Themes"
                <br />
                3. Click "Actions" → "Edit code"
                <br />
                4. Open the theme.liquid file
                <br />
                5. Paste the script tag just before &lt;/head&gt;
                <br />
                6. Click "Save"
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
