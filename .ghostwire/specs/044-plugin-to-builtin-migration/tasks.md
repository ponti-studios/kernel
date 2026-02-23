# Tasks: Plugin to Builtin Migration

**Input**: Design documents from `/specs/044-plugin-to-builtin-migration/`  
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, research.md  
**Branch**: `044-plugin-to-builtin-migration`  

**Organization**: This is a pure migration task with no separate user stories. Tasks are organized into logical phases: Setup, Commands, Skills, Registration, and Cleanup.

## Format: `[ID] [P?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Not applicable (migration task, not feature development)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Infrastructure Validation)

**Purpose**: Verify project state and prepare for migration

- [ ] T001 Verify current branch is `044-plugin-to-builtin-migration`
- [ ] T002 Run `bun test` to establish baseline (all 594 tests should pass)
- [ ] T003 Run `bun run typecheck` to verify no existing TypeScript errors
- [ ] T004 Create templates/workflows directory in `src/execution/features/builtin-commands/templates/`

**Checkpoint**: Environment ready, tests passing, no build errors

---

## Phase 2: Command Migration - Regular Commands (16 files)

**Purpose**: Convert 16 plugin command markdown files to TypeScript templates

### Batch 1: Commands A-E (Parallelizable)

- [ ] T005 [P] Migrate `src/plugin/commands/plan_review.md` to `src/execution/features/builtin-commands/templates/plan-review.ts` with PLAN_REVIEW_TEMPLATE export
- [ ] T006 [P] Migrate `src/plugin/commands/changelog.md` to `src/execution/features/builtin-commands/templates/changelog.ts` with CHANGELOG_TEMPLATE export
- [ ] T007 [P] Migrate `src/plugin/commands/create-agent-skill.md` to `src/execution/features/builtin-commands/templates/create-agent-skill.ts` with CREATE_AGENT_SKILL_TEMPLATE export
- [ ] T008 [P] Migrate `src/plugin/commands/deepen-plan.md` to `src/execution/features/builtin-commands/templates/deepen-plan.ts` with DEEPEN_PLAN_TEMPLATE export
- [ ] T009 [P] Migrate `src/plugin/commands/deploy-docs.md` to `src/execution/features/builtin-commands/templates/deploy-docs.ts` with DEPLOY_DOCS_TEMPLATE export

### Batch 2: Commands F-J (Parallelizable)

- [ ] T010 [P] Migrate `src/plugin/commands/feature-video.md` to `src/execution/features/builtin-commands/templates/feature-video.ts` with FEATURE_VIDEO_TEMPLATE export
- [ ] T011 [P] Migrate `src/plugin/commands/generate_command.md` to `src/execution/features/builtin-commands/templates/generate-command.ts` with GENERATE_COMMAND_TEMPLATE export
- [ ] T012 [P] Migrate `src/plugin/commands/heal-skill.md` to `src/execution/features/builtin-commands/templates/heal-skill.ts` with HEAL_SKILL_TEMPLATE export
- [ ] T013 [P] Migrate `src/plugin/commands/lfg.md` to `src/execution/features/builtin-commands/templates/lfg.ts` with LFG_TEMPLATE export
- [ ] T014 [P] Migrate `src/plugin/commands/quiz-me.md` to `src/execution/features/builtin-commands/templates/quiz-me.ts` with QUIZ_ME_TEMPLATE export

### Batch 3: Commands K-O (Parallelizable)

- [ ] T015 [P] Migrate `src/plugin/commands/release-docs.md` to `src/execution/features/builtin-commands/templates/release-docs.ts` with RELEASE_DOCS_TEMPLATE export
- [ ] T016 [P] Migrate `src/plugin/commands/report-bug.md` to `src/execution/features/builtin-commands/templates/report-bug.ts` with REPORT_BUG_TEMPLATE export
- [ ] T017 [P] Migrate `src/plugin/commands/reproduce-bug.md` to `src/execution/features/builtin-commands/templates/reproduce-bug.ts` with REPRODUCE_BUG_TEMPLATE export
- [ ] T018 [P] Migrate `src/plugin/commands/resolve_parallel.md` to `src/execution/features/builtin-commands/templates/resolve-parallel.ts` with RESOLVE_PARALLEL_TEMPLATE export
- [ ] T019 [P] Migrate `src/plugin/commands/resolve_pr_parallel.md` to `src/execution/features/builtin-commands/templates/resolve-pr-parallel.ts` with RESOLVE_PR_PARALLEL_TEMPLATE export

### Batch 4: Commands P-T (Parallelizable)

