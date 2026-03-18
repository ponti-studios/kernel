# Finding the Right Words: Naming Unification in a Distributed System

**Date**: February 2026  
**Audience**: Engineers working with naming conventions across large codebases

---

## Why This Document Exists

Names are the first interface between a system and its users. They appear in documentation, in error messages, in configuration files, in skill metadata, and in the mental models that developers carry while working. When a system uses inconsistent names for the same concept, it creates cognitive friction that accumulates over time.

This document captures an exploration and proposed solution for unifying the naming in Ghostwire, which had evolved to use two parallel terms—"ralph" (for the self-referential loop hook) and "boulder" (for state management)—where a single, coherent term was desired.

---

## The Problem: Two Names for One Thing

### How It Happened

The dual terminology emerged from two independent threads of development:

**Ralph**: The "ralph-loop" hook was named as an homage to Anthropic's Ralph Wiggum plugin—a self-referential, looping agent pattern. The name was playful and memorable, but it introduced a term that users had to learn without clear semantic meaning.

**Boulder**: State management for active plans used "boulder" as a metaphor—the boulder rolls forward, accumulating state, never quite stopping. Like ralph, it was memorable but arbitrary.

Neither name was "wrong," but having both meant users had to learn two terms where one would suffice. More importantly, neither term reflected the system's actual purpose: continuous, intelligent work automation.

### The Discovery

An audit revealed the scope of the naming fragmentation:

| Term | Occurrences | Files Affected |
|------|-------------|----------------|
| ralph | 153 | 33 files |
| boulder | 213 | 23 files |

The references spanned:
- Source code (`src/orchestration/hooks/ralph-loop/`, `src/execution/boulder-state/`)
- Configuration schemas (`ralph_loop` config key, `boulder_state` types)
- Documentation (`docs/reference/modes.md`, `docs/reference/features.md`)
- System directives (`RALPH_LOOP: "RALPH LOOP"`)
- Skill metadata (`src/execution/builtin-skills/ralph-loop/SKILL.md`)
- Templates (`RALPH_LOOP_TEMPLATE`, `CANCEL_RALPH_TEMPLATE`)
- Test assertions ("Ralph Loop Complete!", "Ralph Loop Stopped")

### Why This Matters

Naming fragmentation creates problems at multiple levels:

**User confusion**: New users encounter both terms without understanding their relationship. "Is ralph-loop different from boulder? Are they related? Do I need both?"

**Documentation burden**: Every piece of documentation must explain both terms and their relationship. This multiplies the documentation surface area.

**Configuration complexity**: Users configuring the system encounter two config namespaces (`ralph_loop.*`, `boulder_state.*`) without understanding the boundary.

**Maintenance overhead**: Bug fixes and feature development must update code in two parallel namespaces, increasing the chance of inconsistencies.

---

## The Decision: Unified Naming

### The Candidate

After exploring several options, the team converged on **Ultrawork** as the unified term:

- **Meaningful**: "Ultra" (beyond) + "work" (the domain) conveys "beyond ordinary work automation"
- **Distinctive**: Unlikely to conflict with existing ecosystem terms
- **Professional**: Suitable for documentation and user-facing communication
- **Singular**: One term replaces two, halving the naming surface area

### What Was Rejected

**"Hook" or "Loop"**: These terms describe mechanisms, not identity. "Hook" is generic across the industry; "loop" describes what ralph did, not what the system is.

**"Agent"**: Too generic. Every agentic system uses "agent." This wouldn't differentiate or unify.

**Keeping both terms with clear boundaries**: Some proposed defining clear scopes—"ralph for hooks, boulder for state." This was rejected because it preserved the cognitive overhead without solving the fundamental problem.

**No name (use internal identifiers only)**: Removing user-facing names entirely and using UUIDs or hashes internally. This was rejected because meaningful names improve developer experience and documentation readability.

### Implementation Scope

The unification covers:
1. All source code references
2. All configuration keys
3. All documentation
4. All skill metadata
5. All system directives and templates
6. All test assertions

Excluded from scope:
- External ecosystem references (e.g., links to Anthropic's original Ralph Wiggum plugin)
- Historical documentation that references the old names in context of explaining the migration

---

## What Was Not Changed

**Functional behavior**: The loop hook and state management continue to function identically. Only the naming has changed.

**Configuration schemas**: The schema structure remains; only the keys are renamed. Users' existing configurations will need key renames but no structural changes.

**API contracts**: External API interfaces (if any) remain unchanged. Naming changes are internal unless explicitly exposed.

---

## Transferable Insights

### 1. Naming Is Infrastructure

Names aren't cosmetic. They form the mental model that users carry while working with a system. A good naming decision compounds positively—every new feature, every documentation page, every configuration option benefits from consistent naming. A bad naming decision compounds negatively, creating growing confusion that must be addressed repeatedly.

Treat naming decisions with the same rigor as architectural decisions.

### 2. Audits Reveal True Scope

Before the audit, the dual terminology felt manageable. After the audit—153 + 213 references across 56 files—the scope became concrete and undeniable. Audits turn vague discomfort into actionable data.

### 3. Unified Terms Enable Unified Thinking

When users have one term for one concept, they can reason about it clearly. "Ultrawork handles continuous automation." When users have two terms, they must constantly distinguish: "Ralph-loop handles the self-referential hook, but boulder-state handles plan state. Are they related? Separate?" Unified terms enable unified reasoning.

### 4. Renaming Is a One-Time Investment

The cost of renaming is high but finite. Every reference must be updated, every user must migrate their configuration, every piece of documentation must be revised. But after the investment, the system is cleaner forever. The alternative—living with inconsistent naming indefinitely—pays the cost continuously without ever completing the work.

### 5. Meaningful Names Outlast Playful Names

"Ralph" was memorable—it referenced a cultural touchstone. But it had no semantic meaning to someone encountering the system fresh. "Ultrawork" is less playful but more durable. Users don't need to know the reference to understand the concept.

When choosing names, optimize for meaning over memorability. The best names explain themselves.

---

## The Path Forward

The exploration phase is complete. The inventory of 366 total references across 56 files provides a complete map for the rename. The execution requires:

1. Automated search-and-replace across all source files
2. Manual review of documentation for context accuracy
3. Configuration migration guidance for users
4. Test suite updates for assertion strings

The investment is significant but straightforward. The result will be a system with one name for one concept—one fewer thing for users to learn, one fewer distinction for documentation to explain, one fewer pairing for maintenance to preserve.
