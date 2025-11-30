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
  placeholderMap: Map<string, string>,
  interfaceProps: Record<string, string>,
  propValues: Record<string, any> = {}
): Record<string, any> {
  if (!node || typeof node !== "object") {
    return propValues;
  }

  const { styleMap, data, children } = node;

  // Extract from styleMap
  if (styleMap && typeof styleMap === "object") {
    for (const [key, value] of Object.entries(styleMap)) {
      if (typeof value === "string") {
        const propName =
          placeholderMap.get(value) ||
          getPropNameFromPlaceholder(value, interfaceProps);
        if (propName) {
          propValues[propName] = value; // Store placeholder, will be replaced later
        }
      }
    }
  }

  // Extract from data
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        const propName =
          placeholderMap.get(value) ||
          getPropNameFromPlaceholder(value, interfaceProps);
        if (propName) {
          propValues[propName] = value; // Store placeholder, will be replaced later
        }
      }
    }
  }

  // Recursively process children
  if (Array.isArray(children)) {
    children.forEach((child) => {
      extractPropValues(child, placeholderMap, interfaceProps, propValues);
    });
  } else if (children) {
    extractPropValues(children, placeholderMap, interfaceProps, propValues);
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
          // The merged value is the example value that replaced the placeholder
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
          // The merged value is the example value that replaced the placeholder
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
    const interfaceProps = interfaces.get(componentName) || {};
    const placeholderMap =
      Object.keys(interfaceProps).length > 0
        ? createPlaceholderMap(interfaceProps)
        : new Map();

    // Merge example data into the JSON structure
    const mergedJson = mergeExampleData(json);

    // Find example values for placeholders by comparing base JSON to merged JSON
    const exampleValues = findExampleValues(
      json,
      mergedJson,
      placeholderMap,
      interfaceProps
    );

    // Build story args
    const storyArgs: Record<string, any> = {};

    // If component has typed props, extract them from example values
    if (Object.keys(interfaceProps).length > 0) {
      for (const [propName, propType] of Object.entries(interfaceProps)) {
        if (exampleValues.has(propName)) {
          storyArgs[propName] = exampleValues.get(propName);
        }
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
    const storybookImports = `import type { Meta, StoryObj } from "@storybook/react";`;

    // Generate component imports if needed for render function
    // Only add component imports if we're using a render function (not args)
    const needsRenderFunction =
      !Object.keys(interfaceProps).length &&
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

    if (Object.keys(interfaceProps).length > 0) {
      // Component has typed props - use props in story
      const argsEntries = Object.entries(storyArgs)
        .map(([key, value]) => `    ${key}: ${formatPropValue(value)},`)
        .join("\n");

      if (argsEntries) {
        storyContent = `export const Default: Story = {
  args: {
${argsEntries}
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
