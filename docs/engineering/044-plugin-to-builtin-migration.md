# Consolidating Component Locations: A Technical Narrative

**Branch**: `044-plugin-to-builtin-migration`  
**Date**: February 2026  
**Author**: Engineering team  
**Audience**: Anyone managing duplicate locations in software systems

---

## Why This Document Exists

When software adds capabilities over time, those capabilities often land in multiple places. Some components live in plugin directories, others in builtin directories, and over time it becomes unclear which is "real" and where new components should go. This document explores that pattern—specifically, how Ghostwire had commands and skills in both plugin and builtin locations, and how it consolidated them into canonical locations.

---

## The Problem Space

### What Kind of Problem Is This?

This is a **duplicate location and ownership clarity problem**—specifically, a case where the same type of component (commands and skills) existed in two different places (plugin and builtin) with no clear rule about which was correct. The result was maintenance burden and confusion about where things belong.

This pattern emerges frequently: when plugins are introduced, they add capabilities. Later, when a "builtin" system is created, both exist. Users and maintainers must reason about which location to use or modify.

### How Did It Manifest?

The duplication was concrete:

- **Commands**: 21 markdown command files in `src/plugin/commands/` AND TypeScript templates in `src/execution/builtin-commands/templates/`
- **Skills**: 14 skills in `src/plugin/skills/` AND 5 skills in `src/execution/builtin-skills/`

The plugin commands were invoked with a `ghostwire:` namespace prefix (like `/ghostwire:plan_review`), while builtin commands were not. This was inconsistent and confusing—which commands had the prefix, which didn't, and why?

When modifying a command, you had to know which location contained the authoritative version. The answer wasn't obvious from the directory structure.

### Why Did It Emerge?

This emerged through **incremental feature addition without consolidation**. The plugin system was likely created first, allowing commands and skills to be provided as plugins. Later, the builtin system was created to provide core capabilities without requiring plugin loading. Both approaches worked, but no one decided which was canonical.

This is the natural state of features added over time: new capabilities are added where they fit, not necessarily where they should live permanently. The "temporary" location often becomes permanent.

---

## The Solution

### Guiding Principles

Two principles guided the migration:

**One canonical location reduces confusion.** When the same component type exists in two places, every future question is "which one?" Consolidating to one location removes that question.

**Builtin should be the default for core capabilities.** Plugin locations make sense for user-provided extensions, but core capabilities that come with the tool should live in builtin directories. This makes the distinction between "what comes with the tool" and "what users add."

### Architectural Choices

The migration moved everything to builtin locations:

1. **Commands**: All 21 markdown commands were converted to TypeScript templates and moved to `src/execution/builtin-commands/templates/`. The markdown files were deleted.

2. **Skills**: All 14 plugin skills were moved to `src/execution/builtin-skills/` alongside the existing 5. The plugin skill directories were deleted.

3. **Namespace removal**: Commands no longer require the `ghostwire:` prefix. `/plan_review` works directly.

4. **Registry updates**: `commands.ts` and `skills.ts` were updated to import from the new locations.

### What Was Considered and Rejected

We considered keeping both locations with clear separation (builtin for core, plugin for extension). This was rejected because it preserved the confusion about which is "real" and added the cognitive overhead of always choosing the right location.

We considered moving everything to plugin directories (the reverse). This was rejected because core capabilities should be available without plugin loading—they're part of the tool itself.

We considered creating aliases so both locations would work. This was rejected because aliases create maintenance burden and don't solve the underlying confusion—they just hide it.

---

## The Implementation

The migration was straightforward for commands:

```markdown
# Before: src/plugin/commands/plan_review.md
---
name: plan_review
description: Have multiple agents review a plan
---

Have @agent-reviewer-1 @agent-reviewer-2 review this plan.
```

```typescript
# After: src/execution/builtin-commands/templates/plan-review.ts
export const PLAN_REVIEW_TEMPLATE = `Have @agent-reviewer-1 @agent-reviewer-2 review this plan.`;
```

The frontmatter fields were mapped to command definition properties. All 21 commands were converted similarly.

Skills were moved as directories:

```
Before: src/plugin/skills/brainstorming/SKILL.md
After:  src/execution/builtin-skills/brainstorming/SKILL.md
```

All assets, references, and subdirectories moved with the skills.

The key verification was confirming all 594 tests still pass and TypeScript compiles without errors.

---

## What Was Not Changed

This was a location migration, not a behavior change:

- **Command behavior**: All commands do the same things
- **Skill behavior**: All skills work identically
- **Agent system**: Not affected by this migration
- **Plugin loading system itself**: The mechanism wasn't modified, just the contents

---

## Transferable Insights

**Duplicate locations are a maintenance burden.** Every change requires finding both locations and ensuring they're consistent. Over time, they drift. Consolidation removes that burden.

**Builtin vs. plugin has natural meaning.** Builtin is "what comes with the tool"—core capabilities that are always available. Plugin is "what users add"—extensions to the tool. This distinction is worth preserving and reinforcing.

**Migration preserves behavior, changes location.** The goal is zero user-visible change. Commands work the same, skills work the same, only the location is different.

**Namespace prefixes are technical debt.** When commands require a prefix like `ghostwire:`, it's a sign that the command system isn't unified. Removing the prefix simplifies the user experience.

---

## Closing

The core insight is that duplicate locations create maintenance overhead that compounds over time. When 21 commands exist in two places and 14 skills exist in two places, every future change requires understanding both locations and ensuring they're consistent. That's unnecessary complexity.

Consolidation removed that complexity. Now there's one location for commands, one for skills. The distinction between builtin and plugin is clear: builtin is core (always loaded), plugin is extension (user-provided). That makes the system easier to understand and maintain.