import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { AGENTS_MANIFEST } from "../execution/features/agents-manifest";
import { createSkills } from "../execution/features/skills";

type ExportTarget = "copilot" | "codex" | "all";

type CopilotGroup = "instructions" | "prompts" | "skills" | "agents" | "hooks";
const COPILOT_GROUPS: CopilotGroup[] = ["instructions", "prompts", "skills", "agents", "hooks"];

export interface ExportArgs {
  target?: ExportTarget;
  directory?: string;
  force?: boolean;
  groups?: string;
  strict?: boolean;
  manifest?: boolean;
}

interface ExportArtifact {
  path: string;
  content: string;
  target: "copilot" | "codex" | "shared";
}

interface ExportModel {
  generatedAt: string;
  generatedDate: string;
  agents: Array<{ id: string; name: string; purpose: string; prompt: string }>;
  skills: Array<{ id: string; name: string; description: string; template: string }>;
  prompts: Array<{ id: string; sourcePath: string; content: string }>;
}

interface CoverageEntry {
  source_count: number;
  emitted_count: number;
  missing_ids: string[];
  applicable: boolean;
}

interface ExportCoverage {
  agents: CoverageEntry;
  skills: CoverageEntry;
  prompts: CoverageEntry;
  codex_catalog: CoverageEntry;
}

interface ResolvedArtifacts {
  artifacts: ExportArtifact[];
  coverage: ExportCoverage;
  model: ExportModel;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}

function ensureUniqueSlug(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  let candidate = `${base}-${i}`;
  while (used.has(candidate)) {
    i++;
    candidate = `${base}-${i}`;
  }
  used.add(candidate);
  return candidate;
}

function collectFilesRecursively(root: string, predicate: (path: string) => boolean): string[] {
  const out: string[] = [];
  if (!existsSync(root)) return out;

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (predicate(fullPath)) {
        out.push(fullPath);
      }
    }
  };

  walk(root);
  return out.sort((a, b) => a.localeCompare(b));
}

function extractTemplateLiteralsFromSource(source: string): string[] {
  const matches: string[] = [];
  const regex = /export const\s+[A-Za-z0-9_]+\s*=\s*`([\s\S]*?)`;/g;
  let match = regex.exec(source);
  while (match) {
    const content = match[1]?.trim();
    if (content) {
      matches.push(content);
    }
    match = regex.exec(source);
  }
  return matches;
}

function compileExportModel(): ExportModel {
  const generatedAt = new Date().toISOString();

  const agents = [...AGENTS_MANIFEST]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((agent) => ({
      id: agent.id,
      name: agent.name,
      purpose: agent.purpose,
      prompt: agent.prompt,
    }));

  const uniqueSkills = new Map<string, { id: string; name: string; description: string; template: string }>();
  for (const skill of createSkills()) {
    const id = slugify(skill.name || "skill");
    if (!uniqueSkills.has(id)) {
      uniqueSkills.set(id, {
        id,
        name: skill.name,
        description: skill.description,
        template: skill.template,
      });
    }
  }
  const skills = [...uniqueSkills.values()].sort((a, b) => a.id.localeCompare(b.id));

  const templatesRoot = new URL("../execution/features/commands/templates", import.meta.url).pathname;
  const templateFiles = collectFilesRecursively(
    templatesRoot,
    (path) => path.endsWith(".ts") && !path.endsWith(".test.ts") && !path.endsWith("/index.ts"),
  );

  const prompts = templateFiles.map((filePath) => {
    const source = readFileSync(filePath, "utf-8");
    const rel = relative(templatesRoot, filePath).replace(/\\/g, "/");
    const id = slugify(rel.replace(/\.ts$/, ""));
    const extracted = extractTemplateLiteralsFromSource(source);
    const content =
      extracted.length > 0
        ? extracted.join("\n\n---\n\n")
        : [`# Source Template`, "", `Path: ${rel}`, "", "```ts", source.trim(), "```"].join("\n");

    return {
      id,
      sourcePath: rel,
      content,
    };
  });

  return {
    generatedAt,
    generatedDate: generatedAt.slice(0, 10),
    agents,
    skills,
    prompts,
  };
}

function buildCopilotRootInstructions(model: ExportModel): string {
  return [
    `# Ghostwire Copilot Instructions`,
    ``,
    `Generated: ${model.generatedDate}`,
    ``,
    `Repository-wide constraints:`,
    `- Use technical and scientific language with explicit assumptions and measurable outcomes.`,
    `- Apply RED -> GREEN -> REFACTOR for non-trivial code changes.`,
    `- Prefer deterministic validation (typecheck, tests, lint, diagnostics) before completion.`,
    `- Keep edits minimal and scoped to requested behavior.`,
    `- Surface defects by severity, with file evidence and reproducible verification steps.`,
    ``,
    `Full capability export is available via modular artifacts:`,
    `- .github/instructions/*.instructions.md`,
    `- .github/prompts/*.prompt.md`,
    `- .github/skills/*/SKILL.md`,
    `- .github/agents/*.agent.md`,
    `- .github/hooks/*.json`,
    ``,
  ].join("\n");
}

