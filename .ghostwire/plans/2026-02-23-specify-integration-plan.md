# Specify → Ghostwire Integration Plan

**Created**: 2026-02-23  
**Status**: ✅ COMPLETED (Historical plan from Feb 2026)
**Branch**: `045-specify-integration`  
**Related**: `.specify/` (to be deleted), `.opencode/command/speckit.*` (to be deleted)

---

## Executive Summary

### Goal
Merge the functionality from `.specify/` into Ghostwire as official builtin commands, eliminating external bash scripts and creating a cohesive feature specification workflow.

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Command namespace | `ghostwire:spec:*` | Universal naming, consistent with existing patterns |
| Migration strategy | Full integration | TypeScript templates, eliminate bash scripts |
| Bash scripts | Replace with TypeScript + agent instructions | Cross-platform, testable, maintainable |
| Constitution | Hybrid approach | Separate file, referenced by AGENTS.md |
| Deprecation period | None | Clean break, speckit commands deleted |

### Scope

**In Scope:**
- 9 new builtin commands (`ghostwire:spec:*` + `ghostwire:project:constitution`)
- 6 TypeScript template files (converted from markdown)
- Bash script functionality replaced with template instructions
- Test coverage for all new commands

**Out of Scope:**
- Changes to existing Ghostwire workflows
- Changes to `.ghostwire/specs/` directory structure (already migrated)
- Backward compatibility with speckit commands

---

## Architecture

### Command Mapping

| Speckit Command | New Ghostwire Command | Template File |
|-----------------|----------------------|---------------|
| `speckit.specify` | `ghostwire:spec:create` | `spec/create.ts` |
| `speckit.plan` | `ghostwire:spec:plan` | `spec/plan.ts` |
| `speckit.tasks` | `ghostwire:spec:tasks` | `spec/tasks.ts` |
| `speckit.implement` | `ghostwire:spec:implement` | `spec/implement.ts` |
| `speckit.clarify` | `ghostwire:spec:clarify` | `spec/clarify.ts` |
| `speckit.analyze` | `ghostwire:spec:analyze` | `spec/analyze.ts` |
| `speckit.checklist` | `ghostwire:spec:checklist` | `spec/checklist.ts` |
| `speckit.taskstoissues` | `ghostwire:spec:to-issues` | `spec/to-issues.ts` |
| `speckit.constitution` | `ghostwire:project:constitution` | `project/constitution.ts` |

### Directory Structure

```
src/execution/features/builtin-commands/templates/
├── spec/                      # NEW - Feature specification templates
│   ├── create.ts              # spec:create command template
│   ├── plan.ts                # spec:plan command template
│   ├── tasks.ts               # spec:tasks command template
│   ├── implement.ts           # spec:implement command template
│   ├── clarify.ts             # spec:clarify command template
│   ├── analyze.ts             # spec:analyze command template
│   ├── checklist.ts           # spec:checklist command template
│   ├── to-issues.ts           # spec:to-issues command template
│   └── index.ts               # barrel export
├── project/                   # NEW - Project-level commands
│   ├── constitution.ts        # project:constitution command template
│   └── index.ts               # barrel export
├── workflows/                 # EXISTING - untouched
└── ... (other existing templates)
```

### Constitution Hybrid Approach

The constitution concept is implemented as a **hybrid approach**:

1. **`.ghostwire/constitution.md`** - Contains project-specific principles (user-editable)
   - Example: "All features must have user-facing documentation"
   - Example: "Performance targets: <200ms response time"
   - Created by `ghostwire:project:constitution` command
   - Can be customized per project

2. **`AGENTS.md`** - Contains system documentation (how agents work)
   - References constitution: "See `.ghostwire/constitution.md` for project principles"
   - Agents check both: AGENTS.md for "how", constitution for "what matters"
   - Stays generic and reusable across projects

**Why hybrid:**
- Keeps user principles separate from system docs
- Allows project customization without modifying AGENTS.md
- Constitution can be versioned per-project
- AGENTS.md stays generic/reusable

---

## Implementation Phases

### Phase 1: Template Infrastructure (~2 hours)

**Goal**: Create TypeScript template infrastructure without adding commands yet.

