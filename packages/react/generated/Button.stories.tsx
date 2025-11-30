import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from './Button';
import './Button.css';

const meta: Meta<typeof Button> = {
  title: "Generated/Button",
  component: Button,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    styleMap: {
  "--button-bg-color": "#0066cc"
},
    data: {
  "buttonContent": "Click Me"
},
  },
};
