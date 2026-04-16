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
import type { MilestoneRecord, WorkProject } from "../work/types.js";
import { resolveWorkProject } from "../work/index.js";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function renderBrief(record: MilestoneRecord): string {
  return `# Milestone Brief\n\n## Goal\n\n${record.goal}\n\n## Target Date\n\n${record.targetDate ?? "No target date"}\n`;
}

async function saveMilestoneRecord(
  project: WorkProject,
  record: MilestoneRecord,
): Promise<void> {
  const milestoneRoot = join(project.milestonesDir, record.id);
  await ensureDir(milestoneRoot);
  await writeFile(join(milestoneRoot, "milestone.yaml"), yaml.stringify(record));
  await writeFile(join(milestoneRoot, "brief.md"), renderBrief(record));
}

async function loadMilestoneRecord(
  project: WorkProject,
  milestoneId: string,
): Promise<MilestoneRecord> {
  const milestonePath = join(project.milestonesDir, milestoneId, "milestone.yaml");
  const raw = yaml.parse(await readFile(milestonePath)) as MilestoneRecord;
  return raw;
}

async function resolveMilestoneId(
  project: WorkProject,
  milestoneId?: string,
): Promise<string> {
  if (milestoneId) {
    return milestoneId;
  }
  const milestoneIds = (await listDirs(project.milestonesDir)).sort();
  if (milestoneIds.length === 1) {
    return milestoneIds[0];
  }
  throw new Error("No active milestone found. Run `kernel milestone new <goal>` or pass `kernel milestone status <milestoneId>`.");
}

export async function createMilestone(
  goal: string,
  opts: { projectId?: string } = {},
  startDir = process.cwd(),
) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.milestonesDir);
  const baseId = slugify(goal) || "milestone";
  let milestoneId = baseId;
  const existing = new Set(await listDirs(project.milestonesDir));
  let index = 2;
  while (existing.has(milestoneId)) {
    milestoneId = `${baseId}-${index}`;
    index += 1;
  }
  const now = new Date().toISOString();
  const record: MilestoneRecord = {
    id: milestoneId,
    goal,
    status: "active",
    projectId: opts.projectId,
    createdAt: now,
    updatedAt: now,
  };
  await saveMilestoneRecord(project, record);
  return {
    milestoneId,
    milestoneDir: relative(project.rootDir, join(project.milestonesDir, milestoneId)),
  };
}

export async function planMilestone(milestoneId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.milestonesDir);
  const resolvedId = await resolveMilestoneId(project, milestoneId);
  const record = await loadMilestoneRecord(project, resolvedId);
  record.updatedAt = new Date().toISOString();
  await saveMilestoneRecord(project, record);
  return {
    milestoneId: resolvedId,
    briefPath: relative(project.rootDir, join(project.milestonesDir, resolvedId, "brief.md")),
  };
}

export async function milestoneStatus(milestoneId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveMilestoneId(project, milestoneId);
  const record = await loadMilestoneRecord(project, resolvedId);
  return {
    milestoneId: resolvedId,
    goal: record.goal,
    status: record.status,
    projectId: record.projectId,
    targetDate: record.targetDate,
    milestoneDir: relative(project.rootDir, join(project.milestonesDir, resolvedId)),
  };
}

export async function listMilestones(startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  if (!(await directoryExists(project.milestonesDir))) {
    return { milestones: [] };
  }
  const milestoneIds = await listDirs(project.milestonesDir);
  const milestones = await Promise.all(
    milestoneIds.map(async (id) => {
      const record = await loadMilestoneRecord(project, id);
      return {
        id: record.id,
        goal: record.goal,
        status: record.status,
        projectId: record.projectId,
      };
    }),
  );
  return { milestones };
}

export async function doneMilestone(milestoneId?: string, startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  const resolvedId = await resolveMilestoneId(project, milestoneId);
  const record = await loadMilestoneRecord(project, resolvedId);
  record.status = "done";
  record.updatedAt = new Date().toISOString();
  await saveMilestoneRecord(project, record);
  return {
    milestoneId: resolvedId,
    status: "done",
  };
}
