import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = join(rootDir, "..");
const templatesDir = join(workspaceRoot, "src", "templates");
const outputPath = join(templatesDir, ".generated", "templates.ts");

function listSkillDirectories(): string[] {
  const baseDir = join(templatesDir, "skills");
  return readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));
}

function listReferenceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        return listReferenceFiles(fullPath);
      }
      return entry.isFile() ? [fullPath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

function buildReferenceBundle(): string {
  const entries = listSkillDirectories().map((name) => {
    const referencesDir = join(templatesDir, "skills", name, "references");
    if (!existsSync(referencesDir)) {
      return `  ${JSON.stringify(name)}: {},`;
    }

    const refs = listReferenceFiles(referencesDir).map((fullPath) => {
      const relativePath = relative(join(templatesDir, "skills", name), fullPath).replaceAll("\\", "/");
      const content = JSON.stringify(readFileSync(fullPath, "utf8"));
      return `    ${JSON.stringify(relativePath)}: ${content},`;
    });

    return `  ${JSON.stringify(name)}: {\n${refs.join("\n")}\n  },`;
  });

  return `export const skillReferenceBundle: SkillReferenceBundle = {\n${entries.join(
    "\n"
  )}\n} as const;`;
}

function buildModule(): string {
  const skillReferenceBundle = buildReferenceBundle();

  return `import type { TemplateReference } from "../../core/templates/types.js";

type SkillReferenceBundle = Record<string, Record<string, string>>;

function selectTemplateReferences(
  templates: SkillReferenceBundle,
  name: string,
  relativePaths: readonly string[],
): TemplateReference[] {
  const bundle = templates[name];
  if (bundle === undefined) {
    throw new Error("Missing template references bundle: " + name);
  }
  return relativePaths.map((relativePath) => {
    const content = bundle[relativePath];
    if (content === undefined) {
      throw new Error("Missing template reference: " + name + "/" + relativePath);
    }
    return { relativePath, content };
  });
}

${skillReferenceBundle}

export function getSkillReferences(name: string, ...relativePaths: string[]): TemplateReference[] {
  return selectTemplateReferences(skillReferenceBundle, name, relativePaths);
}
`;
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buildModule());