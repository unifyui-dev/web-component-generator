import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { HeroSection } from './HeroSection';
import './HeroSection.css';

const meta: Meta<typeof HeroSection> = {
  title: "Generated/HeroSection",
  component: HeroSection,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof HeroSection>;

export const Default: Story = {
  args: {
    styleMap: {
  "--hero-cta-bg-color": "#0066cc"
},
    data: {
  "heroImageSrc": "https://placehold.co/600x400/000000/FFFFFF/png",
  "heroHeading": "Welcome to Our Platform",
  "heroSubheading": "Discover amazing features and transform your workflow",
  "heroCtaText": "Get Started"
},
  },
};
