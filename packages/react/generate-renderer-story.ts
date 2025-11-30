import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXAMPLES_DIR = path.resolve(__dirname, "../../examples");
const OUTPUT_DIR = path.resolve(__dirname, "./generated");
const TYPES_FILE = path.resolve(__dirname, "../../examples/example-types.d.ts");
const RENDERER_STORY_FILE = path.resolve(OUTPUT_DIR, "Renderer.stories.tsx");

// Helper to convert kebab-case to camelCase
function kebabToCamel(str: string): string {
  let result = str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  result = result.replace(/-(\d)/g, (_, d) => d);
  return result;
}

// Helper to convert camelCase to kebab-case
function camelToKebab(str: string): string {
  return str.replace(/([A-Z])/g, "-$1").toLowerCase();
}

// Helper to parse interface definitions from .d.ts file
function parseInterfaces(
  typesFile: string
): Map<string, Record<string, string>> {
  const interfaces = new Map<string, Record<string, string>>();
  if (!fs.existsSync(typesFile)) {
    return interfaces;
  }

  const content = fs.readFileSync(typesFile, "utf-8");
  const interfaceRegex = /interface\s+(\w+)\s*\{([^}]+)\}/g;
  let match;

  while ((match = interfaceRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const body = match[2];
    const props: Record<string, string> = {};

    // Parse properties: propName: type;
    const propRegex = /(\w+):\s*(\w+);/g;
    let propMatch;
    while ((propMatch = propRegex.exec(body)) !== null) {
      props[propMatch[1]] = propMatch[2];
    }

    interfaces.set(interfaceName, props);
  }

  return interfaces;
}

// Helper to create placeholder to prop mapping
function createPlaceholderMap(
  interfaceProps: Record<string, string>
): Map<string, string> {
  const mapping = new Map<string, string>();
  for (const [propName, propType] of Object.entries(interfaceProps)) {
    // Map both camelCase and kebab-case versions
    mapping.set(propName, propName);
    mapping.set(camelToKebab(propName), propName);

    // Handle numbered properties: breadcrumb1 -> breadcrumb-1
    const numberedMatch = propName.match(/^([a-zA-Z]+)(\d+)$/);
    if (numberedMatch) {
      const base = numberedMatch[1];
      const number = numberedMatch[2];
      mapping.set(`${base}-${number}`, propName);
    }
  }
  return mapping;
}

// Helper to get prop name from a placeholder
function getPropNameFromPlaceholder(
  placeholder: string,
  interfaceProps: Record<string, string>
): string | null {
  if (interfaceProps[placeholder]) {
    return placeholder;
  }
  const camelCase = kebabToCamel(placeholder);
  if (interfaceProps[camelCase]) {
    return camelCase;
  }
  return null;
}

// Helper to merge example data into a node recursively
function mergeExampleData(node: any): any {
  if (!node || typeof node !== "object") {
    return node;
  }

  const result: any = { ...node };

  // Merge example.styleMap into styleMap
  if (node.example && node.example.styleMap) {
    result.styleMap = { ...(result.styleMap || {}), ...node.example.styleMap };
  }

  // Merge example.data into data
  if (node.example && node.example.data) {
    result.data = { ...(result.data || {}), ...node.example.data };
  }

  // Merge example.children into children
  if (node.example && node.example.children) {
    result.children = node.example.children;
  }

  // Recursively merge children
  if (Array.isArray(result.children)) {
    result.children = result.children.map((child: any) =>
      mergeExampleData(child)
    );
  } else if (result.children) {
    result.children = mergeExampleData(result.children);
  }

  return result;
}

