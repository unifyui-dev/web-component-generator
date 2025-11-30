import React from "react";
import { Container, ContainerProps } from "./Container";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Container> = {
  title: "Components/Container",
  component: Container,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: "Default Container",
  },
};

export const FlexRow: Story = {
  args: {
    styleMap: {
      display: "flex",
      flexDirection: "row",
      gap: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f0f0",
      padding: 24,
      borderRadius: 8,
    },
    children: [
      <div
        key="1"
        style={{
          background: "#007bff",
          color: "#fff",
          padding: 8,
          borderRadius: 4,
        }}
      >
        Item 1
      </div>,
      <div
        key="2"
        style={{
          background: "#28a745",
          color: "#fff",
          padding: 8,
          borderRadius: 4,
        }}
      >
        Item 2
      </div>,
      <div
        key="3"
        style={{
          background: "#ffc107",
          color: "#fff",
          padding: 8,
          borderRadius: 4,
        }}
      >
        Item 3
      </div>,
    ],
  },
};

export const GridExample: Story = {
  args: {
    styleMap: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12,
      backgroundColor: "#e3e3e3",
      padding: 20,
    },
    children: [
      <div
        key="1"
        style={{
          background: "#ff5722",
          color: "#fff",
          padding: 10,
          borderRadius: 4,
        }}
      >
        A
      </div>,
      <div
        key="2"
        style={{
          background: "#03a9f4",
          color: "#fff",
          padding: 10,
          borderRadius: 4,
        }}
      >
        B
      </div>,
      <div
        key="3"
        style={{
          background: "#8bc34a",
          color: "#fff",
          padding: 10,
          borderRadius: 4,
        }}
      >
        C
      </div>,
    ],
  },
};

export const WithShadowAndBorder: Story = {
  args: {
    styleMap: {
      backgroundColor: "#fff",
      borderColor: "#333",
      borderWidth: 2,
      borderStyle: "dashed",
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      padding: 32,
      margin: 16,
    },
    children: "Container with shadow and border",
  },
};

export const OverflowScroll: Story = {
  args: {
    styleMap: {
      width: 300,
      height: 100,
      overflow: "scroll",
      backgroundColor: "#fafafa",
      border: "1px solid #ccc",
    },
    children: (
      <div style={{ width: 600, height: 200 }}>
        This content is larger than the container, so scrollbars should appear.
      </div>
    ),
  },
};
