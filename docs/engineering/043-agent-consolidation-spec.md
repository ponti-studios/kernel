# Unifying the Agent Definition System: A Technical Narrative

**Branch**: `043-agent-consolidation-spec`  
**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone dealing with duplicate systems and consolidation decisions

---

## Why This Document Exists

When a system evolves through different approaches, it often ends up with parallel implementations that solve the same problem in different ways. Each approach was reasonable when introduced, but the combination creates confusion and maintenance burden. This document explores that pattern—specifically, how Ghostwire ended up with two ways to define agents, and how it consolidated them into one.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **parallel implementation and canonical form problem**—specifically, a case where the same concept (agents) was being defined in two different formats (TypeScript code and Markdown) with different naming conventions, loaded through different systems, and requiring mental overhead to understand which version was "real."

This is a common pattern in evolving systems: when a new approach is introduced, the old approach isn't always retired. Both coexist, and over time it becomes unclear which is authoritative.

### How Did It Manifest?

The symptoms were practical confusion:

- 38 agents defined as TypeScript files in `src/orchestration/agents/*.ts` using factory functions
- 29 agents defined as Markdown files in `src/plugin/agents/*.md` with YAML frontmatter
- Different naming conventions: code used `reviewer-security`, markdown used `security-sentinel`
- Both systems were loaded and merged in `config-composer.ts`, creating potential conflicts

When you wanted to modify an agent, you had to answer: which version? Code or Markdown? What happens when both exist? The answer required understanding both systems and their interaction.

### Why Did It Emerge?

This emerged through **incremental capability building without cleanup**. The code-defined agents came first—the natural way to write TypeScript code. Then the markdown format was introduced, likely to enable easier customization by non-developers. Both were loaded, both were valid, and neither was clearly "the" answer.

The markdown format was a feature for users who wanted to customize agents without writing TypeScript. But it was added on top of the existing system rather than replacing it. This is a common pattern: new capability, old capability, no retirement.

---

## The Solution

### Guiding Principles

Two principles guided the consolidation:

**One canonical format reduces confusion.** When two ways to define the same thing exist, every future decision must consider both. Consolidating to one format (markdown) removes that cognitive overhead.

**Migration should preserve functionality.** The goal wasn't to change what agents do, only to change how they're defined. All agent behavior, prompts, and metadata had to survive the migration unchanged.

### Architectural Choices

The solution had several parts:

1. **Convert code-defined agents to markdown**: All 38 TypeScript agent files were converted to markdown format with YAML frontmatter. The behavior was preserved; the format changed.

2. **Standardize naming convention**: Markdown agents used a different naming pattern than code agents. The solution adopted the code-based naming (kebab-case like `reviewer-security`).

3. **Remove duplicate markdown agents**: The 29 markdown agents in `src/plugin/agents/` contained duplicates of the code-defined agents. These were deduplicated—only one version remains.

4. **Update agent loading system**: The loading logic was updated to read markdown files instead of TypeScript code, becoming the single entry point.

### What Was Considered and Rejected

We considered keeping code-defined agents and just improving the loading system. This was rejected because it preserved two systems and the confusion they create. Consolidation was the goal.

We considered moving to code-only and deprecating markdown. This was rejected because the markdown format was specifically added for user customization—removing it would remove a valuable feature.

We considered hybrid support (both code and markdown, with precedence rules). This was rejected because hybrid support is complexity that compounds. Every future question about "which version wins?" requires answering. Simplicity is valuable.

---

## The Implementation

The implementation converted 38 TypeScript agent files to markdown format:

```
Before: src/orchestration/agents/reviewer-security.ts (factory function)
After:  src/orchestration/agents/reviewer-security.md (YAML frontmatter)
```

The markdown format included all the metadata that was previously in the TypeScript code:

```yaml
---
id: reviewer-security
name: Security Code Reviewer
purpose: Review code for security vulnerabilities
models:
  primary: claude-opus-4.5
  fallback: gpt-5.2
temperature: 0.1
tags:
  - security
  - code-review
---
# Security Code Reviewer
[Agent description and prompt]
```

Loading was updated to scan for `.md` files instead of `.ts` files, parse the YAML frontmatter, and return agents in the same format the code-based system produced.

---

## What Was Not Changed

This was a format migration, not a behavior change:

- **Agent behavior**: All 38 agents do the same things they did before
- **Agent names**: User-facing agent names remained the same for compatibility
- **Prompts and metadata**: All agent prompts, descriptions, and metadata preserved
- **Plugin system**: User/community agents in `src/plugin/agents/` were not changed

---

## Transferable Insights

**Parallel systems accumulate.** When a new approach is introduced, the old one often persists. This is natural—new approaches are added to solve problems, not to replace working systems. But the accumulation creates complexity that must eventually be addressed.

**Consolidation requires choosing a canonical form.** When two ways to define the same thing exist, the question isn't "which is better?" but "which creates less confusion going forward?" The answer is usually "one."

**Migration preserves behavior, changes format.** The goal isn't to change what the system does but to change how it's maintained. Format changes should be invisible to users—only developers see the difference.

**User customization is valuable.** The markdown format was kept because it enables non-developers to customize agents. That capability is worth preserving even if it requires more migration effort.

---

## Closing

The core insight is that parallel systems are a tax on maintainability. Every future decision about agents had to consider two formats, two naming conventions, two loading systems. The cost wasn't in any single decision—it was in the accumulated overhead of always having to reason about both.

Consolidation removed that overhead. Now there's one way to define agents, one loading system, one naming convention. The system is simpler, and developers can focus on what agents do rather than which format they use.