// Helper to find example values for placeholders
function findExampleValues(
  baseNode: any,
  mergedNode: any,
  placeholderMap: Map<string, string>,
  interfaceProps: Record<string, string>
): Map<string, any> {
  const exampleValues = new Map<string, any>();

  function traverse(base: any, merged: any) {
    if (
      !base ||
      !merged ||
      typeof base !== "object" ||
      typeof merged !== "object"
    ) {
      return;
    }

    const baseStyleMap = base.styleMap || {};
    const mergedStyleMap = merged.styleMap || {};
    const baseData = base.data || {};
    const mergedData = merged.data || {};

    // Check styleMap - find where placeholders were replaced with example values
    for (const [key, baseValue] of Object.entries(baseStyleMap)) {
      if (typeof baseValue === "string" && mergedStyleMap[key] !== undefined) {
        const propName =
          placeholderMap.get(baseValue) ||
          getPropNameFromPlaceholder(baseValue, interfaceProps);
        if (propName && !exampleValues.has(propName)) {
          exampleValues.set(propName, mergedStyleMap[key]);
        }
      }
    }

    // Check data - find where placeholders were replaced with example values
    for (const [key, baseValue] of Object.entries(baseData)) {
      if (typeof baseValue === "string" && mergedData[key] !== undefined) {
        const propName =
          placeholderMap.get(baseValue) ||
          getPropNameFromPlaceholder(baseValue, interfaceProps);
        if (propName && !exampleValues.has(propName)) {
          exampleValues.set(propName, mergedData[key]);
        }
      }
    }

    // Recursively traverse children
    const baseChildren = Array.isArray(base.children)
      ? base.children
      : base.children
      ? [base.children]
      : [];
    const mergedChildren = Array.isArray(merged.children)
      ? merged.children
      : merged.children
      ? [merged.children]
      : [];

    for (
      let i = 0;
      i < Math.max(baseChildren.length, mergedChildren.length);
      i++
    ) {
      if (baseChildren[i] && mergedChildren[i]) {
        traverse(baseChildren[i], mergedChildren[i]);
      }
    }
  }

  traverse(baseNode, mergedNode);
  return exampleValues;
}

// Helper to create a valid React component name from filename
function toComponentName(filename: string): string {
  return filename
    .replace(/(^[a-z])|([-_][a-z])/g, (match) =>
      match.replace(/[-_]/, "").toUpperCase()
    )
    .replace(/\.json$/i, "");
}

