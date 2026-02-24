# Work Plan: Remove "builtin" Terminology from Codebase

**Created:** 2026-02-22
**Status:** ✅ COMPLETED
**Priority:** High
**Estimated Effort:** Medium-Large (8-12 hours)
**Risk Level:** Medium (many files, but mechanical changes)

---

## Executive Summary

Remove outdated "builtin" terminology throughout the codebase. This involves directory renames, file renames, function/variable renames, type renames, and documentation updates. The work is organized into 7 phases with strict dependency ordering to maintain a working codebase at each commit.

---

## Phase 1: Directory Renames and Import Path Updates
**Dependencies:** None
**Verification:** `bun run typecheck` passes

### 1.1 Rename `builtin-skills` directory
- [x] `src/execution/features/builtin-skills/` → `src/execution/features/skills/`

### 1.2 Update all import paths referencing `builtin-skills`
Files to update (10 files):
- [x] `src/index.ts` - Line 55: `import { createBuiltinSkills } from "./execution/features/builtin-skills"`
- [x] `src/orchestration/agents/utils.ts` - Line 43: `import { createBuiltinSkills } from "../../execution/features/builtin-skills"`
- [x] `src/execution/features/opencode-skill-loader/skill-content.ts` - Line 1: `import { createBuiltinSkills } from "../builtin-skills/skills"`
- [x] `src/execution/features/opencode-skill-loader/merger.ts` - Line 3: `import type { BuiltinSkill } from "../builtin-skills/types"`
- [x] `src/execution/tools/skill/crud.ts` - Line ~211: `import("../../features/builtin-skills/skills")`

### 1.3 Rename `builtin-commands` directory
- [x] `src/execution/features/builtin-commands/` → `src/execution/features/commands/`

### 1.4 Update all import paths referencing `builtin-commands`
Files to update (4 files):
- [x] `src/platform/opencode/config-composer.ts` - Line 9: `import { loadBuiltinCommands } from "../../execution/features/builtin-commands"`
- [x] `src/platform/opencode/config-composer.test.ts` - Line 8: `import * as builtinCommands from "../../execution/features/builtin-commands"`
- [x] `src/execution/tools/slashcommand/tools.ts` - Line 15: `import { loadBuiltinCommands } from "../../features/builtin-commands"`

### 1.5 Rename `builtin-agents-manifest.ts` file
- [x] `src/execution/features/builtin-agents-manifest.ts` → `src/execution/features/agents-manifest.ts`

### 1.6 Update import of agents manifest
- [x] `src/orchestration/agents/load-markdown-agents.ts` - Line 5: `import { BUILTIN_AGENTS_MANIFEST } from "../../execution/features/builtin-agents-manifest"`

**Commit Message:** `refactor: rename builtin directories to skills/commands/agents-manifest`

---

## Phase 2: Type and Interface Renames
**Dependencies:** Phase 1 complete
**Verification:** `bun run typecheck` passes

### 2.1 Rename types in `src/execution/features/skills/types.ts`
- [x] `BuiltinSkill` → `Skill`

### 2.2 Update all references to `BuiltinSkill` type
Files to update (3 files):
- [x] `src/execution/features/opencode-skill-loader/merger.ts` - Lines 3, 31, 205
- [x] `src/execution/features/skills/skills.ts` - Return type references
- [x] `src/execution/features/skills/index.ts` - Export statement

### 2.3 Rename types in `src/execution/features/commands/types.ts`
- [x] `BuiltinCommandName` → `CommandName`
- [x] `BuiltinCommandConfig` → `CommandConfig`
- [x] `BuiltinCommands` → `Commands`

### 2.4 Update all references to command types
Files to update (3 files):
- [x] `src/execution/features/commands/commands.ts` - Import and usage
- [x] `src/platform/opencode/config-composer.ts` - Type references
- [x] `src/platform/config/schema.ts` - Schema references (if applicable)

### 2.5 Update skill scope type literals
- [x] `src/execution/features/opencode-skill-loader/types.ts` - Line 5: `"builtin"` → `"plugin"`
- [x] `src/execution/tools/slashcommand/types.ts` - Line 4: `"builtin"` → `"plugin"`
- [x] `src/execution/tools/skill/types.ts` - Line 35: `"builtin"` → `"plugin"`

### 2.6 Update MCP/LSP type literals in doctor checks
- [x] `src/cli/doctor/types.ts` - Line 96: `source: "builtin"` → `source: "plugin"`
- [x] `src/cli/doctor/types.ts` - Line 101: `type: "builtin"` → `type: "plugin"`

**Commit Message:** `refactor: rename Builtin* types to simpler names and update scope literals`

---

## Phase 3: Function and Variable Renames (Skills Module)
**Dependencies:** Phase 2 complete
**Verification:** `bun run typecheck` passes