function buildCopilotScopedInstructions(model: ExportModel): ExportArtifact[] {
  const topAgentLines = model.agents
    .slice(0, 20)
    .map((agent) => `- \`${agent.id}\`: ${agent.purpose}`)
    .join("\n");

  return [
    {
      target: "copilot",
      path: ".github/instructions/typescript.instructions.md",
      content: [
        `---`,
        `applyTo: "**/*.ts,**/*.tsx"`,
        `---`,
        ``,
        `# TypeScript Engineering Rules`,
        `- Enforce strict typing and avoid silent fallback behavior.`,
        `- Keep API and function contracts explicit and testable.`,
        `- Validate all behavior changes with typecheck and targeted tests.`,
        ``,
        `## Agent Catalog (Top)`,
        topAgentLines,
        ``,
      ].join("\n"),
    },
    {
      target: "copilot",
      path: ".github/instructions/tests.instructions.md",
      content: [
        `---`,
        `applyTo: "**/*.test.ts,**/*.spec.ts"`,
        `---`,
        ``,
        `# Test Rules`,
        `- Start with failing assertions for new behavior.`,
        `- Encode regression and boundary cases with deterministic expectations.`,
        `- Do not remove failing tests unless behavior is intentionally deprecated.`,
        ``,
      ].join("\n"),
    },
  ];
}

function buildCopilotPromptArtifacts(model: ExportModel): { artifacts: ExportArtifact[]; emittedIds: string[] } {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const prompt of model.prompts) {
    const slug = ensureUniqueSlug(slugify(prompt.id || "prompt"), usedSlugs);
    artifacts.push({
      target: "copilot",
      path: `.github/prompts/${slug}.prompt.md`,
      content: [
        `# ${prompt.id}`,
        ``,
        `Source: ${prompt.sourcePath}`,
        ``,
        prompt.content,
        ``,
      ].join("\n"),
    });
    emittedIds.push(prompt.id);
  }

  return { artifacts, emittedIds };
}

function buildCopilotSkillArtifacts(model: ExportModel): { artifacts: ExportArtifact[]; emittedIds: string[] } {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const skill of model.skills) {
    const slug = ensureUniqueSlug(slugify(skill.id || skill.name), usedSlugs);
    artifacts.push({
      target: "copilot",
      path: `.github/skills/${slug}/SKILL.md`,
      content: [
        `---`,
        `name: ${skill.name}`,
        `description: ${skill.description.replace(/\n+/g, " ")}`,
        `---`,
        ``,
        skill.template.trim(),
        ``,
      ].join("\n"),
    });
    emittedIds.push(skill.id);
  }

  return { artifacts, emittedIds };
}

function buildCopilotAgentArtifacts(model: ExportModel): { artifacts: ExportArtifact[]; emittedIds: string[] } {
  const artifacts: ExportArtifact[] = [];
  const emittedIds: string[] = [];
  const usedSlugs = new Set<string>();

  for (const agent of model.agents) {
    const slug = ensureUniqueSlug(slugify(agent.id), usedSlugs);
    artifacts.push({
      target: "copilot",
      path: `.github/agents/${slug}.agent.md`,
      content: [
        `---`,
        `name: ${agent.name}`,
        `description: ${agent.purpose.replace(/\n+/g, " ")}`,
        `---`,
        ``,
        `# ${agent.id}`,
        ``,
        agent.prompt.trim(),
        ``,
      ].join("\n"),
    });
    emittedIds.push(agent.id);
  }

  return { artifacts, emittedIds };
}

function buildCopilotHookArtifacts(): ExportArtifact[] {
  return [
    {
      target: "copilot",
      path: ".github/hooks/ghostwire-guardrails.json",
      content: JSON.stringify(
        {
          version: 1,
          hooks: {
            sessionStart: [{ command: "echo ghostwire-session-start" }],
            preToolUse: [{ command: "echo ghostwire-pre-tool" }],
            postToolUse: [{ command: "echo ghostwire-post-tool" }],
          },
        },
        null,
        2,
      ),
    },
  ];
}

