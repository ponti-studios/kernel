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
import type { InitiativeRecord, WorkProject } from "../work/types.js";
import { resolveWorkProject } from "../work/index.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function renderBrief(record: InitiativeRecord): string {
  return `# Initiative Brief\n\n## Goal\n\n${record.goal}\n`;
}

async function saveInitiativeRecord(
  project: WorkProject,
  record: InitiativeRecord,
): Promise<void> {
  const initiativeRoot = join(project.initiativeDir, record.id);
  await ensureDir(initiativeRoot);
  await writeFile(join(initiativeRoot, "initiative.yaml"), yaml.stringify(record));
  await writeFile(join(initiativeRoot, "brief.md"), renderBrief(record));
}

async function loadInitiativeRecord(
  project: WorkProject,
  initiativeId: string,
): Promise<InitiativeRecord> {
  const initiativePath = join(project.initiativeDir, initiativeId, "initiative.yaml");
  const raw = yaml.parse(await readFile(initiativePath)) as InitiativeRecord;
  return raw;
}

async function resolveInitiativeId(
  project: WorkProject,
  initiativeId?: string,
): Promise<string> {
  if (initiativeId) {
    return initiativeId;
  }
  const initiativeIds = (await listDirs(project.initiativeDir)).sort();
  if (initiativeIds.length === 1) {
    return initiativeIds[0];
  }
  throw new Error("No active initiative found. Run `kernel initiative new <goal>` or pass `kernel initiative status <initiativeId>`.");
}

export async function createInitiative(goal: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.initiativeDir);
  const baseId = slugify(goal) || "initiative";
  let initiativeId = baseId;
  const existing = new Set(await listDirs(project.initiativeDir));
  let index = 2;
  while (existing.has(initiativeId)) {
    initiativeId = `${baseId}-${index}`;
    index += 1;
  }
  const now = new Date().toISOString();
  const record: InitiativeRecord = {
    id: initiativeId,
    goal,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  await saveInitiativeRecord(project, record);
  return {
    initiativeId,
    initiativeDir: relative(project.rootDir, join(project.initiativeDir, initiativeId)),
  };
}

export async function planInitiative(initiativeId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.initiativeDir);
  const resolvedId = await resolveInitiativeId(project, initiativeId);
  const record = await loadInitiativeRecord(project, resolvedId);
  record.updatedAt = new Date().toISOString();
  await saveInitiativeRecord(project, record);
  return {
    initiativeId: resolvedId,
    briefPath: relative(project.rootDir, join(project.initiativeDir, resolvedId, "brief.md")),
  };
}

export async function initiativeStatus(initiativeId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveInitiativeId(project, initiativeId);
  const record = await loadInitiativeRecord(project, resolvedId);
  return {
    initiativeId: resolvedId,
    goal: record.goal,
    status: record.status,
    initiativeDir: relative(project.rootDir, join(project.initiativeDir, resolvedId)),
  };
}

export async function listInitiatives(startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  if (!(await directoryExists(project.initiativeDir))) {
    return { initiatives: [] };
  }
  const initiativeIds = await listDirs(project.initiativeDir);
  const initiatives = await Promise.all(
    initiativeIds.map(async (id) => {
      const record = await loadInitiativeRecord(project, id);
      return {
        id: record.id,
        goal: record.goal,
        status: record.status,
      };
    }),
  );
  return { initiatives };
}

export async function doneInitiative(initiativeId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveInitiativeId(project, initiativeId);
  const record = await loadInitiativeRecord(project, resolvedId);
  record.status = "done";
  record.updatedAt = new Date().toISOString();
  await saveInitiativeRecord(project, record);
  return {
    initiativeId: resolvedId,
    status: "done",
  };
}
