# Feature Specification: Plugin to Builtin Migration

**Ticket**: `044-plugin-to-builtin-migration`  
**Epic**: Migrate plugin commands and skills to builtin directories  
**Status**: Planning Phase  
**Date**: 2026-02-20

## Problem Statement

Ghostwire has duplicate component locations that create confusion:
- **Commands exist in two places**: `src/plugin/commands/*.md` (21 files) AND `src/execution/features/builtin-commands/templates/*.ts`
- **Skills exist in two places**: `src/plugin/skills/*/` (14 skills) AND `src/execution/features/builtin-skills/*/` (5 skills already migrated)

This dual system creates maintenance burden and unclear ownership.

## Goals

1. **Migrate 21 plugin commands** to TypeScript templates in `src/execution/features/builtin-commands/templates/`
2. **Migrate 14 plugin skills** to `src/execution/features/builtin-skills/`
3. **Remove namespace prefix** from commands (e.g., `ghostwire:plan_review` → `/plan_review`)
4. **Clean up plugin directory** by removing migrated components

## Success Criteria

- [ ] All 21 commands migrated from markdown to TypeScript templates
- [ ] All 14 skills migrated to builtin-skills
- [ ] Commands work without `ghostwire:` namespace prefix
- [ ] All 594 tests pass
- [ ] TypeScript compiles without errors
- [ ] Empty plugin directories removed

## Scope

### In Scope

- Convert plugin commands (.md) to TypeScript templates
- Move plugin skills to builtin-skills with all assets
- Update commands.ts to register new templates
- Update skills.ts imports
- Clean up empty plugin directories

### Out of Scope

- Changes to agent system (already done in 043)
- Changes to plugin loading system itself
- Adding new commands or skills beyond migration

## Technical Requirements

### Current Architecture

```
src/plugin/
├── commands/           # 21 markdown command files
│   └── workflows/     # 5 workflow commands
└── skills/            # 14 skill directories with SKILL.md + assets

src/execution/features/
├── builtin-commands/
│   ├── commands.ts    # Registry of command templates
│   └── templates/     # TypeScript template files (14)
└── builtin-skills/
    ├── skills.ts      # Registry of skill definitions
    └── */SKILL.md    # 5 existing skills
```

### Desired Architecture

```
src/plugin/
├── (empty - commands and skills removed)

src/execution/features/
├── builtin-commands/
│   ├── commands.ts    # Registry (updated with 21 new commands)
│   └── templates/    # 35 TypeScript templates (14 + 21)
└── builtin-skills/
    ├── skills.ts      # Registry (updated with 14 skills)
    └── */SKILL.md    # 19 skills (5 existing + 14 migrated)
```

## Commands to Migrate (21 total)

### Regular Commands (16)
1. `plan_review` → `PLAN_REVIEW_TEMPLATE`
2. `changelog` → `CHANGELOG_TEMPLATE`
3. `create-agent-skill` → `CREATE_AGENT_SKILL_TEMPLATE`
4. `deepen-plan` → `DEEPEN_PLAN_TEMPLATE`
5. `deploy-docs` → `DEPLOY_DOCS_TEMPLATE`
6. `feature-video` → `FEATURE_VIDEO_TEMPLATE`
7. `generate_command` → `GENERATE_COMMAND_TEMPLATE`
8. `heal-skill` → `HEAL_SKILL_TEMPLATE`
9. `lfg` → `LFG_TEMPLATE`
10. `quiz-me` → `QUIZ_ME_TEMPLATE`
11. `release-docs` → `RELEASE_DOCS_TEMPLATE`
12. `report-bug` → `REPORT_BUG_TEMPLATE`
13. `reproduce-bug` → `REPRODUCE_BUG_TEMPLATE`
14. `resolve_parallel` → `RESOLVE_PARALLEL_TEMPLATE`
15. `resolve_pr_parallel` → `RESOLVE_PR_PARALLEL_TEMPLATE`
16. `resolve_todo_parallel` → `RESOLVE_TODO_PARALLEL_TEMPLATE`
17. `sync-tutorials` → `SYNC_TUTORIALS_TEMPLATE`
18. `teach-me` → `TEACH_ME_TEMPLATE`
19. `test-browser` → `TEST_BROWSER_TEMPLATE`
20. `triage` → `TRIAGE_TEMPLATE`
21. `xcode-test` → `XCODE_TEST_TEMPLATE`

