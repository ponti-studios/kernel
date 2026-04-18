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
import { slugify } from "../utils/slugify.js";
import type { MilestoneRecord, ProjectRecord, WorkProject } from "../work/types.js";
import { assertValidKernelRecordId, resolveWorkProject } from "../work/index.js";

function renderBrief(record: ProjectRecord): string {
  return `# Project Brief

## Goal

${record.goal}

## Target Date

${record.targetDate ?? "<!-- Set a target date with: kernel project new ... --target-date YYYY-MM-DD -->"}

## Context

<!-- What initiative or need does this project serve? -->
<!-- What is the current state, and what will be different when this project is done? -->
<!-- What does success unlock for the team or users? -->

## Scope

### In scope

- <!-- Major deliverable or capability 1 -->
- <!-- Major deliverable or capability 2 -->
- <!-- Add more as needed -->

### Out of scope

- <!-- Explicitly deferred — prevents scope creep across milestones -->

## Success Criteria

This project is complete when:

- [ ] <!-- Specific, observable outcome 1 — a capability that now exists and can be verified -->
- [ ] <!-- Specific, observable outcome 2 -->
- [ ] All milestones are delivered and marked done
- [ ] No critical or high-severity bugs remain open against this project

## Milestones

<!-- These become kernel/milestones/<id>/ entries. List in delivery order. -->

1. <!-- Milestone 1: what it delivers, why it comes first -->
2. <!-- Milestone 2: what it builds on from Milestone 1 -->

## Stakeholders

| Stakeholder | Role | What They Care About |
|------------|------|---------------------|
| <!-- Name or team --> | <!-- DRI / reviewer / approver --> | <!-- Their primary concern --> |

## Constraints

<!-- Technical, budget, compliance, or timeline constraints that bound implementation choices. -->
<!-- Example: must not require a database migration, must be backward-compatible with v2 clients -->

## Dependencies

<!-- External systems, teams, or decisions that must be in place before this project can ship. -->
<!-- Unresolved dependencies are project-level blockers — escalate early. -->
`;
}

function renderPlan(record: ProjectRecord): string {
  return `# Project Plan

## Goal

${record.goal}

## Approach

<!-- What is the overall delivery strategy for this project? -->
<!-- How will milestones be sequenced? What is the core technical or product bet? -->
<!-- Why this approach over alternatives? What trade-offs are being accepted? -->

## Milestone Breakdown

<!-- Each milestone is a time-boxed, independently shippable slice of the project. -->
<!-- Order by dependency — what must ship before what? -->

| Milestone | Purpose | Depends On | Target Date |
|----------|---------|-----------|------------|
| <!-- milestone-id --> | <!-- what it delivers --> | <!-- other milestone-id or "none" --> | <!-- date --> |

## Critical Path

<!-- Which milestone is the bottleneck? What does everything else depend on? -->
<!-- If this milestone slips, the project delivery date slips. -->

## Sequencing Rationale

<!-- Explain the ordering. What does the first milestone unlock? -->
<!-- What must be true before the final milestone can begin? -->

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| <!-- e.g. integration with third-party API is underspecified --> | <!-- H/M/L --> | <!-- H/M/L --> | <!-- e.g. spike in Milestone 1 before committing to design --> |
| <!-- e.g. schema migration on live table --> | <!-- Med --> | <!-- High --> | <!-- e.g. shadow write pattern, then backfill --> |

## Acceptance Criteria

This project is complete when:

- [ ] All milestones are done
- [ ] <!-- Observable, testable outcome is verified -->
- [ ] Retrospective captured in kernel/retrospectives/

## Open Questions

<!-- Unresolved decisions that must be answered before or during execution. -->
<!-- Each question should have an owner and a deadline. -->

- <!-- Question: owner, deadline -->
- <!-- Question: what decision or milestone does resolving it unlock? -->
`;
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
  if (projectIds.length === 0) {
    throw new Error("No projects found. Run `kernel project new <goal>` to create one.");
  }
  if (projectIds.length === 1) {
    return projectIds[0];
  }
  // Multiple projects — return the most recently updated active one
  const records = await Promise.all(
    projectIds.map(async (id) => {
      try {
        return await loadProjectRecord(project, id);
      } catch {
        return null;
      }
    }),
  );
  const active = records
    .filter((r): r is ProjectRecord => r !== null && r.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (active.length > 0) {
    return active[0].id;
  }
  throw new Error(
    `Multiple projects found. Pass a project ID: ${projectIds.join(", ")}`,
  );
}

export async function createProject(
  goal: string,
  opts: { initiativeId?: string; targetDate?: string } = {},
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
    targetDate: opts.targetDate,
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
  // Warn about linked milestones that are still active
  const milestoneIds = await listDirs(project.milestonesDir);
  const activeMilestones: string[] = [];
  for (const id of milestoneIds) {
    try {
      const ms = yaml.parse(
        await readFile(join(project.milestonesDir, id, "milestone.yaml")),
      ) as MilestoneRecord;
      if (ms.projectId === resolvedId && ms.status === "active") {
        activeMilestones.push(id);
      }
    } catch {
      // skip unreadable
    }
  }
  const now = new Date().toISOString();
  record.status = "done";
  record.doneAt = now;
  record.updatedAt = now;
  await saveProjectRecord(project, record);
  return {
    projectId: resolvedId,
    status: "done",
    warnings:
      activeMilestones.length > 0
        ? [`${activeMilestones.length} linked milestone(s) are still active: ${activeMilestones.join(", ")}`]
        : undefined,
  };
}
