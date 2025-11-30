import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  title: "Generated/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    breadcrumb1: "Home",
    breadcrumb2: "Products",
    breadcrumb3: "Electronics",
    breadcrumbLinkColor: "#0066cc",
  },
};