function buildCodexInstructions(model: ExportModel): { content: string; emittedIds: string[] } {
  const catalog = model.agents.map((agent) => `- \`${agent.id}\`: ${agent.purpose}`).join("\n");
  return {
    emittedIds: model.agents.map((agent) => agent.id),
    content: [
      `# Ghostwire Codex Instructions`,
      ``,
      `Generated: ${model.generatedDate}`,
      ``,
      `Use technical and scientific language and point of view.`,
      `Apply RED -> GREEN -> REFACTOR for non-trivial implementation.`,
      `Quantify uncertainty and state assumptions explicitly.`,
      `Prefer deterministic validation evidence over narrative claims.`,
      ``,
      `## Full Agent Catalog`,
      catalog,
      ``,
      `## Companion Artifacts`,
      `- .github/copilot-instructions.md`,
      `- .github/instructions/`,
      `- .github/prompts/`,
      `- .github/skills/`,
      `- .github/hooks/`,
      ``,
    ].join("\n"),
  };
}

function createCoverageEntry(sourceIds: string[], emittedIds: string[], applicable: boolean): CoverageEntry {
  const sourceSet = new Set(sourceIds);
  const emittedSet = new Set(emittedIds);
  const missingIds = applicable ? [...sourceSet].filter((id) => !emittedSet.has(id)).sort() : [];
  return {
    source_count: sourceSet.size,
    emitted_count: emittedSet.size,
    missing_ids: missingIds,
    applicable,
  };
}

function createManifestArtifact(
  baseDirectory: string,
  target: ExportTarget,
  model: ExportModel,
  relativeArtifacts: ExportArtifact[],
  coverage: ExportCoverage,
): ExportArtifact {
  const entries = relativeArtifacts
    .map((artifact) => ({
      path: artifact.path,
      target: artifact.target,
      sha256: createHash("sha256").update(artifact.content).digest("hex"),
      bytes: Buffer.byteLength(artifact.content, "utf-8"),
    }))
    .sort((a, b) => a.path.localeCompare(b.path));

  return {
    target: "shared",
    path: join(baseDirectory, ".ghostwire", "export-manifest.json"),
    content: JSON.stringify(
      {
        generator: "ghostwire-export/v3-full",
        generatedAt: model.generatedAt,
        target,
        coverage,
        entries,
      },
      null,
      2,
    ),
  };
}

function resolveArtifactsWithGroups(
  baseDirectory: string,
  target: ExportTarget,
  groups: Set<CopilotGroup>,
): ResolvedArtifacts {
  const model = compileExportModel();
  const relativeArtifacts: ExportArtifact[] = [];

  let emittedAgentIdsForCopilot: string[] = [];
  let emittedSkillIds: string[] = [];
  let emittedPromptIds: string[] = [];
  let emittedCodexAgentIds: string[] = [];

  if (target === "copilot" || target === "all") {
    relativeArtifacts.push({
      target: "copilot",
      path: ".github/copilot-instructions.md",
      content: buildCopilotRootInstructions(model),
    });

    if (groups.has("instructions")) {
      relativeArtifacts.push(...buildCopilotScopedInstructions(model));
    }

    if (groups.has("prompts")) {
      const prompts = buildCopilotPromptArtifacts(model);
      relativeArtifacts.push(...prompts.artifacts);
      emittedPromptIds = prompts.emittedIds;
    }

    if (groups.has("skills")) {
      const skills = buildCopilotSkillArtifacts(model);
      relativeArtifacts.push(...skills.artifacts);
      emittedSkillIds = skills.emittedIds;
    }

    if (groups.has("agents")) {
      const agents = buildCopilotAgentArtifacts(model);
      relativeArtifacts.push(...agents.artifacts);
      emittedAgentIdsForCopilot = agents.emittedIds;
    }

    if (groups.has("hooks")) {
      relativeArtifacts.push(...buildCopilotHookArtifacts());
    }
  }

  if (target === "codex" || target === "all") {
    const codex = buildCodexInstructions(model);
    emittedCodexAgentIds = codex.emittedIds;
    relativeArtifacts.push({
      target: "codex",
      path: "AGENTS.md",
      content: codex.content,
    });
  }

  const sourceAgentIds = model.agents.map((agent) => agent.id);
  const sourceSkillIds = model.skills.map((skill) => skill.id);
  const sourcePromptIds = model.prompts.map((prompt) => prompt.id);

  const coverage: ExportCoverage = {
    agents: createCoverageEntry(
      sourceAgentIds,
      emittedAgentIdsForCopilot,
      (target === "copilot" || target === "all") && groups.has("agents"),
    ),
    skills: createCoverageEntry(
      sourceSkillIds,
      emittedSkillIds,
      (target === "copilot" || target === "all") && groups.has("skills"),
    ),
    prompts: createCoverageEntry(
      sourcePromptIds,
      emittedPromptIds,
      (target === "copilot" || target === "all") && groups.has("prompts"),
    ),
    codex_catalog: createCoverageEntry(sourceAgentIds, emittedCodexAgentIds, target === "codex" || target === "all"),
  };

  const absoluteArtifacts = relativeArtifacts.map((artifact) => ({
    ...artifact,
    path: join(baseDirectory, artifact.path),
  }));

  return {
    artifacts: absoluteArtifacts,
    coverage,
    model,
  };
}

