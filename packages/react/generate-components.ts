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
  // The interface has CSS variable names like "--button-bg-color"
  // But JSON placeholders might be like "button-bg-color" (without --)
  if (parsedInterface.styleMap) {
    for (const cssVar of Object.keys(parsedInterface.styleMap)) {
      // Map the CSS variable name (e.g., "--button-bg-color")
      mapping.set(cssVar, { type: "styleMap", key: cssVar });
      // Map without the -- prefix (e.g., "button-bg-color" -> "--button-bg-color")
      const withoutPrefix = cssVar.replace(/^--/, "");
      if (withoutPrefix !== cssVar) {
        mapping.set(withoutPrefix, { type: "styleMap", key: cssVar });
        // Also map camelCase version if applicable (e.g., "buttonBgColor")
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

      // Handle numbered properties: breadcrumb1 -> breadcrumb-1
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

// Helper to replace placeholders with prop references
// Returns a special marker object for prop references
function replacePlaceholders(
  value: any,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>
): any {
  if (typeof value === "string") {
    // Check if this string is a placeholder
    if (placeholderMap.has(value)) {
      const mapping = placeholderMap.get(value)!;
      // Return a special marker object
      return {
        __isPropRef: true,
        type: mapping.type,
        key: mapping.key,
      };
    }
    // Check if it's a CSS variable reference (var(--variable-name))
    const cssVarMatch = value.match(/^var\(--([^)]+)\)$/);
    if (cssVarMatch) {
      const varName = `--${cssVarMatch[1]}`;
      if (placeholderMap.has(varName)) {
        const mapping = placeholderMap.get(varName)!;
        return {
          __isPropRef: true,
          type: mapping.type,
          key: mapping.key,
          isCssVar: true,
        };
      }
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
): value is { __isPropRef: true; type: "styleMap" | "data"; key: string } {
  return value && typeof value === "object" && value.__isPropRef === true;
}

// Helper to convert styleMap to inline style string
// This handles both regular style values and CSS variable references
function styleMapToJs(
  styleMap: any,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>
): string {
  if (!styleMap || typeof styleMap !== "object") return "";
  // Convert camelCase or kebab-case keys to camelCase for React
  const entries = Object.entries(styleMap).map(([k, v]) => {
    // If key is kebab-case, convert to camelCase
    const key = kebabToCamel(k);

    // If value is a prop reference marker (CSS variable or data)
    if (isPropRef(v)) {
      if ((v as any).isCssVar && v.type === "styleMap") {
        // This is a CSS variable reference - keep it as var(--variable-name)
        return `${key}: "var(${v.key})"`;
      }
      // For data references in styleMap (shouldn't happen often, but handle it)
      if (v.type === "data") {
        return `${key}: props.data?.${v.key}`;
      }
    }

    // Check if value is a string that might be a CSS variable reference
    if (typeof v === "string") {
      // Check if it's already a var() reference
      if (v.startsWith("var(")) {
        return `${key}: "${v}"`;
      }
      // Check if it's a placeholder
      if (placeholderMap.has(v)) {
        const mapping = placeholderMap.get(v)!;
        if (mapping.type === "styleMap") {
          // This should be a CSS variable reference
          return `${key}: "var(${mapping.key})"`;
        }
      }
    }

    return `${key}: ${JSON.stringify(v)}`;
  });
  return `{ ${entries.join(", ")} }`;
}

// Helper to convert styleMap key to CSS property name
function styleKeyToCssProperty(key: string): string {
  // Convert camelCase to kebab-case
  return camelToKebab(key);
}

// Helper to convert styleMap value to CSS value
function styleValueToCssValue(
  value: any,
  key: string,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>
): string {
  if (typeof value === "string") {
    // Check if it's already a var() reference
    if (value.startsWith("var(")) {
      return value;
    }
    // Check if it's a placeholder that maps to a CSS variable
    if (placeholderMap.has(value)) {
      const mapping = placeholderMap.get(value)!;
      if (mapping.type === "styleMap") {
        return `var(${mapping.key})`;
      }
    }
    // Return as-is (might be a color, etc.)
    return value;
  }
  if (typeof value === "number") {
    // Unitless properties
    const unitlessProps = [
      "opacity",
      "zIndex",
      "fontWeight",
      "lineHeight", // Can be unitless or have units
      "flex",
      "flexGrow",
      "flexShrink",
      "order",
    ];
    const cssKey = styleKeyToCssProperty(key);
    if (unitlessProps.includes(cssKey) || unitlessProps.includes(key)) {
      return String(value);
    }
    // Add px for most numeric values
    return `${value}px`;
  }
  return String(value);
}

// Helper to convert styleMap to CSS properties string
function styleMapToCss(
  styleMap: any,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>
): string {
  if (!styleMap || typeof styleMap !== "object") return "";

  const cssProps: string[] = [];

  for (const [key, value] of Object.entries(styleMap)) {
    const cssKey = styleKeyToCssProperty(key);
    let cssValue: string;

    // Handle special cases
    if (key === "marginHorizontal") {
      cssProps.push(
        `  margin-left: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      cssProps.push(
        `  margin-right: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      continue;
    }
    if (key === "marginVertical") {
      cssProps.push(
        `  margin-top: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      cssProps.push(
        `  margin-bottom: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      continue;
    }
    if (key === "paddingHorizontal") {
      cssProps.push(
        `  padding-left: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      cssProps.push(
        `  padding-right: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      continue;
    }
    if (key === "paddingVertical") {
      cssProps.push(
        `  padding-top: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      cssProps.push(
        `  padding-bottom: ${styleValueToCssValue(value, key, placeholderMap)};`
      );
      continue;
    }

    // Skip non-CSS properties
    if (
      [
        "shadowOffset",
        "shadowOffsetX",
        "shadowOffsetY",
        "shadowColor",
        "shadowOpacity",
        "shadowRadius",
        "elevation",
        "numberOfLines",
      ].includes(key)
    ) {
      // These are handled specially or ignored
      continue;
    }

    cssValue = styleValueToCssValue(value, key, placeholderMap);
    cssProps.push(`  ${cssKey}: ${cssValue};`);
  }

  return cssProps.join("\n");
}

// Helper to generate CSS file content for a component
function generateCssFile(
  componentName: string,
  json: any,
  parsedInterface: ParsedInterface,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>
): { css: string; classNames: Map<any, string> } {
  const cssRules: string[] = [];
  const classNames = new Map<any, string>();
  let classCounter = 0;

  // Generate unique class name for a node
  function getClassName(node: any, prefix: string = ""): string {
    if (classNames.has(node)) {
      return classNames.get(node)!;
    }
    const className =
      prefix || `${componentName.toLowerCase()}-${classCounter++}`;
    classNames.set(node, className);
    return className;
  }

  // Traverse JSON tree and generate CSS classes
  function generateCssForNode(node: any, prefix: string = "") {
    if (!node || typeof node !== "object") return;

    const { type, styleMap, children } = node;
    if (!type) return;

    const className = getClassName(node, prefix);
    const cssClass = `.${className}`;

    if (styleMap && typeof styleMap === "object") {
      const cssProps = styleMapToCss(styleMap, placeholderMap);
      if (cssProps) {
        cssRules.push(`${cssClass} {`);
        cssRules.push(cssProps);
        cssRules.push(`}`);
        cssRules.push(""); // Empty line between classes
      }
    }

    // Process children
    if (Array.isArray(children)) {
      children.forEach((child, index) => {
        generateCssForNode(
          child,
          `${className}-${type.toLowerCase()}-${index}`
        );
      });
    } else if (children) {
      generateCssForNode(children, `${className}-${type.toLowerCase()}`);
    }
  }

  // Start with root node
  generateCssForNode(json, `${componentName.toLowerCase()}-root`);

  return {
    css: cssRules.join("\n"),
    classNames,
  };
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

// Helper to convert JSON node to JSX string (with className, data, and props)
function jsonToJsx(
  node: any,
  placeholderMap: Map<string, { type: "styleMap" | "data"; key: string }>,
  parsedInterface: ParsedInterface,
  classNames: Map<any, string>,
  isRoot: boolean = false
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

  // Replace placeholders in data
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
        replaced.__isPropRef === true
      ) {
        if (replaced.type === "data") {
          return `${key}={props.data?.${replaced.key}}`;
        } else if (replaced.type === "styleMap") {
          return `${key}={props.styleMap?.${replaced.key}}`;
        }
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

  // Apply CSS variables to root component via inline styles
  if (isRoot && parsedInterface.styleMap) {
    const cssVarEntries = Object.keys(parsedInterface.styleMap).map(
      (cssVar) => {
        return `"${cssVar}": props.styleMap?.["${cssVar}"]`;
      }
    );
    if (cssVarEntries.length > 0) {
      propStr +=
        (propStr ? " " : "") + `style={{ ${cssVarEntries.join(", ")} }}`;
    }
  }

  // Use className instead of styleMap
  const className = classNames.get(node);
  if (className) {
    propStr += (propStr ? " " : "") + `className="${className}"`;
  }

  if (data && Object.keys(data).length > 0) {
    // Format data prop, handling prop references
    const dataEntries = Object.entries(data).map(([k, v]) => {
      // Check if original value is a placeholder
      if (typeof v === "string") {
        const mapping = placeholderMap.get(v);
        if (mapping && mapping.type === "data") {
          return `${k}: props.data?.${mapping.key}`;
        }
      }
      // Check if replaced value is a prop reference marker
      if (
        replacedData &&
        replacedData[k] &&
        typeof replacedData[k] === "object" &&
        replacedData[k].__isPropRef === true
      ) {
        if (replacedData[k].type === "data") {
          return `${k}: props.data?.${replacedData[k].key}`;
        }
      }
      return `${k}: ${JSON.stringify(v)}`;
    });
    propStr += (propStr ? " " : "") + `data={{ ${dataEntries.join(", ")} }}`;
  }

  // Compose children: data.content (for text), then children from JSON, then props.children if root
  let childrenJsx = "";
  if (data && data.content !== undefined) {
    // Check if original content is a placeholder
    if (typeof data.content === "string") {
      const mapping = placeholderMap.get(data.content);
      if (mapping && mapping.type === "data") {
        childrenJsx += `{props.data?.${mapping.key}}`;
      } else if (replacedData && replacedData.content !== undefined) {
        // Check if content is a prop reference marker
        if (
          replacedData.content &&
          typeof replacedData.content === "object" &&
          replacedData.content.__isPropRef === true &&
          replacedData.content.type === "data"
        ) {
          childrenJsx += `{props.data?.${replacedData.content.key}}`;
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
      .map((child) =>
        jsonToJsx(child, placeholderMap, parsedInterface, classNames, false)
      )
      .join("");
  } else if (children) {
    childrenJsx += jsonToJsx(
      children,
      placeholderMap,
      parsedInterface,
      classNames,
      false
    );
  }
  // If this is the root node, add props.children so users can pass children
  if (isRoot) {
    childrenJsx += "{props.children}";
  }
  return `<${type}${propStr ? " " + propStr : ""}>${childrenJsx}</${type}>`;
}

// Helper to generate interface definition string
function generateInterface(
  interfaceName: string,
  parsedInterface: ParsedInterface,
  includeChildren: boolean = false
): string {
  const propLines: string[] = [];

  // Add styleMap if it exists
  if (
    parsedInterface.styleMap &&
    Object.keys(parsedInterface.styleMap).length > 0
  ) {
    const styleMapEntries = Object.entries(parsedInterface.styleMap)
      .map(([cssVar, type]) => `    "${cssVar}": ${type};`)
      .join("\n");
    propLines.push(`  styleMap: {\n${styleMapEntries}\n  };`);
  }

  // Add data if it exists
  if (parsedInterface.data && Object.keys(parsedInterface.data).length > 0) {
    const dataEntries = Object.entries(parsedInterface.data)
      .map(([name, type]) => `    ${name}: ${type};`)
      .join("\n");
    propLines.push(`  data: {\n${dataEntries}\n  };`);
  }

  // Add children if needed
  if (includeChildren || parsedInterface.children) {
    propLines.push("  children?: React.ReactNode;");
  }

  const allPropLines = propLines.join("\n");
  return `interface ${interfaceName} {\n${allPropLines}\n}`;
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
  const allCssContent: string[] = [];

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

    // Collect all component types used in this JSON
    const componentTypes = collectComponentTypes(json);

    // Generate CSS file and get classNames map
    const { css, classNames } = generateCssFile(
      componentName,
      json,
      parsedInterface,
      placeholderMap
    );

    // Generate imports for the used components
    const imports = generateImports(componentTypes);

    // Import CSS file
    const cssImport = css ? `import './${componentName}.css';\n` : "";

    // Get root component type to check if it accepts children
    const rootComponentType = json?.type;
    // All components (Grid, Container, Text, Image) accept children
    const rootAcceptsChildren =
      rootComponentType &&
      ["Grid", "Container", "Text", "Image"].includes(rootComponentType);

    // Generate interface definition if it exists or if root accepts children
    let interfaceDef = "";
    const hasInterface =
      (parsedInterface.styleMap &&
        Object.keys(parsedInterface.styleMap).length > 0) ||
      (parsedInterface.data && Object.keys(parsedInterface.data).length > 0) ||
      rootAcceptsChildren ||
      parsedInterface.children;

    if (hasInterface) {
      interfaceDef =
        generateInterface(componentName, parsedInterface, rootAcceptsChildren) +
        "\n\n";
    }

    // Generate JSX with placeholder replacement (pass isRoot=true for root node)
    const jsx = jsonToJsx(
      json,
      placeholderMap,
      parsedInterface,
      classNames,
      true
    );

    // Generate component signature
    const componentSignature = hasInterface
      ? `export const ${componentName} = (props: ${componentName}) => (`
      : `export const ${componentName} = () => (`;

    // Combine imports, CSS import, interface, and component
    const component = `${imports}${cssImport}${interfaceDef}${componentSignature}\n  ${jsx}\n);\n`;

    fs.writeFileSync(
      path.join(OUTPUT_DIR, `${componentName}.tsx`),
      component,
      "utf-8"
    );
    console.log(`Generated ${componentName}.tsx`);

    // Generate CSS file
    if (css) {
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${componentName}.css`),
        css,
        "utf-8"
      );
      console.log(`Generated ${componentName}.css`);
      // Collect CSS for combined style.css
      allCssContent.push(`/* ${componentName} */\n${css}\n`);
    }
  });

  // Generate combined style.css file
  if (allCssContent.length > 0) {
    const combinedCss = allCssContent.join("\n");
    fs.writeFileSync(path.join(OUTPUT_DIR, "style.css"), combinedCss, "utf-8");
    console.log(
      `Generated style.css with ${allCssContent.length} component styles`
    );
  }
}

generateComponents();
