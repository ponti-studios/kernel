import { rename } from "fs/promises";
import { join, relative } from "node:path";
import * as yaml from "yaml";
import { findProjectRoot } from "../workflow/project.js";
import { ensureDir, fileExists, listDirs, readFile, writeFile } from "../utils/file-system.js";
import type { WorkProject, WorkRecord, WorkTask } from "./types.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function defaultTasks(): WorkTask[] {
  return [
    { id: "clarify-scope", title: "Clarify scope and success criteria", done: false },
    { id: "implement-core-path", title: "Implement the core path", done: false },
    { id: "verify-behavior", title: "Verify behavior with tests", done: false },
    { id: "capture-followups", title: "Capture follow-up work", done: false },
  ];
}

export async function resolveWorkProject(startDir = process.cwd()): Promise<WorkProject> {
  const rootDir = await findProjectRoot(startDir);
  return {
    rootDir,
    kernelDir: join(rootDir, "kernel"),
    workDir: join(rootDir, "kernel", "work"),
    archiveDir: join(rootDir, "kernel", "work", "archive"),
    dotKernelDir: join(rootDir, ".kernel"),
    pointersPath: join(rootDir, ".kernel", "pointers.json"),
  };
}

async function ensureWorkLayout(project: WorkProject): Promise<void> {
  await ensureDir(project.workDir);
  await ensureDir(project.archiveDir);
  await ensureDir(project.dotKernelDir);
}

async function writePointers(project: WorkProject, currentWorkId: string | null): Promise<void> {
  await writeFile(
    project.pointersPath,
    JSON.stringify(
      {
        currentWorkId,
      },
      null,
      2,
    ),
  );
}

async function readPointers(project: WorkProject): Promise<{ currentWorkId: string | null }> {
  if (!(await fileExists(project.pointersPath))) {
    return { currentWorkId: null };
  }
  return JSON.parse(await readFile(project.pointersPath)) as { currentWorkId: string | null };
}

function renderBrief(record: WorkRecord): string {
  return `# Work Brief\n\n## Goal\n\n${record.goal}\n\n## Success Criteria\n\n- Define what done looks like before implementation starts.\n`;
}

function renderPlan(record: WorkRecord): string {
  return `# Implementation Plan\n\n## Goal\n\n${record.goal}\n\n## Approach\n\n- Start with the simplest vertical slice.\n- Keep the plan concrete and testable.\n\n## Risks\n\n- Capture hidden dependencies and sequencing risks here.\n\n## Validation\n\n- Define the checks that prove the work is done.\n`;
}

function renderTasks(record: WorkRecord): string {
  const body = record.tasks.map((task) => `- [${task.done ? "x" : " "}] ${task.title}`).join("\n");
  return `# Tasks\n\n${body}\n`;
}

function renderJournal(record: WorkRecord): string {
  return `# Journal\n\n- ${record.createdAt}: Created work item \`${record.id}\`.\n`;
}

async function saveWorkRecord(project: WorkProject, record: WorkRecord): Promise<void> {
  const workRoot = join(project.workDir, record.id);
  await ensureDir(workRoot);
  await writeFile(join(workRoot, "work.yaml"), yaml.stringify(record));
  await writeFile(join(workRoot, "brief.md"), renderBrief(record));
  await writeFile(join(workRoot, "plan.md"), renderPlan(record));
  await writeFile(join(workRoot, "tasks.md"), renderTasks(record));
  if (!(await fileExists(join(workRoot, "journal.md")))) {
    await writeFile(join(workRoot, "journal.md"), renderJournal(record));
  }
}

async function loadWorkRecord(project: WorkProject, workId: string): Promise<WorkRecord> {
  const workPath = join(project.workDir, workId, "work.yaml");
  const raw = yaml.parse(await readFile(workPath)) as WorkRecord;
  const tasksPath = join(project.workDir, workId, "tasks.md");
  if (await fileExists(tasksPath)) {
    const parsedTasks = (await readFile(tasksPath))
      .split("\n")
      .map((line) => line.match(/^- \[( |x)\] (.+)$/i))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => ({
        id: slugify(match[2]),
        title: match[2],
        done: match[1].toLowerCase() === "x",
      }));
    if (parsedTasks.length > 0) {
      raw.tasks = parsedTasks;
    }
  }
  return raw;
}

