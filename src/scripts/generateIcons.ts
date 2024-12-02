import * as fs from "fs";
import * as path from "path";

const iconsDir = path.resolve(__dirname, "../../src/icons");
const componentsDir = path.resolve(__dirname, "../../src/components");
const typesDir = path.resolve(__dirname, "../../src/types");

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Function to convert a string to camelCase and capitalize the first letter
const toCamelCase = (str: string) =>
  str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toUpperCase() : match.toUpperCase()
    )
    .replace(/\s+/g, "");

const svgFiles = fs.readdirSync(iconsDir);

const typeDeclarations: string[] = [];

svgFiles.forEach((file) => {
  const svgContent = fs.readFileSync(path.join(iconsDir, file), "utf-8");
  const componentName = `${toCamelCase(path.basename(file, ".svg"))}`;
  const componentPath = path.join(componentsDir, `${componentName}.tsx`);

  // Find all fill attributes and replace from the second to the last one
  const fillMatches = [...svgContent.matchAll(/fill="[^"]*"/g)];
  let updatedSvgContent = svgContent;
  if (fillMatches.length > 1) {
    fillMatches.slice(1).forEach((match) => {
      updatedSvgContent = updatedSvgContent.replace(
        match[0],
        'fill={props.fill || "currentColor"}'
      );
    });
  }

  updatedSvgContent = updatedSvgContent
    .replace(/<svg/, "<svg {...props}")
    .replace(/clip-path/, "clipPath")
    .replace(/fill-rule/, "fillRule")
    .replace(/clip-rule/, "clipRule");

  const componentTemplate = `
import React from 'react';

const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  ${updatedSvgContent}
);

export default ${componentName};
`;

  fs.writeFileSync(componentPath, componentTemplate, "utf-8");

  typeDeclarations.push(
    `export const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>>;`
  );
});

// Generate index.tsx for exporting all icons
const exportStatements = svgFiles
  .map((file) => {
    const componentName = `${toCamelCase(path.basename(file, ".svg"))}`;
    return `export { default as ${componentName} } from './${componentName}';`;
  })
  .join("\n");

fs.writeFileSync(
  path.join(componentsDir, "index.tsx"),
  exportStatements,
  "utf-8"
);

// Generate types for all icons
const typesTemplate = `
import { FC, SVGProps } from 'react';

declare module 'nextera-icon-package' {
  ${typeDeclarations.join("\n")}
}
`;

fs.writeFileSync(path.join(typesDir, "index.d.ts"), typesTemplate, "utf-8");
