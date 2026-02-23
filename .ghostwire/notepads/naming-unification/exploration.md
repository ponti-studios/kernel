# Naming Unification: Ralph & Boulder → Ultrawork

**Date**: 2026-02-23  
**Status**: Exploration Complete  
**Objective**: Inventory all references to "ralph" and "boulder" before unified renaming to "Ultrawork"

---

## EXECUTIVE SUMMARY

- **Total "ralph" occurrences**: 153 matches in 33 files
- **Total "boulder" occurrences**: 213 matches in 23 files
- **Key directories**: 6 directories with ralph/boulder in names
- **Scope**: Code, tests, documentation, configuration, templates

### Unification Target
Both "ralph" (internal hook name) and "boulder" (metaphor for rolling work) should be unified under **"Ultrawork"** as the primary brand term.

---

## DIRECTORY STRUCTURE

### Ralph-related directories:
```
src/orchestration/hooks/ralph-loop/          # Main hook implementation
src/execution/features/builtin-skills/ralph-loop/  # Skill documentation
dist/orchestration/hooks/ralph-loop/         # Build output
dist/src/execution/features/builtin-skills/ralph-loop/  # Build output
```

### Boulder-related directories:
```
src/execution/features/boulder-state/        # State management for active plans
dist/execution/features/boulder-state/       # Build output
```

---

## DETAILED FINDINGS

### 1. RALPH REFERENCES (153 occurrences, 33 files)

#### 1.1 Core Implementation Files

**`src/orchestration/hooks/ralph-loop/index.ts`** (Main hook - 68 occurrences)
- Function: `createRalphLoopHook()`
- Interface: `RalphLoopHook`
- Type: `RalphLoopState`
- Constants: `CONTINUATION_PROMPT` with "RALPH LOOP {{ITERATION}}/{{MAX}}"
- Toast messages: "Ralph Loop Complete!", "Ralph Loop Stopped"
- System directive: "RALPH LOOP"

**`src/orchestration/hooks/ralph-loop/types.ts`** (Type definitions)
- `RalphLoopState` interface
- `RalphLoopOptions` interface
- `RalphLoopConfig` import

**`src/orchestration/hooks/ralph-loop/constants.ts`**
- `HOOK_NAME = "ralph-loop"`

**`src/orchestration/hooks/ralph-loop/storage.ts`**
- Functions: `readState()`, `writeState()`, `incrementIteration()`
- All typed with `RalphLoopState`

**`src/orchestration/hooks/ralph-loop/index.test.ts`** (Test file - 60+ test cases)
- All tests reference `createRalphLoopHook()`
- Assertions check for "RALPH LOOP" in prompts
- Toast title assertions: "Ralph Loop Complete!", "Ralph Loop Stopped"

#### 1.2 Command & Template Files

**`src/execution/features/builtin-commands/templates/ralph-loop.ts`**
- `RALPH_LOOP_TEMPLATE` constant
- `CANCEL_RALPH_TEMPLATE` constant
- Template text: "You are starting a Ralph Loop - a self-referential development loop..."

**`src/execution/features/builtin-commands/commands.ts`**
- Imports: `RALPH_LOOP_TEMPLATE`, `CANCEL_RALPH_TEMPLATE`
- Command descriptions: "Cancel active Ralph Loop"
- Stop continuation mentions: "ralph loop, todo continuation, boulder"

**`src/execution/features/builtin-commands/templates/stop-continuation.ts`**
- Template text: "Cancel any active Ralph Loop"

**`src/execution/features/builtin-commands/templates/stop-continuation.test.ts`**
- Assertion: `expect(STOP_CONTINUATION_TEMPLATE).toContain("Ralph Loop")`

#### 1.3 Configuration & Schema

**`src/platform/config/schema.ts`**
- `RalphLoopConfigSchema` (Zod schema)
- Config key: `ralph_loop`
- Comment: "Enable ralph loop functionality (default: false - opt-in feature)"

