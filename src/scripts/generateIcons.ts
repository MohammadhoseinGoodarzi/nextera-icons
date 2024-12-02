import * as fs from "fs";
import * as path from "path";

const iconsDir = path.resolve(__dirname, "../../src/icons");
const componentsDir = path.resolve(__dirname, "../../src/components");
const distComponentsDir = path.resolve(__dirname, "../../dist/components");
const typesDir = path.resolve(__dirname, "../../dist/types");

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

if (!fs.existsSync(distComponentsDir)) {
  fs.mkdirSync(distComponentsDir, { recursive: true });
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
  const distComponentPath = path.join(
    distComponentsDir,
    `${componentName}.d.ts`
  );

  // Find all fill attributes and replace from the second to the last one
  const fillMatches = [...svgContent.matchAll(/fill="[^"]*"/g)];
  let updatedSvgContent = svgContent;
  if (fillMatches.length > 1) {
    fillMatches.slice(1).forEach((match) => {
      updatedSvgContent = updatedSvgContent.replace(
        match[0],
        'fill={ props.fill || "currentColor"}'
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

  // Add to type declarations
  typeDeclarations.push(
    `export const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>>;`
  );

  // Generate corresponding type declaration
  const typeTemplate = `
import { FC, SVGProps } from 'react';

declare const ${componentName}: FC<SVGProps<SVGSVGElement>>;
export default ${componentName};
`;

  fs.writeFileSync(distComponentPath, typeTemplate, "utf-8");
});

// Generate index.d.ts for all icons
const typesTemplate = `
import { FC, SVGProps } from 'react';

declare module 'nextera-icon-package/dist/components' {
  ${typeDeclarations.join("\n")}
}
`;

fs.writeFileSync(path.join(typesDir, "index.d.ts"), typesTemplate, "utf-8");