- [ ] T020 [P] Migrate `src/plugin/commands/resolve_todo_parallel.md` to `src/execution/features/builtin-commands/templates/resolve-todo-parallel.ts` with RESOLVE_TODO_PARALLEL_TEMPLATE export
- [ ] T021 [P] Migrate `src/plugin/commands/sync-tutorials.md` to `src/execution/features/builtin-commands/templates/sync-tutorials.ts` with SYNC_TUTORIALS_TEMPLATE export
- [ ] T022 [P] Migrate `src/plugin/commands/teach-me.md` to `src/execution/features/builtin-commands/templates/teach-me.ts` with TEACH_ME_TEMPLATE export
- [ ] T023 [P] Migrate `src/plugin/commands/test-browser.md` to `src/execution/features/builtin-commands/templates/test-browser.ts` with TEST_BROWSER_TEMPLATE export
- [ ] T024 [P] Migrate `src/plugin/commands/triage.md` to `src/execution/features/builtin-commands/templates/triage.ts` with TRIAGE_TEMPLATE export

### Batch 5: Commands U-X (Parallelizable)

- [ ] T025 [P] Migrate `src/plugin/commands/xcode-test.md` to `src/execution/features/builtin-commands/templates/xcode-test.ts` with XCODE_TEST_TEMPLATE export

**Checkpoint**: All 16 regular command templates created

---

## Phase 3: Command Migration - Workflow Commands (5 files)

**Purpose**: Convert 5 workflow plugin commands to TypeScript templates

### Batch 1: Workflow Commands (Parallelizable)

- [ ] T026 [P] Migrate `src/plugin/commands/workflows/brainstorm.md` to `src/execution/features/builtin-commands/templates/workflows/brainstorm.ts` with WORKFLOWS_BRAINSTORM_TEMPLATE export
- [ ] T027 [P] Migrate `src/plugin/commands/workflows/compound.md` to `src/execution/features/builtin-commands/templates/workflows/compound.ts` with WORKFLOWS_COMPOUND_TEMPLATE export
- [ ] T028 [P] Migrate `src/plugin/commands/workflows/plan.md` to `src/execution/features/builtin-commands/templates/workflows/plan.ts` with WORKFLOWS_PLAN_TEMPLATE export
- [ ] T029 [P] Migrate `src/plugin/commands/workflows/review.md` to `src/execution/features/builtin-commands/templates/workflows/review.ts` with WORKFLOWS_REVIEW_TEMPLATE export
- [ ] T030 [P] Migrate `src/plugin/commands/workflows/work.md` to `src/execution/features/builtin-commands/templates/workflows/work.ts` with WORKFLOWS_WORK_TEMPLATE export

**Checkpoint**: All 5 workflow command templates created

---

## Phase 4: Command Registration

**Purpose**: Register all 26 command templates in commands.ts

- [ ] T031 Update `src/execution/features/builtin-commands/commands.ts` to import all 21 regular command templates (T005-T025)
- [ ] T032 Update `src/execution/features/builtin-commands/commands.ts` to import all 5 workflow command templates (T026-T030)
- [ ] T033 Update `BUILTIN_COMMAND_DEFINITIONS` in `src/execution/features/builtin-commands/commands.ts` to register all 26 new commands with proper names, descriptions, and templates
- [ ] T034 Verify TypeScript compiles: `bun run typecheck`
- [ ] T035 Run tests to verify no command registration issues: `bun test`

**Checkpoint**: All commands registered and tests passing

---

## Phase 5: Skill Migration (14 directories)

**Purpose**: Move 14 plugin skills to builtin-skills with all assets

### Batch 1: Skills A-D (Parallelizable)

- [ ] T036 [P] Move `src/plugin/skills/andrew-kane-gem-writer/` to `src/execution/features/builtin-skills/andrew-kane-gem-writer/` (includes SKILL.md and any assets)
- [ ] T037 [P] Move `src/plugin/skills/brainstorming/` to `src/execution/features/builtin-skills/brainstorming/` (includes SKILL.md and any assets)
- [ ] T038 [P] Move `src/plugin/skills/coding-tutor/` to `src/execution/features/builtin-skills/coding-tutor/` (includes SKILL.md and any assets)
- [ ] T039 [P] Move `src/plugin/skills/compound-docs/` to `src/execution/features/builtin-skills/compound-docs/` (includes SKILL.md, references/, and assets/)

### Batch 2: Skills E-H (Parallelizable)