async function resolveWorkId(project: WorkProject, workId?: string): Promise<string> {
  if (workId) {
    return workId;
  }
  const pointers = await readPointers(project);
  if (pointers.currentWorkId) {
    return pointers.currentWorkId;
  }
  const workIds = (await listDirs(project.workDir)).filter((entry) => entry !== "archive").sort();
  if (workIds.length === 1) {
    return workIds[0];
  }
  throw new Error("Work id required when there is no active work item.");
}

export async function createWork(goal: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureWorkLayout(project);
  const baseId = slugify(goal) || "work";
  let workId = baseId;
  const existing = new Set(await listDirs(project.workDir));
  let index = 2;
  while (existing.has(workId)) {
    workId = `${baseId}-${index}`;
    index += 1;
  }
  const now = new Date().toISOString();
  const record: WorkRecord = {
    id: workId,
    goal,
    status: "active",
    createdAt: now,
    updatedAt: now,
    tasks: defaultTasks(),
  };
  await saveWorkRecord(project, record);
  await writePointers(project, workId);
  return {
    workId,
    workDir: relative(project.rootDir, join(project.workDir, workId)),
  };
}

export async function planWork(workId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureWorkLayout(project);
  const resolvedId = await resolveWorkId(project, workId);
  const record = await loadWorkRecord(project, resolvedId);
  if (record.tasks.length === 0) {
    record.tasks = defaultTasks();
  }
  record.updatedAt = new Date().toISOString();
  await saveWorkRecord(project, record);
  await writePointers(project, resolvedId);
  return {
    workId: resolvedId,
    planPath: relative(project.rootDir, join(project.workDir, resolvedId, "plan.md")),
    tasksPath: relative(project.rootDir, join(project.workDir, resolvedId, "tasks.md")),
  };
}

export async function nextWorkTask(workId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveWorkId(project, workId);
  const record = await loadWorkRecord(project, resolvedId);
  await writePointers(project, resolvedId);
  return {
    workId: resolvedId,
    nextTask: record.tasks.find((task) => !task.done)?.title ?? null,
    remaining: record.tasks.filter((task) => !task.done).length,
  };
}

export async function workStatus(workId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveWorkId(project, workId);
  const record = await loadWorkRecord(project, resolvedId);
  const complete = record.tasks.filter((task) => task.done).length;
  return {
    workId: resolvedId,
    goal: record.goal,
    progress: {
      total: record.tasks.length,
      complete,
      remaining: Math.max(record.tasks.length - complete, 0),
    },
    nextTask: record.tasks.find((task) => !task.done)?.title ?? null,
    workDir: relative(project.rootDir, join(project.workDir, resolvedId)),
  };
}

export async function completeWorkTask(taskId: string, workId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveWorkId(project, workId);
  const record = await loadWorkRecord(project, resolvedId);
  const normalized = slugify(taskId);
  const task = record.tasks.find(
    (entry) =>
      entry.id === normalized ||
      slugify(entry.title) === normalized ||
      entry.id.startsWith(normalized) ||
      slugify(entry.title).startsWith(normalized),
  );
  if (!task) {
    throw new Error(`Unknown task: ${taskId}`);
  }
  task.done = true;
  task.completedAt = new Date().toISOString();
  record.updatedAt = task.completedAt;
  await saveWorkRecord(project, record);
  return {
    workId: resolvedId,
    completedTask: task.title,
    remaining: record.tasks.filter((entry) => !entry.done).length,
  };
}

export async function archiveWork(workId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveWorkId(project, workId);
  const record = await loadWorkRecord(project, resolvedId);
  record.status = "archived";
  record.updatedAt = new Date().toISOString();
  await saveWorkRecord(project, record);
  const archiveTarget = join(
    project.archiveDir,
    `${new Date().toISOString().slice(0, 10)}-${resolvedId}`,
  );
  await rename(join(project.workDir, resolvedId), archiveTarget);
  const pointers = await readPointers(project);
  if (pointers.currentWorkId === resolvedId) {
    await writePointers(project, null);
  }
  return {
    workId: resolvedId,
    archivedTo: relative(project.rootDir, archiveTarget),
  };
}
