import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const EXAMPLES_DIR = path.resolve(__dirname, "../../examples");
const OUTPUT_DIR = path.resolve(__dirname, "./generated");
const TYPES_FILE = path.resolve(__dirname, "../../examples/example-types.d.ts");

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

// Helper to parse interface definitions from .d.ts file
function parseInterfaces(typesFile: string): Map<string, ParsedInterface> {
  const interfaces = new Map<string, ParsedInterface>();
  if (!fs.existsSync(typesFile)) {
    return interfaces;
  }

  const content = fs.readFileSync(typesFile, "utf-8");

  // Helper to find matching brace for interface body (handles nested braces)
  function findInterfaceBody(
    content: string,
    startIndex: number
  ): string | null {
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

  // Match interface declarations
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

// Helper to create placeholder to prop mapping for CSS variables and data
function createPlaceholderMap(
  parsedInterface: ParsedInterface
): Map<string, { type: "styleMap" | "data"; key: string }> {
  const mapping = new Map<string, { type: "styleMap" | "data"; key: string }>();

  // Map CSS variables from styleMap
  if (parsedInterface.styleMap) {
    for (const cssVar of Object.keys(parsedInterface.styleMap)) {
      mapping.set(cssVar, { type: "styleMap", key: cssVar });
      const withoutPrefix = cssVar.replace(/^--/, "");
      if (withoutPrefix !== cssVar) {
        mapping.set(withoutPrefix, { type: "styleMap", key: cssVar });
        const camelCase = kebabToCamel(withoutPrefix);
        if (camelCase !== withoutPrefix) {
          mapping.set(camelCase, { type: "styleMap", key: cssVar });
        }
      }
    }
  }

  // Map data properties
  if (parsedInterface.data) {
    for (const dataProp of Object.keys(parsedInterface.data)) {
      mapping.set(dataProp, { type: "data", key: dataProp });
      mapping.set(camelToKebab(dataProp), { type: "data", key: dataProp });

      const numberedMatch = dataProp.match(/^([a-zA-Z]+)(\d+)$/);
      if (numberedMatch) {
        const base = numberedMatch[1];
        const number = numberedMatch[2];
        mapping.set(`${base}-${number}`, { type: "data", key: dataProp });
      }
    }
  }

  return mapping;
}

// Helper to get prop name from a placeholder (for backward compatibility)
function getPropNameFromPlaceholder(
  placeholder: string,
  parsedInterface: ParsedInterface
): string | null {
  const mapping = createPlaceholderMap(parsedInterface);
  const result = mapping.get(placeholder);
  if (result && result.type === "data") {
    return result.key;
  }
  return null;
}

// Helper to merge example data into a node recursively
function mergeExampleData(node: any): any {
  if (!node || typeof node !== "object") {
    return node;
  }

  const { example, ...rest } = node;

  if (!example) {
    // No example, but still process children
    if (Array.isArray(node.children)) {
      return {
        ...rest,
        children: node.children.map(mergeExampleData),
      };
    } else if (node.children) {
      return {
        ...rest,
        children: mergeExampleData(node.children),
      };
    }
    return rest;
  }

  // Merge example data
  const merged: any = {
    ...rest,
  };

  // Merge styleMap
  if (example.styleMap) {
    merged.styleMap = {
      ...(rest.styleMap || {}),
      ...example.styleMap,
    };
  }

  // Merge data
  if (example.data) {
    merged.data = {
      ...(rest.data || {}),
      ...example.data,
    };
  }

  // Merge children (example children override base children)
  if (example.children !== undefined) {
    merged.children = Array.isArray(example.children)
      ? example.children.map(mergeExampleData)
      : mergeExampleData(example.children);
  } else if (Array.isArray(node.children)) {
    merged.children = node.children.map(mergeExampleData);
  } else if (node.children) {
    merged.children = mergeExampleData(node.children);
  }

  return merged;
}

// Helper to extract prop values from merged JSON using placeholders
function extractPropValues(
  node: any,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>,
  parsedInterface: ParsedInterface,
  propValues: {
    styleMap?: Record<string, any>;
    data?: Record<string, any>;
  } = {}
): { styleMap?: Record<string, any>; data?: Record<string, any> } {
  if (!node || typeof node !== "object") {
    return propValues;
  }

  const { styleMap, data, children } = node;

  // Extract from styleMap (CSS variables)
  if (styleMap && typeof styleMap === "object") {
    if (!propValues.styleMap) propValues.styleMap = {};
    for (const [key, value] of Object.entries(styleMap)) {
      if (typeof value === "string") {
        const mapping = placeholderMap.get(value);
        if (mapping && mapping.type === "styleMap") {
          // Store the actual value (from example) for the CSS variable
          propValues.styleMap[mapping.key] = value;
        }
      }
    }
  }

  // Extract from data
  if (data && typeof data === "object") {
    if (!propValues.data) propValues.data = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        const mapping = placeholderMap.get(value);
        if (mapping && mapping.type === "data") {
          propValues.data[mapping.key] = value;
        }
      }
    }
  }

  // Recursively process children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      extractPropValues(child, placeholderMap, parsedInterface, propValues);
    });
  } else if (children) {
    extractPropValues(children, placeholderMap, parsedInterface, propValues);
  }

  return propValues;
}

