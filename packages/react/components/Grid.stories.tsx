import React from "react";
import { Grid } from "./Grid";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof Grid> = {
  title: "Components/Grid",
  component: Grid,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Grid>;

export const Default: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
    },
    children: [
      <div
        key="1"
        style={{
          background: "#007bff",
          color: "#fff",
          padding: 16,
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
          padding: 16,
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
          padding: 16,
          borderRadius: 4,
        }}
      >
        Item 3
      </div>,
    ],
  },
};

export const BasicGrid: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 12,
      backgroundColor: "#f0f0f0",
      padding: 20,
    },
    children: Array.from({ length: 9 }, (_, i) => (
      <div
        key={i}
        style={{
          background: `hsl(${(i * 40) % 360}, 70%, 80%)`,
          padding: 20,
          borderRadius: 8,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {i + 1}
      </div>
    )),
  },
};

export const GridWithTemplateAreas: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "1fr 3fr 1fr",
      gridTemplateRows: "auto 1fr auto",
      gridTemplateAreas: `
        "header header header"
        "sidebar main aside"
        "footer footer footer"
      `,
      gap: 12,
      height: 400,
      backgroundColor: "#e3e3e3",
      padding: 12,
    },
    children: [
      <div
        key="header"
        style={{
          gridArea: "header",
          background: "#007bff",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Header
      </div>,
      <div
        key="sidebar"
        style={{
          gridArea: "sidebar",
          background: "#28a745",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
        }}
      >
        Sidebar
      </div>,
      <div
        key="main"
        style={{
          gridArea: "main",
          background: "#ffc107",
          color: "#000",
          padding: 16,
          borderRadius: 4,
        }}
      >
        Main Content
      </div>,
      <div
        key="aside"
        style={{
          gridArea: "aside",
          background: "#17a2b8",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
        }}
      >
        Aside
      </div>,
      <div
        key="footer"
        style={{
          gridArea: "footer",
          background: "#6c757d",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Footer
      </div>,
    ],
  },
};

export const GridWithAutoFlow: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(4, 1fr)",
      gridAutoFlow: "row dense",
      gap: 8,
      backgroundColor: "#f5f5f5",
      padding: 16,
    },
    children: Array.from({ length: 12 }, (_, i) => (
      <div
        key={i}
        style={{
          background: `hsl(${(i * 30) % 360}, 60%, 70%)`,
          padding: 16,
          borderRadius: 4,
          textAlign: "center",
          fontWeight: "500",
          gridColumn: i % 3 === 0 ? "span 2" : undefined,
        }}
      >
        {i + 1}
      </div>
    )),
  },
};

export const GridWithAutoRows: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(3, 1fr)",
      gridAutoRows: "minmax(100px, auto)",
      gap: 16,
      backgroundColor: "#fff",
      padding: 20,
      borderWidth: 2,
      borderColor: "#dee2e6",
      borderStyle: "solid",
      borderRadius: 8,
    },
    children: Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        style={{
          background: `linear-gradient(135deg, hsl(${
            (i * 60) % 360
          }, 70%, 80%), hsl(${(i * 60 + 30) % 360}, 70%, 80%))`,
          padding: 20,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: 18,
        }}
      >
        Auto Row {i + 1}
      </div>
    )),
  },
};

export const GridWithColumnGap: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(4, 1fr)",
      gridColumnGap: 24,
      gridRowGap: 12,
      backgroundColor: "#f8f9fa",
      padding: 20,
    },
    children: Array.from({ length: 8 }, (_, i) => (
      <div
        key={i}
        style={{
          background: "#007bff",
          color: "#fff",
          padding: 20,
          borderRadius: 8,
          textAlign: "center",
          fontWeight: "600",
        }}
      >
        Column {i + 1}
      </div>
    )),
  },
};

export const GridWithJustifyItems: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(3, 1fr)",
      gridTemplateRows: "repeat(2, 150px)",
      justifyItems: "center",
      alignItems: "center",
      gap: 16,
      backgroundColor: "#e9ecef",
      padding: 20,
    },
    children: Array.from({ length: 6 }, (_, i) => (
      <div
        key={i}
        style={{
          background: `hsl(${(i * 50) % 360}, 65%, 75%)`,
          padding: 16,
          borderRadius: 8,
          width: "80%",
          height: "80%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        {i + 1}
      </div>
    )),
  },
};

export const GridWithItemPlacement: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(4, 1fr)",
      gridTemplateRows: "repeat(3, 100px)",
      gap: 12,
      backgroundColor: "#fff",
      padding: 16,
    },
    children: [
      <div
        key="1"
        style={{
          background: "#ff5722",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          gridColumn: "1 / 3",
          gridRow: "1 / 2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        Spans 2 columns
      </div>,
      <div
        key="2"
        style={{
          background: "#03a9f4",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          gridColumn: "3 / 5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        Spans 2 columns
      </div>,
      <div
        key="3"
        style={{
          background: "#8bc34a",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          gridRow: "2 / 4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        Spans 2 rows
      </div>,
      <div
        key="4"
        style={{
          background: "#ffc107",
          color: "#000",
          padding: 16,
          borderRadius: 4,
          gridColumn: "2 / 5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        Spans 3 columns
      </div>,
      <div
        key="5"
        style={{
          background: "#9c27b0",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        Item 5
      </div>,
      <div
        key="6"
        style={{
          background: "#f44336",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        Item 6
      </div>,
    ],
  },
};

export const ResponsiveGrid: Story = {
  args: {
    styleMap: {
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 16,
      backgroundColor: "#f0f0f0",
      padding: 20,
    },
    children: Array.from({ length: 10 }, (_, i) => (
      <div
        key={i}
        style={{
          background: `linear-gradient(45deg, hsl(${
            (i * 36) % 360
          }, 70%, 60%), hsl(${(i * 36 + 20) % 360}, 70%, 60%))`,
          color: "#fff",
          padding: 24,
          borderRadius: 12,
          textAlign: "center",
          fontWeight: "bold",
          fontSize: 18,
          minHeight: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Responsive {i + 1}
      </div>
    )),
  },
};

export const GridWithMinMax: Story = {
  args: {
    styleMap: {
      gridTemplateColumns:
        "minmax(100px, 200px) minmax(200px, 1fr) minmax(150px, 300px)",
      gap: 16,
      backgroundColor: "#fff",
      padding: 20,
      borderWidth: 1,
      borderColor: "#dee2e6",
      borderStyle: "solid",
      borderRadius: 8,
    },
    children: [
      <div
        key="1"
        style={{
          background: "#007bff",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        Min 100px, Max 200px
      </div>,
      <div
        key="2"
        style={{
          background: "#28a745",
          color: "#fff",
          padding: 16,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        Flexible (Min 200px)
      </div>,
      <div
        key="3"
        style={{
          background: "#ffc107",
          color: "#000",
          padding: 16,
          borderRadius: 4,
          textAlign: "center",
        }}
      >
        Min 150px, Max 300px
      </div>,
    ],
  },
};
