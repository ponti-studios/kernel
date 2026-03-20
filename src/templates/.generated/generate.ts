import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

type TemplateKind = "agents" | "skills";

const rootDir = dirname(fileURLToPath(import.meta.url));
const templatesDir = join(rootDir, "..");
const outputPath = join(rootDir, "templates.ts");

function listTemplateDirectories(kind: TemplateKind): string[] {
  const baseDir = join(templatesDir, kind);
  return readdirSync(baseDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => existsSync(join(baseDir, name, kind === "agents" ? "AGENT.md" : "SKILL.md")))
    .sort((left, right) => left.localeCompare(right));
}

function listReferenceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) return listReferenceFiles(fullPath);
      return entry.isFile() && entry.name.endsWith(".md") ? [fullPath] : [];
    })
    .sort((left, right) => left.localeCompare(right));
}

function buildInstructionBundle(kind: TemplateKind): string {
  const filename = kind === "agents" ? "AGENT.md" : "SKILL.md";
  const entries = listTemplateDirectories(kind).map((name) => {
    const content = JSON.stringify(readFileSync(join(templatesDir, kind, name, filename), "utf8"));
    return `  ${JSON.stringify(name)}: ${content},`;
  });
  const exportName = kind === "agents" ? "agentInstructionBundle" : "skillInstructionBundle";
  return `export const ${exportName} = {\n${entries.join("\n")}\n} as const;`;
}

function buildReferenceBundle(kind: TemplateKind): string {
  const entries = listTemplateDirectories(kind).map((name) => {
    const referencesDir = join(templatesDir, kind, name, "references");
    if (!existsSync(referencesDir)) {
      return `  ${JSON.stringify(name)}: {},`;
    }

    const refs = listReferenceFiles(referencesDir).map((fullPath) => {
      const relativePath = relative(join(templatesDir, kind, name), fullPath).replaceAll("\\", "/");
      const content = JSON.stringify(readFileSync(fullPath, "utf8"));
      return `    ${JSON.stringify(relativePath)}: ${content},`;
    });

    return `  ${JSON.stringify(name)}: {\n${refs.join("\n")}\n  },`;
  });

  const exportName = kind === "agents" ? "agentReferenceBundle" : "skillReferenceBundle";
  return `export const ${exportName} = {\n${entries.join("\n")}\n} as const;`;
}

function buildModule(): string {
  const agentInstructionBundle = buildInstructionBundle("agents");
  const skillInstructionBundle = buildInstructionBundle("skills");
  const agentReferenceBundle = buildReferenceBundle("agents");
  const skillReferenceBundle = buildReferenceBundle("skills");

  return `import type { TemplateReference } from "../../core/templates/types.js";

type ReferenceBundle = Record<string, string>;
type InstructionBundle = Record<string, string>;
type TemplateReferenceBundle = Record<string, ReferenceBundle>;

function selectTemplateReferences(
  templates: TemplateReferenceBundle,
  name: string,
  relativePaths: readonly string[],
): TemplateReference[] {
  const bundle = templates[name];
  if (bundle === undefined) {
    throw new Error(\`Missing template references bundle: \${name}\`);
  }
  return relativePaths.map((relativePath) => {
    const content = bundle[relativePath];
    if (content === undefined) {
      throw new Error(\`Missing template reference: \${name}/\${relativePath}\`);
    }
    return { relativePath, content };
  });
}

function selectTemplateInstructions(bundle: InstructionBundle, name: string): string {
  const instructions = bundle[name];
  if (instructions === undefined) {
    throw new Error(\`Missing template instructions: \${name}\`);
  }
  return instructions;
}

${agentInstructionBundle}

${skillInstructionBundle}

${agentReferenceBundle}

${skillReferenceBundle}

export function getAgentInstructions(name: string): string {
  return selectTemplateInstructions(agentInstructionBundle, name);
}

export function getSkillInstructions(name: string): string {
  return selectTemplateInstructions(skillInstructionBundle, name);
}

export function getAgentReferences(name: string, ...relativePaths: string[]): TemplateReference[] {
  return selectTemplateReferences(agentReferenceBundle, name, relativePaths);
}

export function getSkillReferences(name: string, ...relativePaths: string[]): TemplateReference[] {
  return selectTemplateReferences(skillReferenceBundle, name, relativePaths);
}
`;
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, buildModule());
