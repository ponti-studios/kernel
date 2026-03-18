# Engineering Hygiene: Protecting the Foundation

**Date**: March 2026  
**Audience**: Engineers thinking about long-term system health

---

## Why This Document Exists

Engineering hygiene is the practice of maintaining the conditions that enable productive work. Like personal hygiene, it's unglamorous—nobody celebrates brushing their teeth—but it prevents problems that would otherwise consume enormous energy to fix.

This document synthesizes two explorations from the Ghostwire project: the Quality Gates Framework (defining what "done" means for releases) and the Baseline Command/Profile Inventory (understanding what currently exists).

---

## The Problem: Unknown Unknowns

### The Baseline Challenge

Before we could improve the Ghostwire command and profile system, we needed to understand what currently existed. The inventory revealed:

- **32 commands**: From `ghostwire:code:format` to `ghostwire:workflows:work`
- **39 profiles**: From `advisor_architecture` to `writer_readme`
- **2 runtime loaders**: Direct paths for commands and profiles
- **1 export path**: For CLI export
- **Template coupling**: Direct filesystem reads in both paths

This inventory answered questions we hadn't known to ask:
- Which commands are P1 (must have parity across harnesses)? 6 commands represent ~80% of usage
- Which profiles route to `do` vs `research`? Most route to `do`; a subset route to `research`
- What's the relationship between commands and profiles? Profiles are applied to agents executing commands

### The Quality Gates Problem

When you ship software, how do you know it's ready? The intuitive answer is "when it works"—but "works" is underspecified.

Ghostwire ships in multiple contexts:
- Direct CLI usage
- VSCode extension
- Copilot integration
- Codex integration

Each context has different characteristics. A change that works perfectly in one might regress in another.

The Quality Gates Framework defines what "ready" means across these contexts:

| Gate | What It Validates | Threshold |
|------|-------------------|-----------|
| Schema Validation | All specs parse and validate | 100% pass |
| Generation Determinism | Catalogs are reproducible | 100% deterministic |
| Adapter Conformance | P1 commands ≥ 95% parity across harnesses | ≥ 95% |
| Runtime/Export Parity | Runtime and export produce equivalent outputs | 100% equivalent |

---

## The Principles

### Principle 1: Know What You Have

The inventory wasn't just a documentation exercise. It revealed:

**Concentration risk**: The P1 command set (6 commands) represents 80% of usage. If these break, most users feel it. These deserve disproportionate testing investment.

**Consumption patterns**: Understanding that profiles route to `do` vs `research` enables better default configuration. New users benefit from sensible defaults derived from aggregate patterns.

**Coupling hotspots**: Direct filesystem reads in the runtime path are a coupling risk. The inventory made these visible, enabling targeted refactoring.

### Principle 2: Define "Done" Precisely

"Done" is meaningless without criteria. Quality gates make done precise:

**100% is the only acceptable threshold for schema validation**: If any spec fails validation, the build fails. There's no "mostly valid."

**Determinism is non-negotiable**: A catalog that generates differently on identical inputs is a bug, not a feature. Reproducibility enables trust.

**Parity thresholds are explicit**: 95% for P1 commands. Not 90%, not 99%. 95%. The number is arbitrary but explicit—debate can focus on the number rather than the principle.

### Principle 3: Prevention Over Detection

Quality gates prevent bad releases rather than detecting bad releases after the fact:

- Schema validation runs on every build (CI/pre-commit)
- Generation determinism is checked on every catalog generation
- Runtime/export parity is validated before phase completion

This shifts the cost of quality from post-release debugging to pre-merge prevention.

---

## What Was Not Changed

**Command functionality**: The 32 commands continue to function identically. The inventory documented existing state.

**Profile content**: Profile prompts and routing rules remain unchanged. The inventory captured current behavior.

**Release process**: The quality gates are aspirational for future releases. Current releases follow existing processes.

---

## Transferable Insights

### 1. You Can't Improve What You Can't Measure

The first step to improving any system is understanding its current state. The inventory—32 commands, 39 profiles—was the prerequisite for every subsequent decision.

If you find yourself wanting to "clean up" or "improve" something without first understanding what exists, pause. Understanding comes first.

### 2. Concentration Deserves Attention

In any system, usage concentrates around a small core. 6 commands for 80% of usage. A few critical paths for most bugs.

Concentrated usage means concentrated impact. Changes to P1 commands affect 80% of users. This deserves testing investment proportional to impact.

### 3. Thresholds Should Be Explicit

Vague quality standards ("good enough," "mostly works") enable lazy debate. Explicit thresholds ("95% parity," "100% deterministic") enable focused discussion.

When setting thresholds, ask: "What does this number mean in practice?" If you can't answer, the threshold is too vague.

### 4. Prevention Is Cheaper Than Detection

A failing pre-commit hook costs seconds. A production incident costs hours. The math favors prevention.

Build quality gates into the development workflow. Run them early and often. The goal is to catch problems before they ship.

### 5. Coupling Is a Risk Multiplier

Direct filesystem reads in the runtime path mean that file system changes can break runtime behavior. The coupling isn't obvious until something breaks.

Map your system's coupling. Understand which components depend on which others. High coupling means a change in one place can cascade unexpectedly.

---

## The Practice Going Forward

**Every release must pass all quality gates.** Gates are defined in the Quality Gates Framework. Future releases will be blocked by failing gates.

**The baseline is the starting point.** The inventory documents current state. Future changes will be measured against this baseline.

**The P1 command set receives P1 attention.** Changes to P1 commands require extra scrutiny. Automated tests must cover P1 commands across all harnesses.

This practice is infrastructure. It enables everything else.
