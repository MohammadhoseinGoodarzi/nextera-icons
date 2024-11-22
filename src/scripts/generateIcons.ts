import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.resolve(__dirname, "../../src/icons");
const componentsDir = path.resolve(__dirname, "../../src/components");
const typesDir = path.resolve(__dirname, "../../src/types");

if (!fs.existsSync(componentsDir)) {
  fs.mkdirSync(componentsDir, { recursive: true });
}

if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const svgFiles = fs.readdirSync(iconsDir);

const typeDeclarations: string[] = [];

svgFiles.forEach((file) => {
  const svgContent = fs.readFileSync(path.join(iconsDir, file), "utf-8");
  const componentName = `${capitalize(path.basename(file, ".svg"))}Icon`;
  const componentPath = path.join(componentsDir, `${componentName}.tsx`);

  const componentTemplate = `
import React from 'react';

const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  ${svgContent.replace(/<svg/, "<svg {...props}")}
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
    const componentName = `${capitalize(path.basename(file, ".svg"))}Icon`;
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
