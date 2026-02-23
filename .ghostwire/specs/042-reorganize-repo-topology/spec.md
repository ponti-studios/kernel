---
title: Reorganize Core Repo Topology
status: PLANNING
priority: P1
date: 2026-02-19
---

# Feature Specification: Reorganize Core Repo Topology

## Problem Statement

The current directory structure groups code by **type** (agents/, hooks/, tools/, features/, shared/), which doesn't clearly communicate **what each part does**. Contributors struggle to find where to add new code because the organization focuses on implementation type rather than responsibility or domain.

**Example confusion**: 
- Where do I add a new lifecycle hook? → Look in hooks/
- Where is agent orchestration? → Scattered across agents/ + hooks/
- What code deals with integration concerns? → Hidden in shared/ and mcp/

## User Stories

### [P1] Reorganize to domain-based structure
**Goal**: Move directories to group by domain (what they DO) rather than type (what they ARE)

**Acceptance Criteria**:
- [ ] agents/ and hooks/ moved into orchestration/ (control flow layer)
- [ ] features/ and tools/ moved into execution/ (work execution layer)
- [ ] shared/ and mcp/ moved into integration/ (connector layer)
- [ ] config/ moved into platform/ (setup/configuration layer)
- [ ] cli/ remains separate (user interface layer)
- [ ] All imports updated without breaking build
- [ ] `bun run typecheck` passes
- [ ] `bun run build` succeeds
- [ ] `bun test` passes (no regressions)

**Dependencies**: None (refactor doesn't depend on other features)

### [P2] Document new structure
**Goal**: Update AGENTS.md, YAML files, and docs to reflect new directory organization

**Acceptance Criteria**:
- [ ] AGENTS.md "STRUCTURE" section updated with new layout
- [ ] agents.yml paths updated
- [ ] hooks.yml paths updated
- [ ] tools.yml paths updated
- [ ] features.yml paths updated
- [ ] README references to directory structure updated
- [ ] Navigation guide added to docs

**Dependencies**: Depends on P1 (reorganization must be complete first)

## Technical Requirements

### Constraints
- Must preserve git history (use `git mv` for directory moves)
- Must not break the build at any point during refactor
- All 100+ existing tests must pass after reorganization
- Import paths must be updated systematically (not manually)

### Domain Mapping

| Current | New Domain | Rationale |
|---------|------------|-----------|
| `src/agents/` | `src/orchestration/` | Agents orchestrate task flow |
| `src/hooks/` | `src/orchestration/` | Hooks orchestrate lifecycle |
| `src/features/` | `src/execution/` | Features execute functionality |
| `src/tools/` | `src/execution/` | Tools execute actions |
| `src/shared/` | `src/integration/` | Shared utilities connect across domains |
| `src/mcp/` | `src/integration/` | MCP servers integrate externally |
| `src/cli/` | `src/cli/` | CLI stays separate (no change) |
| `src/config/` | `src/platform/` | Configuration provides platform |

### Scale
- 250+ files to move
- ~500 import paths to update across ~150 files
- 7 domains affected
- 100+ test files must pass without regression

## Implementation Approach

**Phased strategy** (not monolithic):
1. **Phase 0**: Create import-mapping helper tool
2. **Phase 1**: Move orchestration domain (agents + hooks)
3. **Phase 2**: Move execution domain (features + tools)
4. **Phase 3**: Move integration domain (shared + mcp)
5. **Phase 4**: Move platform domain (config)
6. **Phase 5**: Update docs and YAML references
7. **Phase 6**: Create PR and merge

Each phase moves ONE domain, updates imports, validates with typecheck/build/test, then commits. This prevents the "500 imports at once" problem.

## Success Metrics

1. **Structure clarity**: Domain names reveal intent without reading code
2. **Navigation improvement**: Contributors can quickly find where to add code
3. **Build integrity**: No regressions, all tests pass
4. **Code consistency**: Import patterns uniform across all domains
5. **Documentation**: AGENTS.md and YAML files reflect new structure

## Deliverables

- ✅ Implementation plan (plan.md)
- ✅ Feature specification (this file - spec.md)
- [ ] Research findings (research.md - Phase 0)
- [ ] Domain data model (data-model.md - Phase 1)
- [ ] API contracts/mappings (contracts/ - Phase 1)
- [ ] Quickstart test scenarios (quickstart.md - Phase 1)
- [ ] Task checklist (tasks.md - Phase 2)
- [ ] Pull request to `dev` branch - Phase 6

## Risk & Mitigation

| Risk | Mitigation |
|------|-----------|
| Breaking imports | Systematic import-mapping tool per phase + typecheck validation |
| Incomplete refactors | One domain per commit = easy rollback if needed |
| Lost git history | Use `git mv` for all directory moves |
| Test failures | Full `bun test` suite runs after each phase |
| Merge conflicts | Each phase is small (1 domain) = fewer conflicts |

## Notes

- This is a refactor, not a feature. No new functionality added.
- Backwards compatibility: External package API unchanged (exports via src/index.ts)
- TDD compliant: Refactor validated with existing 100+ test files
- Constitution compliant: Aligns with AGENTS.md principles (Bun-only, ESM, barrel exports, git mv for history)