- [ ] T040 [P] Move `src/plugin/skills/create-agent-skills/` to `src/execution/features/builtin-skills/create-agent-skills/` (includes SKILL.md and any assets)
- [ ] T041 [P] Move `src/plugin/skills/dhh-rails-style/` to `src/execution/features/builtin-skills/dhh-rails-style/` (includes SKILL.md and any assets)
- [ ] T042 [P] Move `src/plugin/skills/dspy-ruby/` to `src/execution/features/builtin-skills/dspy-ruby/` (includes SKILL.md and any assets)
- [ ] T043 [P] Move `src/plugin/skills/every-style-editor/` to `src/execution/features/builtin-skills/every-style-editor/` (includes SKILL.md and any assets)

### Batch 3: Skills I-L (Parallelizable)

- [ ] T044 [P] Move `src/plugin/skills/file-todos/` to `src/execution/features/builtin-skills/file-todos/` (includes SKILL.md and assets/)
- [ ] T045 [P] Move `src/plugin/skills/frontend-design/` to `src/execution/features/builtin-skills/frontend-design/` (includes SKILL.md and any assets)
- [ ] T046 [P] Move `src/plugin/skills/gemini-imagegen/` to `src/execution/features/builtin-skills/gemini-imagegen/` (includes SKILL.md and any assets)
- [ ] T047 [P] Move `src/plugin/skills/git-worktree/` to `src/execution/features/builtin-skills/git-worktree/` (includes SKILL.md and any assets)

### Batch 4: Skills M-O (Parallelizable)

- [ ] T048 [P] Move `src/plugin/skills/ralph-loop/` to `src/execution/features/builtin-skills/ralph-loop/` (includes SKILL.md and any assets)
- [ ] T049 [P] Move `src/plugin/skills/rclone/` to `src/execution/features/builtin-skills/rclone/` (includes SKILL.md and any assets)
- [ ] T050 [P] Move `src/plugin/skills/skill-creator/` to `src/execution/features/builtin-skills/skill-creator/` (includes SKILL.md and any assets)

**Checkpoint**: All 14 skills moved to builtin-skills

---

## Phase 6: Skill Registration

**Purpose**: Update skills.ts to load from new builtin-skills location

- [ ] T051 Review `src/execution/features/builtin-skills/skills.ts` to identify skill imports that need updates
- [ ] T052 Update all skill import paths in `src/execution/features/builtin-skills/skills.ts` to point to newly migrated skills (T036-T050)
- [ ] T053 Verify skill exports remain compatible with existing code
- [ ] T054 Run TypeScript check: `bun run typecheck`
- [ ] T055 Run tests to verify skill loading: `bun test`

**Checkpoint**: All skills registered and tests passing

---

## Phase 7: Cleanup & Verification

**Purpose**: Remove plugin components and verify migration success

- [ ] T056 Delete empty `src/plugin/commands/workflows/` directory
- [ ] T057 Delete empty `src/plugin/commands/` directory
- [ ] T058 Delete empty `src/plugin/skills/` directory
- [ ] T059 Search codebase for any remaining references to `src/plugin/commands` or `src/plugin/skills` using grep: `grep -r "src/plugin/commands\|src/plugin/skills" /Users/charlesponti/Developer/ghostwire/src` and fix any orphaned imports
- [ ] T060 Run full test suite: `bun test` (verify all 594 tests pass)
- [ ] T061 Run TypeScript check: `bun run typecheck` (verify no type errors)
- [ ] T062 Verify no namespace prefix needed: commands should work without `ghostwire:` prefix
- [ ] T063 Document migration completion in commit message with counts (21 commands + 14 skills migrated)

**Checkpoint**: Migration complete, all tests passing, no build errors

---

## Phase 8: Final Validation

**Purpose**: Comprehensive validation across all migrated components

- [ ] T064 Verify command templates load correctly by checking `BUILTIN_COMMAND_DEFINITIONS` has 26+ commands
- [ ] T065 Verify skills load correctly by checking skill registry has 14+ new skills
- [ ] T066 Run quickstart.md validation steps: follow the guide in `specs/044-plugin-to-builtin-migration/quickstart.md`
- [ ] T067 Create final commit: `git add . && git commit -m "044: Migrate 21 commands and 14 skills to builtin directories"`

**Checkpoint**: All components working, migration validated, ready for PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Commands (Phases 2-3)**: Depends on Setup completion
- **Command Registration (Phase 4)**: Depends on Commands (Phases 2-3) completion
- **Skills (Phase 5)**: Can start immediately after Setup, independent of Commands
- **Skill Registration (Phase 6)**: Depends on Skills (Phase 5) completion
- **Cleanup (Phase 7)**: Depends on Command Registration (Phase 4) AND Skill Registration (Phase 6)
- **Validation (Phase 8)**: Depends on Cleanup (Phase 7) completion

