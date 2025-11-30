import React from "react";
import { Text, TextProps } from "./Text";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Text> = {
  title: "Components/Text",
  component: Text,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    data: {
      content: "Default Text",
    },
  },
};

export const WithChildren: Story = {
  args: {
    children: "Text with children prop",
  },
};

export const StyledText: Story = {
  args: {
    data: {
      content: "Styled Text",
    },
    styleMap: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#007bff",
      fontFamily: "Arial, sans-serif",
    },
  },
};

export const TextWithTypography: Story = {
  args: {
    data: {
      content: "Typography Example",
    },
    styleMap: {
      fontSize: 18,
      fontWeight: "600",
      fontStyle: "italic",
      lineHeight: 1.5,
      letterSpacing: 1,
      textAlign: "center",
      color: "#333",
    },
  },
};

export const TextWithDecoration: Story = {
  args: {
    data: {
      content: "Text with Decoration",
    },
    styleMap: {
      textDecoration: "underline",
      textDecorationColor: "#ff0000",
      textDecorationStyle: "wavy",
      fontSize: 20,
      color: "#000",
    },
  },
};

export const TextTransform: Story = {
  args: {
    data: {
      content: "text transform example",
    },
    styleMap: {
      textTransform: "uppercase",
      fontSize: 16,
      fontWeight: "bold",
      letterSpacing: 2,
    },
  },
};

export const TextWithOverflow: Story = {
  args: {
    data: {
      content:
        "This is a very long text that should be truncated with ellipsis when it overflows the container width",
    },
    styleMap: {
      width: 200,
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap",
      fontSize: 14,
    },
  },
};

export const TextWithBackground: Story = {
  args: {
    data: {
      content: "Text with Background",
    },
    styleMap: {
      backgroundColor: "#ffeb3b",
      color: "#000",
      padding: 12,
      borderRadius: 8,
      fontSize: 16,
      fontWeight: "500",
    },
  },
};

export const TextWithShadow: Story = {
  args: {
    data: {
      content: "Text with Shadow",
    },
    styleMap: {
      fontSize: 32,
      fontWeight: "bold",
      color: "#fff",
      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      backgroundColor: "#007bff",
      padding: 16,
      borderRadius: 8,
    },
  },
};

export const MultilineText: Story = {
  args: {
    data: {
      content:
        "This is a multiline text example that demonstrates how text can wrap within a container. The text will automatically wrap to the next line when it reaches the container width.",
    },
    styleMap: {
      width: 300,
      lineHeight: 1.6,
      fontSize: 14,
      color: "#333",
      padding: 12,
      backgroundColor: "#f5f5f5",
      borderRadius: 4,
    },
  },
};