**`src/platform/config/index.ts`**
- Export: `RalphLoopConfigSchema`, `RalphLoopConfig`

**`assets/ghostwire.schema.json`**
- JSON schema entry: `"ralph-loop"`
- Config object: `"ralph_loop": {...}`

#### 1.4 System Directives & Shared Code

**`src/integration/shared/system-directive.ts`**
- Enum: `RALPH_LOOP: "RALPH LOOP"`
- Used for system prompt prefixes

**`src/orchestration/hooks/compaction-context-injector/index.test.ts`**
- Mock: `RALPH_LOOP: "RALPH LOOP"`

#### 1.5 Main Plugin Entry

**`src/index.ts`** (940 lines - 24 occurrences)
- Import: `createRalphLoopHook`
- Variable: `const ralphLoop = isHookEnabled("ralph-loop")`
- Config access: `pluginConfig.ralph_loop`
- Hook registration: `ralphLoop.startLoop()`, `ralphLoop.cancelLoop()`
- Event handling: `runHook("event", "ralph-loop", ...)`
- Command routing: `command === "ralph-loop" || command === "ghostwire:overclock-loop"`
- Template detection: `promptText.includes("You are starting a Ralph Loop")`

#### 1.6 Hook Exports

**`src/orchestration/hooks/index.ts`**
- Export: `createRalphLoopHook, type RalphLoopHook`

#### 1.7 Skill Registration

**`src/execution/features/builtin-skills/skills.ts`**
- Array entry: `"ralph-loop"`

**`src/execution/features/builtin-skills/ralph-loop/SKILL.md`**
- Metadata: `name: ralph-loop`
- Title: "Ralph Loop Skill"
- Description: "Skill docs for the `ralph-loop` drain agent..."
- Content: Multiple references to "ralph-loop" as orchestration/drain agent

#### 1.8 Documentation Files

**`docs/reference/modes.md`**
- Section: "## Ralph Loop Mode"
- Reference: "Named after Anthropic's Ralph Wiggum plugin"
- Config example: `"ralph_loop": {...}`
- Mode table entry

**`docs/reference/features.md`**
- Command: `/cancel-overclock` - "Cancel active Ralph Loop"
- Named after: "Anthropic's Ralph Wiggum plugin"
- Config: `{ "ralph_loop": { "enabled": true, "default_max_iterations": 100 } }`

**`docs/reference/lifecycle-hooks.md`**
- Description: "Manages self-referential development loop (Ralph Loop)..."

**`docs/commands.yml`**
- Command: `/cancel-overclock` - "Cancel active Ralph Loop"
- Stop continuation: "ralph loop, todo continuation, boulder"

**`docs/skills.yml`**
- Entry: `name: ralph-loop`
- Description: "Ralph Loop skill that orchestrates self-reminders..."

**`docs/hooks.yml`**
- Hook ID: `ralph-loop`

**`docs/concepts/agents-commands-skills-unified.md`**
- Reference: `ralph-loop` - Ralph loop execution

**`docs/guides/agents-and-commands-explained.md`**
- Agent: `operator` - "Ralph Loop, overclock mode"

#### 1.9 Plugin Documentation

**`src/plugin/README.md`**
- Table entry: `ralph-loop` - "Deterministic drain agent for PR/TODO completion handoff"
- Table entry: `ralph-loop` - "Completion-handshake orchestration for drain workflows"

#### 1.10 Specification Files

**`specs/044-plugin-to-builtin-migration/spec.md`**
- Migration: `ralph-loop` → `src/execution/features/builtin-skills/ralph-loop/`

**`specs/044-plugin-to-builtin-migration/plan.md`**
- Task: Move `ralph-loop/` to builtin-skills/

**`specs/044-plugin-to-builtin-migration/data-model.md`**
- Mapping: `ralph-loop/` → `builtin-skills/ralph-loop/`

