# Finding the Right Words: The Naming Standardization Journey

**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone facing the challenge of renaming in a large system—or wondering why it matters

---

## Why This Document Exists

Names are the first interface between humans and code. When names are inconsistent, unclear, or misleading, every future interaction with the system carries a small friction cost. That cost compounds over time. This document explores how Ghostwire renamed 29 agents from confusing metaphor-based names to clear role-based names—and why that investment was worth making.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **naming debt and clarity problem**—specifically, a case where accumulated historical names no longer communicated what they represented. Names that once made sense (or made sense to their creators) had become obstacles to understanding the system.

This category of problem is common in systems that evolve over time. New agents are added with whatever names seem appropriate in the moment. Over years, the collection becomes a taxonomy that only original authors understand.

### How Did It Manifest?

The symptoms were practical navigation problems:

- **7 different naming schemes**: `void-*`, `zen-*`, `eye-*`, `design-*`, `*-scan`, `*-check`, `*-review`, plus legacy patterns like `agent-arch`, `war-mind`, `null-audit`, `dark-runner`, `ui-build`, `docs-write-readme`

- **Unclear purpose**: Looking at `void-review-rails` told you nothing about what the agent did. Looking at `reviewer-rails` tells you immediately: it's for reviewing Rails code.

- **Inconsistent categories**: Some agents used metaphors (void, zen, eye), others used action verbs (scan, check, review), others used role descriptors. They all meant different things.

- **Dual system confusion**: 38 agents in TypeScript code, 29 in markdown format, with different naming conventions in each. Code used `reviewer-security`, markdown used `security-sentinel`.

When you wanted to find the agent that does code review, you had to know which naming scheme to search for.

### Why Did It Emerge?

This emerged through **organic naming without standards**. Each new agent was named by whoever added it, using whatever naming convention seemed natural at the time. There was no team-wide agreement on what names should communicate or what format they should use.

This is the natural state of naming in growing systems. New people add new things with new conventions. The accumulation creates inconsistency that no single person chose.

---

## The Solution

### Guiding Principles

Two principles guided the naming standardization:

**Names should communicate purpose at a glance.** A name like `reviewer-rails` tells you exactly what it is. A name like `void-review-rails` tells you nothing useful. The goal is instant recognition, not clever branding.

**Role-based prefixes create predictable categories.** When all review agents start with `reviewer-`, all research agents with `researcher-`, you can navigate by category without searching. The prefix becomes a navigation aid.

### Architectural Choices

The solution established 8 role-based prefixes:

| Prefix | Meaning | Count | Examples |
|--------|---------|-------|----------|
| `reviewer-*` | Code review specialists | 5 | reviewer-rails, reviewer-typescript |
| `researcher-*` | Knowledge researchers | 6 | researcher-docs, researcher-codebase |
| `analyzer-*` | Analysis agents | 2 | analyzer-media, analyzer-design |
| `designer-*` | Design specialists | 5 | designer-flow, designer-sync |
| `advisor-*` | Strategic advisors | 2 | advisor-architecture, advisor-strategy |
| `validator-*` | Validation/audit agents | 2 | validator-audit, validator-deployment |
| `writer-*` | Documentation writers | 1 | writer-readme |
| `editor-*` | Content editors | 1 | editor-style |
| Simple names | Orchestration/execution | 4 | operator, orchestrator, planner, executor |

All 29 agents were renamed across 6 sequential phases, each validated independently before proceeding to the next.

### What Was Considered and Rejected

We considered keeping the metaphor-based names and just adding documentation. This was rejected because documentation doesn't fix the navigation problem—you still have to know what to look for.

We considered aliases (both old and new names work). This was rejected because it preserves the confusion indefinitely. The goal was clarity, not backward compatibility.

We considered partial renaming (only the most confusing ones). This was rejected because partial solutions create inconsistent naming, which is almost as bad as the original problem.

---

## The Parallel Problem: Dual Agent Systems

While renaming, we discovered another problem: two ways to define agents. Code-defined agents (TypeScript files) and plugin markdown agents (YAML frontmatter) existed in parallel. Both were loaded, both were valid, and it wasn't clear which was authoritative.

The solution was to consolidate to markdown-only format. This had several benefits:

- **Single format**: One way to define agents, not two
- **User accessibility**: Markdown is easier for users to modify than TypeScript
- **Consistent naming**: Both code and markdown now use the same naming convention

### What Was Considered and Rejected

We considered keeping code-defined agents (TypeScript) as the primary format. This was rejected because markdown enables easier customization by non-developers, which is valuable.

We considered supporting both with precedence rules. This was rejected because hybrid support creates complexity that compounds over time.

---

## The Implementation

The implementation followed 6 phases:

1. **Orchestration** (4 agents): `void-runner` → `operator`, `grid-sync` → `orchestrator`, `zen-planner` → `planner`, `dark-runner` → `executor`

2. **Code Review** (5 agents): `void-review-rails` → `reviewer-rails`, etc.

3. **Research** (5 agents): `docs-scan` → `researcher-docs`, etc.

4. **Design** (5 agents): `flow-check` → `designer-flow`, etc.

5. **Advisory/Architecture/Documentation** (8 agents): `agent-arch` → `advisor-architecture`, etc.

6. **Legacy** (2 agents): `scan-ops` → `researcher-codebase`, `data-dive` → `researcher-world`

Each phase:
- Renamed agent files and functions
- Updated all references throughout codebase (206 references across 40 files)
- Validated with typecheck and tests
- Created single git commit

---

## What Was Not Changed

- **Agent behavior**: All 29 agents do the same things they did before
- **Agent capabilities**: Prompts, tools, and functionality unchanged
- **User-facing names**: No breaking changes to what users see

---

## Transferable Insights

**Naming standards are worth investing in.** The 6-phase rename was significant work (206 references across 40 files), but the ongoing benefit of clear names exceeds the one-time cost of fixing them.

**Role-based naming creates navigable systems.** When you know the prefix (reviewer-, researcher-, designer-), you can navigate without searching. This is valuable for both developers and users.

**Phased execution reduces risk.** Renaming 29 agents at once would be risky. Renaming 4-8 at a time, validating each phase, catches issues early and makes rollback tractable if needed.

**Dual systems are a tax.** When two ways to define agents exist, every future decision must consider both. Consolidation removes that tax.

---

## Closing

The core insight is that names are an interface. Every time a developer looks at the agent list, the names either help or hinder understanding. Metaphor-based names (`void-`, `zen-`, `eye-`) might have seemed creative or meaningful when chosen, but they became obstacles to understanding as the system grew.

Role-based names (`reviewer-`, `researcher-`, `designer-`) communicate purpose directly. You don't need to know the naming convention to understand what `reviewer-rails` does. That's the test of a good name: it explains itself.