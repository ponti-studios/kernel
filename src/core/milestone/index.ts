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
import type { MilestoneRecord, WorkProject, WorkRecord } from "../work/types.js";
import { assertValidKernelRecordId, resolveWorkProject } from "../work/index.js";

function renderBrief(record: MilestoneRecord): string {
  return `# Milestone Brief

## Goal

${record.goal}

## Target Date

${record.targetDate ?? "<!-- Set a target date with: kernel milestone new ... --target-date YYYY-MM-DD -->"}

## Context

<!-- What phase of the project does this milestone represent? -->
<!-- What must be true before this milestone can start? -->
<!-- What does completing this milestone unlock for the next milestone or the project overall? -->

## Scope

### In scope

- <!-- Work item or capability 1 included in this milestone -->
- <!-- Work item or capability 2 -->

### Out of scope

- <!-- Explicitly deferred to a later milestone -->
- <!-- State this clearly to prevent work items from expanding scope mid-milestone -->

## Acceptance Criteria

This milestone is complete when:

- [ ] <!-- Specific, testable criterion 1 — a behavior or state that can be verified -->
- [ ] <!-- Specific, testable criterion 2 -->
- [ ] All linked work items are archived
- [ ] No critical bugs remain open against this milestone's scope

## Work Items

<!-- These become kernel/work/<id>/ entries. List in execution order. -->

1. <!-- Work item: what it delivers, any prerequisite -->
2. <!-- Work item: what it delivers -->

## Dependencies

<!-- What must be completed in a prior milestone or external system before this milestone can ship? -->
<!-- Record unresolved dependencies in journal.md if discovered during execution. -->

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| <!-- e.g. API design is not finalized --> | <!-- High --> | <!-- Spike in first work item, freeze design before implementation starts --> |
| <!-- e.g. test data is hard to reproduce --> | <!-- Med --> | <!-- Build a seed script as the first deliverable --> |
`;
}

function renderPlan(record: MilestoneRecord): string {
  return `# Milestone Plan

## Goal

${record.goal}

## Approach

<!-- How will the work items in this milestone be sequenced? -->
<!-- What is the first thing to ship, and why does it come first? -->
<!-- What is the key technical or design decision for this milestone? -->

## Work Item Breakdown

<!-- List each work item, what it delivers, and any prerequisite work items. -->

| Work Item | Purpose | Depends On |
|-----------|---------|-----------|
| <!-- work-id --> | <!-- what it delivers --> | <!-- other work-id or "none" --> |

## Critical Path

<!-- Which work item is the bottleneck? -->
<!-- What must be done before any other work item can complete? -->

## Sequencing Rationale

<!-- Why are work items ordered the way they are? -->
<!-- What does the first work item unlock? What must be true before the last can begin? -->

## Deliverables

<!-- Enumerate concretely what will exist when this milestone is done. -->
<!-- Be specific: "The /users/profile endpoint is live, documented, and covered by integration tests." -->

- <!-- Deliverable 1 -->
- <!-- Deliverable 2 -->

## Acceptance Criteria

This milestone is complete when:

- [ ] All work items are archived
- [ ] <!-- Observable outcome is verified — not a task, a state of the world -->
- [ ] <!-- Automated tests cover the new behavior -->

## Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| <!-- Risk --> | <!-- High / Med / Low --> | <!-- High / Med / Low --> | <!-- Concrete response --> |

## Open Questions

<!-- Unresolved decisions that block or constrain work items in this milestone. -->
<!-- Assign each to an owner with a deadline — unresolved questions become blockers. -->

- <!-- Question: owner, deadline, what it blocks -->
`;
}

async function saveMilestoneRecord(
  project: WorkProject,
  record: MilestoneRecord,
): Promise<void> {
  const milestoneRoot = join(project.milestonesDir, record.id);
  await ensureDir(milestoneRoot);
  await writeFile(join(milestoneRoot, "milestone.yaml"), yaml.stringify(record));
  if (!(await fileExists(join(milestoneRoot, "brief.md")))) {
    await writeFile(join(milestoneRoot, "brief.md"), renderBrief(record));
  }
  if (!(await fileExists(join(milestoneRoot, "plan.md")))) {
    await writeFile(join(milestoneRoot, "plan.md"), renderPlan(record));
  }
}

async function loadMilestoneRecord(
  project: WorkProject,
  milestoneId: string,
): Promise<MilestoneRecord> {
  const safeMilestoneId = assertValidKernelRecordId(milestoneId, "milestoneId");
  const milestonePath = join(project.milestonesDir, safeMilestoneId, "milestone.yaml");
  const raw = yaml.parse(await readFile(milestonePath)) as MilestoneRecord;
  return raw;
}

async function resolveMilestoneId(
  project: WorkProject,
  milestoneId?: string,
): Promise<string> {
  if (milestoneId) {
    return assertValidKernelRecordId(milestoneId, "milestoneId");
  }
  const milestoneIds = (await listDirs(project.milestonesDir)).sort();
  if (milestoneIds.length === 0) {
    throw new Error("No milestones found. Run `kernel milestone new <goal>` to create one.");
  }
  if (milestoneIds.length === 1) {
    return milestoneIds[0];
  }
  // Multiple milestones — return the most recently updated active one
  const records = await Promise.all(
    milestoneIds.map(async (id) => {
      try {
        return await loadMilestoneRecord(project, id);
      } catch {
        return null;
      }
    }),
  );
  const active = records
    .filter((r): r is MilestoneRecord => r !== null && r.status === "active")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  if (active.length > 0) {
    return active[0].id;
  }
  throw new Error(
    `Multiple milestones found. Pass a milestone ID: ${milestoneIds.join(", ")}`,
  );
}

export async function createMilestone(
  goal: string,
  opts: { projectId?: string; targetDate?: string } = {},
  startDir = process.cwd(),
) {
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.milestonesDir);
  if (opts.projectId) {
    const projectId = assertValidKernelRecordId(opts.projectId, "projectId");
    if (!(await fileExists(join(project.projectsDir, projectId, "project.yaml")))) {
      throw new Error(`Unknown project: ${projectId}`);
    }
  }
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
    targetDate: opts.targetDate,
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
    planPath: relative(project.rootDir, join(project.milestonesDir, resolvedId, "plan.md")),
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
  // Warn about linked work items that are still active
  const workIds = (await listDirs(project.workDir)).filter((entry) => entry !== "archive");
  const activeWork: string[] = [];
  for (const id of workIds) {
    try {
      const work = yaml.parse(
        await readFile(join(project.workDir, id, "work.yaml")),
      ) as WorkRecord;
      if (work.milestoneId === resolvedId && work.status === "active") {
        activeWork.push(id);
      }
    } catch {
      // skip unreadable
    }
  }
  const now = new Date().toISOString();
  record.status = "done";
  record.doneAt = now;
  record.updatedAt = now;
  await saveMilestoneRecord(project, record);
  return {
    milestoneId: resolvedId,
    status: "done",
    warnings:
      activeWork.length > 0
        ? [`${activeWork.length} linked work item(s) are still active: ${activeWork.join(", ")}`]
        : undefined,
  };
}
