import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Breadcrumbs } from './Breadcrumbs';
import './Breadcrumbs.css';

const meta: Meta<typeof Breadcrumbs> = {
  title: "Generated/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    styleMap: {
  "--breadcrumb-link-color": "#0066cc"
},
    data: {
  "breadcrumb1": "Home",
  "breadcrumb2": "Products",
  "breadcrumb3": "Electronics"
},
  },
};
