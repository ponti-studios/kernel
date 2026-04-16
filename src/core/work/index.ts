import { rename } from "fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import * as yaml from "yaml";
import {
  directoryExists,
  ensureDir,
  fileExists,
  listDirs,
  readFile,
  writeFile,
} from "../utils/file-system.js";
import type { WorkProject, WorkRecord, WorkTask } from "./types.js";

const RECORD_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function assertValidKernelRecordId(id: string, label = "recordId"): string {
  if (!RECORD_ID_PATTERN.test(id)) {
    throw new Error(`Invalid ${label}: ${id}`);
  }
  return id;
}

function defaultTasks(): WorkTask[] {
  return [
    { id: "clarify-scope", title: "Clarify scope and success criteria", done: false },
    { id: "implement-core-path", title: "Implement the core path", done: false },
    { id: "verify-behavior", title: "Verify behavior with tests", done: false },
    { id: "capture-followups", title: "Capture follow-up work", done: false },
  ];
}

async function findProjectRoot(startDir: string): Promise<string> {
  let currentDir = resolve(startDir);

  while (true) {
    if (
      (await directoryExists(join(currentDir, ".git"))) ||
      (await fileExists(join(currentDir, "package.json")))
    ) {
      return currentDir;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return resolve(startDir);
    }
    currentDir = parentDir;
  }
}

export async function resolveWorkProject(startDir = process.cwd()): Promise<WorkProject> {
  const rootDir = await findProjectRoot(startDir);
  return {
    rootDir,
    kernelDir: join(rootDir, "kernel"),
    initiativeDir: join(rootDir, "kernel", "initiatives"),
    projectsDir: join(rootDir, "kernel", "projects"),
    milestonesDir: join(rootDir, "kernel", "milestones"),
    workDir: join(rootDir, "kernel", "work"),
    archiveDir: join(rootDir, "kernel", "work", "archive"),
    dotKernelDir: join(rootDir, ".kernel"),
    pointersPath: join(rootDir, ".kernel", "pointers.json"),
  };
}

async function ensureWorkLayout(project: WorkProject): Promise<void> {
  await ensureDir(project.initiativeDir);
  await ensureDir(project.projectsDir);
  await ensureDir(project.milestonesDir);
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
  if (!(await fileExists(join(workRoot, "brief.md")))) {
    await writeFile(join(workRoot, "brief.md"), renderBrief(record));
  }
  if (!(await fileExists(join(workRoot, "plan.md")))) {
    await writeFile(join(workRoot, "plan.md"), renderPlan(record));
  }
  if (!(await fileExists(join(workRoot, "tasks.md")))) {
    await writeFile(join(workRoot, "tasks.md"), renderTasks(record));
  }
  if (!(await fileExists(join(workRoot, "journal.md")))) {
    await writeFile(join(workRoot, "journal.md"), renderJournal(record));
  }
}

function matchesTaskIdentifier(task: Pick<WorkTask, "id" | "title">, normalizedId: string): boolean {
  return (
    task.id === normalizedId ||
    slugify(task.title) === normalizedId ||
    task.id.startsWith(normalizedId) ||
    slugify(task.title).startsWith(normalizedId)
  );
}

