import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Page } from './Page';
import { Container } from '../components/Container';
import { Grid } from '../components/Grid';
import { Text } from '../components/Text';

const meta: Meta<typeof Page> = {
  title: "Generated/Page",
  component: Page,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Page>;

export const Default: Story = {
  render: () => (
    <Page>
      <Container styleMap={{
        "display": "flex",
        "flexDirection": "column",
        "backgroundColor": "#ffffff",
        "borderRadius": 8,
        "padding": 20,
        "borderWidth": 1,
        "borderColor": "#e0e0e0"
      }}>
      <Text styleMap={{
          "fontSize": 20,
          "fontWeight": "600",
          "color": "#333333",
          "marginBottom": 8
        }} data={{
          "content": "Page Item 1"
        }} />
      <Text styleMap={{
          "fontSize": 14,
          "color": "#666666",
          "lineHeight": 1.5
        }} data={{
          "content": "This is a sample page item that demonstrates the responsive grid layout."
        }} />
    </Container>
      <Container styleMap={{
        "display": "flex",
        "flexDirection": "column",
        "backgroundColor": "#ffffff",
        "borderRadius": 8,
        "padding": 20,
        "borderWidth": 1,
        "borderColor": "#e0e0e0"
      }}>
      <Text styleMap={{
          "fontSize": 20,
          "fontWeight": "600",
          "color": "#333333",
          "marginBottom": 8
        }} data={{
          "content": "Page Item 2"
        }} />
      <Text styleMap={{
          "fontSize": 14,
          "color": "#666666",
          "lineHeight": 1.5
        }} data={{
          "content": "Another page item showing how children can be passed into the grid."
        }} />
    </Container>
      <Container styleMap={{
        "display": "flex",
        "flexDirection": "column",
        "backgroundColor": "#ffffff",
        "borderRadius": 8,
        "padding": 20,
        "borderWidth": 1,
        "borderColor": "#e0e0e0"
      }}>
      <Text styleMap={{
          "fontSize": 20,
          "fontWeight": "600",
          "color": "#333333",
          "marginBottom": 8
        }} data={{
          "content": "Page Item 3"
        }} />
      <Text styleMap={{
          "fontSize": 14,
          "color": "#666666",
          "lineHeight": 1.5
        }} data={{
          "content": "The grid automatically adjusts to different screen sizes."
        }} />
    </Container>
    </Page>
  ),
};
