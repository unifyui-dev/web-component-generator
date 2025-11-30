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
  // First handle hyphens followed by letters
  let result = str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  // Then handle hyphens followed by numbers (remove the hyphen)
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

// Helper to get prop name from a placeholder (handles various formats)
function getPropNameFromPlaceholder(
  placeholder: string,
  interfaceProps: Record<string, string>
): string | null {
  // Direct match
  if (interfaceProps[placeholder]) {
    return placeholder;
  }

  // Convert kebab-case to camelCase and check
  const camelCase = kebabToCamel(placeholder);
  if (interfaceProps[camelCase]) {
    return camelCase;
  }

  return null;
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
    // Match pattern: word followed by number (e.g., breadcrumb1, navItem1)
    const numberedMatch = propName.match(/^([a-zA-Z]+)(\d+)$/);
    if (numberedMatch) {
      const base = numberedMatch[1];
      const number = numberedMatch[2];
      mapping.set(`${base}-${number}`, propName);
    }
  }
  return mapping;
}

// Helper to replace placeholders with prop references
// Returns a special marker object for prop references
function replacePlaceholders(
  value: any,
  placeholderMap: Map<string, string>
): any {
  if (typeof value === "string") {
    // Check if this string is a placeholder
    if (placeholderMap.has(value)) {
      // Return a special marker object
      return { __isPropRef: true, propName: placeholderMap.get(value)! };
    }
    return value;
  }
  if (typeof value === "object" && value !== null) {
    if (Array.isArray(value)) {
      return value.map((item) => replacePlaceholders(item, placeholderMap));
    }
    const result: any = {};
    for (const [key, val] of Object.entries(value)) {
      result[key] = replacePlaceholders(val, placeholderMap);
    }
    return result;
  }
  return value;
}

// Helper to check if a value is a prop reference marker
function isPropRef(
  value: any
): value is { __isPropRef: true; propName: string } {
  return value && typeof value === "object" && value.__isPropRef === true;
}

// Helper to convert styleMap to inline style string
function styleMapToJs(
  styleMap: any,
  placeholderMap: Map<string, string>,
  interfaceProps: Record<string, string>
): string {
  if (!styleMap || typeof styleMap !== "object") return "";
  // Convert camelCase or kebab-case keys to camelCase for React
  const entries = Object.entries(styleMap).map(([k, v]) => {
    // If key is kebab-case, convert to camelCase
    const key = kebabToCamel(k);
    // Check if value is a placeholder string
    if (typeof v === "string") {
      let propName = placeholderMap.get(v);
      if (!propName) {
        propName = getPropNameFromPlaceholder(v, interfaceProps);
      }
      if (propName) {
        return `${key}: props.${propName}`;
      }
    }
    // If value is a prop reference marker, use props.xxx
    if (v && typeof v === "object" && v.__isPropRef === true && v.propName) {
      return `${key}: props.${v.propName}`;
    }
    return `${key}: ${JSON.stringify(v)}`;
  });
  return `{ ${entries.join(", ")} }`;
}

// Helper to collect all component types used in the JSON tree
function collectComponentTypes(
  node: any,
  types: Set<string> = new Set()
): Set<string> {
  if (typeof node === "string" || typeof node === "number") {
    return types;
  }
  if (!node || typeof node !== "object") {
    return types;
  }
  const { type, children = [] } = node;
  if (type && typeof type === "string") {
    types.add(type);
  }
  if (Array.isArray(children)) {
    children.forEach((child) => collectComponentTypes(child, types));
  } else if (children) {
    collectComponentTypes(children, types);
  }
  return types;
}

// Helper to generate import statements for component types
function generateImports(types: Set<string>): string {
  if (types.size === 0) {
    return "import React from 'react';\n";
  }
  const sortedTypes = Array.from(types).sort();
  const imports = sortedTypes
    .map((type) => `import { ${type} } from '../components/${type}';`)
    .join("\n");
  return `import React from 'react';\n${imports}\n`;
}

