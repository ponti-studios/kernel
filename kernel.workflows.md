# Kernel Workflows

This document explains how the `kernel work` flow works today, what each command does on disk, and why we chose this path instead of a traditional product-management stack.

## Overview

Kernel treats work as a local, durable artifact that lives in the repository.

Instead of pushing planning and execution state into a remote tracker first, we keep the source of truth in files that both humans and agents can read, update, diff, review, and carry forward with the codebase itself.

The `kernel work` commands operate on work items stored under:

```text
kernel/
  work/
    <work-id>/
      work.yaml
      brief.md
      plan.md
      tasks.md
      journal.md
    archive/
.kernel/
  pointers.json
```

`kernel/work/<work-id>/` is the visible work record.

`.kernel/pointers.json` stores the current active work item so commands like `kernel work plan` and `kernel work next` can work without repeatedly passing an id.

## Work Model

Every work item has:

- a stable id derived from the goal
- a goal
- a status: `active` or `archived`
- timestamps
- a task list

When a new work item is created, Kernel seeds it with these default tasks:

1. `clarify-scope` -> `Clarify scope and success criteria`
2. `implement-core-path` -> `Implement the core path`
3. `verify-behavior` -> `Verify behavior with tests`
4. `capture-followups` -> `Capture follow-up work`

This is intentional. We want every work item to begin with clarity, implementation, verification, and cleanup rather than jumping straight to code.

## Commands

### `kernel work new "build analytics dashboard"`

What it does:

- Finds the repo root by walking upward until it sees `.git` or `package.json`
- Ensures `kernel/work/`, `kernel/work/archive/`, and `.kernel/` exist
- Slugifies the goal into a work id
- Creates a unique id if the slug already exists by appending `-2`, `-3`, and so on
- Writes the full work record to `kernel/work/<id>/`
- Marks the new work item as active in `.kernel/pointers.json`

Files created:

- `kernel/work/<id>/work.yaml`
- `kernel/work/<id>/brief.md`
- `kernel/work/<id>/plan.md`
- `kernel/work/<id>/tasks.md`
- `kernel/work/<id>/journal.md`
- `.kernel/pointers.json`

Example:

```bash
kernel work new "build analytics dashboard"
```

Likely result:

```text
kernel/work/build-analytics-dashboard/
```

The brief captures the goal, the plan gives a first-pass implementation shape, the tasks file contains the checklist, and the journal records the creation event.

### `kernel work plan`

What it does:

- Resolves the current work id from `.kernel/pointers.json`
- Falls back to the only work item if exactly one exists
- Loads `work.yaml`
- Reads `tasks.md` if it exists and treats the checkbox list as the current task truth
- Rewrites `plan.md`, `tasks.md`, and `work.yaml`
- Updates the active pointer

Important behavior:

- `tasks.md` is not just a render target. If you edit its checkboxes manually, `kernel work plan` will pull those changes back into structured state.
- If the loaded record has zero tasks, Kernel restores the default four-task scaffold.

Example:

```bash
kernel work plan
```

Use this when you want to refresh the work item after editing the files, or when you want to normalize the work state before execution.

### `kernel work next`

What it does:

- Resolves the current work item
- Loads the task list
- Returns the first unchecked task
- Reports how many tasks remain
- Refreshes the active pointer

Example:

```bash
kernel work next
```

If the default task list is still intact, the first result will be:

```text
Clarify scope and success criteria
```

This command is intentionally narrow. It answers one question: what should happen next?

### `kernel work done clarify-scope`

What it does:

- Resolves the current work item
- Finds the requested task by flexible matching
- Marks the matched task complete
- Writes the updated state back to disk
- Returns the completed task title and remaining count

Matching behavior:

- exact task id match
- exact slugified title match
- prefix match on task id
- prefix match on slugified title

That means all of these can work if the current task is `clarify-scope`:

```bash
kernel work done clarify-scope
kernel work done clarify
```

This flexibility is deliberate. We want the command to be ergonomic in terminal use while still staying deterministic.

### `kernel work status`

What it does:

