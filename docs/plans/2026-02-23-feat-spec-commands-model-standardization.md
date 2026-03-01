---
title: 'Specification Commands & Model Standardization'
type: feat
date: '2026-02-23'
status: completed
version: 1.0.0
created: '2026-02-23'
---

# Integration Planning & Model Standardization Implementation

## Executive Summary

This consolidated plan covers two coordinated initiatives for improving system integration and model consistency:

1. **Specify → Ghostwire Integration Plan** - Merge functionality from `.specify/` into Ghostwire as official builtin commands, eliminating external bash scripts
2. **Standardize All Agent Models to opencode/kimi-k2.5** - Standardize ALL agents and categories to use a unified model with simplified fallback chains

Together, these initiatives align feature specifications with a consistent model strategy, improving both development workflows and system reliability.

---

## Table of Contents

- [Part 1: Specify → Ghostwire Integration](#part-1-specify--ghostwire-integration)
- [Part 2: Model Standardization Implementation](#part-2-model-standardization-implementation)
- [Parallel Execution Strategy](#parallel-execution-strategy)
- [Success Criteria](#success-criteria)

---

## Part 1: Specify → Ghostwire Integration

### Goal

Merge the functionality from `.specify/` into Ghostwire as official builtin commands, eliminating external bash scripts and creating a cohesive feature specification workflow.

### Key Decisions

| Decision           | Choice                                       | Rationale                                           |
| ------------------ | -------------------------------------------- | --------------------------------------------------- |
| Command namespace  | `ghostwire:spec:*`                           | Universal naming, consistent with existing patterns |
| Migration strategy | Full integration                             | TypeScript templates, eliminate bash scripts        |
| Bash scripts       | Replace with TypeScript + agent instructions | Cross-platform, testable, maintainable              |
| Constitution       | Hybrid approach                              | Separate file, referenced by AGENTS.md              |
| Deprecation period | None                                         | Clean break, speckit commands deleted               |

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

### Architecture

#### Command Mapping

| Speckit Command         | New Ghostwire Command            | Template File             |
| ----------------------- | -------------------------------- | ------------------------- |
| `speckit.specify`       | `ghostwire:spec:create`          | `spec/create.ts`          |
| `speckit.plan`          | `ghostwire:spec:plan`            | `spec/plan.ts`            |
| `speckit.tasks`         | `ghostwire:spec:tasks`           | `spec/tasks.ts`           |
| `speckit.implement`     | `ghostwire:spec:implement`       | `spec/implement.ts`       |
| `speckit.clarify`       | `ghostwire:spec:clarify`         | `spec/clarify.ts`         |
| `speckit.analyze`       | `ghostwire:spec:analyze`         | `spec/analyze.ts`         |
| `speckit.checklist`     | `ghostwire:spec:checklist`       | `spec/checklist.ts`       |
| `speckit.taskstoissues` | `ghostwire:spec:to-issues`       | `spec/to-issues.ts`       |
| `speckit.constitution`  | `ghostwire:project:constitution` | `project/constitution.ts` |

#### Directory Structure

```
src/execution/builtin-commands/templates/
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

### Implementation Phases

#### Phase 1: Template Infrastructure (~2 hours)

**Goal**: Create TypeScript template infrastructure without adding commands yet.

**Tasks:**

- ✅ Create `src/execution/builtin-commands/templates/spec/` directory
- ✅ Create 9 template files (create, plan, tasks, implement, clarify, analyze, checklist, to-issues, constitution)
- ✅ Create unit tests for each template
- ✅ Verify all templates compile

#### Phase 2: Core Commands (~2 hours)

**Goal**: Add the 4 core specification commands (create, plan, tasks, implement).

**Tasks:**

- ✅ Add command types to `types.ts`
- ✅ Add command definitions to `commands.ts`
- ✅ Create integration tests
- ✅ Verify commands appear in help

#### Phase 3: Support Commands (~2 hours)

**Goal**: Add the 4 support commands (clarify, analyze, checklist, to-issues).

**Tasks:**

- ✅ Add command types and definitions
- ✅ Create integration tests
- ✅ Verify all 8 spec commands functional

#### Phase 4: Constitution & Project Commands (~1 hour)

**Goal**: Add the project-level constitution command and default constitution file.

**Tasks:**

- ✅ Add `ghostwire:project:constitution` command
- ✅ Create default `.ghostwire/constitution.md` template
- ✅ Update AGENTS.md with constitution reference
- ✅ Create integration test

#### Phase 5: Cleanup (~30 minutes)

**Goal**: Delete specify files and verify clean state.

**Tasks:**

- ✅ Delete `.specify/` directory
- ✅ Delete all 9 speckit command files
- ✅ Run full test suite
- ✅ Verify no speckit references

### Files Summary

#### Files to Create (16+)

**Templates:**

- 9 template files (create, plan, tasks, implement, clarify, analyze, checklist, to-issues, constitution)
- 2 barrel exports (spec/index.ts, project/index.ts)

**Tests:**

- Unit tests for templates
- Integration tests for commands

**Default Content:**

- `.ghostwire/constitution.md` (default template)

#### Files to Modify (3)

- `src/execution/builtin-commands/types.ts` - Add 9 command types
- `src/execution/builtin-commands/commands.ts` - Add 9 command definitions
- `AGENTS.md` - Add constitution reference

#### Files to Delete (15)

- `.specify/` directory (entire directory with bash scripts, templates, memory file)
- All 9 speckit command files from `.opencode/command/`

### Success Criteria - Part 1

✅ All 9 new commands registered and functional  
✅ Command workflow works end-to-end (create → plan → tasks → implement)  
✅ All 1,869 tests pass  
✅ Type checking passes  
✅ Build succeeds  
✅ `.specify/` directory deleted  
✅ All 9 speckit command files deleted  
✅ No references to speckit remain  
✅ Constitution file created and referenced

---

## Part 2: Model Standardization Implementation

### Overview

Standardize ALL agents and categories to use `opencode/kimi-k2.5` as the primary model with a simplified fallback chain prioritizing `opencode` then `github-copilot` providers.

### Key Decisions

1. **Primary model**: `opencode/kimi-k2.5` for ALL agents (uniform strategy)
2. **Test approach**: Make tests model-agnostic (not hardcoded to specific models)
3. **Fallback chain priority**: `opencode` → `github-copilot`
4. **Exception**: Keep `google/gemini-3-flash` for `analyzer-media` (vision capabilities required)

### Scope Boundaries

- **INCLUDE**: All model references in agents.yml, model-requirements.ts, constants.ts, and documentation
- **INCLUDE**: Test files with hardcoded model assertions
- **EXCLUDE**: Vision-specific agents (analyzer-media uses gemini-3-flash for vision)
- **EXCLUDE**: Any code logic changes beyond model configuration

### Task Dependency Graph

| Task                                      | Depends On                             | Reason                                              |
| ----------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| Task 1: Update model-requirements.ts      | None                                   | Core source of truth for programmatic requirements  |
| Task 2: Update delegate-task constants.ts | None                                   | Category defaults independent of agent requirements |
| Task 3: Update agents.yml                 | Task 1                                 | YAML mirrors model-requirements.ts                  |
| Task 4: Update documentation files        | Task 1, Task 2, Task 3                 | Docs reference the source of truth                  |
| Task 5: Refactor test files               | Task 1, Task 2                         | Tests validate the new model configuration          |
| Task 6: Verification                      | Task 1, Task 2, Task 3, Task 4, Task 5 | Final validation                                    |

### Parallel Execution Graph

```
Wave 1 (Start immediately):
├── Task 1: Update model-requirements.ts (no dependencies)
└── Task 2: Update delegate-task constants.ts (no dependencies)

Wave 2 (After Wave 1 completes):
└── Task 3: Update agents.yml (depends: Task 1)

Wave 3 (After Wave 2 completes):
├── Task 4: Update documentation files (depends: Task 1, 2, 3)
└── Task 5: Refactor test files (depends: Task 1, 2)

Wave 4 (After Wave 3 completes):
└── Task 6: Verification (depends: all)

Critical Path: Task 1 → Task 3 → Task 4 → Task 6
Estimated Parallel Speedup: 30% faster than sequential
```

### Task 1: Update model-requirements.ts

**File**: `src/orchestration/agents/model-requirements.ts`

**Changes**: Update all 10 agents and 8 categories to use `opencode/kimi-k2.5`

**Agent Updates:**

| Agent                 | Old Primary         | New Primary             | Fallback Chain                                |
| --------------------- | ------------------- | ----------------------- | --------------------------------------------- |
| `operator`            | `claude-opus-4-5`   | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `executor`            | `claude-sonnet-4-5` | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `advisor-plan`        | `gpt-5.2`           | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `researcher-world`     | `glm-4.7`           | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `researcher-codebase` | `claude-haiku-4-5`  | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `analyzer-media`      | `gemini-3-flash`    | **KEEP gemini-3-flash** | `google → github-copilot → opencode` (vision) |
| `planner`             | `claude-opus-4-5`   | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `advisor-strategy`    | `claude-opus-4-5`   | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `validator-audit`     | `gpt-5.2`           | `kimi-k2.5`             | `opencode → github-copilot`                   |
| `orchestrator`        | `k2p5`              | `kimi-k2.5`             | `opencode → github-copilot`                   |

**Category Updates:**

| Category             | Old Primary         | New Primary | Variant  | Fallback Chain              |
| -------------------- | ------------------- | ----------- | -------- | --------------------------- |
| `visual-engineering` | `gemini-3-pro`      | `kimi-k2.5` | -        | `opencode → github-copilot` |
| `ultrabrain`         | `gpt-5.2-codex`     | `kimi-k2.5` | `max`    | `opencode → github-copilot` |
| `deep`               | `gpt-5.2-codex`     | `kimi-k2.5` | `medium` | `opencode → github-copilot` |
| `artistry`           | `gemini-3-pro`      | `kimi-k2.5` | -        | `opencode → github-copilot` |
| `quick`              | `claude-haiku-4-5`  | `kimi-k2.5` | -        | `opencode → github-copilot` |
| `unspecified-low`    | `claude-sonnet-4-5` | `kimi-k2.5` | -        | `opencode → github-copilot` |
| `unspecified-high`   | `claude-opus-4-5`   | `kimi-k2.5` | `max`    | `opencode → github-copilot` |
| `writing`            | `gemini-3-flash`    | `kimi-k2.5` | -        | `opencode → github-copilot` |

### Task 2: Update delegate-task constants.ts

**File**: `src/execution/tools/delegate-task/constants.ts`

**Changes**: Update `DEFAULT_CATEGORIES` with `opencode/kimi-k2.5`

**Before:**

```typescript
export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  "visual-engineering": { model: "google/gemini-3-pro" },
  ultrabrain: { model: "openai/gpt-5.2-codex", variant: "xhigh" },
  deep: { model: "openai/gpt-5.2-codex", variant: "medium" },
  artistry: { model: "google/gemini-3-pro", variant: "max" },
  quick: { model: "anthropic/claude-haiku-4-5" },
  "unspecified-low": { model: "anthropic/claude-sonnet-4-5" },
  "unspecified-high": { model: "anthropic/claude-opus-4-5", variant: "max" },
  writing: { model: "google/gemini-3-flash" },
};
```

**After:**

```typescript
export const DEFAULT_CATEGORIES: Record<string, CategoryConfig> = {
  "visual-engineering": { model: "opencode/kimi-k2.5" },
  ultrabrain: { model: "opencode/kimi-k2.5", variant: "max" },
  deep: { model: "opencode/kimi-k2.5", variant: "medium" },
  artistry: { model: "opencode/kimi-k2.5" },
  quick: { model: "opencode/kimi-k2.5" },
  "unspecified-low": { model: "opencode/kimi-k2.5" },
  "unspecified-high": { model: "opencode/kimi-k2.5", variant: "max" },
  writing: { model: "opencode/kimi-k2.5" },
};
```

### Task 3: Update agents.yml

**File**: `docs/agents.yml`

**Changes**: Update all agents and categories to reflect kimi-k2.5 configuration

**Key Changes:**

For each agent (except `analyzer-media`), update:

- `model` field to `opencode/kimi-k2.5`
- `fallback_chain` to simplified structure:
  ```yaml
  fallback_chain:
    - providers: [opencode, github-copilot]
      model: kimi-k2.5
  ```

For each category, update to match Task 2 configuration

### Task 4: Update documentation files

**Files to Update:**

- `docs/reference/configurations.md`
- `docs/reference/agents.md`
- `docs/getting-started/overview.md`
- `README.md`

**Changes:**

All examples and configuration templates should reference `opencode/kimi-k2.5` instead of various provider models

### Task 5: Refactor test files

**Strategy**: Tests should validate BEHAVIOR, not IMPLEMENTATION DETAILS

**Approach A: Test Against Constants** (Preferred)

```typescript
// Before:
test("operator has claude-opus-4-5 as primary", () => {
  const primary = AGENT_MODEL_REQUIREMENTS["operator"].fallbackChain[0];
  expect(primary.model).toBe("claude-opus-4-5");
});

// After:
test("operator has valid primary model", () => {
  const operator = AGENT_MODEL_REQUIREMENTS["operator"];
  expect(operator).toBeDefined();
  expect(operator.fallbackChain).toBeArray();
  expect(operator.fallbackChain.length).toBeGreaterThan(0);
  const primary = operator.fallbackChain[0];
  expect(primary.providers).toBeArray();
  expect(typeof primary.model).toBe("string");
});
```

**Exception - analyzer-media**: Keep specific model validation (vision requirement)

### Task 6: Verification

**Commands:**

```bash
bun run typecheck        # Type checking
bun test                 # Full test suite
bun test src/orchestration/agents/model-requirements.test.ts
bunx ghostwire doctor --verbose  # Doctor check
```

### Commit Strategy

1. `refactor(models): standardize agent model requirements to kimi-k2.5`
2. `refactor(models): standardize category defaults to kimi-k2.5`
3. `docs: update agents.yml with kimi-k2.5 model configuration`
4. `docs: update documentation with kimi-k2.5 model references`
5. `test: make model tests agnostic to specific model strings`

### Success Criteria - Part 2

✅ All agents resolve to `opencode/kimi-k2.5` (except `analyzer-media`)  
✅ All categories use unified model configuration  
✅ 594 tests pass with 0 failures  
✅ Type checking passes  
✅ Documentation reflects new configuration  
✅ Doctor command shows correct model resolution  
✅ Fallback chains simplified to `opencode → github-copilot`

---

## Parallel Execution Strategy

### Combined Timeline

**Phase 1 (Specification Integration)** - Days 1-3
- Create template infrastructure
- Add core specification commands
- Add support commands
- Add constitution command
- Cleanup (delete speckit files)

**Phase 2 (Model Standardization - Parallel)** - Days 1-3
- Wave 1: Update model-requirements.ts + constants.ts (parallel)
- Wave 2: Update agents.yml
- Wave 3: Update docs + refactor tests (parallel)
- Wave 4: Verify

**Synchronization Point**: Day 3 end
- Both initiatives converge for final testing
- Ensure no conflicts from concurrent changes
- Full integration test suite

### Risk Mitigation

- **Specification initiat**: Changes only in builtin-commands templates, isolated from model code
- **Model standardization**: Changes to model configuration don't affect command templates
- **No conflicts**: Different file domains (no merge conflicts expected)
- **Testing**: Each initiative has independent test coverage

---

## Success Criteria

### Combined Goals

✅ **Feature specification workflow streamlined** with 9 builtin commands  
✅ **Model consistency achieved** across all agents and categories  
✅ **Constitution concept established** for project-specific principles  
✅ **Development speed improved** with unified, reliable model defaults  
✅ **Test coverage maintained** at 594+ tests passing  
✅ **Documentation complete** for both initiatives  
✅ **No regressions** - all functionality preserved  

### Quality Metrics

- **Code quality**: TypeScript passes typecheck, ESLint passes
- **Test coverage**: 594+ tests, 100% pass rate
- **Performance**: Build completes in <2 minutes
- **Documentation**: All features documented with examples
- **Backward compatibility**: Existing workflows unaffected

---

## Next Steps

1. **Parallel Execution Start**: Begin both initiatives simultaneously
   - Spec integration in `src/execution/builtin-commands/templates/`
   - Model standardization in `src/orchestration/agents/` and `docs/`

2. **Checkpoints**:
   - End of Wave 1 (Day 1): Verify no conflicts
   - End of Wave 2 (Day 2): Both initiatives show progress
   - End of Phase (Day 3): Full integration test suite passes

3. **Merge Strategy**: Create separate PRs for each initiative, merge after both pass CI

This consolidated plan enables efficient parallel execution while maintaining code quality and reducing overall implementation time.