// Helper to convert JSON node to JSX string (with style, data, and props)
function jsonToJsx(
  node: any,
  placeholderMap: Map<string, string>,
  interfaceProps: Record<string, string>
): string {
  if (typeof node === "string" || typeof node === "number") {
    return node.toString();
  }
  if (!node || typeof node !== "object") {
    return "";
  }
  const {
    type,
    props: nodeProps = {},
    styleMap,
    data = {},
    children = [],
  } = node;

  // Replace placeholders in data (styleMap is handled directly in styleMapToJs)
  const replacedData =
    data && Object.keys(data).length > 0
      ? replacePlaceholders(data, placeholderMap)
      : null;

  let propStr = Object.entries(nodeProps)
    .map(([key, value]) => {
      const replaced = replacePlaceholders(value, placeholderMap);
      if (
        replaced &&
        typeof replaced === "object" &&
        replaced.__isPropRef === true &&
        replaced.propName
      ) {
        return `${key}={props.${replaced.propName}}`;
      } else if (typeof replaced === "string") {
        return `${key}={\"${replaced.replace(/\"/g, '\\"')}\"}`;
      } else if (typeof replaced === "boolean") {
        return replaced ? key : "";
      } else {
        return `${key}={${JSON.stringify(replaced)}}`;
      }
    })
    .filter(Boolean)
    .join(" ");

  if (styleMap) {
    propStr +=
      (propStr ? " " : "") +
      `styleMap={${styleMapToJs(styleMap, placeholderMap, interfaceProps)}}`;
  }

  if (data && Object.keys(data).length > 0) {
    // Format data prop, handling prop references
    const dataEntries = Object.entries(data).map(([k, v]) => {
      // Check if original value is a placeholder
      if (typeof v === "string") {
        let propName = placeholderMap.get(v);
        if (!propName) {
          propName = getPropNameFromPlaceholder(v, interfaceProps);
        }
        if (propName) {
          return `${k}: props.${propName}`;
        }
      }
      // Check if replaced value is a prop reference marker
      if (
        replacedData &&
        replacedData[k] &&
        typeof replacedData[k] === "object" &&
        replacedData[k].__isPropRef === true &&
        replacedData[k].propName
      ) {
        return `${k}: props.${replacedData[k].propName}`;
      }
      return `${k}: ${JSON.stringify(v)}`;
    });
    propStr += (propStr ? " " : "") + `data={{ ${dataEntries.join(", ")} }}`;
  }

  // Compose children: data.content (for text), then children
  let childrenJsx = "";
  if (data && data.content !== undefined) {
    // Check if original content is a placeholder
    if (typeof data.content === "string") {
      let propName = placeholderMap.get(data.content);
      if (!propName) {
        propName = getPropNameFromPlaceholder(data.content, interfaceProps);
      }
      if (propName) {
        childrenJsx += `{props.${propName}}`;
      } else if (replacedData && replacedData.content !== undefined) {
        // Check if content is a prop reference marker
        if (
          replacedData.content &&
          typeof replacedData.content === "object" &&
          replacedData.content.__isPropRef === true &&
          replacedData.content.propName
        ) {
          childrenJsx += `{props.${replacedData.content.propName}}`;
        } else if (
          typeof replacedData.content === "string" ||
          typeof replacedData.content === "number"
        ) {
          childrenJsx += replacedData.content;
        }
      } else {
        childrenJsx += data.content;
      }
    } else if (typeof data.content === "number") {
      childrenJsx += data.content;
    }
  }
  if (Array.isArray(children)) {
    childrenJsx += children
      .map((child) => jsonToJsx(child, placeholderMap, interfaceProps))
      .join("");
  } else if (children) {
    childrenJsx += jsonToJsx(children, placeholderMap, interfaceProps);
  }
  return `<${type}${propStr ? " " + propStr : ""}>${childrenJsx}</${type}>`;
}

// Helper to generate interface definition string
function generateInterface(
  interfaceName: string,
  props: Record<string, string>
): string {
  const propLines = Object.entries(props)
    .map(([name, type]) => `  ${name}: ${type};`)
    .join("\n");
  return `interface ${interfaceName} {\n${propLines}\n}`;
}

// Helper to create a valid React component name from filename
function toComponentName(filename: string): string {
  return filename
    .replace(/(^[a-z])|([-_][a-z])/g, (match) =>
      match.replace(/[-_]/, "").toUpperCase()
    )
    .replace(/\.json$/i, "");
}

// Main script
function generateComponents() {
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

    // Collect all component types used in this JSON
    const componentTypes = collectComponentTypes(json);

    // Generate imports for the used components
    const imports = generateImports(componentTypes);

    // Generate interface definition if it exists
    let interfaceDef = "";
    if (Object.keys(interfaceProps).length > 0) {
      interfaceDef = generateInterface(componentName, interfaceProps) + "\n\n";
    }

    // Generate JSX with placeholder replacement
    const jsx = jsonToJsx(json, placeholderMap, interfaceProps);

    // Generate component signature
    const componentSignature = interfaceProps
      ? `export const ${componentName} = (props: ${componentName}) => (`
      : `export const ${componentName} = () => (`;

    // Combine imports, interface, and component
    const component = `${imports}${interfaceDef}${componentSignature}\n  ${jsx}\n);\n`;

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${componentName}.tsx`),
      component,
      "utf-8"
    );
    console.log(`Generated ${componentName}.tsx`);
  });
}

generateComponents();