- Resolves the current work item
- Loads the goal and task list
- Calculates total, complete, and remaining counts
- Returns the next unchecked task
- Returns the repo-relative work directory

Example:

```bash
kernel work status
```

This is the command to run when you want the current shape of the work without mutating anything.

### `kernel work archive`

What it does:

- Resolves the current work item
- Marks the record as `archived`
- Writes the updated `work.yaml`
- Moves the work directory into `kernel/work/archive/`
- Prefixes the archive directory with the current date
- Clears `.kernel/pointers.json` if the archived item was the active one

Example:

```bash
kernel work archive
```

Likely result:

```text
kernel/work/archive/2026-04-12-build-analytics-dashboard/
```

Archiving is a real lifecycle step, not deletion. Old work remains available for review, learning, and future reference.

## Active Work Resolution

Commands that do not receive an explicit work id follow this order:

1. Use the id in `.kernel/pointers.json` if present
2. If there is exactly one work item under `kernel/work/`, use that
3. Otherwise fail and ask for a specific work id

This gives us convenience without hidden ambiguity.

## Source of Truth

The work system is deliberately split into two kinds of files:

- `work.yaml` is the structured machine-readable record
- `brief.md`, `plan.md`, `tasks.md`, and `journal.md` are the human-readable working surface

Today, `tasks.md` is especially important because Kernel reloads checkbox state from it when planning or reading work. That makes the markdown file a legitimate operational surface, not just documentation.

## Philosophy

### Work should live with the code

We want planning and execution context to move with the repository, not be trapped in a remote system, a chat transcript, or one person’s memory.

If the code moves, the work record should move too.

If a branch changes, the plan should diff with it.

If an agent needs context, it should be able to read local files directly.

### The path from idea to code should stay short

Traditional product-management flows often force a sequence like:

1. create ticket
2. groom ticket
3. move ticket through status columns
4. translate the ticket into implementation context
5. finally do the work

That can be useful for large organizations, but it adds friction when the real goal is simply to clarify, implement, verify, and close the loop.

Kernel chooses a tighter flow:

1. define the work locally
2. shape the plan where the code lives
3. execute one task at a time
4. verify with tests
5. capture follow-ups
6. archive the completed work

### We optimize for agent readability

Remote PM systems are built for dashboards, assignment, reporting, and organizational process.

Kernel is built for:

- local clarity
- fast execution
- readable context for LLM agents
- diffable state
- low ceremony

An agent can open `kernel/work/<id>/brief.md` and `tasks.md` immediately. No connector, login, network dependency, or parallel source of truth is required.

### We want less translation and less duplication

Traditional PM flows usually create at least two versions of the same work:

- the management version
- the implementation version

Those drift constantly.

Kernel is trying to collapse them:

- the visible local work artifact is the planning surface
- the same artifact is the execution surface
- the same artifact is the review surface

That does not eliminate all process. It eliminates duplicate process.

### We care about reversibility

A local file-based workflow is easy to inspect, branch, diff, back up, and restore.

That matters for humans, and it matters even more for agent systems. We do not want invisible state transitions hiding in external tools when the repo itself is the place where the work becomes real.

## Why not traditional product management flows

We are not trying to out-compete full PM tools at:

- multi-team portfolio planning
- executive reporting
- organization-wide capacity tracking
- remote workflow enforcement

We are intentionally choosing a different center of gravity:

- repo-local truth
- operator speed
- agent compatibility
- minimal overhead

Traditional PM tools optimize for coordination across people and departments.

Kernel optimizes for coordinated execution between a developer, a codebase, and one or more agents working locally.

That is why the workflow is file-based, explicit, and small.

## Recommended Way to Use It

The intended loop is:

1. `kernel work new "<goal>"`
2. read and improve `brief.md`, `plan.md`, and `tasks.md`
3. `kernel work plan`
4. `kernel work next`
5. implement the task
6. `kernel work done <task>`
7. `kernel work status`
8. repeat until complete
9. `kernel work archive`

That loop is simple on purpose. The system should help us do the work, not become the work.