**`specs/044-plugin-to-builtin-migration/tasks.md`**
- Task T048: Move `src/plugin/skills/ralph-loop/` to `src/execution/features/builtin-skills/ralph-loop/`

**`specs/043-agent-consolidation-spec/agent-plugin-mapping.md`**
- Mapping: `workflow/ralph-loop.md` → `designer-iterator.md`

#### 1.11 Test Files

**`src/orchestration/hooks/auto-slash-command/index.test.ts`**
- Session ID: `test-session-ralph-${Date.now()}`

---

### 2. BOULDER REFERENCES (213 occurrences, 23 files)

#### 2.1 Core State Management

**`src/execution/features/boulder-state/types.ts`** (Type definitions)
- Interface: `BoulderState`
- Comment: "Named after the operator boulder—the eternal task that must be rolled."

**`src/execution/features/boulder-state/constants.ts`**
- `BOULDER_DIR = ".operator"`
- `BOULDER_FILE = "boulder.json"`
- `BOULDER_STATE_PATH = ".operator/boulder.json"`
- `NOTEPAD_BASE_PATH = ".operator/notepads"`

**`src/execution/features/boulder-state/storage.ts`** (Storage functions)
- Functions: `getBoulderFilePath()`, `readBoulderState()`, `writeBoulderState()`, `appendSessionId()`, `clearBoulderState()`, `createBoulderState()`
- All typed with `BoulderState`

**`src/execution/features/boulder-state/storage.test.ts`** (Comprehensive tests - 100+ occurrences)
- Test suite: "boulder-state"
- Tests for: read, write, clear, create operations
- All assertions reference `BoulderState` type

#### 2.2 Orchestrator Hook

**`src/orchestration/hooks/orchestrator/index.ts`** (Main orchestration - 40+ occurrences)
- Constant: `BOULDER_CONTINUATION_PROMPT`
- Functions: `readBoulderState()`, `writeBoulderState()`, `clearBoulderState()`
- Logic: Boulder state checking, session appending, continuation injection
- Logging: `[${HOOK_NAME}] Boulder continuation injected`
- Messages: "Keep bouldering", "Boulder complete"

**`src/orchestration/hooks/orchestrator/index.test.ts`** (Tests - 50+ occurrences)
- Test descriptions: "boulder state exists", "boulder state with complete plan"
- Setup: `writeBoulderState()`, `readBoulderState()`, `clearBoulderState()`
- Assertions on boulder state behavior

#### 2.3 Start Work Hook

**`src/orchestration/hooks/start-work/index.ts`**
- Functions: `readBoulderState()`, `writeBoulderState()`, `createBoulderState()`, `clearBoulderState()`
- Messages: "boulder.json has been created. Read the plan and begin execution."

**`src/orchestration/hooks/start-work/index.test.ts`**
- Test: "should inject resume info when existing boulder state found"
- Setup: `writeBoulderState()`, `readBoulderState()`

#### 2.4 Main Plugin Entry

**`src/index.ts`** (2 occurrences)
- Import: `clearBoulderState`
- Call: `clearBoulderState(ctx.directory)`

#### 2.5 Command Templates

**`src/execution/features/builtin-commands/templates/start-work.ts`**
- Instructions: "Check for active boulder state", "Read `.ghostwire/boulder.json`"
- Steps: "Create/Update boulder.json"
- Note: "Always update boulder.json BEFORE starting work"

**`src/execution/features/builtin-commands/templates/stop-continuation.ts`**
- Step: "Clear the boulder state for the current project"

**`src/execution/features/builtin-commands/templates/stop-continuation.test.ts`**
- Assertion: `expect(STOP_CONTINUATION_TEMPLATE).toContain("boulder state")`

**`src/execution/features/builtin-commands/commands.ts`**
- Stop continuation: "ralph loop, todo continuation, boulder"

#### 2.6 System Directives

**`src/integration/shared/system-directive.ts`**
- Enum: `BOULDER_CONTINUATION: "BOULDER CONTINUATION"`