// Helper to replace placeholders with actual example values
function replacePlaceholdersWithExamples(
  node: any,
  placeholderMap: Map<string, string>,
  exampleValues: Map<string, any>
): any {
  if (!node || typeof node !== "object") {
    return node;
  }

  const result: any = { ...node };

  // Replace in styleMap
  if (result.styleMap && typeof result.styleMap === "object") {
    result.styleMap = { ...result.styleMap };
    for (const [key, value] of Object.entries(result.styleMap)) {
      if (typeof value === "string") {
        const propName =
          placeholderMap.get(value) || getPropNameFromPlaceholder(value, {});
        if (propName && exampleValues.has(propName)) {
          result.styleMap[key] = exampleValues.get(propName);
        }
      }
    }
  }

  // Replace in data
  if (result.data && typeof result.data === "object") {
    result.data = { ...result.data };
    for (const [key, value] of Object.entries(result.data)) {
      if (typeof value === "string") {
        const propName =
          placeholderMap.get(value) || getPropNameFromPlaceholder(value, {});
        if (propName && exampleValues.has(propName)) {
          result.data[key] = exampleValues.get(propName);
        }
      }
    }
  }

  // Recursively process children
  if (Array.isArray(result.children)) {
    result.children = result.children.map((child: any) =>
      replacePlaceholdersWithExamples(child, placeholderMap, exampleValues)
    );
  } else if (result.children) {
    result.children = replacePlaceholdersWithExamples(
      result.children,
      placeholderMap,
      exampleValues
    );
  }

  return result;
}