**Tasks:**
- [x] T001 Create `src/execution/features/builtin-commands/templates/spec/` directory
- [x] T002 [P] Create `spec/create.ts` template (from spec-template.md)
- [x] T003 [P] Create `spec/plan.ts` template (from plan-template.md)
- [x] T004 [P] Create `spec/tasks.ts` template (from tasks-template.md)
- [x] T005 [P] Create `spec/implement.ts` template (from speckit.implement.md)
- [x] T006 [P] Create `spec/clarify.ts` template (from speckit.clarify.md)
- [x] T007 [P] Create `spec/analyze.ts` template (from speckit.analyze.md)
- [x] T008 [P] Create `spec/checklist.ts` template (from checklist-template.md)
- [x] T009 [P] Create `spec/to-issues.ts` template (from speckit.taskstoissues.md)
- [x] T010 Create `spec/index.ts` barrel export
- [x] T011 Create `src/execution/features/builtin-commands/templates/project/` directory
- [x] T012 [P] Create `project/constitution.ts` template (from constitution-template.md)
- [x] T013 Create `project/index.ts` barrel export
- [x] T014-T018 [P] Create unit tests for each template

**Verification:**
- [x] V001 All template files compile without errors
- [x] V002 Unit tests pass
- [x] V003 Templates can be imported from index.ts

---

### Phase 2: Core Commands (~2 hours)

**Goal**: Add the 4 core specification commands (create, plan, tasks, implement).

**Tasks:**
- [x] T019 Add `ghostwire:spec:create` type to `types.ts`
- [x] T020 Add `ghostwire:spec:plan` type to `types.ts`
- [x] T021 Add `ghostwire:spec:tasks` type to `types.ts`
- [x] T022 Add `ghostwire:spec:implement` type to `types.ts`
- [x] T023 Add `ghostwire:spec:create` command definition to `commands.ts`
- [x] T024 Add `ghostwire:spec:plan` command definition to `commands.ts`
- [x] T025 Add `ghostwire:spec:tasks` command definition to `commands.ts`
- [x] T026 Add `ghostwire:spec:implement` command definition to `commands.ts`
- [x] T027 Update `src/execution/features/builtin-commands/index.ts` exports
- [x] T028-T031 [P] Create integration tests for each command

**Verification:**
- [x] V004 Type check passes
- [x] V005 Build succeeds
- [x] V006 Integration tests pass
- [x] V007 Commands appear in help output

---

### Phase 3: Support Commands (~2 hours)

**Goal**: Add the 4 support commands (clarify, analyze, checklist, to-issues).

**Tasks:**
- [x] T032 Add `ghostwire:spec:clarify` type to `types.ts`
- [x] T033 Add `ghostwire:spec:analyze` type to `types.ts`
- [x] T034 Add `ghostwire:spec:checklist` type to `types.ts`
- [x] T035 Add `ghostwire:spec:to-issues` type to `types.ts`
- [x] T036 Add `ghostwire:spec:clarify` command definition to `commands.ts`
- [x] T037 Add `ghostwire:spec:analyze` command definition to `commands.ts`
- [x] T038 Add `ghostwire:spec:checklist` command definition to `commands.ts`
- [x] T039 Add `ghostwire:spec:to-issues` command definition to `commands.ts`
- [x] T040-T043 [P] Create integration tests for each command

**Verification:**
- [x] V008 Type check passes
- [x] V009 Build succeeds
- [x] V010 All 8 spec commands functional

---

### Phase 4: Constitution & Project Commands (~1 hour)

**Goal**: Add the project-level constitution command and default constitution file.

**Tasks:**
- [x] T044 Add `ghostwire:project:constitution` type to `types.ts`
- [x] T045 Add `ghostwire:project:constitution` command definition to `commands.ts`
- [x] T046 Create default `.ghostwire/constitution.md` template
- [x] T047 Update `AGENTS.md` with constitution reference
- [x] T048 Create integration test for constitution command

**Verification:**
- [x] V011 Constitution command creates file correctly
- [x] V012 AGENTS.md references constitution
- [x] V013 All 9 commands functional

---

### Phase 5: Cleanup (~30 minutes)

**Goal**: Delete specify files and verify clean state.

**Tasks:**
- [x] T050 Delete `.specify/` directory entirely
- [x] T051 Delete `.opencode/command/speckit.specify.md`
- [x] T052 Delete `.opencode/command/speckit.plan.md`
- [x] T053 Delete `.opencode/command/speckit.tasks.md`
- [x] T054 Delete `.opencode/command/speckit.implement.md`
- [x] T055 Delete `.opencode/command/speckit.clarify.md`
- [x] T056 Delete `.opencode/command/speckit.analyze.md`
- [x] T057 Delete `.opencode/command/speckit.checklist.md`
- [x] T058 Delete `.opencode/command/speckit.taskstoissues.md`
- [x] T059 Delete `.opencode/command/speckit.constitution.md`
- [x] T060 Run full test suite
- [x] T061 Verify no speckit references remain

