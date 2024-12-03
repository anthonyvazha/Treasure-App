import { Form, FormLayout, TextField, Button, Select, Card, BlockStack } from "@shopify/polaris";
import { useState, useCallback } from "react";

export function CampaignForm({ initialData = {}, onSubmit, submitText = "Save" }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "EASTER_EGG",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    visitCount: "1",
    timeSpent: "0",
    pageTypes: "product,collection",
    rewardValue: "10",
    rewardCode: "",
    ...initialData
  });

  const handleChange = useCallback((field) => (value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const campaignTypes = [
    { label: "Easter Egg Hunt", value: "EASTER_EGG" },
    { label: "Halloween Hunt", value: "HALLOWEEN" },
    { label: "Christmas Hunt", value: "CHRISTMAS" },
    { label: "Custom Hunt", value: "CUSTOM" },
  ];

  return (
    <Form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <BlockStack gap="500">
        <FormLayout>
          <TextField
            label="Campaign Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange("name")}
            required
          />

          <Select
            label="Campaign Type"
            options={campaignTypes}
            name="type"
            value={formData.type}
            onChange={handleChange("type")}
          />

          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange("startDate")}
            required
          />

          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange("endDate")}
            required
          />

          <TextField
            label="Required Visit Count"
            type="number"
            name="visitCount"
            value={formData.visitCount}
            onChange={handleChange("visitCount")}
            helpText="Number of pages customer must visit"
          />

          <TextField
            label="Required Time Spent (seconds)"
            type="number"
            name="timeSpent"
            value={formData.timeSpent}
            onChange={handleChange("timeSpent")}
            helpText="Time customer must spend on site"
          />

          <TextField
            label="Page Types"
            type="text"
            name="pageTypes"
            value={formData.pageTypes}
            onChange={handleChange("pageTypes")}
            helpText="Comma-separated list of page types (e.g., product,collection)"
          />

          <TextField
            label="Reward Value"
            type="text"
            name="rewardValue"
            value={formData.rewardValue}
            onChange={handleChange("rewardValue")}
            helpText="Discount amount or reward value"
          />

          <TextField
            label="Reward Code"
            type="text"
            name="rewardCode"
            value={formData.rewardCode}
            onChange={handleChange("rewardCode")}
            helpText="Discount code or reward identifier"
          />

          <Button submit primary>{submitText}</Button>
        </FormLayout>
      </BlockStack>
    </Form>
  );
}
