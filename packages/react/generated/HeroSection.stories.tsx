import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from './HeroSection';

const meta: Meta<typeof HeroSection> = {
  title: "Generated/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {
  args: {
    heroCtaBgColor: "#0066cc",
    heroCtaText: "Get Started",
    heroHeading: "Welcome to Our Platform",
    heroImageSrc: "https://placehold.co/600x400/000000/FFFFFF/png",
    heroSubheading: "Discover amazing features and transform your workflow",
  },
};
