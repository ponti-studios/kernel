# Lifecycle Clarity: From Spec to Workflow

**Date**: February 2026  
**Audience**: Engineers working with planning and execution workflows

---

## Why This Document Exists

Every workflow has a lifecycle—a sequence of states that work passes through from creation to completion. When these lifecycles are clear, users know what to expect at each stage. When they're unclear, users guess, get confused, or work against the system instead of with it.

This document explains the consolidation of Ghostwire's planning lifecycle from two parallel command families (`ghostwire:spec:*` and `ghostwire:workflows:*`) into a single canonical family (`ghostwire:workflows:*`).

---

## The Problem: Two Ways to Do the Same Thing

### The Original State

Ghostwire had evolved to support two parallel command families:

**`ghostwire:spec:*`**: The original planning commands
- `ghostwire:spec:plan`: Create a specification
- `ghostwire:spec:create`: Create from specification
- `ghostwire:spec:workflow`: Convert to workflow

**`ghostwire:workflows:*`**: The newer planning commands
- `ghostwire:workflows:plan`: Plan comprehensive solution
- `ghostwire:workflows:create`: Create workflow
- `ghostwire:workflows:work`: Execute workflow
- `ghostwire:workflows:review`: Review and iterate
- `ghostwire:workflows:status`: Show status
- `ghostwire:workflows:complete`: Mark complete

The relationship was unclear:
- Were these the same thing with different names?
- Did one supersede the other?
- Were they meant for different use cases?
- Which should a new user learn?

### User Confusion

The duplication created predictable confusion:

1. **New users**: "Which family should I use? What's the difference?"
2. **Experienced users**: "Do the spec commands still work? Should I migrate?"
3. **Documentation**: Every document had to explain both, their relationship, and which to prefer

### The Technical Debt

Maintaining two command families meant:
- Two sets of command handlers to keep in sync
- Two documentation pages to update
- Two mental models for users to maintain
- Twice the surface area for bugs

---

## The Decision: Workflows Only

### Why Not Keep Both?

**"They serve different purposes"**: The spec family was for specifications; the workflows family was for execution.

This distinction was artificial. A specification in Ghostwire is simply a workflow in the planning phase. The artifact model is identical; only the framing differed.

**"Users are used to spec commands"**: Changing them would break existing muscle memory.

The migration window was intentionally closed. The breaking change was accepted as the cost of simplification. Users who relied on `ghostwire:spec:*` commands received clear error messages directing them to the canonical `ghostwire:workflows:*` equivalents.

### The Canonical Lifecycle

The consolidated lifecycle is:

1. **`/ghostwire:workflows:plan`**: Create a plan. This is the entry point for all planned work.
2. **`/ghostwire:workflows:create`**: Formalize the plan into a workflow. Allocate resources, set timelines.
3. **`/ghostwire:workflows:work`**: Execute the workflow. Drive the work forward.

From any stage, users can:
- **`/ghostwire:workflows:review`**: Review progress, get feedback, iterate
- **`/ghostwire:workflows:status`**: See current state
- **`/ghostwire:workflows:complete`**: Mark the work done

This is a linear progression with standard backtracking options. The mental model is simple: plan → create → work.

---

## The Artifact Model

### Where Plans Live

Canonical artifact location: `.ghostwire/plans/`

Each plan can have an optional detail directory:
```
.ghostwire/plans/<plan-id>/
├── spec.md           # The specification
├── research.md        # Background research
├── data-model.md     # Data models
├── contracts/        # Interface contracts
├── quickstart.md     # Quick start guide
├── tasks.md          # Task breakdown
├── analysis.md       # Analysis artifacts
└── checklists/       # Verification checklists
```

This structure emerged from the OpenSpec planning system. The artifact model is well-defined and comprehensive.

### Legacy Compatibility

For existing plans that used the old `ghostwire:spec:*` paths under `.ghostwire/specs/<branch>/`, a compatibility adapter attempts resolution:

1. If a legacy path is provided, look for a canonical plan in `.ghostwire/plans/` with a matching name
2. If found, serve the canonical version
3. If not found, serve the original legacy path

This adapter is temporary. Long-term, all plans should migrate to the canonical location.

---

## What Was Not Changed

**The OpenSpec planning system**: The planning commands still invoke the same underlying planning logic. Only the command names changed.

**Plan artifact structure**: The internal format of plan files remains unchanged. `spec.md` is still `spec.md`; `tasks.md` is still `tasks.md`.

**Execution behavior**: What happens when you run `/ghostwire:workflows:work` is identical to what happened before. Only the command name changed.

---

## Transferable Insights

### 1. Parallel Systems Breed Confusion

When two systems exist for the same purpose, users must understand both and their relationship. This is pure overhead—understanding two things when one would suffice.

If you're maintaining parallel systems, the question isn't "what's the difference?" but "why do both exist?" Usually, one should be retired.

### 2. Aliases Are Technical Debt

Aliasing legacy commands to new ones is a useful temporary bridge. But aliases kept indefinitely become:
- Maintenance burden (two code paths)
- Documentation complexity (two names, one explanation)
- User confusion (which do I use?)

Set a clear migration window. After it closes, remove the aliases. The short-term pain enables long-term clarity.

### 3. Lifecycle Commands Should Tell a Story

A good lifecycle command sequence tells a story: begin → middle → end. Users who understand the story can predict what commands they'll need next.

`plan` → `create` → `work` tells a clear story. Users know: first plan, then formalize, then execute.

`spec:plan` → `spec:create` → `spec:workflow` tells a confusing story. "Plan" and "create" make sense, but "workflow" as the third step is unclear. What's a workflow? How does it differ from a plan?

### 4. Entry Points Should Be Obvious

One entry point is clear. Two entry points are a choice. The choice is overhead.

If you have multiple entry points, ask: "What does a new user do first?" If the answer is "they choose," you have a UX problem. Reduce the surface area.

---

## The Rule Going Forward

**Use `ghostwire:workflows:*` commands only.** The `ghostwire:spec:*` aliases have been removed.

**Plans live in `.ghostwire/plans/`**. Legacy paths are supported temporarily but should be migrated.

**Lifecycle is linear**: plan → create → work, with review and status available at any stage.
