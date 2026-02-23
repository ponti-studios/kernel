---
title: Compound to Learnings Rebranding Plan
type: refactor
date: 2026-02-22
---

# Compound to Learnings Rebranding Plan

## Overview

Rename all "compound" references to "learnings" throughout the Ghostwire codebase. Also rename "solutions" directory to "learnings" for consistency.

## Naming Summary

| Old | New |
|-----|-----|
| `/workflows:compound` | `/workflows:learnings` |
| `compound-docs` | `learnings` |
| `docs/solutions/` | `docs/learnings/` |
| `CompoundEngineeringConfigSchema` | Remove entirely (dead config) |

## Reference Categories

### 1. Source Code to UPDATE

| File | Changes |
|------|---------|
| `src/platform/config/schema.ts` | Remove `CompoundEngineeringConfigSchema`, remove `compound_engineering` from FeaturesConfigSchema, remove `"grid:doc-compound"`, remove `"ghostwire:workflows:compound"` |
| `src/execution/features/builtin-commands/commands.ts` | Rename `WORKFLOWS_COMPOUND_TEMPLATE` → `WORKFLOWS_LEARNINGS_TEMPLATE`, rename command to `"ghostwire:workflows:learnings"`, update description |
| `src/execution/features/builtin-commands/types.ts` | Rename `"ghostwire:workflows:compound"` → `"ghostwire:workflows:learnings"` |
| `src/execution/features/builtin-commands/templates/workflows/compound.ts` | Rename file to `learnings.ts`, rename template constant, replace all "compound" with "learnings", replace "docs/solutions/" with "docs/learnings/" |
| `src/execution/features/builtin-commands/templates/deepen-plan.ts` | Update `/workflows:compound` → `/workflows:learnings`, update `docs/solutions/` → `docs/learnings/` |
| `src/execution/features/builtin-skills/skills.ts` | Rename `"compound-docs"` → `"learnings"` |
| `src/execution/features/imports/claude/migration.ts` | Remove compound_engineering migration logic |

### 2. Skill Directory to RENAME

| Old Path | New Path |
|----------|----------|
| `src/execution/features/builtin-skills/compound-docs/` | `src/execution/features/builtin-skills/learnings/` |

### 3. Test Files

#### Delete (compound-specific):
- `tests/compound/foundation.test.ts`
- `tests/compound/regression.test.ts`
- `tests/compound/commands.test.ts`
- `tests/compound/skills.test.ts`
- `tests/compound/` directory

#### Update (partial references):
| File | Changes |
|------|---------|
| `tests/naming-cutover.test.ts` | Verify the legacy naming references are eliminated |
| `tests/commands.test.ts` | Align with command naming conventions, referencing current command catalog |
| `tests/skills.test.ts` | Align with skill naming conventions, referencing current skill catalog |
| `tests/foundation.test.ts` | Ensure foundation tests reflect canonical artifacts |
| `tests/regression.test.ts` | Confirm regressions remain guarded for current agents/commands/skills |

### 4. Documentation Files

#### Delete entirely:
- `docs/plans/2026-02-07-compound-validation-checklist.md`
- The February 6, 2026 true merge plan that centered on the Compound Engineering initiative (delete the associated doc)
- The February 7, 2026 phase 2 core integration plan that documented Compound Engineering (delete that doc)

#### Update (legacy references preserved for archival purposes):
| File | Changes |
|------|---------|
| `docs/plans/2026-02-07-feat-unified-plugin-architecture-plan.md` | Remove compound refs, update solutions→learnings |
| `docs/plans/2026-02-06-configuration-migration-system.md` | Remove compound refs, update solutions→learnings |
| `docs/plans/2026-02-20-refactor-agent-renaming-plan.md` | Remove compound refs, update solutions→learnings |
| `docs/plans/2026-02-06-feat-unified-opencode-plugin-architecture-plan.md` | Remove compound refs, update solutions→learnings |
| `docs/plans/2026-02-06-component-mapping-strategy.md` | Remove compound refs, update solutions→learnings |
| `docs/plans/2026-02-06-feat-unified-opencode-plugin-architecture-plan-deepened.md` | Remove compound refs, update solutions→learnings |
| `docs/AGENTS-COMMANDS-SKILLS.md` | Remove compound, update solutions→learnings |
| `docs/guides/agents-commands-quick-reference.md` | Remove compound, update solutions→learnings |
| `docs/guides/agents-and-commands-explained.md` | Remove compound, update solutions→learnings |
| `docs/concepts/agents-commands-skills-unified.md` | Remove compound refs, update solutions→learnings |