function validateTarget(target: string | undefined): target is ExportTarget {
  return target === undefined || target === "copilot" || target === "codex" || target === "all";
}

// Backward-compatible helper retained for existing import surface.
export function buildAgentCatalogLegacy(): string {
  const sorted = [...AGENTS_MANIFEST].sort((a, b) => a.id.localeCompare(b.id));
  return sorted.map((agent) => `- \`${agent.id}\`: ${agent.purpose}`).join("\n");
}

function parseGroups(groupsArg: string | undefined): Set<CopilotGroup> | null {
  if (!groupsArg || groupsArg.trim().length === 0) {
    return new Set(COPILOT_GROUPS);
  }

  const groups = groupsArg
    .split(",")
    .map((group) => group.trim().toLowerCase())
    .filter(Boolean);

  const parsed = new Set<CopilotGroup>();
  for (const group of groups) {
    if (!COPILOT_GROUPS.includes(group as CopilotGroup)) {
      return null;
    }
    parsed.add(group as CopilotGroup);
  }

  return parsed;
}

function runStrictValidation(artifacts: ExportArtifact[], coverage: ExportCoverage): string[] {
  const errors: string[] = [];

  for (const artifact of artifacts) {
    if (!artifact.content.trim()) {
      errors.push(`Empty artifact content: ${artifact.path}`);
    }

    if (artifact.path.endsWith(".json")) {
      try {
        JSON.parse(artifact.content);
      } catch {
        errors.push(`Invalid JSON artifact: ${artifact.path}`);
      }
    }

    if (artifact.path.endsWith(".github/copilot-instructions.md") && artifact.content.length > 4000) {
      errors.push(
        `Copilot root instructions exceed 4000 characters (${artifact.content.length}): ${artifact.path}`,
      );
    }
  }

  const parityClasses: Array<keyof ExportCoverage> = ["agents", "skills", "prompts", "codex_catalog"];
  for (const className of parityClasses) {
    const entry = coverage[className];
    if (entry.applicable && entry.missing_ids.length > 0) {
      errors.push(
        `Parity gap in ${className}: source=${entry.source_count}, emitted=${entry.emitted_count}, missing=${entry.missing_ids.join(",")}`,
      );
    }
  }

  return errors;
}

export async function exportGenius(args: ExportArgs): Promise<number> {
  if (!validateTarget(args.target)) {
    console.error(`Invalid --target value: ${args.target}. Expected one of: copilot, codex, all`);
    return 1;
  }

  const target = args.target ?? "all";
  const force = args.force ?? false;
  const strict = args.strict ?? false;
  const writeManifest = args.manifest ?? false;
  const baseDirectory = resolve(args.directory ?? process.cwd());

  const groups = parseGroups(args.groups);
  if (!groups) {
    console.error(
      `Invalid --groups value: ${args.groups}. Expected comma-separated subset of: ${COPILOT_GROUPS.join(",")}`,
    );
    return 1;
  }

  const resolved = resolveArtifactsWithGroups(baseDirectory, target, groups);

  const artifacts = [...resolved.artifacts];
  if (writeManifest) {
    artifacts.push(
      createManifestArtifact(
        baseDirectory,
        target,
        resolved.model,
        artifacts.map((artifact) => ({
          ...artifact,
          path: relative(baseDirectory, artifact.path).replace(/\\/g, "/"),
        })),
        resolved.coverage,
      ),
    );
  }

  if (strict) {
    const errors = runStrictValidation(artifacts, resolved.coverage);
    if (errors.length > 0) {
      for (const error of errors) {
        console.error(error);
      }
      return 1;
    }
  }

  for (const artifact of artifacts) {
    if (existsSync(artifact.path) && !force) {
      console.error(`Refusing to overwrite existing file: ${artifact.path}. Use --force to overwrite.`);
      return 1;
    }
  }

  for (const artifact of artifacts) {
    mkdirSync(dirname(artifact.path), { recursive: true });
    writeFileSync(artifact.path, artifact.content, "utf-8");
    console.log(`Exported ${artifact.target} artifact -> ${artifact.path}`);
  }

  return 0;
}
