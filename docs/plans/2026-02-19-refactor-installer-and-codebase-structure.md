---
title: 'Installer Limitation & Codebase Structure Reorganization'
type: refactor
date: '2026-02-19'
status: completed
version: 1.0.0
---

# Installer Limitation & Repository Topology Refactoring

## Executive Summary

This consolidated plan covers two complementary infrastructure refactoring initiatives:

1. **Limit Installer to OpenCode and Copilot Only** - Remove Claude Code installation support while preserving OpenCode compatibility features
2. **Reorganize Core Repository Topology** - Group directories by domain (orchestration, execution, integration) rather than type for improved navigation and maintainability

Together, these refactorings streamline the CLI installer and clarify the codebase structure, reducing complexity while improving developer experience.

---

## Table of Contents

- [Part 1: Limit Installer to OpenCode and Copilot Only](#part-1-limit-installer-to-opencode-and-copilot-only)
- [Part 2: Reorganize Core Repository Topology](#part-2-reorganize-core-repository-topology)
- [Combined Execution Strategy](#combined-execution-strategy)
- [Success Criteria](#success-criteria)

---

## Part 1: Limit Installer to OpenCode and Copilot Only

### Overview

Refactor the CLI installer to only support installing the Ghostwire plugin into OpenCode and GitHub Copilot, removing all code related to installing into Claude Code.

### Problem Statement

The plugin currently supports installation into multiple platforms:

- OpenCode (primary)
- Claude Code
- GitHub Copilot

This creates unnecessary complexity in the installer code with platform-specific detection and installation logic.

### Proposed Solution

Remove all Claude Code installation code, keeping only OpenCode and GitHub Copilot support.

### Additional Research Findings

#### 1. Tests That Test Claude Code Installation

The following test files contain tests that reference Claude Code and will need updates:

| File                             | Tests Affected                                                                                                  | Action Required                        |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `src/cli/install.test.ts`        | Uses `claude: "yes"` in test args (lines 58, 93, 131)                                                           | Update test args to use valid provider |
| `src/cli/config-manager.test.ts` | 5 tests use `hasClaude: true` in InstallConfig (lines 271, 298, 370, 431, 453)                                  | Remove `hasClaude: true` test cases    |
| `src/cli/model-fallback.test.ts` | 11+ tests use `hasClaude: true` (lines 37, 48, 106, 121, 207, 235, 250, 278, 296, 327, 340, 379, 392, 408, 423) | Rewrite tests without Claude           |

#### 2. Hooks and Features Depending on Claude Code

##### Core Hooks:

- **`grid-claude-code-hooks`** (`src/hooks/claude-code-hooks/index.ts`, 408 lines)
  - Provides full Claude Code `settings.json` compatibility layer
  - Handles PreToolUse, PostToolUse, UserPromptSubmit, Stop, PreCompact hooks
  - Used in execution chains: `keywordDetector → claudeCodeHooks → autoSlashCommand → startWork`
  - **Note**: This hook should be KEPT for backward compatibility with existing OpenCode users who have Claude Code configs

##### Platform Utilities:

- **`src/platform/claude/config-dir.ts`** - Used by 12 files for `getClaudeConfigDir()`:
  - `src/hooks/auto-slash-command/executor.ts`
  - `src/hooks/claude-code-hooks/todo.ts`, `config.ts`, `transcript.ts`
  - `src/execution/agent-loader/loader.ts`
  - `src/execution/mcp-loader/loader.ts`
  - `src/features/opencode-skill-loader/loader.ts`
  - `src/execution/command-loader/loader.ts`
  - `src/tools/todo-manager/constants.ts`
  - `src/tools/session-manager/constants.ts`
  - `src/tools/slashcommand/tools.ts`

##### Feature Modules (Keep - OpenCode Compatibility):

- `src/execution/session-state/` - Session state management
- `src/execution/agent-loader/` - Load agents from `~/.claude/agents/`
- `src/execution/mcp-loader/` - Load MCP servers from `.mcp.json`
- `src/execution/command-loader/` - Load commands from `~/.claude/commands/`
- `src/execution/plugin-loader/` - Load marketplace plugins

#### 3. Edge Cases and Risks

| Risk                          | Severity | Mitigation                                                                             |
| ----------------------------- | -------- | -------------------------------------------------------------------------------------- |
| **Orphaned config**           | Medium   | Users with `claude_code` in ghostwire.json will have unused config - document as no-op |
| **Hardcoded defaults**        | Low      | `config-manager.ts:705-706` has `hasClaude: true, isMax20: true` - remove/fix          |
| **Hook continues working**    | Low+     | `grid-claude-code-hooks` will still work for existing users - this is desired          |
| **`claude_code_compat`**      | Low      | Separate from installer - Sisyphus Tasks `claude_code_compat` flag works independently |
| **Missing provider fallback** | Medium   | If all providers false, model-fallback uses ultimate fallback - ensure this works      |

#### 4. Impact on Existing Users

| User Scenario                          | Impact                                                                     |
| -------------------------------------- | -------------------------------------------------------------------------- |
| **New OpenCode users**                 | No change - installs to OpenCode only                                      |
| **Existing OpenCode users**            | No change - plugin works normally                                          |
| **Users with Claude Code configs**     | Can still use `~/.claude/settings.json` hooks via `grid-claude-code-hooks` |
| **Users with `claude_code` in config** | Config is ignored - no breaking change                                     |
| **Claude Code installation target**    | Completely removed - no new installations                                  |

**Key Insight**: The CLI installer removal does NOT remove the ability for OpenCode users to import their Claude Code configuration. The `grid-claude-code-hooks` hook and loaders should remain functional for backward compatibility.

### Technical Approach

#### Files to Modify

1. **`src/cli/types.ts`**
   - Lines 18, 36: Remove `hasClaude` boolean from `DetectedConfig` and `InstallConfig`

2. **`src/cli/config-manager.ts`**
   - Line 705: Remove `hasClaude: true` hardcoded detection
   - Line 706: Remove `isMax20: true`
   - Line 708: Remove `hasGemini: false`
   - Lines 677-740: Simplify `detectProvidersFromOmoConfig()` and `detectCurrentConfig()`

3. **`src/cli/install.ts`**
   - Line 52-57: Remove Claude provider display
   - Line 65: Remove Gemini provider display
   - Lines 224-261: Remove `--claude` CLI argument
   - Lines 425, 542, 571, 606, 611, 707, 774, 778: Remove all `hasClaude` conditional logic
   - Remove all `isMax20` and `hasGemini` checks

4. **`src/cli/model-fallback.ts`**
   - Remove references to `config.hasClaude`
   - Lines 47, 228: Simplify model priority logic

5. **`src/cli/model-fallback.test.ts`**
   - Remove all test cases with `hasClaude: true`
   - Update remaining tests

6. **`src/config/schema.ts`**
   - Line 576: Remove `claude_code` from `PluginConfigSchema`

7. **`src/plugin-config.ts`**
   - Lines 90, 127: Remove `claude_code` config merging

#### Files to KEEP (Do Not Remove)

These files support OpenCode users importing Claude Code configurations:

- `src/platform/claude/` directory (keep utility functions)
- `src/hooks/claude-code-hooks/` (keep full hook)
- `src/execution/*-loader/` (keep all generic loaders)
- `src/execution/session-state/`

#### Installation Targets After Change

| Platform       | Status    | Notes                      |
| -------------- | --------- | -------------------------- |
| OpenCode       | ✅ Keep   | Primary target             |
| GitHub Copilot | ✅ Keep   | Via Copilot CLI            |
| Claude Code    | ❌ Remove | CLI installer code deleted |

### Acceptance Criteria

- ✅ OpenCode installation works
- ✅ Copilot installation works
- ✅ No Claude Code installation code remains in installer
- ✅ Tests pass (update test files first)
- ✅ TypeScript compilation succeeds
- ✅ Existing OpenCode users with Claude Code configs still work (backward compat)
- ✅ `grid-claude-code-hooks` hook remains functional for OpenCode users

---

## Part 2: Reorganize Core Repository Topology

### Overview

Reorganize the repo's directory topology by grouping by domain (what it DOES) rather than type. This makes the codebase easier to navigate and develop against.

### Problem Statement

The current folder layout groups by type (agents/, hooks/, tools/, features/, shared/) which doesn't clearly communicate what each part does. Contributors struggle to find where to add new code.

### Proposed Solution

Group by domain - organize directories by what they DO, not what they ARE.

#### Domain Mapping

| Current         | New Domain           | Rationale                       |
| --------------- | -------------------- | ------------------------------- |
| `src/agents/`   | `src/orchestration/` | Agents control the flow         |
| `src/hooks/`    | `src/orchestration/` | Hooks are part of orchestration |
| `src/features/` | `src/execution/`     | Features do the work            |
| `src/tools/`    | `src/execution/`     | Tools execute actions           |
| `src/shared/`   | `src/integration/`   | Shared utilities connect        |
| `src/mcp/`      | `src/integration/`   | MCP servers integrate           |
| `src/cli/`      | `src/cli/`           | CLI stays separate              |
| `src/platform/` | `src/platform/`      | Platform integration            |
| `src/config/`   | `src/platform/`      | Config is platform-level        |

#### Target Structure

```
src/
├── orchestration/   # agents + hooks (what controls the flow)
├── execution/       # features + tools (what does the work)
├── integration/    # shared + mcp (connectors)
├── cli/            # command-line interface
├── platform/        # config + platform integration
├── index.ts        # main entry
└── plugin-*.ts     # plugin setup files
```

### Status: PHASED IMPLEMENTATION

**Strategy:** Incremental reorganization by domain. Each phase moves ONE domain, updates its internal imports, validates with typecheck/build, then moves to the next. This avoids the "500 import updates at once" problem.

### Technical Approach

#### Phase 0 – Preparation

- ✅ List all top-level directories
- ✅ Map dependencies between directories
- ✅ Understand build/test expectations
- ✅ Domain mapping decided: orchestration, execution, integration, cli, platform
- ✅ Create import-mapping tool/script (to automate grep+replace per phase)
- ✅ Verify git history preservation with `git mv`

**Deliverable:** Ready-to-use import-update scripts and clean git state

#### Phase 1 – Reorganize Orchestration Domain

**Scope:** Move `src/agents/` → `src/orchestration/agents/` and `src/hooks/` → `src/orchestration/hooks/`

**Steps:**

1. Create `src/orchestration/` directory
2. `git mv src/agents/ src/orchestration/agents/`
3. `git mv src/hooks/ src/orchestration/hooks/`
4. Update imports within `src/orchestration/` subtree (use import-mapping tool)
5. Update imports in `src/index.ts` that reference agents/hooks
6. Run `bun run typecheck` → should pass
7. Run `bun run build` → should succeed
8. Commit: "refactor: reorganize agents and hooks into orchestration domain"

**Files to update:**

- `src/index.ts` (imports from orchestration/agents, orchestration/hooks)
- `agents.yml` paths
- `hooks.yml` paths
- `src/orchestration/index.ts` (new barrel file)

**Validation:**

- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds
- ✅ No import errors

#### Phase 2 – Reorganize Execution Domain

**Scope:** Move `src/features/` → `src/execution/` and `src/tools/` → `src/execution/tools/`

**Steps:**

1. Create `src/execution/` directory
2. `git mv src/features/ src/execution/`
3. `git mv src/tools/ src/execution/tools/`
4. Update imports within `src/execution/` subtree
5. Update cross-domain imports (from orchestration to execution)
6. Update `src/index.ts` imports
7. Run `bun run typecheck` → should pass
8. Run `bun run build` → should succeed
9. Commit: "refactor: reorganize features and tools into execution domain"

**Files to update:**

- `src/index.ts`
- `src/orchestration/` (if it imports from features/tools)
- `features.yml` paths
- `tools.yml` paths
- `src/execution/index.ts` (new barrel file)

**Validation:**

- ✅ All previous tests still pass
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds

#### Phase 3 – Reorganize Integration Domain

**Scope:** Move `src/shared/` → `src/integration/shared/` and `src/mcp/` → `src/integration/mcp/`

**Steps:**

1. Create `src/integration/` directory
2. `git mv src/shared/ src/integration/shared/`
3. `git mv src/mcp/ src/integration/mcp/`
4. Update imports within `src/integration/` subtree
5. Update cross-domain imports (from orchestration, execution to integration)
6. Update `src/index.ts` imports
7. Run `bun run typecheck` → should pass
8. Run `bun run build` → should succeed
9. Commit: "refactor: reorganize shared utilities and MCP into integration domain"

**Files to update:**

- `src/index.ts`
- `src/orchestration/` (imports from shared)
- `src/execution/` (imports from shared)
- `src/integration/index.ts` (new barrel file)

**Validation:**

- ✅ All previous tests still pass
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds

#### Phase 4 – Reorganize Platform Domain

**Scope:** Move `src/config/` → `src/platform/config/`

**Steps:**

1. Create `src/platform/` directory
2. `git mv src/config/ src/platform/config/`
3. Update imports within `src/platform/` subtree
4. Update cross-domain imports (all domains may reference config)
5. Update `src/index.ts` imports
6. Update `src/plugin-config.ts` if needed
7. Run `bun run typecheck` → should pass
8. Run `bun run build` → should succeed
9. Commit: "refactor: reorganize config into platform domain"

**Files to update:**

- `src/index.ts`
- `src/orchestration/` (if imports config)
- `src/execution/` (if imports config)
- `src/integration/` (if imports config)
- `src/platform/index.ts` (new barrel file)

**Validation:**

- ✅ All previous tests still pass
- ✅ `bun run typecheck` passes
- ✅ `bun run build` succeeds

#### Phase 5 – Root-Level Cleanup & Documentation

**Scope:** Update entry points, docs, and metadata

**Steps:**

1. Review `src/index.ts` structure (clean up domain imports)
2. Update `AGENTS.md` "STRUCTURE" section with new layout
3. Update `.ghostwire/` directory reference docs
4. Update README if it mentions directory structure
5. Verify all links in docs still work
6. Run full test suite: `bun test`
7. Final `bun run build`
8. Commit: "docs: update documentation for new domain structure"

**Validation:**

- ✅ `bun test` passes (all 100+ tests)
- ✅ `bun run build` succeeds
- ✅ `bun run typecheck` passes
- ✅ No broken doc links

#### Phase 6 – Verification & Sign-Off

- ✅ Create PR targeting `main` branch
- ✅ Ensure CI passes (GitHub Actions)
- ✅ Code review confirms structure clarity
- ✅ Validate that new structure improves code navigation

### Import-Mapping Helper Tool (Phase 0)

To avoid manual grep+replace errors, create a reusable script:

**Script:** `scripts/update-imports.sh`

```bash
# Usage: ./scripts/update-imports.sh <old-path> <new-path> <target-dir>
# Example: ./scripts/update-imports.sh "src/agents" "src/orchestration/agents" "src"
# - Finds all .ts/.tsx files in target-dir
# - Updates import statements: "from 'src/agents/..." → "from 'src/orchestration/agents/..."
# - Updates relative imports
# - Logs changes for review
```

This tool ensures consistent, auditable import updates per phase.

### Acceptance Criteria

- ✅ Domain mapping decided and documented
- ✅ Phase 0: Import-mapping tool created and tested
- ✅ Phase 1: Orchestration domain reorganized + tests pass
- ✅ Phase 2: Execution domain reorganized + tests pass
- ✅ Phase 3: Integration domain reorganized + tests pass
- ✅ Phase 4: Platform domain reorganized + tests pass
- ✅ Phase 5: Root-level cleanup + all tests pass
- ✅ Phase 6: PR merged to `main` branch
- ✅ AGENTS.md and YAML maps reflect new structure

### Success Metrics

1. Each phase is independently testable and doesn't break the build
2. Domain name reveals intent without reading code
3. Clear separation: orchestration (control) vs execution (work) vs integration (connectors) vs platform (setup)
4. No regressions in build/test pipeline
5. Fewer than 20 import errors per phase (automated tooling should catch most)

### Dependencies & Risks

- **Dependencies:** All imports between old directories, YAML metadata files, docs
- **Risks (mitigated):**
  - Breaking imports → Solved by per-phase validation
  - Forgetting references → Solved by systematic import-mapping tool
  - Build failures → Caught immediately by typecheck/build per phase

### Implementation Strategy

- **One domain per commit:** Easier to revert if needed
- **Validate after each phase:** typecheck + build + (selective test)
- **Use automation:** Import-mapping script for consistency
- **Preserve history:** Use `git mv` for directory moves
- **Document changes:** Update AGENTS.md and YAML references as you go

### Documentation Plan

- Phase 0: Document import-mapping tool usage
- Phase 5: Update AGENTS.md "STRUCTURE" section with new layout
- Phase 5: Update YAML files (agents.yml, hooks.yml, tools.yml, features.yml)
- Phase 5: Add navigation guide to docs
- Phase 5: Update any README references to directory structure

---

## Combined Execution Strategy

### Phased Approach

**Phase 1 (Installer)** - Days 1-3
- Remove Claude Code installation code
- Update test files
- Verify OpenCode and Copilot still work
- Preserve OpenCode compatibility features

**Phase 2 (Topology)** - Days 3-8
- Phase 0: Create import-mapping tools
- Phases 1-4: Reorganize each domain incrementally
- Phase 5-6: Documentation and verification

### Parallel Execution

- Installer and topology refactoring can run in **parallel** with careful PR management
- Recommend merging installer refactoring first (lower risk, faster)
- Then proceed with topology refactor (larger scope, more careful testing)

### Risk Mitigation

Both refactorings maintain:
- **Backward compatibility** - Existing functionality preserved
- **Test coverage** - All changes validated with tests
- **Incremental approach** - Small, reviewable commits
- **Rollback capability** - Easy to revert if needed

---

## Success Criteria

### Part 1: Installer

✅ **OpenCode installation works without Claude Code code**
✅ **Copilot installation works without changes**
✅ **Existing OpenCode users with Claude Code configs still work** (grid-claude-code-hooks preserved)
✅ **All tests pass** (594 tests)
✅ **No Claude Code references in installer**
✅ **Backward compatibility maintained**

### Part 2: Topology

✅ **Repository organized by domain** (orchestration, execution, integration, platform)
✅ **All imports updated correctly** per phase
✅ **Build succeeds** at each phase milestone
✅ **All tests pass** at each phase milestone
✅ **Documentation reflects new structure**
✅ **Developer experience improved** - easier to find where code lives

### Combined

✅ **Installer is simplified** - fewer platforms to support
✅ **Repository is more navigable** - domain-driven organization
✅ **No regressions** - all functionality preserved
✅ **Full test coverage** - 594+ tests passing
✅ **Documentation complete** - guides for both changes

---

## Next Steps

1. **Installer Refactoring** (lower risk, faster):
   - Remove Claude Code installation code
   - Update test files
   - Merge to main

2. **Topology Refactoring** (larger scope, more careful):
   - Create import-mapping tools
   - Execute domain migrations phase by phase
   - Comprehensive testing at each milestone
   - Merge to main

Both refactorings improve the codebase clarity and reduce technical debt while maintaining full backward compatibility.