### Critical Path

```
Setup (T001-T004)
    ↓
    ├→ Commands (T005-T025) ──→ Workflow Commands (T026-T030) ──→ Registration (T031-T035)
    │                                                                    ↓
    │                                                               Cleanup (T056-T063)
    │                                                                    ↓
    └→ Skills (T036-T050) ──────────────────────────────────────→ Registration (T051-T055)
                                                                        ↓
                                                                   Validation (T064-T067)
```

### Parallel Opportunities

**Within Phase 2-3 (Commands)**:
- All command migrations marked [P] can run in parallel
- Suggested: 5 developers × 5 commands each = 3 rounds of 5 tasks
- Example: Developer 1 does T005-T009, Developer 2 does T010-T014, etc.

**Within Phase 5 (Skills)**:
- All skill migrations marked [P] can run in parallel
- Suggested: 4 developers × 3 skills each = 1 round (some developers get 4)
- Example: Developer 1 does T036-T039, Developer 2 does T040-T043, etc.

**Command vs Skills**:
- After Setup complete: Commands and Skills migration can run in parallel
- Different developers can work on commands while others work on skills
- Phases 2-5 can overlap (Setup → Commands Phase 4 while Skills Phase 5 ongoing)

---

## Parallel Example: Batch Migration (Recommended Approach)

```bash
# Setup phase (sequential, single developer)
Task: T001 Verify branch
Task: T002 Run baseline tests
Task: T003 Run typecheck
Task: T004 Create directories

# Command migration (can parallelize 5 at a time)
Parallel run 1:
  Task: T005 (plan_review)
  Task: T006 (changelog)
  Task: T007 (create-agent-skill)
  Task: T008 (deepen-plan)
  Task: T009 (deploy-docs)

Parallel run 2:
  Task: T010 (feature-video)
  Task: T011 (generate-command)
  Task: T012 (heal-skill)
  Task: T013 (lfg)
  Task: T014 (quiz-me)

# ...continue with T015-T025, then T026-T030

# Skill migration (can parallelize 4 at a time while commands register)
Parallel run (while T031-T035 registering):
  Task: T036 (andrew-kane-gem-writer)
  Task: T037 (brainstorming)
  Task: T038 (coding-tutor)
  Task: T039 (compound-docs)

# After command registration passes, skill registration
Task: T051-T055 Register skills
```

---

## Implementation Strategy

### Sequential (Single Developer, ~6 hours)

1. Complete Setup (T001-T004): ~15 min
2. Complete Commands (T005-T030): ~3 hours (migrate 26 files)
3. Register Commands (T031-T035): ~30 min
4. Complete Skills (T036-T050): ~1.5 hours (move 14 directories)
5. Register Skills (T051-T055): ~20 min
6. Cleanup & Validation (T056-T067): ~20 min

### Parallel (Multiple Developers, ~2.5 hours with 4 developers)

1. Developer A: Setup (T001-T004) while others wait - 15 min
2. Developers A-D (parallel):
   - Dev A: Command Batch 1 (T005-T009)
   - Dev B: Command Batch 2 (T010-T014)
   - Dev C: Command Batch 3 (T015-T019)
   - Dev D: Skill Batch 1 (T036-T039)
   - Time: ~45 min

3. Developers A-D (parallel):
   - Dev A: Command Batch 4 (T020-T024)
   - Dev B: Workflow Commands (T026-T030)
   - Dev C: Skill Batch 2 (T040-T043)
   - Dev D: Skill Batch 3 (T044-T047)
   - Time: ~45 min

4. Developers A-C (parallel):
   - Dev A: Skill Batch 4 (T048-T050)
   - Dev B & C: Idle/review
   - Time: ~15 min

5. Command Registration (sequential bottleneck): ~30 min (T031-T035)
6. Skill Registration (parallel with testing): ~20 min (T051-T055)
7. Cleanup & Validation (parallel): ~20 min (T056-T067)

---

## Notes

- [P] tasks = different files, no dependencies → parallelizable
- Each migration task is self-contained: read source, write target, follow data-model.md mapping
- Tests must pass after each phase (T002, T035, T055, T061, T065)
- Commit after Phase 4 (commands complete) and Phase 6 (skills complete)
- Stop at any checkpoint to validate independently
- Use `grep -r` to find references before cleanup
- All 594 tests must pass before moving to next phase
