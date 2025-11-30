import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "./Button";
import { Card } from "./Card";
import { HeroSection } from "./HeroSection";
import { NavigationBar } from "./NavigationBar";
import { Page } from "./Page";

// Component map for case-insensitive component lookup
const componentMap: Record<string, React.ComponentType<any>> = {
  breadcrumbs: Breadcrumbs,
  button: Button,
  card: Card,
  herosection: HeroSection,
  navigationbar: NavigationBar,
  page: Page,
};

// Type definition for component data structure
export interface ComponentData {
  component: string;
  data?: Record<string, any>;
}

export interface RendererProps {
  data: ComponentData[];
}

// Recursive render function
function renderComponent(item: ComponentData): React.ReactNode {
  const { component, data = {} } = item;

  // Find component in map (case-insensitive)
  const Component = componentMap[component.toLowerCase()];

  if (!Component) {
    console.warn(`Component "${component}" not found in component map`);
    return null;
  }

  // Handle children if they exist in data
  let children: React.ReactNode = undefined;
  if (data.children && Array.isArray(data.children)) {
    children = data.children.map((child: ComponentData, index: number) => (
      <React.Fragment key={index}>{renderComponent(child)}</React.Fragment>
    ));
  }

  // Create props object, excluding children if it exists
  const { children: _, ...props } = data;

  // If children exist, pass them as React children
  if (children) {
    return <Component {...props}>{children}</Component>;
  }

  return <Component {...props} />;
}

// Main renderer component
export const Renderer = (props: RendererProps) => {
  const { data } = props;

  if (!Array.isArray(data)) {
    return null;
  }

  return (
    <>
      {data.map((item, index) => (
        <React.Fragment key={index}>{renderComponent(item)}</React.Fragment>
      ))}
    </>
  );
};