async function syncTaskMarkdown(project: WorkProject, workId: string, normalizedId: string): Promise<void> {
  const tasksPath = join(project.workDir, workId, "tasks.md");
  if (!(await fileExists(tasksPath))) {
    return;
  }

  const lines = (await readFile(tasksPath)).split("\n");
  let updated = false;
  const nextLines = lines.map((line) => {
    if (updated) {
      return line;
    }

    const match = line.match(/^- \[( |x)\] (.+)$/i);
    if (!match) {
      return line;
    }

    const title = match[2];
    if (!matchesTaskIdentifier({ id: slugify(title), title }, normalizedId)) {
      return line;
    }

    updated = true;
    return `- [x] ${title}`;
  });

  if (updated) {
    await writeFile(tasksPath, nextLines.join("\n"));
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  return (await fileExists(filePath)) || (await directoryExists(filePath));
}

async function resolveUniqueArchiveTarget(project: WorkProject, workId: string): Promise<string> {
  const baseName = `${new Date().toISOString().slice(0, 10)}-${workId}`;
  let archiveTarget = join(project.archiveDir, baseName);
  let index = 2;

  while (await pathExists(archiveTarget)) {
    archiveTarget = join(project.archiveDir, `${baseName}-${index}`);
    index += 1;
  }

  return archiveTarget;
}

async function loadWorkRecord(project: WorkProject, workId: string): Promise<WorkRecord> {
  const safeWorkId = assertValidKernelRecordId(workId, "workId");
  const workPath = join(project.workDir, safeWorkId, "work.yaml");
  const raw = yaml.parse(await readFile(workPath)) as WorkRecord;
  const tasksPath = join(project.workDir, safeWorkId, "tasks.md");
  if (await fileExists(tasksPath)) {
    const storedTasks = new Map(
      (raw.tasks ?? []).map((task) => [task.id || slugify(task.title), task] satisfies [string, WorkTask]),
    );
    const parsedTasks = (await readFile(tasksPath))
      .split("\n")
      .map((line) => line.match(/^- \[( |x)\] (.+)$/i))
      .filter((match): match is RegExpMatchArray => match !== null)
      .map((match) => {
        const title = match[2];
        const taskId = slugify(title);
        const storedTask = storedTasks.get(taskId);
        const done = match[1].toLowerCase() === "x";
        return {
          id: storedTask?.id ?? taskId,
          title,
          done,
          completedAt: done ? storedTask?.completedAt : undefined,
        };
      });
    if (parsedTasks.length > 0) {
      raw.tasks = parsedTasks;
    }
  }
  return raw;
}

async function resolveWorkId(project: WorkProject, workId?: string): Promise<string> {
  if (workId) {
    return assertValidKernelRecordId(workId, "workId");
  }
  const pointers = await readPointers(project);
  if (pointers.currentWorkId) {
    return pointers.currentWorkId;
  }
  const workIds = (await listDirs(project.workDir)).filter((entry) => entry !== "archive").sort();
  if (workIds.length === 1) {
    return workIds[0];
  }
  throw new Error("No active work item found. Run `kernel work new <goal>` or pass `kernel work status <workId>`.");
}

export async function createWork(
  goal: string,
  optsOrStartDir?: { milestoneId?: string; projectId?: string; initiativeId?: string } | string,
  startDir?: string,
) {
  // Handle backward compatibility: if optsOrStartDir is a string, it's the startDir
  let resolvedOpts: { milestoneId?: string; projectId?: string; initiativeId?: string } = {};
  let resolvedStartDir = process.cwd();

  if (typeof optsOrStartDir === "string") {
    resolvedStartDir = optsOrStartDir;
  } else if (optsOrStartDir && typeof optsOrStartDir === "object") {
    resolvedOpts = optsOrStartDir;
    resolvedStartDir = startDir || process.cwd();
  }

  const opts = resolvedOpts;

  const project = await resolveWorkProject(resolvedStartDir);
  await ensureWorkLayout(project);
  if (opts.initiativeId) {
    const initiativeId = assertValidKernelRecordId(opts.initiativeId, "initiativeId");
    if (!(await fileExists(join(project.initiativeDir, initiativeId, "initiative.yaml")))) {
      throw new Error(`Unknown initiative: ${initiativeId}`);
    }
  }
  if (opts.projectId) {
    const projectId = assertValidKernelRecordId(opts.projectId, "projectId");
    if (!(await fileExists(join(project.projectsDir, projectId, "project.yaml")))) {
      throw new Error(`Unknown project: ${projectId}`);
    }
  }
  if (opts.milestoneId) {
    const milestoneId = assertValidKernelRecordId(opts.milestoneId, "milestoneId");
    if (!(await fileExists(join(project.milestonesDir, milestoneId, "milestone.yaml")))) {
      throw new Error(`Unknown milestone: ${milestoneId}`);
    }
  }
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
    milestoneId: opts.milestoneId,
    projectId: opts.projectId,
    initiativeId: opts.initiativeId,
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
  if (!normalized) {
    throw new Error(`Unknown task: ${taskId}`);
  }
  const task = record.tasks.find(
    (entry) => matchesTaskIdentifier(entry, normalized),
  );
  if (!task) {
    throw new Error(`Unknown task: ${taskId}`);
  }
  task.done = true;
  task.completedAt = new Date().toISOString();
  record.updatedAt = task.completedAt;
  await saveWorkRecord(project, record);
  await syncTaskMarkdown(project, resolvedId, normalized);
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
  const archiveTarget = await resolveUniqueArchiveTarget(project, resolvedId);
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