// Helper to find example values for placeholders
// Compares base JSON (with placeholders) to merged JSON (with example values)
function findExampleValues(
  baseNode: any,
  mergedNode: any,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>,
  parsedInterface: ParsedInterface
): { styleMap?: Record<string, any>; data?: Record<string, any> } {
  const exampleValues: {
    styleMap?: Record<string, any>;
    data?: Record<string, any>;
  } = {};

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
        const mapping = placeholderMap.get(baseValue);
        if (
          mapping &&
          mapping.type === "styleMap" &&
          !exampleValues.styleMap?.[mapping.key]
        ) {
          if (!exampleValues.styleMap) exampleValues.styleMap = {};
          // The merged value is the example value that replaced the placeholder
          exampleValues.styleMap[mapping.key] = mergedStyleMap[key];
        }
      }
    }

    // Check data - find where placeholders were replaced with example values
    for (const [key, baseValue] of Object.entries(baseData)) {
      if (typeof baseValue === "string" && mergedData[key] !== undefined) {
        const mapping = placeholderMap.get(baseValue);
        if (
          mapping &&
          mapping.type === "data" &&
          !exampleValues.data?.[mapping.key]
        ) {
          if (!exampleValues.data) exampleValues.data = {};
          // The merged value is the example value that replaced the placeholder
          exampleValues.data[mapping.key] = mergedData[key];
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

// Helper to collect component types used in JSX
function collectComponentTypesFromNode(
  node: any,
  types: Set<string> = new Set()
): Set<string> {
  if (!node || typeof node !== "object") {
    return types;
  }
  const { type, children } = node;
  if (type && typeof type === "string") {
    types.add(type);
  }
  if (Array.isArray(children)) {
    children.forEach((child) => collectComponentTypesFromNode(child, types));
  } else if (children) {
    collectComponentTypesFromNode(children, types);
  }
  return types;
}

// Helper to convert JSON node to JSX string for story rendering
function jsonToJsxString(node: any, indent: number = 0): string {
  if (typeof node === "string") {
    return JSON.stringify(node);
  }
  if (typeof node === "number") {
    return node.toString();
  }
  if (!node || typeof node !== "object") {
    return "null";
  }

  const { type, styleMap, data, children } = node;
  const indentStr = "  ".repeat(indent);
  const nextIndentStr = "  ".repeat(indent + 1);

  let props: string[] = [];

  if (styleMap && Object.keys(styleMap).length > 0) {
    const styleMapStr = JSON.stringify(styleMap, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : nextIndentStr + line))
      .join("\n");
    props.push(`styleMap={${styleMapStr}}`);
  }

  if (data && Object.keys(data).length > 0) {
    const dataStr = JSON.stringify(data, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : nextIndentStr + line))
      .join("\n");
    props.push(`data={${dataStr}}`);
  }

  const propsStr = props.length > 0 ? " " + props.join(" ") : "";

  if (Array.isArray(children) && children.length > 0) {
    const childrenJsx = children
      .map((child) => jsonToJsxString(child, indent + 1))
      .join(`\n${nextIndentStr}`);
    return `<${type}${propsStr}>\n${nextIndentStr}${childrenJsx}\n${indentStr}</${type}>`;
  } else if (children) {
    const childrenJsx = jsonToJsxString(children, indent + 1);
    return `<${type}${propsStr}>\n${nextIndentStr}${childrenJsx}\n${indentStr}</${type}>`;
  }

  return `<${type}${propsStr} />`;
}

// Helper to create a valid React component name from filename
function toComponentName(filename: string): string {
  return filename
    .replace(/(^[a-z])|([-_][a-z])/g, (match) =>
      match.replace(/[-_]/, "").toUpperCase()
    )
    .replace(/\.json$/i, "");
}

// Helper to format prop values for story args
function formatPropValue(value: any): string {
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    return value.toString();
  }
  if (typeof value === "boolean") {
    return value.toString();
  }
  if (value === null || value === undefined) {
    return "undefined";
  }
  if (typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

// Main script
function generateStories() {
  // Parse all interfaces from the types file
  const interfaces = parseInterfaces(TYPES_FILE);

  const files = fs.readdirSync(EXAMPLES_DIR).filter((f) => f.endsWith(".json"));
  files.forEach((file) => {
    const filePath = path.join(EXAMPLES_DIR, file);
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const componentName = toComponentName(file);

    // Get interface for this component
    const parsedInterface = interfaces.get(componentName) || {
      styleMap: undefined,
      data: undefined,
      children: false,
    };
    const placeholderMap =
      (parsedInterface.styleMap &&
        Object.keys(parsedInterface.styleMap).length > 0) ||
      (parsedInterface.data && Object.keys(parsedInterface.data).length > 0)
        ? createPlaceholderMap(parsedInterface)
        : new Map();

    // Merge example data into the JSON structure
    const mergedJson = mergeExampleData(json);

    // Find example values for placeholders by comparing base JSON to merged JSON
    const exampleValues = findExampleValues(
      json,
      mergedJson,
      placeholderMap,
      parsedInterface
    );

    // Build story args with nested structure
    const storyArgs: {
      styleMap?: Record<string, any>;
      data?: Record<string, any>;
    } = {};

    // If component has typed props, extract them from example values
    const hasInterface =
      (parsedInterface.styleMap &&
        Object.keys(parsedInterface.styleMap).length > 0) ||
      (parsedInterface.data && Object.keys(parsedInterface.data).length > 0);

    if (hasInterface) {
      if (
        exampleValues.styleMap &&
        Object.keys(exampleValues.styleMap).length > 0
      ) {
        storyArgs.styleMap = exampleValues.styleMap;
      }
      if (exampleValues.data && Object.keys(exampleValues.data).length > 0) {
        storyArgs.data = exampleValues.data;
      }
    }

    // For components that accept children, we can render the merged JSON structure
    // But for typed components, we'll use the component with props
    const rootComponentType = json?.type;
    const rootAcceptsChildren =
      rootComponentType &&
      ["Grid", "Container", "Text", "Image"].includes(rootComponentType);

    // Collect component types used in merged JSON for imports
    const componentTypes = collectComponentTypesFromNode(mergedJson);

    // Generate imports
    const reactImport = `import React from "react";`;
    const componentImport = `import { ${componentName} } from './${componentName}';`;
    const cssImport = `import './${componentName}.css';`;
    const storybookImports = `import type { Meta, StoryObj } from "@storybook/react";`;

    // Generate component imports if needed for render function
    // Only add component imports if we're using a render function (not args)
    const needsRenderFunction =
      !hasInterface &&
      rootAcceptsChildren &&
      mergedJson.children &&
      mergedJson.children.length > 0;

    let componentImports = "";
    if (needsRenderFunction) {
      const sortedTypes = Array.from(componentTypes).sort();
      if (sortedTypes.length > 0) {
        componentImports =
          sortedTypes
            .map((type) => `import { ${type} } from '../components/${type}';`)
            .join("\n") + "\n";
      }
    }

    // Generate meta
    const meta = `const meta: Meta<typeof ${componentName}> = {
  title: "Generated/${componentName}",
  component: ${componentName},
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof ${componentName}>;`;

    // Generate story
    let storyContent = "";

    if (hasInterface) {
      // Component has typed props - use props in story
      const argsEntries: string[] = [];
      if (storyArgs.styleMap && Object.keys(storyArgs.styleMap).length > 0) {
        argsEntries.push(
          `    styleMap: ${formatPropValue(storyArgs.styleMap)},`
        );
      }
      if (storyArgs.data && Object.keys(storyArgs.data).length > 0) {
        argsEntries.push(`    data: ${formatPropValue(storyArgs.data)},`);
      }

      if (argsEntries.length > 0) {
        storyContent = `export const Default: Story = {
  args: {
${argsEntries.join("\n")}
  },
};`;
      } else {
        // No args extracted, use default
        storyContent = `export const Default: Story = {
  args: {},
};`;
      }
    } else if (
      rootAcceptsChildren &&
      mergedJson.children &&
      mergedJson.children.length > 0
    ) {
      // Component accepts children and has example children - render them
      const childrenJsx = mergedJson.children
        .map((child: any) => jsonToJsxString(child, 2))
        .join("\n      ");
      storyContent = `export const Default: Story = {
  render: () => (
    <${componentName}>
      ${childrenJsx}
    </${componentName}>
  ),
};`;
    } else {
      // Default story with no args
      storyContent = `export const Default: Story = {
  args: {},
};`;
    }

    // Combine everything
    const storyFile = `${reactImport}
${storybookImports}
${componentImport}
${cssImport}
${componentImports}
${meta}

${storyContent}
`;

    // Write story file
    const outputPath = path.join(OUTPUT_DIR, `${componentName}.stories.tsx`);
    fs.writeFileSync(outputPath, storyFile, "utf-8");
    console.log(`Generated ${componentName}.stories.tsx`);
  });
}

generateStories();
