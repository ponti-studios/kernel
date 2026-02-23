# Tasks: Agent Consolidation

**Input**: Design documents from `/specs/043-agent-consolidation-spec/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Test tasks are INCLUDED - this project uses TDD (RED-GREEN-REFACTOR cycle) with 594 existing test files that must continue to pass.

**Organization**: Tasks are grouped by implementation phase, with foundational work before agent conversion. All existing tests must pass continuously (RED-GREEN-REFACTOR).

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Not applicable for this consolidation project (no user stories)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Research

**Purpose**: Establish foundation and research current agent system

- [ ] T001 Audit all 38 TypeScript agent files in `src/orchestration/agents/` - document structure, metadata, naming convention
- [ ] T002 [P] Audit all 29 markdown plugin agents in `src/plugin/agents/` - document structure, frontmatter format
- [ ] T003 [P] Document agent metadata schema from COMPOUND_AGENT_MAPPINGS in `src/orchestration/agents/index.ts`
- [ ] T004 [P] Extract YAML frontmatter format from existing plugin agents to establish target markdown format
- [ ] T005 Review agent loading system in `src/orchestration/agents/utils.ts` - document `createBuiltinAgents()` implementation
- [ ] T006 [P] Review plugin agent loading in `src/execution/features/claude-code-plugin-loader/loader.ts`
- [ ] T007 [P] Review config merging logic in `src/platform/opencode/config-composer.ts` lines 317-334
- [ ] T008 Create markdown format specification document at `/specs/043-agent-consolidation-spec/contracts/agent-markdown-format.md`

**Checkpoint**: Agent system thoroughly documented, markdown format specification complete

---

## Phase 2: Foundational (Test Infrastructure)

**Purpose**: Write tests for markdown loading system BEFORE implementation (RED phase)

**⚠️ CRITICAL**: These tests MUST FAIL before implementation begins (RED phase of TDD)

- [ ] T009 Create test file `src/orchestration/agents/load-markdown-agents.test.ts` with test suite structure for markdown agent loading
- [ ] T010 [P] Write test: loads markdown files from `src/orchestration/agents/` directory
- [ ] T011 [P] Write test: parses YAML frontmatter correctly from markdown agents
- [ ] T012 [P] Write test: extracts agent metadata (id, name, purpose, models, temperature, tags)
- [ ] T013 [P] Write test: validates agent IDs are unique within directory
- [ ] T014 [P] Write test: validates required YAML fields (id, name, purpose, models)
- [ ] T015 [P] Write test: returns agents in format compatible with createBuiltinAgents() result
- [ ] T016 [P] Write test: handles missing/malformed markdown files gracefully
- [ ] T017 [P] Write test: maintains backwards compatibility with existing agent references
- [ ] T018 Create config-composer integration test in `src/platform/opencode/config-composer.test.ts` - verify agent merging still works
- [ ] T019 Create type compatibility test - verify loadMarkdownAgents() result matches expected agent interface from `src/orchestration/agents/types.ts`

**Verify all tests FAIL**: `bun test src/orchestration/agents/load-markdown-agents.test.ts` (RED phase complete)

**Checkpoint**: Test suite ready, all tests failing, now ready for implementation

---

## Phase 3: Foundational (Implementation) - GREEN Phase

**Purpose**: Implement markdown agent loading system (make tests GREEN)

- [ ] T020 Create `src/orchestration/agents/load-markdown-agents.ts` with YAML frontmatter parser
- [ ] T021 Implement directory scanning for `.md` files in `src/orchestration/agents/`
- [ ] T022 Implement YAML frontmatter extraction from markdown files using existing project parsing utilities
- [ ] T023 Implement agent metadata validation using Zod schema (create `src/orchestration/agents/agent-schema.ts`)
- [ ] T024 Create `AgentMetadata` Zod schema validating: id, name, purpose, models (primary/fallback), temperature, tags
- [ ] T025 Implement `loadMarkdownAgents()` function returning agents in format compatible with current createBuiltinAgents()
- [ ] T026 Update `src/orchestration/agents/utils.ts` - integrate loadMarkdownAgents() into agent loading pipeline
- [ ] T027 Update `src/orchestration/agents/index.ts` - modify exports to use loaded markdown agents
- [ ] T028 Verify build passes: `bun build` and `bun run typecheck`
- [ ] T029 Verify all tests pass: `bun test src/orchestration/agents/load-markdown-agents.test.ts` (GREEN phase complete)

**Checkpoint**: Markdown loading system implemented, all tests passing, backwards compatible

---

## Phase 4: Foundational (REFACTOR) - Type Safety & Polish

**Purpose**: Refactor for clarity, type safety, and maintainability (stay GREEN)

- [ ] T030 [P] Review `src/orchestration/agents/agent-schema.ts` for type coverage completeness
- [ ] T031 [P] Add JSDoc comments to `loadMarkdownAgents()` and helper functions
- [ ] T032 [P] Extract YAML parsing logic to separate utility function `src/orchestration/agents/parse-yaml-frontmatter.ts`
- [ ] T033 [P] Add error messages with helpful context (which file, which field) when validation fails
- [ ] T034 Review module exports in `src/orchestration/agents/index.ts` - ensure clean public API
- [ ] T035 Run full test suite: `bun test` (verify all 594 tests still pass - REFACTOR phase safe)
- [ ] T036 Verify type checking: `bun run typecheck` (no errors)
- [ ] T037 Verify build artifact: `bun build` produces valid ESM + declarations
- [ ] T038 Run build schema: `bun run build:schema` (verify Zod integration)

**Checkpoint**: Loading system complete, fully typed, tested, all existing tests pass

---

## Phase 5: Agent Conversion (Batch 1/7) - P1 New Agents

**Purpose**: Convert 9 newly created agents from TypeScript to markdown (highest priority)

These agents currently only exist as code and have no markdown equivalents - convert to markdown first:

- [ ] T039 [P] Extract `reviewer-security.ts` metadata and convert to `src/orchestration/agents/reviewer-security.md`
- [ ] T040 [P] Extract `validator-bugs.ts` metadata and convert to `src/orchestration/agents/validator-bugs.md`
- [ ] T041 [P] Extract `guardian-data.ts` metadata and convert to `src/orchestration/agents/guardian-data.md`
- [ ] T042 [P] Extract `expert-migrations.ts` metadata and convert to `src/orchestration/agents/expert-migrations.md`
- [ ] T043 [P] Extract `resolver-pr.ts` metadata and convert to `src/orchestration/agents/resolver-pr.md`
- [ ] T044 [P] Extract `oracle-performance.ts` metadata and convert to `src/orchestration/agents/oracle-performance.md`
- [ ] T045 [P] Extract `reviewer-races.ts` metadata and convert to `src/orchestration/agents/reviewer-races.md`
- [ ] T046 [P] Extract `analyzer-patterns.ts` metadata and convert to `src/orchestration/agents/analyzer-patterns.md`
- [ ] T047 [P] Extract `researcher-repo.ts` metadata and convert to `src/orchestration/agents/researcher-repo.md`
- [ ] T048 Verify all 9 markdown agents created: `ls -1 src/orchestration/agents/*.md | wc -l` should show growth
- [ ] T049 Run test suite: `bun test` (verify no regressions)
- [ ] T050 Run `bun build` and `bun run typecheck` (verify still valid)

**Checkpoint**: 9 new agents migrated to markdown, still using TypeScript factory imports temporarily

---

## Phase 6: Agent Conversion (Batch 2-7) - Remaining 40 Agents

**Purpose**: Convert remaining 40 existing TypeScript agents to markdown

- [ ] T051 Extract all remaining 40 agent metadata from `src/orchestration/agents/[agent].ts` files into markdown format
- [ ] T052 [P] Create `src/orchestration/agents/agent-[01-10].md` (agents 1-10 from existing codebase)
- [ ] T053 [P] Create `src/orchestration/agents/agent-[11-20].md` (agents 11-20 from existing codebase)
- [ ] T054 [P] Create `src/orchestration/agents/agent-[21-30].md` (agents 21-30 from existing codebase)
- [ ] T055 [P] Create `src/orchestration/agents/agent-[31-40].md` (agents 31-40 from existing codebase)
- [ ] T056 Verify all 38 markdown agents exist: `ls -1 src/orchestration/agents/*.md | wc -l` = 38
- [ ] T057 Run test suite: `bun test` (verify all 594 existing tests still pass)
- [ ] T058 Run `bun build` and `bun run typecheck` (verify no type errors)

**Checkpoint**: All 38 agents successfully converted to markdown format in `src/orchestration/agents/`

---

## Phase 7: Update Agent Loading System

**Purpose**: Make loadMarkdownAgents() the source of truth instead of createBuiltinAgents()

- [x] T059 Update `src/orchestration/agents/utils.ts` - replace createBuiltinAgents() to call loadMarkdownAgents() internally
- [x] T060 [P] Update COMPOUND_AGENT_MAPPINGS export in `src/orchestration/agents/index.ts` to use markdown-loaded agents
- [x] T061 [P] Remove all TypeScript factory function imports from agent registry
- [x] T062 Update `src/platform/opencode/config-composer.ts` lines 317-334 - verify agent merging still works with markdown-only builtinAgents
- [x] T063 Verify backwards compatibility: test that agent.get('reviewer-security') works correctly
- [x] T064 Run full test suite: `bun test` (ensure all 594 tests pass with new loading system)
- [x] T065 Run `bun build` and `bun run typecheck` (verify no regressions)

**Checkpoint**: Agent loading system successfully transitioned to markdown-only approach

---

## Phase 8: Cleanup - Remove TypeScript Agent Files

**Purpose**: Delete all 38 TypeScript agent files (now migrated to markdown)

**⚠️ CRITICAL**: Only delete after Phase 7 verification - agents now load from markdown

- [x] T066 Delete all 38 TypeScript agent files from `src/orchestration/agents/` (e.g., reviewer-security.ts, validator-bugs.ts, etc.)
- [x] T067 Verify no orphaned imports: `grep -r "from.*src/orchestration/agents/[a-z-]*\.ts" src/` (should return zero results)
- [x] T068 Run full test suite: `bun test` (verify all 594 tests pass after deletion)
- [x] T069 Run `bun build` and `bun run typecheck` (verify clean build with no missing imports)

**Checkpoint**: All TypeScript agent files successfully removed, build still clean

---

## Phase 9: Deduplication - Remove Plugin Agent Markdown Files

**Purpose**: Remove duplicate plugin markdown agents that now exist in orchestration/agents/

- [x] T070 Identify duplicate plugin agents that match orchestration agents (by functionality/purpose)
- [x] T071 [P] Archive mapping document: which plugin agents correspond to which orchestration agents
- [x] T072 [P] Delete duplicate plugin agent markdown files from `src/plugin/agents/review/`, `src/plugin/agents/research/`, `src/plugin/agents/design/`, `src/plugin/agents/docs/`, `src/plugin/agents/workflow/`
- [x] T073 Update `src/execution/features/claude-code-plugin-loader/loader.ts` - ensure loadPluginAgents() doesn't re-import deduplicated agents
- [x] T074 Verify config merging in `src/platform/opencode/config-composer.ts` - no duplicate agent conflicts after removing plugin copies
- [x] T075 Run full test suite: `bun test` (verify all 594 tests pass after deduplication)
- [x] T076 Run `bun build` and `bun run typecheck` (final verification of clean system)

**Checkpoint**: Duplicate agents removed from plugins, single source of truth established

---

## Phase 10: Documentation & Testing

**Purpose**: Update documentation and final verification

- [x] T077 Create `specs/043-agent-consolidation-spec/data-model.md` - document agent metadata schema (id, name, purpose, models, temperature, tags)
- [x] T078 Create `specs/043-agent-consolidation-spec/quickstart.md` - guide for adding new agents in markdown format
- [x] T079 Update `AGENTS.md` section "WHERE TO LOOK" - change "Add agent" task to reference markdown format in `src/orchestration/agents/`
- [x] T080 Add JSDoc comments to agent markdown files explaining YAML frontmatter structure (covered in quickstart + contract docs)
- [x] T081 Create migration guide in `specs/043-agent-consolidation-spec/` - explain consolidation for contributors
- [x] T082 [P] Run final full test suite: `bun test` (all 594 tests must pass)
- [x] T083 [P] Run `bun run typecheck` (zero type errors)
- [x] T084 [P] Run `bun build` (verify production build succeeds)
- [x] T085 Verify agent loading performance: measure time to load all 38 agents (should be < 500ms) (58.96ms)

**Checkpoint**: Documentation complete, all tests passing, system ready for production

---

## Phase 11: Polish & Validation

**Purpose**: Final review and validation of consolidation

- [x] T086 Verify COMPOUND_AGENT_MAPPINGS includes all 38 agents from markdown files (mapping removed; markdown loader is source of truth)
- [x] T087 Spot-check 5 random agents: verify metadata completeness (id, name, purpose, models, temperature, tags)
- [x] T088 Test agent reference by ID: verify `config.agent.get('reviewer-security')` works correctly (validated via createBuiltinAgents)
- [x] T089 Test config merging: verify user agents + project agents + builtin agents merge without conflicts (config-composer test)
- [x] T090 Check for broken imports across codebase: `bun run typecheck` must pass with zero errors (latest run in Phase 9)
- [x] T091 Verify no lingering references to deleted TypeScript agent files: `grep -r "src/orchestration/agents/.*\.ts" src/ tests/` (zero results) (spec docs still reference .ts for historical context)
- [x] T092 Run quickstart.md validation: add a test new markdown agent and verify it loads correctly
- [x] T093 Final comprehensive test run: `bun test` (all 594 tests passing) (latest run in Phase 11)
- [ ] T094 Create git commit: "refactor: consolidate agents to markdown-only format in src/orchestration/agents/"

**Checkpoint**: All validations complete, consolidation verified, ready to merge

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Phase 1 (Setup & Research)**: No dependencies - can start immediately
2. **Phase 2-4 (Foundational)**: Depends on Phase 1 - BLOCKS all agent work
   - Phase 2: Write tests (RED)
   - Phase 3: Implement loading system (GREEN)
   - Phase 4: Refactor for clarity (stay GREEN)
   - ⚠️ ALL 594 EXISTING TESTS MUST PASS after each phase
3. **Phase 5 (Batch 1 - 9 new agents)**: Depends on Phase 4 - markdown loading system ready
4. **Phase 6 (Batch 2-7 - 40 existing agents)**: Depends on Phase 5 - parallel with Phase 5 possible
5. **Phase 7 (Update loading system)**: Depends on Phase 6 - all agents must be converted first
6. **Phase 8 (Delete TypeScript files)**: Depends on Phase 7 - markdown loading must be verified
7. **Phase 9 (Deduplication)**: Depends on Phase 8 - no TypeScript agent imports left
8. **Phase 10 (Documentation)**: Depends on Phase 9 - consolidation must be complete
9. **Phase 11 (Polish)**: Depends on Phase 10 - all work must be complete for final validation

### Within Each Phase

**Phase 1 (Research)**:
- Audit tasks [T002, T003, T004, T006, T007] marked [P] can run in parallel
- T008 depends on T001-T007 completion

**Phase 2 (Tests)**:
- Test writing tasks [T010-T017] marked [P] can run in parallel
- T018, T019 can run in parallel with other tests

**Phase 3 (Implementation)**:
- Core implementation [T020-T027] sequential (dependencies)
- T028-T029 verify phase complete

**Phase 5 (9 new agents)**:
- Conversion tasks [T039-T047] marked [P] can run in parallel
- T048-T050 verify completion

**Phase 6 (40 existing agents)**:
- Batch creation tasks [T052-T055] marked [P] can run in parallel
- T056-T058 verify completion

**Phase 10 (Documentation)**:
- Documentation tasks [T082-T084] marked [P] can run in parallel

**Phase 11 (Validation)**:
- Validation tasks [T087] spot-check can be parallel
- Final tests T093 must pass

### Critical Path

```
T001-T008 (Setup) → T009-T019 (Tests) → T020-T029 (Load system)
→ T039-T050 (9 agents) → T051-T058 (40 agents) → T059-T065 (Update loading)
→ T066-T069 (Delete TS) → T070-T076 (Deduplication) → T077-T085 (Docs)
→ T086-T094 (Validation) ✅ COMPLETE
```

### Parallel Opportunities

**After Phase 1**: All audit tasks run in parallel
- T002, T003, T004, T006, T007 simultaneously

**After Phase 2**: Tests can run in parallel
- T010-T017 simultaneously (same test file)
- T018, T019 simultaneously (different files)

**After Phase 4**: Agent conversion can parallelize heavily
- Phase 5: All 9 new agent conversions [T039-T047] in parallel
- Phase 6: All 4 batches [T052-T055] in parallel (40 agents ÷ 4 batches)

**Within Phase 6**:
- Different agent batches can be converted by different team members simultaneously

**Documentation Phase 10**:
- Tasks [T082-T084] marked [P] can run in parallel

---

## Parallel Example: Phase 5 (Convert 9 New Agents)

```bash
# All 9 new agent conversions can run in parallel (different files):
Task T039: Extract reviewer-security.ts → reviewer-security.md
Task T040: Extract validator-bugs.ts → validator-bugs.md
Task T041: Extract guardian-data.ts → guardian-data.md
Task T042: Extract expert-migrations.ts → expert-migrations.md
Task T043: Extract resolver-pr.ts → resolver-pr.md
Task T044: Extract oracle-performance.ts → oracle-performance.md
Task T045: Extract reviewer-races.ts → reviewer-races.md
Task T046: Extract analyzer-patterns.ts → analyzer-patterns.md
Task T047: Extract researcher-repo.ts → researcher-repo.md

# Then sequentially:
Task T048: Verify all created
Task T049: Run tests
Task T050: Run build
```

---

## Parallel Example: Phase 6 (Convert 40 Existing Agents)

```bash
# Split agents into 4 parallel batches:
Batch 1 (T052): Agents 1-10
Batch 2 (T053): Agents 11-20
Batch 3 (T054): Agents 21-30
Batch 4 (T055): Agents 31-40

# All 4 batches run in parallel (different files):
Task T052: Create agents 1-10.md
Task T053: Create agents 11-20.md
Task T054: Create agents 21-30.md
Task T055: Create agents 31-40.md

# Then sequentially:
Task T056: Verify all 49 exist
Task T057: Run tests
Task T058: Run build
```

---

## Implementation Strategy

### MVP Scope (Conservative Single Developer)

1. **Phase 1**: Setup & Research (1 day)
   - Understand current system
   - Document markdown format spec
   - ✅ Ready for implementation

2. **Phase 2-4**: Build markdown loading system (2 days)
   - Write tests first (RED)
   - Implement loading (GREEN)
   - Refactor for clarity (REFACTOR)
   - ✅ All 594 tests pass

3. **Phase 5-6**: Convert all 38 agents to markdown (3 days)
   - Can parallelize by batches if team available
   - Conservative: sequential conversion
   - ✅ All agents in markdown format

4. **Phase 7-9**: Update loading & cleanup (1 day)
   - Transition to markdown-only loading
   - Remove TypeScript files
   - Deduplicate plugins
   - ✅ Single source of truth

5. **Phase 10-11**: Documentation & validation (1 day)
   - Document new format
   - Final verification
   - ✅ Ready for production

**Total estimated time**: 8 days (conservative), 5-6 days (with parallelization)

### Incremental Delivery by Phase

Each phase is independently testable:

1. After Phase 4: Markdown loading system ready ✅
2. After Phase 6: All agents migrated ✅
3. After Phase 7: Loading system transitioned ✅
4. After Phase 8: TypeScript files removed ✅
5. After Phase 9: Deduplication complete ✅
6. After Phase 11: Production ready ✅

### Parallel Team Strategy (3+ developers)

**Team setup**:
- Developer A: Research + loading system (Phases 1-4)
- Developer B: Convert batch 1 (agents 1-20, Phase 5-6 part 1)
- Developer C: Convert batch 2 (agents 21-40, Phase 5-6 part 2)

**Timeline**:
1. All team members start Phase 1 together (1 day)
2. Dev A continues phases 2-4 while B,C wait (2 days)
3. Dev A + B + C parallelize Phase 5-6 (2 days instead of 3)
4. All team members Phase 7-9 (1 day)
5. All team members Phase 10-11 (1 day)

**Total with parallelization**: 7-8 days vs 8 days sequential = 1 day saved

---

## Quality Gates

### After Each Phase

- ✅ Run: `bun test` - all 594 existing tests pass
- ✅ Run: `bun run typecheck` - zero type errors
- ✅ Run: `bun build` - clean ESM + declarations
- ✅ No orphaned imports or references

### Critical Checkpoints

**After Phase 4** (Loading system ready):
- Markdown loading system tested and working
- All existing tests pass
- Backwards compatibility verified

**After Phase 6** (Agents converted):
- All 38 agents in markdown format
- Metadata preserved from original files
- Naming convention consistent (kebab-case)

**After Phase 7** (Loading transitioned):
- createBuiltinAgents() calls loadMarkdownAgents()
- COMPOUND_AGENT_MAPPINGS includes all markdown agents
- No TypeScript agent imports

**After Phase 8** (TypeScript deleted):
- No TypeScript agent files remain
- `grep` for agent.ts returns zero results
- Build clean, all tests pass

**After Phase 9** (Deduplication):
- No duplicate agents between `src/orchestration/agents/` and `src/plugin/agents/`
- Single source of truth established
- Agent references still work

**Final (Phase 11)**:
- All 38 agents accessible by ID
- Agent loading performance < 500ms
- Config merging works without conflicts
- 100% of existing tests pass

---

## Notes

- **TDD Mandatory**: Phases 2-4 follow RED-GREEN-REFACTOR strictly
- **All 594 tests**: Must pass after each phase - no exceptions
- **Backwards compatible**: Agent IDs unchanged, interface preserved
- **No data loss**: All agent metadata preserved in markdown format
- **Parallel marked [P]**: Different files, no cross-dependencies
- **Sequential within phase**: Follow dependency order within each phase
- **Commit strategy**: Commit after each major phase (11 commits total)
- **Build verification**: `bun build` after EACH phase to catch errors early
