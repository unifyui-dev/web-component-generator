import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { NavigationBar } from './NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: "Generated/NavigationBar",
  component: NavigationBar,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  args: {
    navCtaText: "Sign In",
    navItem1: "Home",
    navItem1Color: "#333333",
    navItem2: "About",
    navItem2Color: "#666666",
    navItem3: "Products",
    navItem3Color: "#666666",
    navItem4: "Contact",
    navItem4Color: "#666666",
    navLogoColor: "#0066cc",
    navLogoText: "Logo",
  },
};