#### Keep as historical (no change):
- `.ghostwire/specs/044-plugin-to-builtin-migration/` - Historical migration specs

### 5. Plugin Documentation

| File | Changes |
|------|---------|
| `src/plugin/CLAUDE.md` | `/workflows:compound` → `/workflows:learnings` |
| `src/plugin/README.md` | `/workflows:compound` → `/workflows:learnings`, `compound-docs` → `learnings` |
| `CONTRIBUTING.md` | Remove compound migration reference |

### 6. Ignorable (Not the feature)

These are unrelated uses:
- "compound adjectives" in style guide docs
- "knowledge compounds" in coding tutor SKILL.md

## Implementation Steps

### Phase 1: Source Code Updates

1. Edit `src/platform/config/schema.ts`:
   - Remove `CompoundEngineeringConfigSchema` definition
   - Remove `compound_engineering` from `FeaturesConfigSchema`
   - Remove `"grid:doc-compound"` from enum
   - Remove `"ghostwire:workflows:compound"` from enum

2. Rename `src/execution/features/builtin-skills/compound-docs/` → `learnings/`

3. Rename `src/execution/features/builtin-commands/templates/workflows/compound.ts` → `learnings.ts`

4. Edit `src/execution/features/builtin-commands/commands.ts`:
   - Update import: `WORKFLOWS_COMPOUND_TEMPLATE` → `WORKFLOWS_LEARNINGS_TEMPLATE`
   - Rename command: `"ghostwire:workflows:compound"` → `"ghostwire:workflows:learnings"`
   - Update template variable usage
   - Update description to use "learnings"

5. Edit `src/execution/features/builtin-commands/types.ts`:
   - Rename type: `"ghostwire:workflows:compound"` → `"ghostwire:workflows:learnings"`

6. Edit `src/execution/features/builtin-skills/skills.ts`:
   - Rename skill: `"compound-docs"` → `"learnings"`

7. Edit `src/execution/features/imports/claude/migration.ts`:
   - Remove all `compound_engineering` migration logic

8. Edit `src/execution/features/builtin-commands/templates/deepen-plan.ts`:
   - Replace `/workflows:compound` → `/workflows:learnings`
   - Replace `docs/solutions/` → `docs/learnings/`

9. Edit template file `src/execution/features/builtin-commands/templates/workflows/learnings.ts`:
   - Rename export: `WORKFLOWS_COMPOUND_TEMPLATE` → `WORKFLOWS_LEARNINGS_TEMPLATE`
   - Replace all "compound" → "learnings"
   - Replace "docs/solutions/" → "docs/learnings/"

### Phase 2: Test Files

1. Delete `tests/compound/` directory
2. Update partial references in test files:
   - Remove compound test cases
   - Replace `solutions` → `learnings` where appropriate

### Phase 3: Documentation

1. Delete obsolete plan files
2. Update docs to rename compound→learnings and solutions→learnings

### Phase 4: Directory Rename (solutions → learnings)

1. Rename `docs/solutions/` → `docs/learnings/`

### Phase 5: Verification

1. Run `bun run typecheck` - Verify no type errors
2. Run `bun test` - Verify all tests pass
3. Run `grep -ri "compound" src/` - Confirm no remaining references
4. Run `grep -ri "solutions" src/` - Confirm references updated

## Acceptance Criteria

- [ ] `/workflows:learnings` command works
- [ ] `learnings` skill available
- [ ] `docs/learnings/` directory exists
- [ ] No "compound" references in source code
- [ ] All tests pass
- [ ] TypeScript compiles without errors
