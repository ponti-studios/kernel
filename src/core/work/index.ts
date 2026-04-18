import { cp, rename } from "fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import * as yaml from "yaml";
import {
  directoryExists,
  ensureDir,
  fileExists,
  listDirs,
  readFile,
  removeDir,
  writeFile,
} from "../utils/file-system.js";
import { slugify } from "../utils/slugify.js";
import type { WorkProject, WorkRecord, WorkTask } from "./types.js";

const RECORD_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

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
  return `# Work Brief

## Goal

${record.goal}

## Context

<!-- Why is this work being done? What problem does it solve or what opportunity does it capture? -->
<!-- What is the current state, and what will be different when this is done? -->

## Scope

### In scope

- <!-- Specific capability, change, or fix being delivered -->
- <!-- Add more as needed -->

### Out of scope

- <!-- What is explicitly NOT included — prevents scope creep -->
- <!-- If it comes up during execution, add a new work item instead -->

## Success Criteria

The work is complete when all of the following are true:

- [ ] <!-- Specific, observable criterion — something a reviewer can verify without asking -->
- [ ] <!-- Another criterion — behavior, performance, API contract, or test result -->
- [ ] All tasks in tasks.md are checked off
- [ ] The implementation has been reviewed and no blockers remain

<!-- Each criterion must be testable. "It works" is not a criterion. -->
<!-- "A user can submit the form and see a confirmation message" is. -->

## Constraints

<!-- Technical, time, or compatibility constraints that affect how this must be implemented. -->
<!-- Examples: must not break the public API, must complete in under 200ms, must support Node 18+ -->

## Dependencies

<!-- External work, decisions, or systems that must be in place before this can start or ship. -->
<!-- Unresolved dependencies are blockers — record them in journal.md if discovered during execution. -->

## Related Work

<!-- Parent: kernel/milestones/<id>/ or kernel/projects/<id>/ -->
<!-- Blocks: <!-- other work items that cannot start until this is done --> -->
<!-- Blocked by: <!-- other work items that must finish first --> -->
`;
}

function renderPlan(record: WorkRecord): string {
  return `# Implementation Plan

## Goal

${record.goal}

## Approach

<!-- Describe the overall implementation strategy in 2–5 sentences. -->
<!-- Which layer are you starting from — data model, API, UI? -->
<!-- Why this approach over alternatives? What is the key design decision? -->

## Key Decisions

| Decision | Choice | Rationale | Alternative Considered |
|----------|--------|-----------|----------------------|
| <!-- e.g. storage backend --> | <!-- e.g. PostgreSQL --> | <!-- e.g. already in infra --> | <!-- e.g. SQLite → no concurrent writes --> |

## Implementation Steps

### 1. Clarify scope and success criteria

- Read brief.md and confirm every success criterion is specific and testable
- Identify any ambiguities or missing information and resolve them before writing code
- Confirm all dependencies from brief.md are in place
- If scope is unclear, update brief.md before proceeding

### 2. Implement the core path

- <!-- Name the files, modules, or APIs you expect to create or modify -->
- <!-- Describe the sequence: data model → business logic → API → UI, or whichever applies -->
- <!-- Call out any tricky parts or areas that need extra care -->
- <!-- Write the smallest implementation that satisfies the success criteria -->

### 3. Verify behavior with tests

- <!-- What tests will be written or updated? -->
- <!-- Unit tests for isolated logic, integration tests for cross-boundary behavior -->
- <!-- Edge cases to cover: empty input, concurrent access, failure modes, large payloads -->
- <!-- Manual verification steps if automated tests cannot cover everything -->

### 4. Capture follow-up work

- <!-- Known improvements deferred out of scope -->
- <!-- Technical debt being accepted, and why -->
- <!-- Observations or discoveries that should feed into the next work item -->

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| <!-- e.g. third-party API is unstable --> | <!-- High / Med / Low --> | <!-- High / Med / Low --> | <!-- e.g. add retry with exponential backoff --> |
| <!-- e.g. migration is slow on large tables --> | <!-- Med --> | <!-- High --> | <!-- e.g. run in batches with a progress log --> |

## Validation

How to verify this work is correct:

- **Automated:** \`<!-- test command, e.g. bun test src/auth/ -->\`
- **Manual:** <!-- step-by-step check a reviewer can follow without guidance -->
- **Regression:** <!-- what existing behavior must still work after this change -->

## Rollback

<!-- How to undo this change if it causes problems after shipping. -->
<!-- e.g. revert the commit, disable the feature flag, run the down migration -->
`;
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
    slugify(task.title) === normalizedId
  );
}