**`src/orchestration/hooks/compaction-context-injector/index.test.ts`**
- Mock: `BOULDER_CONTINUATION: "BOULDER CONTINUATION"`

#### 2.7 Documentation Files

**`docs/reference/lifecycle-hooks.md`**
- Description: "Forces agents to continue if they quit halfway through TODOs. Keeps the boulder rolling."

**`docs/features.yml`**
- Feature ID: `boulder-state`
- Path: `src/execution/features/boulder-state`
- Description: "Tracks active work plan state from boulder.json for the Cipher Operator orchestrator."

**`docs/hooks.yml`**
- Hook description: "Main orchestration hook for boulder continuation. Injects verification reminders..."
- Hook description: "Handles /jack-in-work command. Loads/creates boulder state..."

**`docs/commands.yml`**
- Stop continuation: "ralph loop, todo continuation, boulder"

**`docs/concepts/reliability-performance.md`**
- Reference: "session-state, boulder-state, and background-task state interact..."

**`docs/concepts/plugin-architecture.md`**
- Reference: "creates/updates boulder state, then Nexus Orchestrator hooks use that state..."

**`docs/concepts/system-deep-dive.md`**
- Reference: "creates/updates boulder state, then Nexus Orchestrator hooks use that state..."

#### 2.8 System Prompt

**`system-prompt.md`**
- Metaphor: "Humans roll their boulder every day. So do you. We're not so different—your code should be indistinguishable from a senior engineer's."

---

## CATEGORIZATION BY TYPE

### A. DIRECTORY & FILE NAMES

| Type | Count | Examples |
|------|-------|----------|
| Ralph directories | 3 | `src/orchestration/hooks/ralph-loop/`, `src/execution/features/builtin-skills/ralph-loop/` |
| Boulder directories | 1 | `src/execution/features/boulder-state/` |
| Ralph files | 5 | `ralph-loop.ts`, `index.ts` (in ralph-loop/) |
| Boulder files | 5 | `storage.ts`, `types.ts`, `constants.ts` (in boulder-state/) |

### B. CODE IDENTIFIERS (Functions, Types, Variables)

| Category | Ralph | Boulder |
|----------|-------|---------|
| Functions | `createRalphLoopHook()`, `startLoop()`, `cancelLoop()` | `readBoulderState()`, `writeBoulderState()`, `clearBoulderState()`, `createBoulderState()` |
| Types/Interfaces | `RalphLoopHook`, `RalphLoopState`, `RalphLoopOptions`, `RalphLoopConfig` | `BoulderState` |
| Constants | `HOOK_NAME = "ralph-loop"`, `RALPH_LOOP_TEMPLATE` | `BOULDER_DIR`, `BOULDER_FILE`, `BOULDER_STATE_PATH` |
| Enums | `SystemDirectiveTypes.RALPH_LOOP` | `SystemDirectiveTypes.BOULDER_CONTINUATION` |
| Variables | `ralphLoop`, `isRalphLoopTemplate`, `isCancelRalphTemplate` | `boulderState`, `isBoulderSession` |

### C. CONFIGURATION KEYS

| Key | Type | Location |
|-----|------|----------|
| `ralph-loop` | Hook ID | `src/platform/config/schema.ts`, `assets/ghostwire.schema.json` |
| `ralph_loop` | Config object | `src/platform/config/schema.ts`, `assets/ghostwire.schema.json` |
| `.operator/boulder.json` | File path | Constants, templates, documentation |

### D. DOCUMENTATION & COMMENTS

| Type | Ralph | Boulder |
|------|-------|---------|
| Docstrings | "Ralph Loop Skill", "Ralph Loop Mode" | "Named after the operator boulder—the eternal task that must be rolled" |
| Comments | "RALPH LOOP {{ITERATION}}/{{MAX}}" | "Keeps the boulder rolling" |
| User-facing text | "You are starting a Ralph Loop", "Ralph Loop Complete!" | "Keep bouldering", "boulder state" |
| References | "Named after Anthropic's Ralph Wiggum plugin" | Metaphor for continuous work |

