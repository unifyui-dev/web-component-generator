import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Renderer } from './Renderer';
import type { ComponentData } from './Renderer';

const meta: Meta<typeof Renderer> = {
  title: "Generated/Renderer",
  component: Renderer,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Renderer>;

export const Default: Story = {
  args: {
    data: [
    {
      component: "Breadcrumbs",
      styleMap: {
        "--breadcrumb-link-color": "#0066cc"
      },
      data: {
        breadcrumb1: "Home",
        breadcrumb2: "Products",
        breadcrumb3: "Electronics"
      }
    },
    {
      component: "Button",
      styleMap: {
        "--button-bg-color": "#0066cc"
      },
      data: {
        buttonContent: "Click Me"
      }
    },
    {
      component: "Card",
      styleMap: {
        "--card-button-bg-color": "#0066cc"
      },
      data: {
        cardImageSrc: "https://placehold.co/400",
        cardTitle: "Card Title",
        cardDescription: "This is a description of the card content. It can contain multiple lines of text to describe the card in detail.",
        cardButtonText: "Learn More"
      }
    },
    {
      component: "HeroSection",
      styleMap: {
        "--hero-cta-bg-color": "#0066cc"
      },
      data: {
        heroImageSrc: "https://placehold.co/600x400/000000/FFFFFF/png",
        heroHeading: "Welcome to Our Platform",
        heroSubheading: "Discover amazing features and transform your workflow",
        heroCtaText: "Get Started"
      }
    },
    {
      component: "NavigationBar",
      styleMap: {
        "--nav-logo-color": "#0066cc",
        "--nav-item-1-color": "#333333",
        "--nav-item-2-color": "#666666",
        "--nav-item-3-color": "#666666",
        "--nav-item-4-color": "#666666"
      },
      data: {
        navLogoText: "Logo",
        navItem1: "Home",
        navItem2: "About",
        navItem3: "Products",
        navItem4: "Contact",
        navCtaText: "Sign In"
      }
    },
    {
      component: "Page"
    }
    ] as ComponentData[],
  },
};
