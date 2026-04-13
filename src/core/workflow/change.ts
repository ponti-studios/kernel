import { rename } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import {
  directoryExists,
  ensureDir,
  fileExists,
  listDirs,
  listFiles,
  readFile,
  writeFile,
} from "../utils/file-system.js";
import { workflowArtifactDefinitions } from "./templates.js";
import type {
  ApplyInstructionPayload,
  ApplyInstructionTask,
  ArtifactInstruction,
  ChangeStatus,
  KernelProject,
  WorkflowArtifactStatus,
} from "./types.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function changeDir(project: KernelProject, change: string): string {
  return join(project.changesDir, change);
}

function artifactPath(project: KernelProject, change: string, artifactId: string): string {
  const artifact = workflowArtifactDefinitions.find((entry) => entry.id === artifactId);
  if (!artifact) {
    throw new Error(`Unknown artifact: ${artifactId}`);
  }
  return join(changeDir(project, change), artifact.fileName);
}

async function readMarkdownIfPresent(path: string): Promise<string> {
  if (!(await fileExists(path))) {
    return "";
  }
  return readFile(path);
}

function hasContent(content: string): boolean {
  return content.trim().length > 0;
}

export async function createChange(
  project: KernelProject,
  input: string,
): Promise<{
  change: string;
  changeDir: string;
}> {
  const change = slugify(input);
  if (change.length === 0) {
    throw new Error("Change name cannot be empty.");
  }
  const dir = changeDir(project, change);
  if (await fileExists(join(dir, "change.json"))) {
    throw new Error(`Change already exists: ${change}`);
  }
  await ensureDir(join(dir, "specs"));
  await writeFile(
    join(dir, "change.json"),
    JSON.stringify(
      {
        name: change,
        schemaName: "kernel-change",
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
  return { change, changeDir: relative(project.rootDir, dir) };
}

export async function listChanges(project: KernelProject): Promise<string[]> {
  const names = await listDirs(project.changesDir);
  return names.filter((name) => name !== "archive").sort();
}

async function buildArtifactStatus(
  project: KernelProject,
  change: string,
): Promise<WorkflowArtifactStatus[]> {
  const contentByArtifact = new Map<string, string>();
  for (const artifact of workflowArtifactDefinitions) {
    contentByArtifact.set(
      artifact.id,
      await readMarkdownIfPresent(artifactPath(project, change, artifact.id)),
    );
  }

  return workflowArtifactDefinitions.map((artifact) => {
    const content = contentByArtifact.get(artifact.id) ?? "";
    const done = hasContent(content);
    const depsDone = artifact.dependencies.every((dependency) =>
      hasContent(contentByArtifact.get(dependency) ?? ""),
    );
    return {
      id: artifact.id,
      title: artifact.title,
      outputPath: relative(project.rootDir, artifactPath(project, change, artifact.id)),
      dependencies: [...artifact.dependencies],
      status: done ? "done" : depsDone ? "ready" : "blocked",
    };
  });
}

export async function getChangeStatus(
  project: KernelProject,
  change: string,
): Promise<ChangeStatus> {
  const dir = changeDir(project, change);
  if (!(await fileExists(join(dir, "change.json")))) {
    throw new Error(`Unknown change: ${change}`);
  }
  return {
    change,
    schemaName: "kernel-change",
    applyRequires: ["tasks"],
    artifacts: await buildArtifactStatus(project, change),
  };
}

export async function getArtifactInstruction(
  project: KernelProject,
  change: string,
  artifactId: string,
): Promise<ArtifactInstruction> {
  await getChangeStatus(project, change);
  const artifact = workflowArtifactDefinitions.find((entry) => entry.id === artifactId);
  if (!artifact) {
    throw new Error(`Unknown artifact: ${artifactId}`);
  }
  return {
    artifactId,
    change,
    outputPath: relative(project.rootDir, artifactPath(project, change, artifact.id)),
    dependencies: [...artifact.dependencies],
    context: artifact.context,
    rules: [...artifact.rules],
    template: artifact.template,
    instruction: artifact.instruction,
  };
}

function parseTasks(tasksMarkdown: string): ApplyInstructionTask[] {
  return tasksMarkdown
    .split("\n")
    .map((line) => line.match(/^- \[( |x)\] (.+)$/i))
    .filter((match): match is RegExpMatchArray => match !== null)
    .map((match) => ({ done: match[1].toLowerCase() === "x", text: match[2] }));
}

export async function getApplyInstructions(
  project: KernelProject,
  change: string,
): Promise<ApplyInstructionPayload> {
  const status = await getChangeStatus(project, change);
  const contextFiles = status.artifacts
    .filter((artifact) => artifact.status === "done")
    .map((artifact) => artifact.outputPath);
  const tasksMarkdown = await readMarkdownIfPresent(artifactPath(project, change, "tasks"));
  const tasks = parseTasks(tasksMarkdown);
  const complete = tasks.filter((task) => task.done).length;
  const total = tasks.length;

  let state: ApplyInstructionPayload["state"] = "blocked";
  let instruction = "Create kernel/changes/<change>/tasks.md before applying work.";

  if (
    status.artifacts.find((artifact) => artifact.id === "tasks")?.status === "done" &&
    total === 0
  ) {
    state = "blocked";
    instruction = "Add checkbox tasks to kernel/changes/<change>/tasks.md before applying work.";
  } else if (total > 0 && complete === total) {
    state = "all_done";
    instruction = "All tasks are complete. Archive the change when you are ready.";
  } else if (total > 0) {
    state = "in_progress";
    instruction = `Implement the next unchecked task in kernel/changes/${change}/tasks.md and update the checkbox when complete.`;
  }

  return {
    change,
    schemaName: "kernel-change",
    state,
    contextFiles,
    progress: {
      total,
      complete,
      remaining: Math.max(total - complete, 0),
    },
    tasks,
    instruction,
  };
}

async function collectRelativeFiles(baseDir: string, currentDir = baseDir): Promise<string[]> {
  const fileNames = await listFiles(currentDir);
  const dirNames = await listDirs(currentDir);
  const files = fileNames.map((name) => relative(baseDir, join(currentDir, name)));
  for (const dirName of dirNames) {
    files.push(...(await collectRelativeFiles(baseDir, join(currentDir, dirName))));
  }
  return files.sort();
}

async function getSpecSyncState(
  project: KernelProject,
  change: string,
): Promise<"no-delta" | "synced" | "needs-sync"> {
  const deltaDir = join(changeDir(project, change), "specs");
  const deltaFiles = await collectRelativeFiles(deltaDir);
  if (deltaFiles.length === 0) {
    return "no-delta";
  }
  for (const relativePath of deltaFiles) {
    const source = await readFile(join(deltaDir, relativePath));
    const targetPath = join(project.specsDir, relativePath);
    if (!(await fileExists(targetPath))) {
      return "needs-sync";
    }
    const target = await readFile(targetPath);
    if (source !== target) {
      return "needs-sync";
    }
  }
  return "synced";
}

export async function archiveChange(
  project: KernelProject,
  change: string,
): Promise<{
  archivedTo: string;
  artifacts: ChangeStatus["artifacts"];
  incompleteTasks: number;
  specsState: "no-delta" | "synced" | "needs-sync";
}> {
  const status = await getChangeStatus(project, change);
  const apply = await getApplyInstructions(project, change);
  const datePrefix = new Date().toISOString().slice(0, 10);
  const targetDir = join(project.archiveDir, `${datePrefix}-${basename(change)}`);
  if (await directoryExists(targetDir)) {
    throw new Error(`Archive target already exists: ${relative(project.rootDir, targetDir)}`);
  }
  const specsState = await getSpecSyncState(project, change);
  await ensureDir(project.archiveDir);
  await rename(changeDir(project, change), targetDir);
  return {
    archivedTo: relative(project.rootDir, targetDir),
    artifacts: status.artifacts,
    incompleteTasks: apply.progress.remaining,
    specsState,
  };
}
