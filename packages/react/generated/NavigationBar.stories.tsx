import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NavigationBar } from './NavigationBar';
import './NavigationBar.css';

const meta: Meta<typeof NavigationBar> = {
  title: "Generated/NavigationBar",
  component: NavigationBar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  args: {
    styleMap: {
  "--nav-logo-color": "#0066cc",
  "--nav-item-1-color": "#333333",
  "--nav-item-2-color": "#666666",
  "--nav-item-3-color": "#666666",
  "--nav-item-4-color": "#666666"
},
    data: {
  "navLogoText": "Logo",
  "navCtaText": "Sign In"
},
  },
};