### 3.1 Rename in `src/execution/features/skills/skills.ts`
- [x] `createBuiltinSkills` → `createSkills`
- [x] `builtinSkills` variable → `skills`

### 3.2 Update export in `src/execution/features/skills/index.ts`
- [x] Update export: `export { createSkills, type CreateSkillsOptions } from "./skills"`

### 3.3 Update all callers of `createBuiltinSkills`
Files to update (4 files):
- [x] `src/index.ts` - Lines 55, 369
- [x] `src/orchestration/agents/utils.ts` - Lines 43, 386, 387
- [x] `src/execution/features/opencode-skill-loader/skill-content.ts` - Line 1, 24
- [x] `src/execution/tools/skill/crud.ts` - Lines 211-213

### 3.4 Update merger.ts helper function
- [x] `src/execution/features/opencode-skill-loader/merger.ts`:
  - Line 31: `builtinToLoaded` → `skillToLoaded` (internal function)
  - All internal variable references

**Commit Message:** `refactor: rename createBuiltinSkills to createSkills`

---

## Phase 4: Function and Variable Renames (Commands Module)
**Dependencies:** Phase 3 complete
**Verification:** `bun run typecheck` passes

### 4.1 Rename in `src/execution/features/commands/commands.ts`
- [x] `BUILTIN_COMMAND_DEFINITIONS` → `COMMAND_DEFINITIONS`
- [x] `loadBuiltinCommands` → `loadCommands`

### 4.2 Update export in `src/execution/features/commands/index.ts`
- [x] Update exports if needed

### 4.3 Update all callers
Files to update (3 files):
- [x] `src/platform/opencode/config-composer.ts` - Lines 9, 416, 444
- [x] `src/platform/opencode/config-composer.test.ts` - Lines 8, 48, 107
- [x] `src/execution/tools/slashcommand/tools.ts` - Lines 15, 73, 74

### 4.4 Remove "(builtin)" prefix from command descriptions
- [x] `src/execution/features/commands/commands.ts`:
  - Line 95: `"(builtin) Initialize..."` → `"Initialize..."`
  - Line 107: `"(builtin) Start self-referential..."` → `"Start self-referential..."`
  - Line 120: `"(builtin) Start ultrawork loop..."` → `"Start ultrawork loop..."`
  - Line 132: `"(builtin) Cancel active..."` → `"Cancel active..."`
  - Line 139: `"(builtin) Intelligent refactoring..."` → `"Intelligent refactoring..."`
  - Line 147: `"(builtin) Start operator..."` → `"Start operator..."`
  - Line 165: `"(builtin) Stop all continuation..."` → `"Stop all continuation..."`

**Commit Message:** `refactor: rename loadBuiltinCommands to loadCommands and clean descriptions`

---

## Phase 5: Function and Variable Renames (Agents and Tools)
**Dependencies:** Phase 4 complete
**Verification:** `bun run typecheck` passes

### 5.1 Rename agents manifest exports
- [x] `src/execution/features/agents-manifest.ts`:
  - `BUILTIN_AGENTS_MANIFEST` → `AGENTS_MANIFEST`
  - `loadBuiltinAgents` → `loadAgents`

### 5.2 Update agents manifest callers
- [x] `src/orchestration/agents/load-markdown-agents.ts` - Line 5

### 5.3 Rename tools export
- [x] `src/execution/tools/index.ts` - Line 69: `builtinTools` → `tools`

### 5.4 Update tools callers
- [x] `src/index.ts` - Lines 66, 458

### 5.5 Rename LSP constants
- [x] `src/execution/tools/lsp/constants.ts` - Line 88: `BUILTIN_SERVERS` → `LSP_SERVERS`

### 5.6 Update LSP callers
- [x] `src/execution/tools/lsp/config.ts` - Lines 3, 109, 288

### 5.7 Rename MCP constants and functions
- [x] `src/cli/doctor/checks/mcp.ts`:
  - Line 8: `BUILTIN_MCP_SERVERS` → `MCP_SERVERS`
  - Line 40: `getBuiltinMcpInfo` → `getMcpInfo`
  - Line 67: `checkBuiltinMcpServers` → `checkMcpServers`

### 5.8 Update MCP callers
- [x] `src/cli/doctor/constants.ts` - Line 33: `MCP_BUILTIN` → `MCP_PLUGIN`

**Commit Message:** `refactor: rename builtin exports in agents, tools, LSP, and MCP modules`

---

## Phase 6: Build Script and Makefile Updates
**Dependencies:** Phase 5 complete
**Verification:** `make build` succeeds

### 6.1 Rename copy script
- [x] `script/copy-builtin-skills.ts` → `script/copy-skills.ts`

### 6.2 Update copy script content
- [x] Update all path references from `builtin-skills` to `skills`
- [x] Update console.log messages

