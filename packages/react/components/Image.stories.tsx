import React from "react";
import { Image, ImageProps } from "./Image";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Image> = {
  title: "Components/Image",
  component: Image,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    data: {
      src: "https://placehold.co/300x200",
    },
  },
};

export const WithSize: Story = {
  args: {
    data: {
      src: "https://placehold.co/400x300",
    },
    styleMap: {
      width: 400,
      height: 300,
    },
  },
};

export const WithBorderRadius: Story = {
  args: {
    data: {
      src: "https://placehold.co/300x300",
    },
    styleMap: {
      width: 300,
      height: 300,
      borderRadius: 16,
    },
  },
};

export const CircularImage: Story = {
  args: {
    data: {
      src: "https://placehold.co/200x200",
    },
    styleMap: {
      width: 200,
      height: 200,
      borderRadius: "50%",
    },
  },
};

export const WithBorder: Story = {
  args: {
    data: {
      src: "https://placehold.co/350x250",
    },
    styleMap: {
      width: 350,
      height: 250,
      borderWidth: 4,
      borderColor: "#007bff",
      borderStyle: "solid",
      borderRadius: 8,
    },
  },
};

export const WithShadow: Story = {
  args: {
    data: {
      src: "https://placehold.co/400x300",
    },
    styleMap: {
      width: 400,
      height: 300,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
  },
};

export const ResponsiveImage: Story = {
  args: {
    data: {
      src: "https://placehold.co/600x400",
    },
    styleMap: {
      width: "100%",
      maxWidth: 600,
      height: "auto",
      borderRadius: 8,
    },
  },
};

export const WithAspectRatio: Story = {
  args: {
    data: {
      src: "https://placehold.co/400x300",
    },
    styleMap: {
      width: 400,
      aspectRatio: "16/9",
      borderRadius: 8,
      objectFit: "cover",
    },
  },
};

export const WithOpacity: Story = {
  args: {
    data: {
      src: "https://placehold.co/300x200",
    },
    styleMap: {
      width: 300,
      height: 200,
      opacity: 0.7,
      borderRadius: 8,
    },
  },
};

export const WithTransform: Story = {
  args: {
    data: {
      src: "https://placehold.co/300x300",
    },
    styleMap: {
      width: 300,
      height: 300,
      borderRadius: 8,
      transform: "rotate(15deg) scale(1.1)",
      transformOrigin: "center",
    },
  },
};

export const WithOverflow: Story = {
  args: {
    data: {
      src: "https://placehold.co/500x300",
    },
    styleMap: {
      width: 300,
      height: 200,
      borderRadius: 8,
      overflow: "hidden",
      objectFit: "cover",
    },
  },
};
