# Directory Organization by Domain: A Technical Narrative

**Branch**: `042-reorganize-repo-topology`  
**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone navigating code organization decisions in growing codebases

---

## Why This Document Exists

When a codebase reaches a certain size, its directory structure becomes a primary interface for understanding the system. Developers navigate by exploring directories, not by reading import statements. If the structure doesn't communicate intent, every navigation becomes a search problem. This document explores what happens when a type-based organization breaks down, and how domain-based organization restores clarity.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **code organization and navigation clarity problem**—specifically, a case where the structure grouped code by what it *is* (agents, hooks, tools, features) rather than by what it *does* (orchestrates, executes, integrates). The result was a structure that made sense to the original authors but created friction for anyone trying to understand the system.

This category of problem is common in systems that grow incrementally. Early decisions about structure often reflect initial understanding, which evolves as the system matures. The original organization becomes a constraint, not a guide.

### How Did It Manifest?

The symptoms were practical navigation problems:

- "Where do I add a new lifecycle hook?" → Look in hooks/ (but why hooks and not agents?)
- "Where is agent orchestration?" → Scattered across agents/ + hooks/ (but they're conceptually related)
- "What code deals with integration concerns?" → Hidden in shared/ and mcp/ (the name tells you nothing)

The type-based grouping (agents, hooks, features, tools, shared) described implementation categories, not functional responsibilities. You could only answer "where does this go?" by understanding the existing classification system, not by understanding the domain.

### Why Did It Emerge?

This emerged through **incremental addition without periodic reorganization**. Each new capability was placed in the "obvious" type-based category. No one made a wrong decision—features went into features, tools into tools. But the accumulation created a structure that reflected implementation type rather than system responsibility.

This is the natural state of many codebases: organized by what things are, not by what they do. It's not wrong, but it reaches a threshold where it stops serving the people navigating it.

---

## The Solution

### Guiding Principles

Two principles guided the reorganization:

**Organization should reflect responsibility, not implementation.** A directory name should answer "what does this code do?" not "what kind of file is this?" When you see `orchestration/`, you know it's about coordinating other components. When you see `execution/`, you know it's about doing work.

**Similar responsibilities should live together.** If agents and hooks both orchestrate behavior, they belong in the same domain. If features and tools both execute work, they belong in the same domain. Grouping by behavioral similarity makes the system's structure predictable.

### Architectural Choices

The solution mapped the existing type-based structure to a domain-based structure:

| Before (Type-based) | After (Domain-based) | Rationale |
|---------------------|----------------------|------------|
| `src/agents/` | `src/orchestration/` | Agents orchestrate task flow |
| `src/hooks/` | `src/orchestration/` | Hooks orchestrate lifecycle |
| `src/features/` | `src/execution/` | Features execute functionality |
| `src/tools/` | `src/execution/` | Tools execute actions |
| `src/shared/` | `src/integration/` | Shared utilities connect across domains |
| `src/mcp/` | `src/integration/` | MCP servers integrate externally |
| `src/config/` | `src/platform/` | Configuration provides platform |
| `src/cli/` | `src/cli/` | CLI stays separate (user interface) |

The mapping preserved all existing code—just in a structure that communicates more clearly.

### What Was Considered and Rejected

We considered organizing by feature (email, auth, etc.) but rejected it—this is a CLI tool with a plugin architecture, not a business application. Features don't cluster that way.

We considered layer-based organization (frontend, backend) but rejected it—this is a CLI tool, not a web application. The analogy doesn't fit.

We considered keeping the type-based structure and just adding documentation. This was rejected because a confusing structure plus documentation still requires navigation of the confusing structure. The fix had to be structural.

---

## The Implementation

The implementation used a phased approach to manage risk:

1. **Phase 1**: Create import-mapping helper tool
2. **Phase 2**: Move orchestration domain (agents + hooks)
3. **Phase 3**: Move execution domain (features + tools)
4. **Phase 4**: Move integration domain (shared + mcp)
5. **Phase 5**: Move platform domain (config)
6. **Phase 6**: Update docs and YAML references

Each phase moved one domain, updated imports, validated with typecheck/build/test, then committed. This prevented the "500 imports at once" problem and made rollback possible if issues emerged.

The scale was significant: 250+ files to move, ~500 import paths to update across ~150 files, 7 domains affected. But the phased approach made it tractable.

---

## What Was Not Changed

This was a structural reorganization, not a code change. Several things were explicitly left alone:

- **Code behavior**: No functionality was modified, only relocated
- **External package API**: Exports via src/index.ts remained unchanged
- **Test files**: Tests were moved with their code but not modified
- **CLI interface**: User-facing commands stayed the same

---

## Transferable Insights

**Type-based organization works until it doesn't.** Early in a project's life, type-based (agents/, hooks/, tools/) is simple and obvious. But as the system grows, it becomes a taxonomy that only experts remember. Domain-based (orchestration/, execution/, integration/) scales better because domain names describe behavior.

**Reorganization is a navigation problem, not a code problem.** The code works either way. The question is: which structure helps developers find what they need faster? That's the standard to optimize for.

**Phased migration reduces risk.** Moving everything at once creates a large, hard-to-verify change. Moving one domain at a time creates small, verifiable commits that can be rolled back individually if issues emerge.

**Git history preservation matters.** Using `git mv` rather than `rm` + `add` preserves the history that helps future developers understand why code ended up where it did.

---

## Closing

The core insight is that directory structure is a navigation interface. When it stops serving the people using it, it becomes friction rather than help. The type-based organization made sense when the system was small; the domain-based organization serves it better now that it's larger.

This wasn't a code change—it was a communication improvement. The code does the same things, just from different locations. But the new locations answer questions that the old ones couldn't: "where would code that orchestrates other components live?" → orchestration/. That's the test of whether a structure communicates intent.