### Workflow Commands (5)
- `workflows/brainstorm` → `WORKFLOWS_BRAINSTORM_TEMPLATE`
- `workflows/compound` → `WORKFLOWS_COMPOUND_TEMPLATE`
- `workflows/plan` → `WORKFLOWS_PLAN_TEMPLATE`
- `workflows/review` → `WORKFLOWS_REVIEW_TEMPLATE`
- `workflows/work` → `WORKFLOWS_WORK_TEMPLATE`

## Skills to Migrate (14 total)

1. `andrew-kane-gem-writer` → `src/execution/features/builtin-skills/andrew-kane-gem-writer/`
2. `brainstorming` → `src/execution/features/builtin-skills/brainstorming/`
3. `coding-tutor` → `src/execution/features/builtin-skills/coding-tutor/`
4. `compound-docs` → `src/execution/features/builtin-skills/compound-docs/`
5. `create-agent-skills` → `src/execution/features/builtin-skills/create-agent-skills/`
6. `dhh-rails-style` → `src/execution/features/builtin-skills/dhh-rails-style/`
7. `dspy-ruby` → `src/execution/features/builtin-skills/dspy-ruby/`
8. `every-style-editor` → `src/execution/features/builtin-skills/every-style-editor/`
9. `file-todos` → `src/execution/features/builtin-skills/file-todos/`
10. `frontend-design` → `src/execution/features/builtin-skills/frontend-design/`
11. `gemini-imagegen` → `src/execution/features/builtin-skills/gemini-imagegen/`
12. `git-worktree` → `src/execution/features/builtin-skills/git-worktree/`
13. `ralph-loop` → `src/execution/features/builtin-skills/ralph-loop/`
14. `rclone` → `src/execution/features/builtin-skills/rclone/`
15. `skill-creator` → `src/execution/features/builtin-skills/skill-creator/`

## Implementation Notes

### Command Migration Pattern

Each markdown command like:
```markdown
---
name: plan_review
description: Have multiple specialized agents review a plan in parallel
argument-hint: "[plan file path or plan content]"
---

Have @agent-dhh-rails-reviewer @agent-kieran-rails-reviewer @agent-code-simplicity-reviewer review this plan in parallel.
```

Becomes TypeScript:
```typescript
export const PLAN_REVIEW_TEMPLATE = `Have @agent-dhh-rails-reviewer @agent-kieran-rails-reviewer @agent-code-simplicity-reviewer review this plan in parallel.`;
```

With frontmatter fields mapped to command definition properties.

### Skill Migration Pattern

Move entire directory:
- `src/plugin/skills/file-todos/` → `src/execution/features/builtin-skills/file-todos/`
- Includes: `SKILL.md`, `assets/`, `references/`

Update `skills.ts` import path.

## Dependencies

### Internal
- `src/execution/features/builtin-commands/commands.ts` - Command registry
- `src/execution/features/builtin-commands/templates/` - Template location
- `src/execution/features/builtin-skills/skills.ts` - Skill registry
- `src/execution/features/builtin-skills/` - Skill location

### External
- Bun (package manager)
- TypeScript

## Timeline Estimate

- **Phase 1**: Migrate 21 commands (~3 hours)
- **Phase 2**: Migrate 14 skills (~2 hours)  
- **Phase 3**: Cleanup and testing (~1 hour)
- **Total**: ~6 hours

## Acceptance Criteria

1. **Commands work** - All 21 commands execute correctly without namespace prefix
2. **Skills load** - All 14 skills available in skill loader
3. **Tests pass** - All 594 tests pass
4. **No build errors** - TypeScript compiles cleanly
5. **Cleanup complete** - Empty plugin directories removed
