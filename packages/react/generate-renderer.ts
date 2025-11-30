import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "./generated");
const RENDERER_FILE = path.resolve(OUTPUT_DIR, "Renderer.tsx");

// Helper to extract component name from a generated component file
function extractComponentName(filePath: string): string | null {
  const content = fs.readFileSync(filePath, "utf-8");
  // Look for: export const ComponentName = ...
  const match = content.match(/export\s+const\s+(\w+)\s*=/);
  return match ? match[1] : null;
}

// Helper to get all component names from generated files
function getAllComponentNames(): string[] {
  const files = fs
    .readdirSync(OUTPUT_DIR)
    .filter(
      (f) =>
        f.endsWith(".tsx") &&
        !f.endsWith(".stories.tsx") &&
        f !== "Renderer.tsx"
    );

  const componentNames: string[] = [];
  files.forEach((file) => {
    const filePath = path.join(OUTPUT_DIR, file);
    const componentName = extractComponentName(filePath);
    if (componentName) {
      componentNames.push(componentName);
    }
  });

  return componentNames.sort();
}

// Helper to create a component map entry for case-insensitive lookup
function createComponentMapEntry(componentName: string): string {
  return `  "${componentName.toLowerCase()}": ${componentName},`;
}

// Generate the renderer component
function generateRenderer() {
  const componentNames = getAllComponentNames();

  if (componentNames.length === 0) {
    console.log("No components found to generate renderer");
    return;
  }

  // Generate imports
  const imports = componentNames
    .map((name) => `import { ${name} } from './${name}';`)
    .join("\n");

  // Generate component map for case-insensitive lookup
  const componentMapEntries = componentNames
    .map(createComponentMapEntry)
    .join("\n");

  // Generate the renderer component
  const renderer = `import React from 'react';
import './style.css';
${imports}

// Component map for case-insensitive component lookup
const componentMap: Record<string, React.ComponentType<any>> = {
${componentMapEntries}
};

// Type definition for component data structure
export interface ComponentData {
  component: string;
  styleMap?: Record<string, any>;
  data?: Record<string, any>;
  children?: ComponentData[];
}

export interface RendererProps {
  data: ComponentData[];
}

// Recursive render function
function renderComponent(item: ComponentData): React.ReactNode {
  const { component, styleMap, data, children: childrenData } = item;

  // Find component in map (case-insensitive)
  const Component = componentMap[component.toLowerCase()];

  if (!Component) {
    console.warn(\`Component "\${component}" not found in component map\`);
    return null;
  }

  // Handle children if they exist
  let children: React.ReactNode = undefined;
  if (childrenData && Array.isArray(childrenData)) {
    children = childrenData.map((child: ComponentData, index: number) => (
      <React.Fragment key={index}>{renderComponent(child)}</React.Fragment>
    ));
  }

  // Build props object with styleMap and data as separate properties
  const props: any = {};
  if (styleMap) {
    props.styleMap = styleMap;
  }
  if (data) {
    props.data = data;
  }

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
`;

  // Write the renderer file
  fs.writeFileSync(RENDERER_FILE, renderer, "utf-8");
  console.log(
    `Generated Renderer.tsx with ${componentNames.length} components`
  );
  console.log(`Components: ${componentNames.join(", ")}`);
}

generateRenderer();
