import { join, relative } from "node:path";
import { fileExists, listDirs, readFile, writeFile } from "../utils/file-system.js";
import { resolveKernelProject, readFeaturePointer, writeFeaturePointer } from "./project.js";
import type { AnalyzeSummary, FeatureSummary, KernelProject } from "./types.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

async function getNextFeatureSlug(project: KernelProject, description: string): Promise<string> {
  const base = slugify(description) || "feature";
  const existing = new Set(await listDirs(project.specsDir));
  if (!existing.has(base)) {
    return base;
  }
  let index = 2;
  while (existing.has(`${base}-${index}`)) {
    index += 1;
  }
  return `${base}-${index}`;
}

async function getCurrentFeatureDirectory(project: KernelProject): Promise<string> {
  const pointer = await readFeaturePointer(project);
  if (!pointer) {
    throw new Error("No active kernel feature. Run `kernel specify <feature-description>` first.");
  }
  return join(project.rootDir, pointer.featureDirectory);
}

function fillTemplate(template: string, title: string, summary: string): string {
  return template
    .replace("## Summary", `## Summary\n\n${summary}`)
    .replace(/^# .+$/m, `# ${title}`);
}

export async function specifyFeature(
  description: string,
  startDir = process.cwd(),
): Promise<FeatureSummary> {
  const project = await resolveKernelProject(startDir, { createIfMissing: true });
  const slug = await getNextFeatureSlug(project, description);
  const featureDir = join(project.specsDir, slug);
  const relativeDir = relative(project.rootDir, featureDir);
  const specPath = join(featureDir, "spec.md");
  const specTemplate = await readFile(join(project.templatesDir, "spec-template.md"));
  await writeFile(specPath, fillTemplate(specTemplate, "Specification", description));
  await writeFeaturePointer(project, relativeDir);
  return {
    featureDirectory: relativeDir,
    specPath: relative(project.rootDir, specPath),
  };
}

export async function clarifyFeature(startDir = process.cwd()): Promise<{ outputPath: string }> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const outputPath = join(featureDir, "clarifications.md");
  if (!(await fileExists(outputPath))) {
    await writeFile(
      outputPath,
      `# Clarifications\n\n## Decisions\n\n- Pending clarification\n\n## Follow-ups\n\n- [ ] Confirm unresolved questions\n`,
    );
  }
  return { outputPath: relative(project.rootDir, outputPath) };
}

export async function planFeature(startDir = process.cwd()): Promise<{ outputPath: string }> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const specPath = join(featureDir, "spec.md");
  const planPath = join(featureDir, "plan.md");
  const template = await readFile(join(project.templatesDir, "plan-template.md"));
  const specSummary = (await readFile(specPath)).split("\n").slice(0, 6).join("\n");
  await writeFile(planPath, fillTemplate(template, "Implementation Plan", specSummary));
  return { outputPath: relative(project.rootDir, planPath) };
}

export async function generateTasks(startDir = process.cwd()): Promise<{ outputPath: string }> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const tasksPath = join(featureDir, "tasks.md");
  const template = await readFile(join(project.templatesDir, "tasks-template.md"));
  await writeFile(
    tasksPath,
    `${template.trim()}\n- [ ] Implement the core workflow path\n- [ ] Add verification coverage\n`,
  );
  return { outputPath: relative(project.rootDir, tasksPath) };
}

export async function createChecklist(startDir = process.cwd()): Promise<{ outputPath: string }> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const checklistPath = join(featureDir, "checklist.md");
  const template = await readFile(join(project.templatesDir, "checklist-template.md"));
  await writeFile(checklistPath, template);
  return { outputPath: relative(project.rootDir, checklistPath) };
}

export async function ensureConstitution(
  startDir = process.cwd(),
): Promise<{ outputPath: string }> {
  const project = await resolveKernelProject(startDir, { createIfMissing: true });
  const constitutionPath = join(project.memoryDir, "constitution.md");
  if (!(await fileExists(constitutionPath))) {
    await writeFile(
      constitutionPath,
      "# Kernel Constitution\n\n- Prefer small, focused functions.\n- Eliminate duplication.\n- Favor strong runtime performance.\n",
    );
  }
  return { outputPath: relative(project.rootDir, constitutionPath) };
}

export async function analyzeFeature(startDir = process.cwd()): Promise<AnalyzeSummary> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const specPath = join(featureDir, "spec.md");
  const planPath = join(featureDir, "plan.md");
  const tasksPath = join(featureDir, "tasks.md");
  const findings: string[] = [];

  if (!(await fileExists(specPath))) {
    findings.push("Missing spec.md");
  }
  if (!(await fileExists(planPath))) {
    findings.push("Missing plan.md");
  }
  if (!(await fileExists(tasksPath))) {
    findings.push("Missing tasks.md");
  }
  if (await fileExists(tasksPath)) {
    const tasks = await readFile(tasksPath);
    if (!tasks.includes("- [ ]") && !tasks.includes("- [x]")) {
      findings.push("tasks.md has no actionable checklist items");
    }
  }

  return {
    featureDirectory: relative(project.rootDir, featureDir),
    findings,
    readyForImplementation: findings.length === 0,
  };
}

export async function taskstoissues(startDir = process.cwd()): Promise<{ outputPath: string }> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const tasksPath = join(featureDir, "tasks.md");
  const issuesPath = join(featureDir, "issues.md");
  const tasks = (await readFile(tasksPath))
    .split("\n")
    .map((line) => line.match(/^- \[( |x)\] (.+)$/i))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => `- ${match[2]}`);
  await writeFile(issuesPath, `# Issues\n\n${tasks.join("\n")}\n`);
  return { outputPath: relative(project.rootDir, issuesPath) };
}

export async function implementFeature(startDir = process.cwd()): Promise<{
  featureDirectory: string;
  nextTask: string | null;
}> {
  const project = await resolveKernelProject(startDir);
  const featureDir = await getCurrentFeatureDirectory(project);
  const tasksPath = join(featureDir, "tasks.md");
  const tasks = (await readFile(tasksPath))
    .split("\n")
    .map((line) => line.match(/^- \[( |x)\] (.+)$/i))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => ({ done: match[1].toLowerCase() === "x", text: match[2] }));
  return {
    featureDirectory: relative(project.rootDir, featureDir),
    nextTask: tasks.find((task) => !task.done)?.text ?? null,
  };
}