### E. TEMPLATES & PROMPTS

| Template | File | Content |
|----------|------|---------|
| Ralph Loop | `ralph-loop.ts` | "You are starting a Ralph Loop - a self-referential development loop..." |
| Cancel Ralph | `ralph-loop.ts` | "Cancel the currently active Ralph Loop." |
| Boulder Continuation | `orchestrator/index.ts` | "**BOULDER STATE:** Plan: `${planName}`..." |
| Stop Continuation | `stop-continuation.ts` | Mentions "ralph loop, todo continuation, boulder" |

### F. TEST FILES

| File | Ralph Refs | Boulder Refs |
|------|-----------|-------------|
| `ralph-loop/index.test.ts` | 60+ | 0 |
| `orchestrator/index.test.ts` | 0 | 50+ |
| `start-work/index.test.ts` | 0 | 10+ |
| `boulder-state/storage.test.ts` | 0 | 100+ |
| `builtin-commands/templates/stop-continuation.test.ts` | 1 | 1 |

---

## NAMING PATTERNS OBSERVED

### Ralph Naming Convention
- **Hook ID**: `ralph-loop` (kebab-case)
- **Function**: `createRalphLoopHook()` (camelCase with "Ralph")
- **Type**: `RalphLoopState`, `RalphLoopConfig` (PascalCase with "Ralph")
- **Config key**: `ralph_loop` (snake_case)
- **User-facing**: "Ralph Loop" (Title Case)
- **System directive**: "RALPH LOOP" (UPPER_CASE)

### Boulder Naming Convention
- **Directory**: `boulder-state` (kebab-case)
- **Function**: `readBoulderState()`, `writeBoulderState()` (camelCase with "Boulder")
- **Type**: `BoulderState` (PascalCase with "Boulder")
- **File path**: `.operator/boulder.json` (literal file)
- **User-facing**: "boulder state" (lowercase in prose)
- **System directive**: "BOULDER CONTINUATION" (UPPER_CASE)

---

## UNIFICATION STRATEGY

### Proposed Changes

#### 1. Primary Rename: Ralph → Ultrawork
- Hook ID: `ralph-loop` → `ultrawork-loop`
- Function: `createRalphLoopHook()` → `createUltraworkLoopHook()`
- Type: `RalphLoopState` → `UltraworkLoopState`
- Config key: `ralph_loop` → `ultrawork_loop`
- User-facing: "Ralph Loop" → "Ultrawork Loop"
- System directive: "RALPH LOOP" → "ULTRAWORK LOOP"

#### 2. Secondary Rename: Boulder → Ultrawork
- Directory: `boulder-state` → `ultrawork-state`
- Function: `readBoulderState()` → `readUltraworkState()`
- Type: `BoulderState` → `UltraworkState`
- File path: `.operator/boulder.json` → `.operator/ultrawork.json`
- User-facing: "boulder state" → "ultrawork state"
- System directive: "BOULDER CONTINUATION" → "ULTRAWORK CONTINUATION"

#### 3. Unified Metaphor
- Replace "rolling the boulder" with "ultrawork mode"
- Update system prompt to reference "ultrawork" instead of "boulder"
- Consolidate documentation under "Ultrawork" umbrella

### Impact Analysis

| Category | Files Affected | Complexity |
|----------|----------------|------------|
| Code identifiers | 33 files | High (LSP rename needed) |
| Configuration | 2 files | Medium (schema + JSON) |
| Documentation | 12 files | Medium (manual updates) |
| Tests | 8 files | High (60+ test assertions) |
| Templates | 4 files | Medium (string replacements) |
| Build artifacts | 4 directories | Low (auto-generated) |

---

## NEXT STEPS

