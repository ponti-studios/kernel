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
import type { ProjectRecord, WorkProject } from "../work/types.js";
import { assertValidKernelRecordId, resolveWorkProject } from "../work/index.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function renderBrief(record: ProjectRecord): string {
  return `# Project Brief\n\n## Goal\n\n${record.goal}\n\n## Target Date\n\n${record.targetDate ?? "No target date"}\n`;
}

function renderPlan(record: ProjectRecord): string {
  return `# Project Plan\n\n## Goal\n\n${record.goal}\n\n## Approach\n\n- Define the overall project approach.\n\n## Risks\n\n- Capture project-level risks here.\n`;
}

async function saveProjectRecord(
  project: WorkProject,
  record: ProjectRecord,
): Promise<void> {
  const projectRoot = join(project.projectsDir, record.id);
  await ensureDir(projectRoot);
  await writeFile(join(projectRoot, "project.yaml"), yaml.stringify(record));
  if (!(await fileExists(join(projectRoot, "brief.md")))) {
    await writeFile(join(projectRoot, "brief.md"), renderBrief(record));
  }
  if (!(await fileExists(join(projectRoot, "plan.md")))) {
    await writeFile(join(projectRoot, "plan.md"), renderPlan(record));
  }
}

async function loadProjectRecord(
  project: WorkProject,
  projectId: string,
): Promise<ProjectRecord> {
  const safeProjectId = assertValidKernelRecordId(projectId, "projectId");
  const projectPath = join(project.projectsDir, safeProjectId, "project.yaml");
  const raw = yaml.parse(await readFile(projectPath)) as ProjectRecord;
  return raw;
}

async function resolveProjectId(
  project: WorkProject,
  projectId?: string,
): Promise<string> {
  if (projectId) {
    return assertValidKernelRecordId(projectId, "projectId");
  }
  const projectIds = (await listDirs(project.projectsDir)).sort();
  if (projectIds.length === 1) {
    return projectIds[0];
  }
  throw new Error("No active project found. Run `kernel project new <goal>` or pass `kernel project status <projectId>`.");
}

export async function createProject(
  goal: string,
  opts: { initiativeId?: string } = {},
  startDir = process.cwd(),
) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.projectsDir);
  if (opts.initiativeId) {
    const initiativeId = assertValidKernelRecordId(opts.initiativeId, "initiativeId");
    if (!(await fileExists(join(project.initiativeDir, initiativeId, "initiative.yaml")))) {
      throw new Error(`Unknown initiative: ${initiativeId}`);
    }
  }
  const baseId = slugify(goal) || "project";
  let projectId = baseId;
  const existing = new Set(await listDirs(project.projectsDir));
  let index = 2;
  while (existing.has(projectId)) {
    projectId = `${baseId}-${index}`;
    index += 1;
  }
  const now = new Date().toISOString();
  const record: ProjectRecord = {
    id: projectId,
    goal,
    status: "active",
    initiativeId: opts.initiativeId,
    createdAt: now,
    updatedAt: now,
  };
  await saveProjectRecord(project, record);
  return {
    projectId,
    projectDir: relative(project.rootDir, join(project.projectsDir, projectId)),
  };
}

export async function planProject(projectId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.projectsDir);
  const resolvedId = await resolveProjectId(project, projectId);
  const record = await loadProjectRecord(project, resolvedId);
  record.updatedAt = new Date().toISOString();
  await saveProjectRecord(project, record);
  return {
    projectId: resolvedId,
    briefPath: relative(project.rootDir, join(project.projectsDir, resolvedId, "brief.md")),
    planPath: relative(project.rootDir, join(project.projectsDir, resolvedId, "plan.md")),
  };
}

export async function projectStatus(projectId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveProjectId(project, projectId);
  const record = await loadProjectRecord(project, resolvedId);
  return {
    projectId: resolvedId,
    goal: record.goal,
    status: record.status,
    initiativeId: record.initiativeId,
    targetDate: record.targetDate,
    projectDir: relative(project.rootDir, join(project.projectsDir, resolvedId)),
  };
}

export async function listProjects(startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  if (!(await directoryExists(project.projectsDir))) {
    return { projects: [] };
  }
  const projectIds = await listDirs(project.projectsDir);
  const projects = await Promise.all(
    projectIds.map(async (id) => {
      const record = await loadProjectRecord(project, id);
      return {
        id: record.id,
        goal: record.goal,
        status: record.status,
        initiativeId: record.initiativeId,
      };
    }),
  );
  return { projects };
}

export async function doneProject(projectId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveProjectId(project, projectId);
  const record = await loadProjectRecord(project, resolvedId);
  record.status = "done";
  record.updatedAt = new Date().toISOString();
  await saveProjectRecord(project, record);
  return {
    projectId: resolvedId,
    status: "done",
  };
}
