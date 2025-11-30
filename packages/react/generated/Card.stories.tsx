import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: "Generated/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    cardButtonBgColor: "#0066cc",
    cardButtonText: "Learn More",
    cardDescription: "This is a description of the card content. It can contain multiple lines of text to describe the card in detail.",
    cardImageSrc: "https://placehold.co/400",
    cardTitle: "Card Title",
  },
};
