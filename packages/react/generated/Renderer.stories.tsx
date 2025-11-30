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
      data: {
        breadcrumb1: "Home",
        breadcrumb2: "Products",
        breadcrumb3: "Electronics",
        breadcrumbLinkColor: "#0066cc"
      }
    },
    {
      component: "Button",
      data: {
        buttonBgColor: "#0066cc",
        buttonContent: "Click Me"
      }
    },
    {
      component: "Card",
      data: {
        cardButtonBgColor: "#0066cc",
        cardButtonText: "Learn More",
        cardDescription: "This is a description of the card content. It can contain multiple lines of text to describe the card in detail.",
        cardImageSrc: "https://placehold.co/400",
        cardTitle: "Card Title"
      }
    },
    {
      component: "HeroSection",
      data: {
        heroCtaBgColor: "#0066cc",
        heroCtaText: "Get Started",
        heroHeading: "Welcome to Our Platform",
        heroImageSrc: "https://placehold.co/600x400/000000/FFFFFF/png",
        heroSubheading: "Discover amazing features and transform your workflow"
      }
    },
    {
      component: "NavigationBar",
      data: {
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
        navLogoText: "Logo"
      }
    },
    {
      component: "Page",
      data: {
      }
    }
    ] as ComponentData[],
  },
};
