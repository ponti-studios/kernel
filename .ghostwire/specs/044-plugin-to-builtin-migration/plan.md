# Implementation Plan: Plugin to Builtin Migration

**Branch**: `044-plugin-to-builtin-migration` | **Date**: 2026-02-20 | **Spec**: `specs/044-plugin-to-builtin-migration/spec.md`

## Summary

Migrate 21 plugin commands from markdown to TypeScript templates and 14 plugin skills to builtin-skills directory, removing namespace prefixes and consolidating to single source of truth.

## Technical Context

**Language/Version**: TypeScript (Bun)  
**Primary Dependencies**: None (existing system)  
**Storage**: File-based (templates in .ts, skills in .md)  
**Testing**: Bun test (594 test files)  
**Target Platform**: OpenCode plugin  
**Project Type**: CLI plugin (monorepo structure)  
**Performance Goals**: N/A (migration only)  
**Constraints**: Must maintain backwards compatibility for command names  
**Scale/Scope**: 21 commands + 14 skills

## Constitution Check

*No constitution gates apply to this migration task.*

## Project Structure

### Source Code (repository root)

```
src/
├── execution/features/
│   ├── builtin-commands/
│   │   ├── commands.ts           # [MODIFY] Add 21 new commands
│   │   └── templates/             # [ADD] 21 TypeScript templates
│   └── builtin-skills/
│       ├── skills.ts             # [MODIFY] Update imports
│       └── */SKILL.md            # [ADD] 14 skill directories
│
└── plugin/
    ├── commands/                  # [REMOVE] 21 .md files
    └── skills/                    # [REMOVE] 14 skill directories
```

### Documentation (this feature)

```
specs/044-plugin-to-builtin-migration/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Migration mapping
├── quickstart.md        # Migration guide
└── tasks.md             # Task breakdown (generated)
```

## Complexity Tracking

> N/A - No complexity violations

## Phase 0: Outline & Research

**Status**: Complete

- [x] Analyze current plugin command loading architecture
- [x] Analyze current plugin skill loading architecture
- [x] Identify migration path and risks
- [x] Document in research.md

## Phase 1: Design & Contracts

**Status**: Complete

- [x] Document command migration mapping (data-model.md)
- [x] Document skill migration mapping (data-model.md)
- [x] Create quickstart guide (quickstart.md)

## Phase 2: Implementation

### Task Breakdown

#### Commands (21 files)

- [ ] 1. Migrate `plan_review.md` → `templates/plan-review.ts`
- [ ] 2. Migrate `changelog.md` → `templates/changelog.ts`
- [ ] 3. Migrate `create-agent-skill.md` → `templates/create-agent-skill.ts`
- [ ] 4. Migrate `deepen-plan.md` → `templates/deepen-plan.ts`
- [ ] 5. Migrate `deploy-docs.md` → `templates/deploy-docs.ts`
- [ ] 6. Migrate `feature-video.md` → `templates/feature-video.ts`
- [ ] 7. Migrate `generate_command.md` → `templates/generate-command.ts`
- [ ] 8. Migrate `heal-skill.md` → `templates/heal-skill.ts`
- [ ] 9. Migrate `lfg.md` → `templates/lfg.ts`
- [ ] 10. Migrate `quiz-me.md` → `templates/quiz-me.ts`
- [ ] 11. Migrate `release-docs.md` → `templates/release-docs.ts`
- [ ] 12. Migrate `report-bug.md` → `templates/report-bug.ts`
- [ ] 13. Migrate `reproduce-bug.md` → `templates/reproduce-bug.ts`
- [ ] 14. Migrate `resolve_parallel.md` → `templates/resolve-parallel.ts`
- [ ] 15. Migrate `resolve_pr_parallel.md` → `templates/resolve-pr-parallel.ts`
- [ ] 16. Migrate `resolve_todo_parallel.md` → `templates/resolve-todo-parallel.ts`
- [ ] 17. Migrate `sync-tutorials.md` → `templates/sync-tutorials.ts`
- [ ] 18. Migrate `teach-me.md` → `templates/teach-me.ts`
- [ ] 19. Migrate `test-browser.md` → `templates/test-browser.ts`
- [ ] 20. Migrate `triage.md` → `templates/triage.ts`
- [ ] 21. Migrate `xcode-test.md` → `templates/xcode-test.ts`

#### Workflow Commands (5 files)

- [ ] 22. Migrate `workflows/brainstorm.md` → `templates/workflows/brainstorm.ts`
- [ ] 23. Migrate `workflows/compound.md` → `templates/workflows/compound.ts`
- [ ] 24. Migrate `workflows/plan.md` → `templates/workflows/plan.ts`
- [ ] 25. Migrate `workflows/review.md` → `templates/workflows/review.ts`
- [ ] 26. Migrate `workflows/work.md` → `templates/workflows/work.ts`

#### Skills (14 directories)

- [ ] 27. Move `andrew-kane-gem-writer/` to builtin-skills/
- [ ] 28. Move `brainstorming/` to builtin-skills/
- [ ] 29. Move `coding-tutor/` to builtin-skills/
- [ ] 30. Move `compound-docs/` to builtin-skills/
- [ ] 31. Move `create-agent-skills/` to builtin-skills/
- [ ] 32. Move `dhh-rails-style/` to builtin-skills/
- [ ] 33. Move `dspy-ruby/` to builtin-skills/
- [ ] 34. Move `every-style-editor/` to builtin-skills/
- [ ] 35. Move `file-todos/` to builtin-skills/
- [ ] 36. Move `frontend-design/` to builtin-skills/
- [ ] 37. Move `gemini-imagegen/` to builtin-skills/
- [ ] 38. Move `git-worktree/` to builtin-skills/
- [ ] 39. Move `ralph-loop/` to builtin-skills/
- [ ] 40. Move `rclone/` to builtin-skills/
- [ ] 41. Move `skill-creator/` to builtin-skills/

#### Registration

- [ ] 42. Update `commands.ts` with all 21 new template imports
- [ ] 43. Update `commands.ts` with all 5 workflow template imports
- [ ] 44. Update `skills.ts` with all 14 new skill imports

#### Cleanup

- [ ] 45. Run tests: `bun test`
- [ ] 46. Run typecheck: `bun run typecheck`
- [ ] 47. Remove empty `src/plugin/commands/` directory
- [ ] 48. Remove empty `src/plugin/skills/` directory
- [ ] 49. Verify no orphaned references

## Dependencies

### Internal
- `src/execution/features/builtin-commands/commands.ts`
- `src/execution/features/builtin-skills/skills.ts`
- `src/plugin/commands/` (source)
- `src/plugin/skills/` (source)

### External
- Bun (package manager)

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Commands | 26 files | ~3 hours |
| Skills | 14 directories | ~2 hours |
| Registration | 3 files | ~30 min |
| Testing/Cleanup | Verification | ~30 min |
| **Total** | 49 items | **~6 hours** |

## Success Criteria

- [ ] All 21 commands work without `ghostwire:` prefix
- [ ] All 14 skills load from builtin-skills
- [ ] All 594 tests pass
- [ ] TypeScript compiles without errors
- [ ] Empty plugin directories removed
