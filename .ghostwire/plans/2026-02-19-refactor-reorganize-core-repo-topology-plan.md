---
title: refactor: reorganize core repo topology
type: refactor
date: 2026-02-19
---

**Status**: ✅ COMPLETED (Historical plan from Feb 2026)

# Refactor: Reorganize Core Repo Topology

## Overview
Reorganize the repo's directory topology by grouping by domain (what it DOES) rather than type. This makes the codebase easier to navigate and develop against.

## Problem Statement
The current folder layout groups by type (agents/, hooks/, tools/, features/, shared/) which doesn't clearly communicate what each part does. Contributors struggle to find where to add new code.

## Proposed Solution
Group by domain - organize directories by what they DO, not what they ARE.

### Domain Mapping

| Current | New Domain | Rationale |
|---------|------------|-----------|
| `src/agents/` | `src/orchestration/` | Agents control the flow |
| `src/hooks/` | `src/orchestration/` | Hooks are part of orchestration |
| `src/features/` | `src/execution/` | Features do the work |
| `src/tools/` | `src/execution/` | Tools execute actions |
| `src/shared/` | `src/integration/` | Shared utilities connect |
| `src/mcp/` | `src/integration/` | MCP servers integrate |
| `src/cli/` | `src/cli/` | CLI stays separate |
| `src/platform/` | `src/platform/` | Platform integration |
| `src/config/` | `src/platform/` | Config is platform-level |

### Target Structure
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

## Status: PHASED IMPLEMENTATION

**Strategy:** Incremental reorganization by domain. Each phase moves ONE domain, updates its internal imports, validates with typecheck/build, then moves to the next. This avoids the "500 import updates at once" problem.

## Technical Approach

### Phase 0 – Preparation
- [x] List all top-level directories
- [x] Map dependencies between directories
- [x] Understand build/test expectations
- [x] Domain mapping decided: orchestration, execution, integration, cli, platform
- [x] Create import-mapping tool/script (to automate grep+replace per phase)
- [x] Verify git history preservation with `git mv`

**Deliverable:** Ready-to-use import-update scripts and clean git state

---

### Phase 1 – Reorganize Orchestration Domain
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
- `bun run typecheck` passes
- `bun run build` succeeds
- No import errors

---

### Phase 2 – Reorganize Execution Domain
**Scope:** Move `src/features/` → `src/execution/features/` and `src/tools/` → `src/execution/tools/`

**Steps:**
1. Create `src/execution/` directory
2. `git mv src/features/ src/execution/features/`
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
- All previous tests still pass
- `bun run typecheck` passes
- `bun run build` succeeds

---

### Phase 3 – Reorganize Integration Domain
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
- All previous tests still pass
- `bun run typecheck` passes
- `bun run build` succeeds

---

### Phase 4 – Reorganize Platform Domain
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
- All previous tests still pass
- `bun run typecheck` passes
- `bun run build` succeeds

---

### Phase 5 – Root-Level Cleanup & Documentation
**Scope:** Update entry points, docs, and metadata

**Steps:**
1. Review `src/index.ts` structure (clean up domain imports)
2. Update `AGENTS.md` "STRUCTURE" section with new layout
3. Update `.specify/` directory reference docs
4. Update README if it mentions directory structure
5. Verify all links in docs still work
6. Run full test suite: `bun test`
7. Final `bun run build`
8. Commit: "docs: update documentation for new domain structure"

**Validation:**
- `bun test` passes (all 100+ tests)
- `bun run build` succeeds
- `bun run typecheck` passes
- No broken doc links

---

### Phase 6 – Verification & Sign-Off
- [x] Create PR targeting `dev` branch
- [x] Ensure CI passes (GitHub Actions)
- [x] Code review confirms structure clarity
- [x] Validate that new structure improves code navigation

## Import-Mapping Helper Tool (Phase 0)

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

---

## Acceptance Criteria
- [x] Domain mapping decided and documented
- [x] Phase 0: Import-mapping tool created and tested
- [x] Phase 1: Orchestration domain reorganized + tests pass
- [x] Phase 2: Execution domain reorganized + tests pass
- [x] Phase 3: Integration domain reorganized + tests pass
- [x] Phase 4: Platform domain reorganized + tests pass
- [x] Phase 5: Root-level cleanup + all tests pass
- [x] Phase 6: PR merged to `dev` branch
- [x] AGENTS.md and YAML maps reflect new structure

## Success Metrics
1. Each phase is independently testable and doesn't break the build
2. Domain name reveals intent without reading code
3. Clear separation: orchestration (control) vs execution (work) vs integration (connectors) vs platform (setup)
4. No regressions in build/test pipeline
5. Fewer than 20 import errors per phase (automated tooling should catch most)

## Dependencies & Risks
- **Dependencies:** All imports between old directories, YAML metadata files, docs
- **Risks (mitigated):** 
  - Breaking imports → Solved by per-phase validation
  - Forgetting references → Solved by systematic import-mapping tool
  - Build failures → Caught immediately by typecheck/build per phase

## Implementation Strategy
- **One domain per commit:** Easier to revert if needed
- **Validate after each phase:** typecheck + build + (selective test)
- **Use automation:** Import-mapping script for consistency
- **Preserve history:** Use `git mv` for directory moves
- **Document changes:** Update AGENTS.md and YAML references as you go

## Documentation Plan
- Phase 0: Document import-mapping tool usage
- Phase 5: Update AGENTS.md "STRUCTURE" section with new layout
- Phase 5: Update YAML files (agents.yml, hooks.yml, tools.yml, features.yml)
- Phase 5: Add navigation guide to docs
- Phase 5: Update any README references to directory structure
