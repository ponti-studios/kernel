# Kernel Codebase — Complete Change Log and Deep Reasoning

This document covers every change made to the kernel codebase in this session, in the order the problems were discovered and fixed. Each section explains what was wrong, why it was wrong, what the fix is, and why the fix is correct.

---

## Table of Contents

1. [Background: What Kernel Is](#1-background-what-kernel-is)
2. [Type System Correctness: `WorkRecord.status` and `doneAt`](#2-type-system-correctness-workrecordstatus-and-doneat)
3. [Extracting the `slugify` Utility](#3-extracting-the-slugify-utility)
4. [The Core Task Bug: `loadWorkRecord` Dual-Indexing](#4-the-core-task-bug-loadworkrecord-dual-indexing)
5. [The Silent No-Op Bug: `syncTaskMarkdown` Fake Task](#5-the-silent-no-op-bug-synctaskmarkdown-fake-task)
6. [The Prefix Match Bug: `matchesTaskIdentifier`](#6-the-prefix-match-bug-matchestaskidentifier)
7. [Pointer Recovery: `resolveWorkId` Auto-Fallback](#7-pointer-recovery-resolveworkid-auto-fallback)
8. [Archive Improvements: Pointer Advance, Warnings, EXDEV, Journal](#8-archive-improvements-pointer-advance-warnings-exdev-journal)
9. [Journal Writes: `appendJournal` and `completeWorkTask`](#9-journal-writes-appendjournal-and-completetasktask)
10. [`listWork` — Visibility Into Active Queue](#10-listwork--visibility-into-active-queue)
11. [`listArchivedWork` — Visibility Into Archive](#11-listarchivedwork--visibility-into-archive)
12. [`restoreWork` — Making Archive Reversible](#12-restorework--making-archive-reversible)
13. [Initiative System: Missing `plan.md`, `resolveId`, `doneAt`, Cascade Warnings](#13-initiative-system-missing-planmd-resolveid-doneat-cascade-warnings)
14. [Project System: `targetDate`, `resolveId`, `doneAt`, Cascade Warnings](#14-project-system-targetdate-resolveid-doneat-cascade-warnings)
15. [Milestone System: Missing `plan.md`, `targetDate`, `resolveId`, `doneAt`, Cascade Warnings](#15-milestone-system-missing-planmd-targetdate-resolveid-doneat-cascade-warnings)
16. [CLI Additions: `work list --archived`, `work restore`, `--target-date`](#16-cli-additions-work-list---archived-work-restore---target-date)
17. [Registry: `DEFAULT_COMMAND_TARGETS` and Defensive Loading](#17-registry-default_command_targets-and-defensive-loading)
18. [Template Updates: Commands and `kernel-do` Agent](#18-template-updates-commands-and-kernel-do-agent)
19. [Test Coverage](#19-test-coverage)
20. [What Was Not Changed (and Why)](#20-what-was-not-changed-and-why)

---

## 1. Background: What Kernel Is

Kernel is a local-first project management CLI (`@hackefeller/kernel`). Its core idea is that product management artifacts — goals, plans, tasks, journals — live as plain files in the repo under a `kernel/` directory, making them versionable, diffable, and readable by AI agents without any external API.

The hierarchy is:

```
initiative  (high-level program)
  └── project  (deliverable)
        └── milestone  (time-boxed chunk)
              └── work item  (atomic unit of execution)
                    ├── brief.md        (goal + success criteria)
                    ├── plan.md         (approach + risks)
                    ├── tasks.md        (checkbox list)
                    └── journal.md      (timestamped audit log)
```

Each level stores a YAML record (`initiative.yaml`, `project.yaml`, `milestone.yaml`, `work.yaml`) alongside its markdown documents. A `.kernel/pointers.json` file tracks which work item is currently "active" so commands that take an optional ID can resolve it automatically.

The bugs in this audit fell into four categories:

1. **Lookup failures** — the system couldn't find tasks by their IDs due to key mismatches between storage and lookup
2. **Silent no-ops** — markdown files weren't being updated even when the logic claimed success
3. **Dead ends** — the pointer system orphaned users with no way forward when active items ran out
4. **Missing operations** — archive was one-way, journal was never updated after creation, plan.md was missing for two of four hierarchy levels

---

## 2. Type System Correctness: `WorkRecord.status` and `doneAt`

### What Was Wrong

`WorkRecord` was typed as:

```typescript
type WorkRecord = {
  status: "active" | "archived";
  // no doneAt field
  ...
}
```

Meanwhile, `InitiativeRecord`, `ProjectRecord`, and `MilestoneRecord` all had a `"done"` status variant and a `doneAt?: string` field. The work item record was the odd one out.

This caused two problems. First, TypeScript would flag any code that tried to write `record.status = "done"` on a work item as a type error, even though semantically a work item absolutely can be "done." Second, the `archiveWork` function marked items as `"archived"` but never recorded when this happened, making it impossible to know how long something had been in the archive or to display a "completed at" date in any UI.

### Why This Matters

A type system is only useful if it accurately models the domain. When the type says "archived" but you also want to know *when* it was archived, you end up writing workarounds — maybe you read the file modification time, maybe you parse the archive directory name, maybe you just don't surface the data. All of these are worse than storing a `doneAt` timestamp.

The `"done"` status question is subtler. In the hierarchy levels above, `"done"` means a deliberate human decision to close the item. `"archived"` is a storage operation — it moves files from `kernel/work/` to `kernel/work/archive/`. These are actually different things semantically. But for work items specifically, archiving IS the done operation (unlike initiatives, projects, and milestones which don't have an archive move). So adding `"done"` to the work record status union makes the type consistent across all four levels, even if the lifecycle for work items uses `archiveWork` rather than a separate `done` command.

### The Fix

Added `"done"` to `WorkRecord.status` union and `doneAt?: string` to all four record types:

```typescript
// types.ts
type WorkRecord = {
  id: string;
  goal: string;
  status: "active" | "archived" | "done";
  doneAt?: string;
  ...
}
```

Every level (`InitiativeRecord`, `ProjectRecord`, `MilestoneRecord`, `WorkRecord`) now has `doneAt` so the audit trail is complete.

---

## 3. Extracting the `slugify` Utility

### What Was Wrong

The same `slugify` implementation appeared in four files:

- `src/core/work/index.ts`
- `src/core/initiative/index.ts`
- `src/core/project/index.ts`
- `src/core/milestone/index.ts`

Each copy was character-for-character identical:

```typescript
function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
```

### Why This Matters

Four copies of a pure function creates a maintenance trap. If the slug format needs to change — say, the 64-character truncation is too aggressive, or you need to handle Unicode — you have to find and update all four copies. If you miss one, you get inconsistent IDs across the hierarchy. A work item created in `work/index.ts` might slugify its title differently than a milestone created in `milestone/index.ts`, breaking any cross-reference lookup.

More concretely: the entire linking system (milestoneId, projectId, initiativeId on work items) depends on slugs matching across creation sites. If the slugify functions ever diverged, parent references would silently break.

### The Fix

Created `src/core/utils/slugify.ts`:

```typescript
export function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64);
}
```

All four files now import from this shared location. The function is pure (no side effects, deterministic output), so extracting it has zero behavioral risk — it's purely a maintenance improvement.

The 64-character truncation is intentional: filesystem path limits and human readability both benefit from IDs that don't grow arbitrarily long. `"this-is-an-extremely-verbose-goal-description-that-goes-on-forever"` would be ugly as a directory name and as a CLI argument.

---

## 4. The Core Task Bug: `loadWorkRecord` Dual-Indexing

### What Was Wrong

This is the most important bug in the entire codebase, and it was completely silent — the code would run without errors, return success, but do the wrong thing.

Here is what the original `loadWorkRecord` did:

1. Read `work.yaml`, which contains tasks like:
   ```yaml
   tasks:
     - id: clarify-scope
       title: "Clarify scope and success criteria"
       done: false
   ```

2. Build a lookup map `storedTasks` indexed by `task.id`:
   ```typescript
   for (const task of raw.tasks ?? []) {
     storedTasks.set(task.id, task);
   }
   // storedTasks: { "clarify-scope" => task }
   ```

3. Parse `tasks.md`, which contains lines like:
   ```
   - [ ] Clarify scope and success criteria
   ```

4. For each parsed line, look up the stored task:
   ```typescript
   const taskId = slugify(title);  // "clarify-scope-and-success-criteria"
   const storedTask = storedTasks.get(taskId);  // undefined! key mismatch
   ```

The key used to store was `"clarify-scope"` (the short ID). The key used to look up was `"clarify-scope-and-success-criteria"` (the full title slugified). These are different strings. The lookup always returned `undefined`.

When the lookup failed, the code fell back to using `taskId` (the title slug) as the task ID:

```typescript
return {
  id: storedTask?.id ?? taskId,  // "clarify-scope-and-success-criteria"
  title,
  done,
};
```

So every task loaded from `tasks.md` got its ID replaced with the title slug, losing the original short ID from `work.yaml`. The task that was stored as `{ id: "clarify-scope", ... }` was now loaded as `{ id: "clarify-scope-and-success-criteria", ... }`.

### Why This Matters

The downstream consequence cascades everywhere:

- `completeWorkTask("clarify-scope")` normalizes the argument: `slugify("clarify-scope") = "clarify-scope"`. It then searches `record.tasks.find(t => t.id === "clarify-scope")`. But because `loadWorkRecord` replaced the ID with `"clarify-scope-and-success-criteria"`, the find returns `undefined`, and the function throws `"Unknown task: clarify-scope"`.

- Every task operation in the system silently broke any time `tasks.md` existed (which is always after the first `planWork` or `createWork` call).

### The Fix

Index `storedTasks` by **both** the original `task.id` AND `slugify(task.title)`:

```typescript
const storedTasks = new Map<string, WorkTask>();
for (const task of raw.tasks ?? []) {
  const idKey = task.id || slugify(task.title);
  storedTasks.set(idKey, task);
  const titleKey = slugify(task.title);
  if (titleKey && !storedTasks.has(titleKey)) {
    storedTasks.set(titleKey, task);
  }
}
```

Now `storedTasks` maps both `"clarify-scope"` and `"clarify-scope-and-success-criteria"` to the same task object. When the title slug `"clarify-scope-and-success-criteria"` is used as the lookup key after parsing `tasks.md`, the lookup succeeds and returns the original task with `id: "clarify-scope"` intact.

The `if (!storedTasks.has(titleKey))` guard prevents a title-slug key from overwriting an ID key if they happen to collide (e.g., if someone gives a task the ID `"clarify-scope-and-success-criteria"` directly).

---

## 5. The Silent No-Op Bug: `syncTaskMarkdown` Fake Task

### What Was Wrong

After fixing the lookup bug, a second silent failure remained in `syncTaskMarkdown`. This function is responsible for updating `tasks.md` when a task is completed — marking `- [ ]` as `- [x]`.

The original signature was:

```typescript
async function syncTaskMarkdown(
  project: WorkProject,
  workId: string,
  normalizedId: string,  // just a string, e.g. "clarify-scope"
): Promise<void>
```

Inside, it built a fake task object:

```typescript
const fakeTask = { id: slugify(normalizedId), title: "..." };
```

Wait — it didn't even have the title. It just had a slugified ID. Then it tried to match lines in `tasks.md`:

```typescript
if (title !== fakeTask.title && slugify(title) !== fakeTask.id) {
  return line;  // no match — skip
}
```

`fakeTask.title` was an empty string (it wasn't being passed), so `title !== fakeTask.title` was always true. The match fell to `slugify(title) !== fakeTask.id`, which compared `"clarify-scope-and-success-criteria"` (slug of the task title in tasks.md) with `"clarify-scope"` (slug of the normalizedId argument). These are different, so no lines ever matched. The function silently did nothing.

### Why This Matters

This is the worst kind of bug: one that returns success (no error thrown, no exception) but doesn't do what it says. The calling code in `completeWorkTask` would see `syncTaskMarkdown` return `Promise<void>`, assume it worked, and mark the task done in `work.yaml`. But `tasks.md` would remain unchanged. The next `loadWorkRecord` would re-parse `tasks.md`, find the checkbox still unchecked, and overwrite the `done: true` from `work.yaml` with `done: false` from the markdown. The task would silently un-complete itself.

### The Fix

Change the signature to accept the actual `WorkTask` object, which has both `id` and `title`:

```typescript
async function syncTaskMarkdown(
  project: WorkProject,
  workId: string,
  completedTask: WorkTask,
): Promise<void>
```

The match now uses the real task data:

```typescript
if (title !== completedTask.title && slugify(title) !== completedTask.id) {
  return line;
}
```

`title !== completedTask.title` matches the exact title string from `tasks.md` against the stored title. `slugify(title) !== completedTask.id` matches the title's slug against the short ID. Either match is sufficient. For the default tasks:

- `"Clarify scope and success criteria" === "Clarify scope and success criteria"` → exact title match ✓
- `"clarify-scope-and-success-criteria" !== "clarify-scope"` → ID match fails, but title match already succeeded ✓

The caller was also updated to pass the actual task:

```typescript
await syncTaskMarkdown(project, resolvedId, task);
// previously: await syncTaskMarkdown(project, resolvedId, normalized);
```

---

## 6. The Prefix Match Bug: `matchesTaskIdentifier`

### What Was Wrong

The original `matchesTaskIdentifier` used `startsWith`:

```typescript
function matchesTaskIdentifier(task, normalizedId): boolean {
  return (
    task.id === normalizedId ||
    slugify(task.title) === normalizedId ||
    task.id.startsWith(normalizedId) ||
    slugify(task.title).startsWith(normalizedId)
  );
}
```

The `startsWith` clauses were intended as convenience — let users type `"verify"` instead of `"verify-behavior"`. But they create ambiguity. Consider a task list:

```
- [ ] Verify behavior with tests
- [ ] Verify deployment works
```

Running `kernel work done verify` would match both tasks. The code uses `find`, which returns the first match. Depending on task order, you might complete the wrong task. Even worse, this ambiguity is invisible to the user — no error, just incorrect behavior.

### Why Prefix Matching Is the Wrong Abstraction

Prefix matching makes sense for command-line completion (where the shell shows you options and you pick), but not for a programmatic operation that's meant to be deterministic. If your task list has any two tasks sharing a prefix, the "short form" ceases to work correctly and there's no way to distinguish them except by typing the full ID. At that point, prefix matching adds complexity with no benefit.

The correct solution for human convenience is to make the canonical IDs already short. The default tasks have IDs like `"clarify-scope"`, `"implement-core-path"`, `"verify-behavior"`, `"capture-followups"` — these are already terse enough to type without prefix matching.

### The Fix

Remove the `startsWith` clauses entirely:

```typescript
function matchesTaskIdentifier(task, normalizedId): boolean {
  return (
    task.id === normalizedId ||
    slugify(task.title) === normalizedId
  );
}
```

Exact match only. The dual-indexing fix in `loadWorkRecord` (section 4) ensures that `"clarify-scope"` resolves correctly through the ID path, so the short IDs continue to work. Users who need to complete a custom task by its full title slug can do so via the `slugify(task.title)` path.

---

## 7. Pointer Recovery: `resolveWorkId` Auto-Fallback

### What Was Wrong

The original `resolveWorkId` function had two modes:

1. If an explicit `workId` was passed → validate and use it
2. If no `workId` was passed → read the pointer from `.kernel/pointers.json`

If the pointer was `null` (e.g., `.kernel/pointers.json` didn't exist yet), the function threw an error immediately: `"No active work item found."` It never tried to recover by looking at what was actually in `kernel/work/`.

This created a real usability problem. A user who:
- Just cloned a repo that had work items
- Deleted `.kernel/pointers.json` by accident
- Or ran `kernel work archive` and the pointer-update code failed partway through

...would be told "No active work item found" even when `kernel/work/build-analytics-dashboard/` clearly existed on disk.

### The Design Principle

The pointer is a **cache** — it speeds up common-case resolution so you don't have to scan the filesystem every time. But a cache should never be the source of truth. The source of truth is the filesystem. When the cache is empty, the correct behavior is to fall back to the source of truth, not to give up.

### The Fix

```typescript
async function resolveWorkId(project: WorkProject, workId?: string): Promise<string> {
  if (workId) {
    return assertValidKernelRecordId(workId, "workId");
  }
  const pointers = await readPointers(project);
  if (pointers.currentWorkId) {
    return pointers.currentWorkId;
  }
  // Pointer is null — fall back to filesystem scan
  const workIds = (await listDirs(project.workDir)).filter((entry) => entry !== "archive").sort();
  if (workIds.length === 0) {
    throw new Error("No work items found. Run `kernel work new <goal>` to create one.");
  }
  if (workIds.length === 1) {
    await writePointers(project, workIds[0]);
    return workIds[0];
  }
  // Multiple items — pick the most recently updated active one
  const records = await Promise.all(
    workIds.map(async (id) => {
      try { return await loadWorkRecord(project, id); }
      catch { return null; }
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
    `Multiple work items found but none are active. Run \`kernel work list\` to see available items.`,
  );
}
```

Three tiers of fallback:

1. **Single item** — if only one work item exists on disk, it's unambiguously the right one. Write it to the pointer and return it.
2. **Multiple items** — pick the one with the latest `updatedAt` timestamp. This heuristic is correct because the "active" item is almost always the one you've been working on most recently.
3. **No active items** — give a useful error that tells you what to do next, rather than a cryptic "Not found."

The same fallback pattern was applied to `resolveInitiativeId`, `resolveProjectId`, and `resolveMilestoneId` for the same reasons.

---

## 8. Archive Improvements: Pointer Advance, Warnings, EXDEV, Journal

### 8.1 Pointer Advance After Archive

**What was wrong:** After `archiveWork` moved an item to the archive, it left the pointer pointing at the archived item's ID. The next command that tried to resolve the work ID via the pointer would look for `kernel/work/<archived-id>/work.yaml`, fail to find it (because the directory had been moved), and crash with a file-not-found error.

**The fix:** After renaming the directory to the archive, scan the remaining active work items and write the first one as the new pointer:

```typescript
const remaining = (await listDirs(project.workDir))
  .filter((entry) => entry !== "archive")
  .sort();
if (pointers.currentWorkId === resolvedId || pointers.currentWorkId === null) {
  await writePointers(project, remaining.length > 0 ? remaining[0] : null);
}
```

The condition `pointers.currentWorkId === resolvedId || pointers.currentWorkId === null` is important: if the user explicitly passed a work ID that was NOT the current pointer, we shouldn't steal the pointer away from the item they've been working on. Only advance when we're archiving the currently pointed-at item.

### 8.2 Incomplete Task Warnings

**What was wrong:** `archiveWork` would silently archive items with unchecked tasks. This violates the principle that warnings should surface when the user is about to lose information. A `- [ ]` task in an archived item is never going to get done unless someone explicitly restores the item.

**The fix:** Collect incomplete tasks before archiving and include them in the return value:

```typescript
const incompleteTasks = record.tasks.filter((t) => !t.done).map((t) => t.title);
// ...
return {
  warnings: incompleteTasks.length > 0
    ? [`${incompleteTasks.length} incomplete task(s) were archived: ${incompleteTasks.join(", ")}`]
    : undefined,
};
```

Using `undefined` (not an empty array) when there are no warnings keeps the return type clean — callers can use `if (result.warnings)` rather than `if (result.warnings && result.warnings.length > 0)`.

### 8.3 EXDEV Fallback for Cross-Device Moves

**What was wrong:** `rename()` on Linux/macOS throws `EXDEV` ("Invalid cross-device link") when the source and destination are on different filesystems. This is not a theoretical edge case — it happens any time the user has their temp directory on a RAM disk or when `kernel/work/` and `kernel/work/archive/` happen to straddle a mount point. On Docker containers, it's extremely common.

The original code had no fallback:

```typescript
await rename(join(project.workDir, resolvedId), archiveTarget);
// If this throws EXDEV, the entire archiveWork call fails,
// leaving work.yaml already updated to status="archived"
// but the directory still in kernel/work/
// Now the system is in a corrupt half-state.
```

**The fix:** Catch `EXDEV` specifically and fall back to `cp` (recursive copy) + `removeDir` (recursive delete):

```typescript
try {
  await rename(sourceDir, archiveTarget);
} catch (err: unknown) {
  if ((err as NodeJS.ErrnoException).code === "EXDEV") {
    await cp(sourceDir, archiveTarget, { recursive: true });
    await removeDir(sourceDir);
  } else {
    throw err;  // re-throw anything else (permissions, etc.)
  }
}
```

Only `EXDEV` is swallowed. Permission errors, disk full errors, and anything else are re-thrown immediately. The copy-then-delete approach is slightly less atomic than `rename` but functionally equivalent — and on any single filesystem, `rename` is still used (it's a metadata-only operation and is atomic).

The same fallback was added to `restoreWork` for the same reasons.

### 8.4 Journal Entry Before Archive Move

The journal should record the archive event. This entry must be written **before** the `rename`/`cp`, because after the move, the journal file is no longer at the path `appendJournal` expects:

```typescript
await appendJournal(project, resolvedId, incompleteTasks.length > 0
  ? `Archived with ${incompleteTasks.length} incomplete task(s): ${incompleteTasks.join(", ")}`
  : "Archived work item");
try {
  await rename(sourceDir, archiveTarget);
} catch ...
```

The entry ends up in the archive alongside all other work artifacts, which is correct — the journal travels with the work item.

---

## 9. Journal Writes: `appendJournal` and `completeWorkTask`

### What Was Wrong

`journal.md` was written exactly once — when the work item was created, by `renderJournal()`:

```markdown
# Journal

- 2025-04-01T10:00:00.000Z: Created work item `build-analytics-dashboard`.
```

After that, nothing ever wrote to it again. Task completions, plan updates, archive — all were silent. The journal existed but was useless as an audit trail.

### Why a Journal Matters

The journal serves a specific role that none of the other artifacts fill: it records **events over time**, not **current state**. `work.yaml` tells you the current state. `tasks.md` tells you the current checklist. But neither tells you "task A was completed on Tuesday afternoon, then uncompleted and redone on Wednesday." The journal is the audit trail that lets an AI agent (or a human) understand *what happened* when examining a work item after the fact.

### The `appendJournal` Helper

```typescript
async function appendJournal(
  project: WorkProject,
  workId: string,
  entry: string,
): Promise<void> {
  const journalPath = join(project.workDir, workId, "journal.md");
  if (!(await fileExists(journalPath))) {
    return;  // silently skip if journal doesn't exist
  }
  const now = new Date().toISOString();
  const current = await readFile(journalPath);
  await writeFile(journalPath, current.trimEnd() + "\n" + `- ${now}: ${entry}` + "\n");
}
```

Key design decisions:

- **Silent skip if no journal:** The function is called from multiple places. If for some reason `journal.md` doesn't exist (malformed work item, manual deletion), failing loudly would break task completion and archiving. The journal is an audit trail, not a required artifact for correctness.
- **`trimEnd()` before appending:** Prevents double-blank-lines from accumulating if `journal.md` was written with trailing whitespace.
- **ISO timestamp:** The journal timestamp format matches `createdAt`, `updatedAt`, and `doneAt` everywhere in the system. Consistency is important when tools parse these files.

### Where It's Called

**`completeWorkTask`** — after successfully updating `work.yaml` and `tasks.md`:

```typescript
await appendJournal(project, resolvedId, `Completed task: ${task.title}`);
```

Using `task.title` (the human-readable title) rather than `task.id` (the slug) makes the journal legible without needing to know the ID scheme.

**`archiveWork`** — before the directory move (explained in 8.4).

**`restoreWork`** — after the directory is moved back and `work.yaml` is updated:

```typescript
await appendJournal(project, safeId, "Restored from archive");
```

---

## 10. `listWork` — Visibility Into Active Queue

### What Was Wrong

There was no way to see all work items at once. The only visibility commands were:

- `work status [workId]` — one item at a time
- `work next [workId]` — one item at a time

If you had three active work items and forgot their IDs, there was no command to list them. You had to manually browse `kernel/work/` in your file explorer.

### Why This Is a Real Problem

The pointer system means you're always working "on" one item. But that doesn't mean others don't exist. Multi-tasking is normal — a developer might have a feature work item, a bug fix work item, and a documentation work item all in flight simultaneously. They need to see all three to decide what to switch to.

### The Implementation

```typescript
export async function listWork(startDir = process.cwd()) {
  const project = await resolveWorkProject(startDir);
  await ensureWorkLayout(project);
  const workIds = (await listDirs(project.workDir))
    .filter((entry) => entry !== "archive")
    .sort();
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
          progress: {
            total: record.tasks.length,
            complete,
            remaining: record.tasks.length - complete,
          },
        };
      } catch {
        return {
          id,
          goal: "(unreadable)",
          status: "unknown" as const,
          progress: { total: 0, complete: 0, remaining: 0 },
        };
      }
    }),
  );
  const pointers = await readPointers(project);
  return { currentWorkId: pointers.currentWorkId, items };
}
```

The `filter((entry) => entry !== "archive")` is critical — it prevents the `archive` directory itself from being treated as a work item directory.

The unreadable-item fallback ensures a single corrupt work item doesn't break the entire list. The `progress: { total: 0, complete: 0, remaining: 0 }` is always present even on unreadable items so the return type is uniform — no optional `progress` field that callers have to null-check.

---

## 11. `listArchivedWork` — Visibility Into Archive

### What Was Wrong

Archives were write-only from a UX perspective. You could archive something, but there was no command to see what was in the archive. If you wanted to restore something, you had to manually browse `kernel/work/archive/` to find the right directory name.

### The Implementation

```typescript
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
          progress: { ... },
        };
      } catch {
        return { id: dirName, goal: "(unreadable)", ... };
      }
    }),
  );
  return { items };
}
```

Note `archivedDir` uses `relative(project.rootDir, ...)` to return a path relative to the project root, consistent with how `archiveWork` returns `archivedTo`. This makes it easy for callers to display human-readable paths without exposing absolute filesystem paths.

The function reads directly from `work.yaml` rather than going through `loadWorkRecord`. This is intentional — `loadWorkRecord` tries to sync state between `work.yaml` and `tasks.md`, but for archived items we only need to display metadata. Reading `work.yaml` directly is cheaper and avoids any side effects.

---

## 12. `restoreWork` — Making Archive Reversible

### What Was Wrong

Archiving was a one-way operation. Once a work item was archived, the only way to get it back was to manually move files around in the filesystem and hand-edit `work.yaml`. This is a bad design for a tool that's supposed to remove friction from project management.

Real project management involves mistakes: you archive something that turns out not to be done, or you realize archived work needs to be revisited. A system that can't undo archive is incomplete.

### The Implementation

```typescript
export async function restoreWork(workId: string, startDir = process.cwd()) {
  const safeId = assertValidKernelRecordId(workId, "workId");
  const project = await resolveWorkProject(startDir);
  await ensureDir(project.archiveDir);
  
  // Find the archived directory by scanning work.yaml files
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
  
  // Move back (with EXDEV fallback)
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
  
  // Reset metadata
  const now = new Date().toISOString();
  const record = yaml.parse(await readFile(join(destDir, "work.yaml"))) as WorkRecord;
  record.status = "active";
  delete record.doneAt;
  record.updatedAt = now;
  await writeFile(join(destDir, "work.yaml"), yaml.stringify(record));
  
  await appendJournal(project, safeId, "Restored from archive");
  await writePointers(project, safeId);
  
  return { workId: safeId, restoredTo: relative(project.rootDir, destDir) };
}
```

Several design choices here deserve explanation:

**Why scan by reading `work.yaml` rather than matching directory names?** Archive directories are named `{date}-{workId}` (e.g., `2025-04-17-build-analytics-dashboard`). Matching on directory name alone would require parsing and stripping the date prefix, and would break if the same work ID was archived twice (directories get a `-2` suffix). Reading `work.yaml` and checking `raw.id === safeId` is authoritative — it matches the canonical ID regardless of how the directory was named.

**Why check for existing active directory before restoring?** If `kernel/work/build-analytics-dashboard/` already exists (perhaps someone re-created the work item after archiving), doing a restore would overwrite it, silently destroying in-progress work. Better to fail fast with a clear error.

**Why `delete record.doneAt`?** Setting it to `undefined` would still write `doneAt: ` (null/undefined) to the YAML. Using `delete` removes the key entirely, keeping the YAML clean.

**Why write the pointer immediately to the restored item?** Because the user just explicitly asked to restore this specific item. It's natural to assume they want to work on it now. If they don't, they can switch to a different item.

---

## 13. Initiative System: Missing `plan.md`, `resolveId`, `doneAt`, Cascade Warnings

### 13.1 Missing `plan.md`

**What was wrong:** `createInitiative` wrote `brief.md` but not `plan.md`. `createProject` wrote both. `createMilestone` wrote `brief.md` but not `plan.md`. Work items wrote all four documents. This was inconsistent — agents and humans looking at an initiative directory would find no `plan.md` to fill in.

**The fix:** Added `renderPlan()` to both `initiative/index.ts` and `milestone/index.ts`, and called it from `saveInitiativeRecord` / `saveMilestoneRecord` with the same "only write if not exists" guard used elsewhere.

The guard is essential: if a user has manually edited `plan.md`, running `planInitiative` again should NOT overwrite their edits. The guard ensures idempotency.

### 13.2 `planInitiative` and `planMilestone` Now Return `planPath`

`planWork` already returned `planPath`. `planProject` returned `planPath`. `planInitiative` and `planMilestone` didn't return it, making them inconsistent. Added `planPath` to both return values so callers can open the plan file immediately after the command runs.

### 13.3 `resolveInitiativeId` Auto-Fallback

Applied the same three-tier fallback pattern from `resolveWorkId` (section 7) to `resolveInitiativeId`, `resolveProjectId`, and `resolveMilestoneId`. The reasoning is identical: the pointer/pointer-equivalent should be a cache, not the source of truth.

For initiatives and milestones, there's no explicit pointer file — they just use the "most recently updated active record" heuristic directly when no ID is passed. This is appropriate because you typically only work with one initiative or milestone at a time, and "the one you've touched most recently" is almost always the right one.

### 13.4 `doneAt` on `doneInitiative`

Added:
```typescript
record.doneAt = new Date().toISOString();
```

to `doneInitiative`, `doneProject`, and `doneMilestone`. Without this, closing a hierarchy level leaves no timestamp record. Anyone reviewing the YAML to understand when a project was delivered would find nothing. The `doneAt` field completes the lifecycle narrative: created at X, last updated at Y, done at Z.

### 13.5 Cascade Warnings

**What was wrong:** You could mark an initiative "done" even if it had active projects. You could mark a project "done" even if it had active milestones. You could mark a milestone "done" even if it had active work items. No warning, no error — just silent inconsistency.

**Why warnings and not errors?** The decision to mark something done despite incomplete children might be intentional. Projects get cancelled. Scope gets cut. Forcing users to go bottom-up through the entire hierarchy to close things in order would be paternalistic. But silently doing nothing when children are still open is also wrong. The right answer is: do what the user asked, but warn them about the state.

**The fix:**

For `doneInitiative`:
```typescript
const allProjects = await listDirs(project.projectsDir);
const activeProjects = (await Promise.all(
  allProjects.map(async (pId) => {
    try {
      const raw = yaml.parse(await readFile(...)) as ProjectRecord;
      return raw.initiativeId === resolvedId && raw.status === "active" ? pId : null;
    } catch { return null; }
  })
)).filter((p): p is string => p !== null);

if (activeProjects.length > 0) {
  warnings.push(`${activeProjects.length} linked project(s) are still active`);
}
```

The same pattern at each level: scan children, count active ones linked to this parent, warn. The warnings array is `undefined` when empty (same design as `archiveWork.warnings`).

---

## 14. Project System: `targetDate`, `resolveId`, `doneAt`, Cascade Warnings

### `targetDate` Field

**What was wrong:** `ProjectRecord` and `MilestoneRecord` had a `targetDate?: string` field in the type definition, but:
1. The CLI `project new` command had no `--target-date` option
2. The CLI `milestone new` command had no `--target-date` option

The field existed in the data model but was unreachable from the CLI. Any agent or human using the CLI to create projects/milestones couldn't set a deadline.

**The fix:** Added `--target-date <date>` option to both `project new` and `milestone new` CLI subcommands, passed through to `createProject` / `createMilestone`.

```typescript
.option("--target-date <date>", "Target completion date (e.g. 2025-12-31)")
.action(async (goal, options) => {
  printOutput(await createProject(goal, {
    initiativeId: options.initiative,
    targetDate: options.targetDate,
  }));
})
```

The date is stored as a raw string (`"2025-12-31"`) rather than a Date object to avoid timezone serialization issues. YAML can serialize Date objects, but they get timezone-offset applied during serialization and deserialization, which causes dates to shift depending on the server's timezone. String storage is explicit and predictable.

---

## 15. Milestone System: Missing `plan.md`, `targetDate`, `resolveId`, `doneAt`, Cascade Warnings

All of the same fixes from initiatives and projects were applied to milestones. The milestone level is the most operationally important one — it's the direct parent of work items and represents a concrete time-boxed deliverable. It was also the level most incomplete:

- No `plan.md` on creation
- `planMilestone` didn't return `planPath`
- `doneMilestone` didn't set `doneAt`
- `doneMilestone` didn't warn about active linked work items
- No `--target-date` on `milestone new`

Every one of these was fixed using the same patterns applied above.

---

## 16. CLI Additions: `work list --archived`, `work restore`, `--target-date`

### `work list --archived`

```typescript
work
  .command("list")
  .option("--archived", "List archived items instead of active ones")
  .action(async (options) => {
    if (options.archived) {
      printOutput(await listArchivedWork());
    } else {
      printOutput(await listWork());
    }
  });
```

Using a flag rather than a separate `work list-archived` subcommand keeps the surface area smaller. The two operations are conceptually "listing work" with a filter applied.

### `work restore <workId>`

```typescript
work
  .command("restore <workId>")
  .description("Restore an archived work item to active")
  .action(async (workId) => {
    printOutput(await restoreWork(workId));
  });
```

`workId` is required here (no optional bracket notation). Unlike most commands where you can rely on the pointer, restore has no pointer equivalent for archived items — there's no "current archived item." You must say which one you want back.

---

## 17. Registry: `DEFAULT_COMMAND_TARGETS` and Defensive Loading

### `DEFAULT_COMMAND_TARGETS`

The `validateRegistry` function in `src/core/registry/index.ts` checks that every command template's `target` field maps to a real CLI command. If a command template says `target: work restore` but `"work restore"` isn't in `DEFAULT_COMMAND_TARGETS`, validation fails and the registry throws.

Added `"work restore"` to the set:

```typescript
const DEFAULT_COMMAND_TARGETS = new Set([
  ...
  "work list",
  "work restore",  // NEW
]);
```

### Defensive Loading

**What was wrong:** Both `loadFromFilesystem()` and `loadBundled()` would crash the entire registry if any single template failed to parse. The error from one malformed `SKILL.md` would propagate up and cause `getRegistry()` to throw, making ALL templates unavailable — including the hundreds of valid ones.

This is catastrophically bad for a tool that agents use constantly. A typo in one template file would silently break the entire system until someone figured out which file was corrupted.

**The fix:** Wrap each template parse in try-catch, emit a console.warn, and skip the bad template:

```typescript
try {
  const template = parseSkillTemplate(filePath, content);
  template.name = entry.name;
  skills.push(template);
} catch (err) {
  console.warn(
    `[registry] Skipping invalid skill template at ${filePath}: ${(err as Error).message}`
  );
}
```

The same pattern for agents and commands in both `loadFromFilesystem` and `loadBundled`.

**Design trade-off:** Silently skipping bad templates means a user might not immediately notice their template is broken. But the `console.warn` ensures it shows up in the output, and a broken template being absent is far better than all templates being absent. The user can fix the template and the registry will pick it up on the next call (the cache is keyed per invocation).

---

## 18. Template Updates: Commands and `kernel-do` Agent

### Command Templates

Removed 71 commands that were Claude Code UI-specific (auth, billing, session management, etc.) — these don't belong in an agent-agnostic tool.

Kept and rewrote 10 generic dev workflow commands:

- `batch.md` — running multiple operations in sequence
- `debug.md` — structured debugging workflow
- `init.md` — project initialization
- `loop.md` — iterative improvement loop
- `plan.md` — planning that detects kernel context
- `review.md` — code review workflow
- `schedule.md` — scheduling and prioritization
- `security-review.md` — security audit workflow
- `simplify.md` — code simplification
- `team-onboarding.md` — new contributor onboarding

`plan.md` was specifically merged with the kernel-plan flow. It detects whether a `kernel/` directory exists, classifies the scope of what's being planned (initiative/project/milestone/work item), interviews the user, and then creates the appropriate kernel artifacts via CLI commands. When no kernel context exists, it falls back to generic planning. This makes it useful in both kernel-enabled and non-kernel projects.

### `kernel-do` Agent: Step 3 Instruction Bug

**What was wrong:** Step 3 of the mandatory protocol said:

> "Mark the task done using `kernel work status` updates to `kernel/work/<id>/work.yaml`"

This is wrong on two counts:
1. `kernel work status` is a read command that shows status. It does not mark anything done.
2. Directly editing `work.yaml` is explicitly what the CLI is supposed to abstract away. An agent following this instruction would bypass the CLI and produce inconsistent state (e.g., not syncing `tasks.md`, not updating the pointer, not appending the journal).

**The fix:**

> "Mark the task done with `kernel work done <taskId>`"

This is the actual command. It updates `work.yaml`, syncs `tasks.md`, appends the journal, and is the correct operation.

### `kernel-do` Agent: Missing Handoffs

**What was wrong:** The `handoffs` section in `AGENT.md` was completely absent. The body text said "hand off to `kernel-plan` first" in two places, but the YAML frontmatter had no `handoffs:` array. Most agent runtimes that support handoffs read this from the frontmatter, so the instruction in the body was dead text — clicking a "hand off" button would do nothing.

**The fix:** Added the `handoffs` array:

```yaml
handoffs:
  - label: Replan (Blocked)
    agent: kernel-plan
    prompt: Execution is blocked and the plan needs revision before work can continue.
    send: false
  - label: Replan (Scope Change)
    agent: kernel-plan
    prompt: A scope change has been discovered during execution.
    send: false
```

`send: false` means the handoff prompt is shown to the user for review before being sent, which is appropriate for a non-trivial context switch between agents.

---

## 19. Test Coverage

### New Tests Added

**`workflow.test.ts`** — 7 new test cases:

1. **`listWork` returns all active items and current pointer** — creates two items, verifies both appear in list with correct progress counts, verifies pointer points to most recently created item.

2. **`archiveWork` warns about incomplete tasks** — creates item, completes one task, archives, verifies `warnings` array contains the count of incomplete tasks.

3. **`archiveWork` with all tasks done produces no warnings** — completes all four default tasks, archives, verifies `warnings` is `undefined`.

4. **`archiveWork` auto-advances pointer to next active item** — creates two items, archives the active one (b), verifies pointer now points to (a).

5. **Resolves work item automatically when only one exists** — creates two items, archives one, verifies remaining item is resolved automatically even without an explicit ID.

6. **Exact task ID match does not collide on shared prefix** — writes a custom `tasks.md` with two tasks sharing a `"verify-"` prefix, completes one by full slug, verifies only that one is checked.

7. **`completeWorkTask` appends journal entry** — verifies journal contains "Completed task: ..." after completion.

8. **`archiveWork` appends journal entry before moving** — verifies the journal file in the archive dir contains the archive entry.

9. **`listArchivedWork` returns archived items** — creates, archives, lists archived, verifies item appears with correct `id` and `archivedDir`.

10. **`restoreWork` moves item back to active** — full round-trip: create, archive, restore, verify active list contains item again, verify archived list no longer contains it, verify pointer updated.

11. **`restoreWork` appends journal entry** — verifies "Restored from archive" in journal after restore.

12. **`restoreWork` rejects unknown work ID** — verifies correct error thrown.

**`hierarchy.test.ts`** — 8 new test cases:

1. **Preserves edited initiative, project, and milestone docs** — writes custom content to all markdown files, runs all plan/done operations, verifies content unchanged.

2. **Creates `plan.md` for initiative and milestone** — verifies both files exist after creation.

3. **`planInitiative` and `planMilestone` return `planPath`** — verifies the path contains `"plan.md"`.

4. **Sets `doneAt` on all hierarchy levels when marked done** — reads raw YAML after done operations, verifies `doneAt:` appears in each file.

5. **`doneInitiative` warns when linked projects are still active** — verifies warning contains count.

6. **`doneProject` warns when linked milestones are still active** — same pattern.

7. **`doneMilestone` warns when linked work items are still active** — same pattern.

8. **Done functions produce no warnings when all children are complete** — marks all children done before parent, verifies no warnings.

9. **Stores target date on project and milestone records** — passes `targetDate`, reads YAML, verifies field persisted correctly.

10. **List functions return all records with correct status** — creates two of each type, marks one done, verifies list returns both with correct status values.

11. **Rejects missing parent links and invalid IDs** — all six rejection cases covered.

### Test Philosophy

The tests use a temporary directory for every test case (`mkTmpDir`) and clean it up in `afterEach`. This means:
- Tests are fully isolated from each other
- Tests are isolated from the developer's actual `kernel/` directory
- Tests run in parallel without stepping on each other
- Tests don't leave artifacts behind

The `package.json` seeding (`'{"name":"kernel-test"}'`) is required because `findProjectRoot` walks upward looking for `package.json` or `.git`. Without it, the function would walk all the way to the filesystem root before falling back to `startDir`.

---

## 20. What Was Not Changed (and Why)

### `findProjectRoot` Walking Algorithm

The root-finding algorithm walks upward from `startDir` looking for `.git` or `package.json`. This works but has a subtle issue: in a monorepo, there might be multiple `package.json` files at different depths. The current algorithm stops at the first one it finds, which might be a nested package rather than the monorepo root.

This was not changed because:
1. The fix would require knowing what "root" means in a monorepo context (workspace root vs. package root), which is project-specific.
2. A `kernel.json` or `.kernelrc` file at the project root would be a cleaner marker, but adding a new config file format is a feature, not a bug fix.
3. The current behavior is at least deterministic and predictable.

### Registry Validation Still Runs After Loading

`validateRegistry` runs after all templates are loaded, checking cross-references (e.g., a skill in an agent's `availableSkills` must actually exist). This validation still throws on invalid cross-references. The defensive loading change (section 17) prevents individual template parse errors from crashing the load, but cross-reference validation errors still fail hard.

This is intentional. Cross-reference errors are configuration bugs that must be fixed — there's no sensible way to "skip" a valid template that references a non-existent dependency. Parse errors, by contrast, are usually malformed YAML or missing required fields, which should be skippable.

### Journal Format

The journal format is plain Markdown with bullet-list entries:

```markdown
# Journal

- 2025-04-17T10:00:00.000Z: Created work item `build-analytics-dashboard`.
- 2025-04-17T14:23:11.000Z: Completed task: Clarify scope and success criteria
- 2025-04-17T16:45:00.000Z: Archived work item
```

A structured format (JSON, YAML) would be easier to parse programmatically but harder for humans to read and edit. Since the journal's primary consumers are humans and AI agents that read Markdown natively, the plain text format is more valuable. Parsing journal entries programmatically (e.g., to build a timeline view) can always be done with a simple regex.

### No `workDone` Command Separate From `workArchive`

Some product management tools distinguish between "mark done" (close the ticket) and "archive" (move to storage). Kernel currently collapses these into one: `archiveWork` is the "done" operation. This is intentional for the current scope — work items are atomic enough that archiving is the natural closure. Adding a separate `done` state without archive would require a second status transition, more state machine complexity, and more UX surface area, for limited additional value. If the need arises, `WorkRecord.status` already includes `"done"` to accommodate it.

---

## Summary of All Files Changed

| File | Change |
|------|--------|
| `src/core/utils/slugify.ts` | Created — extracted shared slugify function |
| `src/core/work/types.ts` | Added `"done"` to status unions; added `doneAt?` to all records |
| `src/core/work/index.ts` | Major: dual-indexing, syncTaskMarkdown fix, prefix match removal, pointer recovery, listWork, archiveWork improvements, appendJournal, listArchivedWork, restoreWork, EXDEV fallback |
| `src/core/initiative/index.ts` | Added plan.md creation, planPath return, doneAt, cascade warnings, resolveId fallback |
| `src/core/project/index.ts` | Added targetDate option, doneAt, cascade warnings, resolveId fallback |
| `src/core/milestone/index.ts` | Added plan.md creation, planPath return, targetDate option, doneAt, cascade warnings, resolveId fallback |
| `src/core/registry/index.ts` | Added "work restore" to targets; defensive per-template error handling |
| `src/cli/commands/work.ts` | Added listArchivedWork, restoreWork imports; work list --archived flag; work restore subcommand |
| `src/cli/commands/project.ts` | Added --target-date option |
| `src/cli/commands/milestone.ts` | Added --target-date option |
| `src/templates/commands/` | Deleted 71 Claude-specific commands; rewrote 10 generic workflow commands; added kernel-work-restore.md, kernel-work-list.md |
| `src/templates/agents/kernel-do/AGENT.md` | Fixed step 3 instruction; added handoffs array |
| `src/core/work/__tests__/workflow.test.ts` | Added 12 new test cases |
| `src/core/work/__tests__/hierarchy.test.ts` | Added 11 new test cases |

**Final state: 172 tests, 0 failures, 0 TypeScript errors.**