async function syncTaskMarkdown(project: WorkProject, workId: string, completedTask: WorkTask): Promise<void> {
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
    // Match by exact title or by matching the task id against the title slug
    if (title !== completedTask.title && slugify(title) !== completedTask.id) {
      return line;
    }

    updated = true;
    return `- [x] ${title}`;
  });

  if (updated) {
    await writeFile(tasksPath, nextLines.join("\n"));
  }
}

async function appendJournal(project: WorkProject, workId: string, entry: string): Promise<void> {
  const journalPath = join(project.workDir, workId, "journal.md");
  if (!(await fileExists(journalPath))) {
    return;
  }
  const now = new Date().toISOString();
  const current = await readFile(journalPath);
  await writeFile(journalPath, current.trimEnd() + "\n" + `- ${now}: ${entry}` + "\n");
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
    // Index by both task.id and slugify(task.title) so tasks.md titles
    // correctly re-link with stored metadata even when the id differs from the title slug.
    const storedTasks = new Map<string, WorkTask>();
    for (const task of raw.tasks ?? []) {
      const idKey = task.id || slugify(task.title);
      storedTasks.set(idKey, task);
      const titleKey = slugify(task.title);
      if (titleKey && !storedTasks.has(titleKey)) {
        storedTasks.set(titleKey, task);
      }
    }
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
  if (workIds.length === 0) {
    throw new Error("No work items found. Run `kernel work new <goal>` to create one.");
  }
  if (workIds.length === 1) {
    await writePointers(project, workIds[0]);
    return workIds[0];
  }
  // Multiple items, no pointer — return the most recently updated active item
  const records = await Promise.all(
    workIds.map(async (id) => {
      try {
        return await loadWorkRecord(project, id);
      } catch {
        return null;
      }
    }),
  );
  const active = records
    .filter((r): r is WorkRecord => r !== null && r.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (active.length > 0) {
    await writePointers(project, active[0].id);
    return active[0].id;
  }
  throw new Error(
    `Multiple work items found but none are active. Run \`kernel work list\` to see available items, then pass an explicit work ID.`,
  );
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
  await syncTaskMarkdown(project, resolvedId, task);
  await appendJournal(project, resolvedId, `Completed task: ${task.title}`);
  return {
    workId: resolvedId,
    completedTask: task.title,
    remaining: record.tasks.filter((entry) => !entry.done).length,
  };
}

export async function listWork(startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureWorkLayout(project);
  const workIds = (await listDirs(project.workDir)).filter((entry) => entry !== "archive").sort();
  const items = await Promise.all(
    workIds.map(async (id) => {
      try {
        const record = await loadWorkRecord(project, id);
        const complete = record.tasks.filter((t) => t.done).length;
        return {
          id: record.id,
          goal: record.goal,
          status: record.status,
          milestoneId: record.milestoneId,
          projectId: record.projectId,
          progress: { total: record.tasks.length, complete, remaining: record.tasks.length - complete },
        };
      } catch {
        return { id, goal: "(unreadable)", status: "unknown" as const, progress: { total: 0, complete: 0, remaining: 0 } };
      }
    }),
  );
  const pointers = await readPointers(project);
  return {
    currentWorkId: pointers.currentWorkId,
    items,
  };
}

export async function archiveWork(workId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveWorkId(project, workId);
  const record = await loadWorkRecord(project, resolvedId);
  const incompleteTasks = record.tasks.filter((t) => !t.done).map((t) => t.title);
  const now = new Date().toISOString();
  record.status = "archived";
  record.doneAt = now;
  record.updatedAt = now;
  await saveWorkRecord(project, record);
  const archiveTarget = await resolveUniqueArchiveTarget(project, resolvedId);
  const sourceDir = join(project.workDir, resolvedId);
  await appendJournal(project, resolvedId, incompleteTasks.length > 0
    ? `Archived with ${incompleteTasks.length} incomplete task(s): ${incompleteTasks.join(", ")}`
    : "Archived work item");
  try {
    await rename(sourceDir, archiveTarget);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "EXDEV") {
      await cp(sourceDir, archiveTarget, { recursive: true });
      await removeDir(sourceDir);
    } else {
      throw err;
    }
  }
  // Advance pointer to the next available active work item
  const remaining = (await listDirs(project.workDir))
    .filter((entry) => entry !== "archive")
    .sort();
  const pointers = await readPointers(project);
  if (pointers.currentWorkId === resolvedId || pointers.currentWorkId === null) {
    await writePointers(project, remaining.length > 0 ? remaining[0] : null);
  }
  return {
    workId: resolvedId,
    archivedTo: relative(project.rootDir, archiveTarget),
    nextWorkId: remaining.length > 0 ? remaining[0] : null,
    warnings:
      incompleteTasks.length > 0
        ? [`${incompleteTasks.length} incomplete task(s) were archived: ${incompleteTasks.join(", ")}`]
        : undefined,
  };
}

