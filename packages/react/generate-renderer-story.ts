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

// Interface structure for parsed interfaces
interface ParsedInterface {
  styleMap?: Record<string, string>; // CSS variable names -> type
  data?: Record<string, string>; // Data property names -> type
  children?: boolean;
}

// Helper to find matching brace for interface body (handles nested braces)
function findInterfaceBody(content: string, startIndex: number): string | null {
  let i = startIndex;
  // Find the opening brace
  while (i < content.length && content[i] !== "{") i++;
  if (i >= content.length) return null;

  let braceCount = 0;
  const start = i;
  while (i < content.length) {
    if (content[i] === "{") braceCount++;
    if (content[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        return content.substring(start + 1, i);
      }
    }
    i++;
  }
  return null;
}

// Helper to extract nested object content (handles nested braces)
function extractNestedObject(str: string, key: string): string | null {
  const keyIndex = str.indexOf(key + ":");
  if (keyIndex === -1) return null;

  let start = keyIndex + key.length + 1;
  // Skip whitespace
  while (start < str.length && /\s/.test(str[start])) start++;

  if (str[start] !== "{") return null;

  let braceCount = 0;
  let i = start;
  while (i < str.length) {
    if (str[i] === "{") braceCount++;
    if (str[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        return str.substring(start + 1, i);
      }
    }
    i++;
  }
  return null;
}

// Helper to parse interface definitions from .d.ts file
function parseInterfaces(typesFile: string): Map<string, ParsedInterface> {
  const interfaces = new Map<string, ParsedInterface>();
  if (!fs.existsSync(typesFile)) {
    return interfaces;
  }

  const content = fs.readFileSync(typesFile, "utf-8");
  const interfaceNameRegex = /interface\s+(\w+)\s*\{/g;
  let match;

  while ((match = interfaceNameRegex.exec(content)) !== null) {
    const interfaceName = match[1];
    const bodyStart = match.index + match[0].length - 1; // Position of opening brace
    const body = findInterfaceBody(content, bodyStart);

    if (!body) continue;
    const parsed: ParsedInterface = {};

    // Check for nested styleMap object
    const styleMapBody = extractNestedObject(body, "styleMap");
    if (styleMapBody) {
      parsed.styleMap = {};
      // Parse CSS variable names: "--var-name": string;
      const styleMapPropRegex = /"([^"]+)":\s*(\w+);/g;
      let styleMapPropMatch;
      while (
        (styleMapPropMatch = styleMapPropRegex.exec(styleMapBody)) !== null
      ) {
        parsed.styleMap[styleMapPropMatch[1]] = styleMapPropMatch[2];
      }
    }

    // Check for nested data object
    const dataBody = extractNestedObject(body, "data");
    if (dataBody) {
      parsed.data = {};
      // Parse data properties: propName: type;
      const dataPropRegex = /(\w+):\s*(\w+);/g;
      let dataPropMatch;
      while ((dataPropMatch = dataPropRegex.exec(dataBody)) !== null) {
        parsed.data[dataPropMatch[1]] = dataPropMatch[2];
      }
    }

    // Check for children property
    if (body.includes("children:")) {
      parsed.children = true;
    }

    interfaces.set(interfaceName, parsed);
  }

  return interfaces;
}

// Helper to create placeholder to prop mapping
function createPlaceholderMap(
  parsedInterface: ParsedInterface
): Map<string, { type: "styleMap" | "data"; key: string }> {
  const mapping = new Map<string, { type: "styleMap" | "data"; key: string }>();

  // Map styleMap CSS variables
  if (parsedInterface.styleMap) {
    for (const [cssVar] of Object.entries(parsedInterface.styleMap)) {
      // CSS variables are already in kebab-case format like "--button-bg-color"
      // Extract the variable name without the "--" prefix
      const varName = cssVar.replace(/^--/, "");
      mapping.set(varName, { type: "styleMap", key: cssVar });
      // Also map with the "--" prefix
      mapping.set(cssVar, { type: "styleMap", key: cssVar });
    }
  }

  // Map data properties
  if (parsedInterface.data) {
    for (const [propName] of Object.entries(parsedInterface.data)) {
      // Map both camelCase and kebab-case versions
      mapping.set(propName, { type: "data", key: propName });
      mapping.set(camelToKebab(propName), { type: "data", key: propName });

      // Handle numbered properties: breadcrumb1 -> breadcrumb-1
      const numberedMatch = propName.match(/^([a-zA-Z]+)(\d+)$/);
      if (numberedMatch) {
        const base = numberedMatch[1];
        const number = numberedMatch[2];
        mapping.set(`${base}-${number}`, { type: "data", key: propName });
      }
    }
  }

  return mapping;
}