**Verification:**
- [x] V014 All tests pass (1,869)
- [x] V015 Type check passes
- [x] V016 Build succeeds
- [x] V017 No references to speckit in codebase
- [x] V018 `.specify/` directory removed
- [x] V019 All 9 speckit command files removed

---

## Files Summary

### Files to Create (16+)

**Templates:**
- `src/execution/features/builtin-commands/templates/spec/create.ts`
- `src/execution/features/builtin-commands/templates/spec/plan.ts`
- `src/execution/features/builtin-commands/templates/spec/tasks.ts`
- `src/execution/features/builtin-commands/templates/spec/implement.ts`
- `src/execution/features/builtin-commands/templates/spec/clarify.ts`
- `src/execution/features/builtin-commands/templates/spec/analyze.ts`
- `src/execution/features/builtin-commands/templates/spec/checklist.ts`
- `src/execution/features/builtin-commands/templates/spec/to-issues.ts`
- `src/execution/features/builtin-commands/templates/spec/index.ts`
- `src/execution/features/builtin-commands/templates/project/constitution.ts`
- `src/execution/features/builtin-commands/templates/project/index.ts`

**Tests:**
- `src/execution/features/builtin-commands/templates/spec/index.test.ts`
- `src/execution/features/builtin-commands/templates/project/index.test.ts`

**Default Content:**
- `.ghostwire/constitution.md` (default template)

### Files to Modify (3)

- `src/execution/features/builtin-commands/types.ts` - Add 9 command types
- `src/execution/features/builtin-commands/commands.ts` - Add 9 command definitions
- `AGENTS.md` - Add constitution reference

### Files to Delete (15)

- `.specify/` directory (entire directory with 5 bash scripts, 6 templates, 1 memory file)
- `.opencode/command/speckit.specify.md`
- `.opencode/command/speckit.plan.md`
- `.opencode/command/speckit.tasks.md`
- `.opencode/command/speckit.implement.md`
- `.opencode/command/speckit.clarify.md`
- `.opencode/command/speckit.analyze.md`
- `.opencode/command/speckit.checklist.md`
- `.opencode/command/speckit.taskstoissues.md`
- `.opencode/command/speckit.constitution.md`

---

## Testing Strategy

### Unit Tests (Phase 1)

Each template file should have corresponding unit tests:
- Template structure validation
- Variable substitution tests
- Edge case handling

### Integration Tests (Phases 2-4)

Each command should have integration tests:
- Command registration test
- Template loading test
- End-to-end workflow test

### Final Verification (Phase 5)

- Full test suite: `bun test` (1,869 tests)
- Type checking: `bun run typecheck`
- Build verification: `bun run build`
- Grep audit: No speckit references

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Template conversion errors | Medium | Test each template independently before integration |
| Command registration issues | Low | Follow existing Ghostwire patterns exactly |
| Missing functionality from bash scripts | Medium | Thoroughly test workflow equivalence |
| Constitution confusion | Low | Clear documentation in AGENTS.md |

---

## Success Criteria

- [x] All 9 new commands registered and functional
- [x] Command workflow works end-to-end (create → plan → tasks → implement)
- [x] All 1,869 tests pass
- [x] Type checking passes (`bun run typecheck`)
- [x] Build succeeds (`bun run build`)
- [x] `.specify/` directory deleted
- [x] All 9 speckit command files deleted
- [x] No references to speckit remain in codebase
- [x] Constitution file created and referenced

---

## Timeline

**Total estimated time**: 7.5 hours

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 1: Template Infrastructure | ~2 hours | 2h |
| Phase 2: Core Commands | ~2 hours | 4h |
| Phase 3: Support Commands | ~2 hours | 6h |
| Phase 4: Constitution & Project | ~1 hour | 7h |
| Phase 5: Cleanup | ~30 min | 7.5h |

---

## Notes

- This plan assumes no breaking changes to existing Ghostwire functionality
- The `.ghostwire/specs/` directory structure is preserved (already migrated from `specs/`)
- No backward compatibility - clean break from speckit
- All bash script functionality replaced with TypeScript templates and agent instructions

---

**Status**: Ready for implementation  
**Next Step**: Create branch `045-specify-integration` and begin Phase 1
