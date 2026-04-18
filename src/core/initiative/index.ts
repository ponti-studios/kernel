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
import type { InitiativeRecord, ProjectRecord, WorkProject } from "../work/types.js";
import { assertValidKernelRecordId, resolveWorkProject } from "../work/index.js";

function renderBrief(record: InitiativeRecord): string {
  return `# Initiative Brief

## Goal

${record.goal}

## Why This Matters

<!-- What business, product, or technical problem does this initiative address? -->
<!-- What happens if we don't pursue it? What is the cost of inaction? -->

## Strategic Objective

<!-- Express the goal as a measurable outcome with a timeframe. -->
<!-- Example: "Reduce authentication-related support tickets by 40% by end of Q3." -->
<!-- Example: "Enable self-serve onboarding so the sales team is no longer the bottleneck." -->

## Scope

### In scope

- <!-- High-level area of work or capability 1 -->
- <!-- High-level area of work or capability 2 -->

### Out of scope

- <!-- Explicitly excluded — set the boundary clearly so projects don't drift -->

## Success Criteria

This initiative is complete when:

- [ ] <!-- Measurable, observable outcome 1 — not a task, an outcome -->
- [ ] <!-- Measurable, observable outcome 2 -->
- [ ] All linked projects are delivered and marked done
- [ ] A retrospective has been written in kernel/retrospectives/

## Key Projects

<!-- These become kernel/projects/<id>/ entries. List in dependency order. -->

1. <!-- Project 1: what it delivers and why it comes first -->
2. <!-- Project 2: what it unlocks or depends on Project 1 -->

## Stakeholders

| Stakeholder | Role | What They Care About |
|------------|------|---------------------|
| <!-- Name or team --> | <!-- DRI / informed / approver --> | <!-- Their primary concern --> |

## Timeline

- **Start:** <!-- Date or sprint -->
- **Target completion:** <!-- Date or sprint -->
- **Decision gate:** <!-- Any checkpoint where we evaluate whether to continue -->

## Risks and Assumptions

| Item | Type | Mitigation or Validation |
|------|------|--------------------------|
| <!-- e.g. team will have capacity in Q3 --> | Assumption | <!-- Confirm with eng lead by end of Q2 --> |
| <!-- e.g. regulatory approval takes longer than expected --> | Risk | <!-- Begin approval process in parallel, not sequentially --> |
`;
}

function renderPlan(record: InitiativeRecord): string {
  return `# Initiative Plan

## Goal

${record.goal}

## Strategic Approach

<!-- Describe how this initiative will be executed at a high level. -->
<!-- Which capabilities or teams are involved? -->
<!-- What is the core bet — the thing that must be true for this to succeed? -->

## Project Breakdown

<!-- List each project, its purpose, and its dependency relationships. -->
<!-- Projects should be independently deliverable slices — not phases of one big thing. -->

| Project | Purpose | Depends On | Target Date |
|---------|---------|-----------|------------|
| <!-- project-id --> | <!-- what it delivers --> | <!-- other project-id or "none" --> | <!-- date --> |

## Critical Path

<!-- Identify the sequence of dependencies that determines total duration. -->
<!-- Which project must ship first? What is blocked behind it? -->
<!-- If the critical path slips, the whole initiative slips. -->

## Sequencing Rationale

<!-- Explain why projects are ordered the way they are. -->
<!-- What de-risks the initiative fastest? What enables subsequent projects? -->

## Success Criteria

This initiative is complete when:

- [ ] <!-- Observable, measurable outcome -->
- [ ] All projects are marked done
- [ ] Learnings are captured in a retrospective

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| <!-- Risk --> | <!-- High / Med / Low --> | <!-- High / Med / Low --> | <!-- Concrete response --> |

## Open Questions

<!-- Questions that must be answered before or during execution. -->
<!-- Assign an owner and a date for each. -->

- <!-- Question: who owns answering it, by when? -->
- <!-- Question: what decision does it unlock? -->
`;
}

async function saveInitiativeRecord(
  project: WorkProject,
  record: InitiativeRecord,
): Promise<void> {
  const initiativeRoot = join(project.initiativeDir, record.id);
  await ensureDir(initiativeRoot);
  await writeFile(join(initiativeRoot, "initiative.yaml"), yaml.stringify(record));
  if (!(await fileExists(join(initiativeRoot, "brief.md")))) {
    await writeFile(join(initiativeRoot, "brief.md"), renderBrief(record));
  }
  if (!(await fileExists(join(initiativeRoot, "plan.md")))) {
    await writeFile(join(initiativeRoot, "plan.md"), renderPlan(record));
  }
}

async function loadInitiativeRecord(
  project: WorkProject,
  initiativeId: string,
): Promise<InitiativeRecord> {
  const safeInitiativeId = assertValidKernelRecordId(initiativeId, "initiativeId");
  const initiativePath = join(project.initiativeDir, safeInitiativeId, "initiative.yaml");
  const raw = yaml.parse(await readFile(initiativePath)) as InitiativeRecord;
  return raw;
}

async function resolveInitiativeId(
  project: WorkProject,
  initiativeId?: string,
): Promise<string> {
  if (initiativeId) {
    return assertValidKernelRecordId(initiativeId, "initiativeId");
  }
  const initiativeIds = (await listDirs(project.initiativeDir)).sort();
  if (initiativeIds.length === 0) {
    throw new Error("No initiatives found. Run `kernel initiative new <goal>` to create one.");
  }
  if (initiativeIds.length === 1) {
    return initiativeIds[0];
  }
  // Multiple initiatives — return the most recently updated active one
  const records = await Promise.all(
    initiativeIds.map(async (id) => {
      try {
        return await loadInitiativeRecord(project, id);
      } catch {
        return null;
      }
    }),
  );
  const active = records
    .filter((r): r is InitiativeRecord => r !== null && r.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (active.length > 0) {
    return active[0].id;
  }
  throw new Error(
    `Multiple initiatives found. Pass an initiative ID: ${initiativeIds.join(", ")}`,
  );
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
    planPath: relative(project.rootDir, join(project.initiativeDir, resolvedId, "plan.md")),
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
  // Warn about linked projects that are still active
  const projectIds = await listDirs(project.projectsDir);
  const activeProjects: string[] = [];
  for (const id of projectIds) {
    try {
      const proj = yaml.parse(
        await readFile(join(project.projectsDir, id, "project.yaml")),
      ) as ProjectRecord;
      if (proj.initiativeId === resolvedId && proj.status === "active") {
        activeProjects.push(id);
      }
    } catch {
      // skip unreadable
    }
  }
  const now = new Date().toISOString();
  record.status = "done";
  record.doneAt = now;
  record.updatedAt = now;
  await saveInitiativeRecord(project, record);
  return {
    initiativeId: resolvedId,
    status: "done",
    warnings:
      activeProjects.length > 0
        ? [`${activeProjects.length} linked project(s) are still active: ${activeProjects.join(", ")}`]
        : undefined,
  };
}