export async function listArchivedWork(startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.archiveDir);
  const archiveDirs = await listDirs(project.archiveDir);
  const items = await Promise.all(
    archiveDirs.map(async (dirName) => {
      try {
        const yamlPath = join(project.archiveDir, dirName, "work.yaml");
        const raw = yaml.parse(await readFile(yamlPath)) as WorkRecord;
        const complete = (raw.tasks ?? []).filter((t) => t.done).length;
        return {
          id: raw.id,
          goal: raw.goal,
          status: raw.status,
          doneAt: raw.doneAt,
          archivedDir: relative(project.rootDir, join(project.archiveDir, dirName)),
          progress: { total: (raw.tasks ?? []).length, complete, remaining: (raw.tasks ?? []).length - complete },
        };
      } catch {
        return {
          id: dirName,
          goal: "(unreadable)",
          status: "archived" as const,
          doneAt: undefined,
          archivedDir: relative(project.rootDir, join(project.archiveDir, dirName)),
          progress: { total: 0, complete: 0, remaining: 0 },
        };
      }
    }),
  );
  return { items };
}

export async function restoreWork(workId: string, startDir = process.cwd()) {
  const safeId = assertValidKernelRecordId(workId, "workId");
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.archiveDir);
  const archiveDirs = await listDirs(project.archiveDir);
  let foundDir: string | null = null;
  for (const dirName of archiveDirs) {
    try {
      const yamlPath = join(project.archiveDir, dirName, "work.yaml");
      const raw = yaml.parse(await readFile(yamlPath)) as WorkRecord;
      if (raw.id === safeId) {
        foundDir = dirName;
        break;
      }
    } catch {
      // skip unreadable entries
    }
  }
  if (!foundDir) {
    throw new Error(`No archived work item found with id: ${workId}`);
  }
  const sourceDir = join(project.archiveDir, foundDir);
  const destDir = join(project.workDir, safeId);
  if (await directoryExists(destDir)) {
    throw new Error(`Work item ${workId} already exists in the active work directory.`);
  }
  try {
    await rename(sourceDir, destDir);
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "EXDEV") {
      await cp(sourceDir, destDir, { recursive: true });
      await removeDir(sourceDir);
    } else {
      throw err;
    }
  }
  const now = new Date().toISOString();
  const record = yaml.parse(await readFile(join(destDir, "work.yaml"))) as WorkRecord;
  record.status = "active";
  delete record.doneAt;
  record.updatedAt = now;
  await writeFile(join(destDir, "work.yaml"), yaml.stringify(record));
  await appendJournal(project, safeId, "Restored from archive");
  await writePointers(project, safeId);
  return {
    workId: safeId,
    restoredTo: relative(project.rootDir, destDir),
  };
}