// Helper to format a value for JSON output
function formatValue(value: any): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (value === null || value === undefined) {
    return "null";
  }
  if (Array.isArray(value)) {
    return `[${value.map(formatValue).join(", ")}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([k, v]) => `${JSON.stringify(k)}: ${formatValue(v)}`)
      .join(", ");
    return `{ ${entries} }`;
  }
  return String(value);
}

// Helper to get all available component names from example files
function getAllComponentNames(): Set<string> {
  const files = fs.readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".json"));
  const names = new Set<string>();
  files.forEach((file) => {
    names.add(toComponentName(file));
  });
  return names;
}

// Helper to recursively extract children components from example JSON
function extractChildrenComponents(
  children: any[],
  allComponentNames: Set<string>,
  interfaces: Map<string, Record<string, string>>,
  componentDataCache: Map<string, any>
): any[] {
  if (!Array.isArray(children) || children.length === 0) {
    return [];
  }

  const result: any[] = [];

  for (const child of children) {
    if (!child || typeof child !== "object" || !child.type) {
      continue;
    }

    const childType = child.type;
    // Check if this child is a generated component
    if (allComponentNames.has(childType)) {
      // This is a generated component, extract its data
      const componentData = extractComponentDataFromNode(
        child,
        childType,
        allComponentNames,
        interfaces,
        componentDataCache
      );
      if (componentData) {
        result.push(componentData);
      }
    } else {
      // Not a generated component, but might have children that are
      // Recursively process its children
      if (Array.isArray(child.children)) {
        const nestedChildren = extractChildrenComponents(
          child.children,
          allComponentNames,
          interfaces,
          componentDataCache
        );
        if (nestedChildren.length > 0) {
          result.push(...nestedChildren);
        }
      }
    }
  }

  return result;
}

// Helper to extract component data from a JSON node
function extractComponentDataFromNode(
  node: any,
  componentName: string,
  allComponentNames: Set<string>,
  interfaces: Map<string, Record<string, string>>,
  componentDataCache: Map<string, any>
): any | null {
  if (!node || typeof node !== "object") {
    return null;
  }

  // Get interface for this component
  const interfaceProps = interfaces.get(componentName) || {};
  const placeholderMap =
    Object.keys(interfaceProps).length > 0
      ? createPlaceholderMap(interfaceProps)
      : new Map();

  // Merge example data into the JSON structure
  const mergedNode = mergeExampleData(node);

  // Find example values for placeholders
  const exampleValues = findExampleValues(
    node,
    mergedNode,
    placeholderMap,
    interfaceProps
  );

  // Build prop values object
  const propValues: Record<string, any> = {};

  // Extract prop values from example values
  if (Object.keys(interfaceProps).length > 0) {
    for (const [propName, propType] of Object.entries(interfaceProps)) {
      if (exampleValues.has(propName)) {
        propValues[propName] = exampleValues.get(propName);
      }
    }
  }

  // Check if component has children in the example
  const hasChildren = interfaceProps.children !== undefined;
  let childrenComponents: any[] = [];

  if (
    hasChildren &&
    mergedNode.children &&
    Array.isArray(mergedNode.children)
  ) {
    childrenComponents = extractChildrenComponents(
      mergedNode.children,
      allComponentNames,
      interfaces,
      componentDataCache
    );
  }

  const result: any = {
    component: componentName,
    data: { ...propValues },
  };

  if (childrenComponents.length > 0) {
    result.data.children = childrenComponents;
  }

  return result;
}

// Helper to format component data for the renderer (as string)
function formatComponentDataString(
  componentData: any,
  indent: number = 4
): string {
  const indentStr = " ".repeat(indent);
  const nextIndent = " ".repeat(indent + 2);
  const dataIndent = " ".repeat(indent + 4);

  let result = `${indentStr}{\n${nextIndent}component: ${formatValue(
    componentData.component
  )},\n${nextIndent}data: {`;

  // Format data properties
  const dataEntries = Object.entries(componentData.data || {})
    .filter(([key]) => key !== "children")
    .map(([key, value]) => `${dataIndent}${key}: ${formatValue(value)}`)
    .join(",\n");

  if (dataEntries) {
    result += `\n${dataEntries}`;
  }

  // Format children if they exist
  if (
    componentData.data?.children &&
    Array.isArray(componentData.data.children)
  ) {
    if (dataEntries) {
      result += ",";
    }
    result += `\n${dataIndent}children: [\n`;
    result += componentData.data.children
      .map((child: any) => formatComponentDataString(child, indent + 6))
      .join(",\n");
    result += `\n${dataIndent}]`;
  }

  result += `\n${nextIndent}}\n${indentStr}}`;
  return result;
}

// Main script
function generateRendererStory() {
  // Parse all interfaces from the types file
  const interfaces = parseInterfaces(TYPES_FILE);

  // Get all available component names
  const allComponentNames = getAllComponentNames();

  const files = fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();

  // Cache for component data to avoid duplicate processing
  const componentDataCache = new Map<string, any>();

  // Extract component data from each example file
  const componentDataArray: any[] = [];

  files.forEach((file) => {
    const filePath = path.join(EXAMPLES_DIR, file);
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const componentName = toComponentName(file);

    // Extract component data from the JSON node
    const componentData = extractComponentDataFromNode(
      json,
      componentName,
      allComponentNames,
      interfaces,
      componentDataCache
    );

    if (componentData) {
      componentDataArray.push(componentData);
    }
  });

  // Format component data as strings
  const componentDataStrings = componentDataArray.map((data) =>
    formatComponentDataString(data, 4)
  );

  // Generate the story file
  const storyContent = `import React from "react";
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
${componentDataStrings.join(",\n")}
    ] as ComponentData[],
  },
};
`;

  // Write the story file
  fs.writeFileSync(RENDERER_STORY_FILE, storyContent, "utf-8");
  console.log(`Generated Renderer.stories.tsx with ${files.length} components`);
}

generateRendererStory();