### 6.3 Update build-agents-manifest.ts
- [x] `script/build-agents-manifest.ts` - Line 6: Update OUTPUT_FILE path
- [x] Update generated code to use new export names

### 6.4 Update Makefile
- [x] Line 119-120: `Copying builtin skills` → `Copying skills`
- [x] Line 120, 130: `copy-builtin-skills.ts` → `copy-skills.ts`
- [x] Line 223: Legacy target `copy-builtin-skills` → `copy-skills`
- [x] Line 226: Update dependency

**Commit Message:** `refactor: update build scripts for new directory structure`

---

## Phase 7: Test File Updates
**Dependencies:** Phase 5 complete (can run in parallel with Phase 6)
**Verification:** `bun test` passes

### 7.1 Update test assertions and comments
Files to update (11 test files):

- [x] `src/platform/opencode/config-composer.test.ts`:
  - Update import path
  - Update mock spy references
  - Update test descriptions referencing "builtin"

- [x] `src/platform/config/schema.test.ts`:
  - Line 382: Update test description

- [x] `src/execution/features/opencode-skill-loader/skill-content.test.ts`:
  - Update BDD comments mentioning "builtin"
  - Update scope assertions from `"builtin"` to `"plugin"`

- [x] `src/execution/tools/skill/crud.test.ts`:
  - Lines 22-24: Update scope filter tests
  - Lines 78-82: Update reserved name tests
  - Lines 127-138: Update error message assertions

- [x] `src/execution/tools/slashcommand/tools.test.ts`:
  - Line 13: Update scope assertion

- [x] `src/execution/tools/delegate-task/tools.test.ts`:
  - Update test descriptions mentioning "builtin"

- [x] `src/execution/tools/lsp/config.test.ts`:
  - Line 275: Update test name

- [x] `src/cli/doctor/checks/mcp.test.ts`:
  - Update function name references
  - Update type assertions
  - Update test descriptions

- [x] `src/cli/doctor/checks/lsp.test.ts`:
  - Update `source: "builtin"` → `source: "plugin"` assertions

- [x] `src/cli/doctor/checks/auth.test.ts`:
  - Update BDD comment

- [x] `src/orchestration/agents/model-requirements.test.ts`:
  - Line 159: Update test description

**Commit Message:** `test: update test files for builtin terminology removal`

---

## Phase 8: Documentation Updates
**Dependencies:** All code phases complete
**Verification:** Manual review

### 8.1 Update AGENTS.md
- [x] Line 74: `builtin-skills` → `skills`
- [x] Line 75: `builtin-commands` → `commands`
- [x] Line 146: `builtin-skills/skills.ts` → `skills/skills.ts`

### 8.2 Update CONTRIBUTING.md
- [x] Line 147: Update path reference
- [x] Line 148: Update path reference
- [x] Line 201: `builtinAgents` → `agents`
- [x] Line 246: `builtinTools` → `tools`

### 8.3 Update DEVELOPMENT.md
- [x] Line 12: Update manifest file reference
- [x] Line 74: Update path reference

### 8.4 Update docs/concepts files
- [x] `docs/concepts/system-deep-dive.md` - Line 81: `builtinTools` → `tools`
- [x] `docs/concepts/plugin-architecture.md` - Line 140: `builtinTools` → `tools`

### 8.5 Update docs/*.yml if needed
- [x] Review `docs/skills.yml`, `docs/commands.yml`, etc. for "builtin" references

**Commit Message:** `docs: update documentation for builtin terminology removal`

---

## Verification Checklist

After each phase:
- [x] `bun run typecheck` passes
- [x] No TypeScript errors in IDE

After Phase 6:
- [x] `make build` succeeds
- [x] `bun run script/build-agents-manifest.ts` generates correct output

After Phase 7:
- [x] `bun test` passes (all 594 tests)

Final verification:
- [x] Clean build: `make clean && make build`
- [x] Full test suite: `bun test`
- [x] Plugin loads correctly in OpenCode

---

## Risk Mitigation

### Backup Strategy
Before starting, create a backup branch:
```bash
git checkout -b backup/before-builtin-removal
git checkout -b refactor/remove-builtin-terminology
```

### Rollback Plan
If issues arise:
```bash
git checkout backup/before-builtin-removal
```

### Incremental Commits
Each phase produces a working, verifiable state. If a phase fails:
1. Fix the issue within that phase
2. Re-verify before proceeding

---

## Notes

- The `builtin-agents-manifest.ts` is auto-generated. After renaming, run `bun run script/build-agents-manifest.ts` to regenerate with new export names.
- LSP's "source" field uses `"builtin"` to mean "bundled with plugin" vs `"config"` (user-configured). Changing to `"plugin"` maintains this semantic.
- Some "builtin" references in test BDD comments are descriptive, not functional. Update them for consistency but they don't affect test execution.