// Helper to get prop info from a placeholder
function getPropInfoFromPlaceholder(
  placeholder: string,
  parsedInterface: ParsedInterface
): { type: "styleMap" | "data"; key: string } | null {
  // Check if it's a CSS variable (starts with --)
  if (placeholder.startsWith("--")) {
    if (parsedInterface.styleMap && parsedInterface.styleMap[placeholder]) {
      return { type: "styleMap", key: placeholder };
    }
  } else {
    // Check if it's a CSS variable without the -- prefix
    const cssVar = `--${placeholder}`;
    if (parsedInterface.styleMap && parsedInterface.styleMap[cssVar]) {
      return { type: "styleMap", key: cssVar };
    }

    // Check data properties
    if (parsedInterface.data) {
      if (parsedInterface.data[placeholder]) {
        return { type: "data", key: placeholder };
      }
      const camelCase = kebabToCamel(placeholder);
      if (parsedInterface.data[camelCase]) {
        return { type: "data", key: camelCase };
      }
    }
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
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>,
  parsedInterface: ParsedInterface
): { styleMap: Record<string, any>; data: Record<string, any> } {
  const styleMapValues: Record<string, any> = {};
  const dataValues: Record<string, any> = {};

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
        const propInfo =
          placeholderMap.get(baseValue) ||
          getPropInfoFromPlaceholder(baseValue, parsedInterface);
        if (propInfo && propInfo.type === "styleMap") {
          if (!styleMapValues[propInfo.key]) {
            styleMapValues[propInfo.key] = mergedStyleMap[key];
          }
        }
      }
    }

    // Check data - find where placeholders were replaced with example values
    for (const [key, baseValue] of Object.entries(baseData)) {
      if (typeof baseValue === "string" && mergedData[key] !== undefined) {
        const propInfo =
          placeholderMap.get(baseValue) ||
          getPropInfoFromPlaceholder(baseValue, parsedInterface);
        if (propInfo && propInfo.type === "data") {
          if (!dataValues[propInfo.key]) {
            dataValues[propInfo.key] = mergedData[key];
          }
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
  return { styleMap: styleMapValues, data: dataValues };
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
  interfaces: Map<string, ParsedInterface>,
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
  interfaces: Map<string, ParsedInterface>,
  componentDataCache: Map<string, any>
): any | null {
  if (!node || typeof node !== "object") {
    return null;
  }

  // Get interface for this component
  const parsedInterface = interfaces.get(componentName) || {};
  const placeholderMap =
    (parsedInterface.styleMap &&
      Object.keys(parsedInterface.styleMap).length > 0) ||
    (parsedInterface.data && Object.keys(parsedInterface.data).length > 0)
      ? createPlaceholderMap(parsedInterface)
      : new Map();

  // Merge example data into the JSON structure
  const mergedNode = mergeExampleData(node);

  // Find example values for placeholders
  const exampleValues = findExampleValues(
    node,
    mergedNode,
    placeholderMap,
    parsedInterface
  );

  // Build result object with separate styleMap and data
  const result: any = {
    component: componentName,
  };

  // Add styleMap if it has values
  if (Object.keys(exampleValues.styleMap).length > 0) {
    result.styleMap = exampleValues.styleMap;
  }

  // Add data if it has values
  if (Object.keys(exampleValues.data).length > 0) {
    result.data = exampleValues.data;
  }

  // Check if component has children in the example
  const hasChildren = parsedInterface.children !== undefined;
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

  if (childrenComponents.length > 0) {
    result.children = childrenComponents;
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
  const propIndent = " ".repeat(indent + 4);

  let result = `${indentStr}{\n${nextIndent}component: ${formatValue(
    componentData.component
  )}`;

  // Format styleMap if it exists
  if (
    componentData.styleMap &&
    Object.keys(componentData.styleMap).length > 0
  ) {
    result += `,\n${nextIndent}styleMap: {`;
    const styleMapEntries = Object.entries(componentData.styleMap)
      .map(
        ([key, value]) =>
          `${propIndent}${formatValue(key)}: ${formatValue(value)}`
      )
      .join(",\n");
    if (styleMapEntries) {
      result += `\n${styleMapEntries}`;
    }
    result += `\n${nextIndent}}`;
  }

  // Format data if it exists
  if (componentData.data && Object.keys(componentData.data).length > 0) {
    result += `,\n${nextIndent}data: {`;
    const dataEntries = Object.entries(componentData.data)
      .map(([key, value]) => `${propIndent}${key}: ${formatValue(value)}`)
      .join(",\n");
    if (dataEntries) {
      result += `\n${dataEntries}`;
    }
    result += `\n${nextIndent}}`;
  }

  // Format children if they exist (as top-level property, not in data)
  if (componentData.children && Array.isArray(componentData.children)) {
    result += `,\n${nextIndent}children: [\n`;
    result += componentData.children
      .map((child: any) => formatComponentDataString(child, indent + 6))
      .join(",\n");
    result += `\n${nextIndent}]`;
  }

  result += `\n${indentStr}}`;
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