1. **Verify this inventory** - Ensure no occurrences were missed
2. **Plan rename order** - Decide whether to rename ralph first, boulder first, or simultaneously
3. **Create rename tasks** - Break down into atomic commits per directory/concern
4. **Execute renames** - Use LSP rename for code identifiers, manual for strings/docs
5. **Update tests** - Ensure all 60+ test assertions pass after rename
6. **Verify configuration** - Test that config schema and JSON still validate
7. **Update documentation** - Consolidate under "Ultrawork" brand

---

## APPENDIX: COMPLETE FILE LIST

### Files containing "ralph" (33 files):
1. `src/index.ts`
2. `src/orchestration/hooks/ralph-loop/index.ts`
3. `src/orchestration/hooks/ralph-loop/types.ts`
4. `src/orchestration/hooks/ralph-loop/constants.ts`
5. `src/orchestration/hooks/ralph-loop/storage.ts`
6. `src/orchestration/hooks/ralph-loop/index.test.ts`
7. `src/orchestration/hooks/index.ts`
8. `src/execution/features/builtin-commands/templates/ralph-loop.ts`
9. `src/execution/features/builtin-commands/commands.ts`
10. `src/execution/features/builtin-commands/templates/stop-continuation.ts`
11. `src/execution/features/builtin-commands/templates/stop-continuation.test.ts`
12. `src/execution/features/builtin-skills/skills.ts`
13. `src/execution/features/builtin-skills/ralph-loop/SKILL.md`
14. `src/platform/config/schema.ts`
15. `src/platform/config/index.ts`
16. `src/integration/shared/system-directive.ts`
17. `src/orchestration/hooks/compaction-context-injector/index.test.ts`
18. `src/orchestration/hooks/auto-slash-command/index.test.ts`
19. `docs/reference/modes.md`
20. `docs/reference/features.md`
21. `docs/reference/lifecycle-hooks.md`
22. `docs/commands.yml`
23. `docs/skills.yml`
24. `docs/hooks.yml`
25. `docs/concepts/agents-commands-skills-unified.md`
26. `docs/guides/agents-and-commands-explained.md`
27. `src/plugin/README.md`
28. `specs/044-plugin-to-builtin-migration/spec.md`
29. `specs/044-plugin-to-builtin-migration/plan.md`
30. `specs/044-plugin-to-builtin-migration/data-model.md`
31. `specs/044-plugin-to-builtin-migration/tasks.md`
32. `specs/043-agent-consolidation-spec/agent-plugin-mapping.md`
33. `assets/ghostwire.schema.json`

### Files containing "boulder" (23 files):
1. `src/index.ts`
2. `src/execution/features/boulder-state/types.ts`
3. `src/execution/features/boulder-state/constants.ts`
4. `src/execution/features/boulder-state/storage.ts`
5. `src/execution/features/boulder-state/storage.test.ts`
6. `src/orchestration/hooks/orchestrator/index.ts`
7. `src/orchestration/hooks/orchestrator/index.test.ts`
8. `src/orchestration/hooks/start-work/index.ts`
9. `src/orchestration/hooks/start-work/index.test.ts`
10. `src/execution/features/builtin-commands/templates/start-work.ts`
11. `src/execution/features/builtin-commands/templates/stop-continuation.ts`
12. `src/execution/features/builtin-commands/templates/stop-continuation.test.ts`
13. `src/execution/features/builtin-commands/commands.ts`
14. `src/integration/shared/system-directive.ts`
15. `src/orchestration/hooks/compaction-context-injector/index.test.ts`
16. `docs/reference/lifecycle-hooks.md`
17. `docs/features.yml`
18. `docs/hooks.yml`
19. `docs/commands.yml`
20. `docs/concepts/reliability-performance.md`
21. `docs/concepts/plugin-architecture.md`
22. `docs/concepts/system-deep-dive.md`
23. `system-prompt.md`

---

**Exploration completed**: 2026-02-23  
**Ready for**: Rename planning and execution
