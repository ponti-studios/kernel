---
title: refactor: agent renaming and naming convention standardization
type: refactor
date: 2026-02-20
status: complete
---

# Refactor: Agent Renaming and Naming Convention Standardization

**Completed**: 2026-02-20  
**Status**: ✅ COMPLETE (6 phases executed, 29 agents renamed, legacy aliases removed)  
**Related Commits**: 72f8df8...c605c58

## Overview

All 29 agents in the Ghostwire repository have been successfully renamed from legacy metaphor-based names (void-*, zen-*, *-scan, etc.) to clean, role-based names (reviewer-*, researcher-*, advisor-*, etc.). This refactor eliminated naming inconsistencies and improved code clarity across 6 sequential phases.

## Problem Statement

The codebase had accumulated multiple naming schemes over time:
- **Prefix patterns**: `void-*` (4 agents), `zen-*` (2 agents), `eye-*` (2 agents), `design-*` (4 agents)
- **Suffix patterns**: `*-scan` (5 agents), `*-check` (3 agents), `*-review` (5 agents), `*-loop`, `*-sync`
- **Descriptive names**: agent-arch, war-mind, null-audit, dark-runner, ui-build, docs-write-readme
- **Legacy patterns**: `*-ops` (2 agents: scan-ops, eye-ops)

This inconsistency made the agent landscape difficult to navigate and understand.

## Proposed Solution

Standardize all agent names using **role-based prefixes** that immediately convey the agent's purpose:

| Prefix | Meaning | Count | Examples |
|--------|---------|-------|----------|
| `reviewer-*` | Code review specialists | 5 | reviewer-rails, reviewer-typescript |
| `researcher-*` | Knowledge researchers | 6 | researcher-docs, researcher-codebase |
| `analyzer-*` | Analysis agents | 2 | analyzer-media, analyzer-design |
| `designer-*` | Design specialists | 5 | designer-flow, designer-sync |
| `advisor-*` | Strategic advisors | 2 | advisor-architecture, advisor-strategy |
| `validator-*` | Validation/audit agents | 2 | validator-audit, validator-deployment |
| `writer-*` | Documentation writers | 1 | writer-readme |
| `editor-*` | Content editors | 1 | editor-style |
| Simple names | Orchestration/execution | 4 | operator, orchestrator, planner, executor |

**Total**: 29 agents across 8 categories

## Status: COMPLETE

All 6 phases executed successfully with full verification:
- ✅ **29/29 agents renamed**
- ✅ **Tests passing** (1902+ pass, pre-existing failures only)
- ✅ **Build successful** (schema generated)
- ✅ **Zero orphaned references**
- ✅ **Zero legacy aliases**
- ✅ **agents.yml is canonical source of truth**

---

## Technical Approach: Phased Renaming

**Strategy:** Sequential phases organized by agent category. Each phase:
1. Renames agent files and functions
2. Updates all references throughout codebase
3. Validates with `bun run typecheck` and `bun test`
4. Creates single git commit per phase
5. Moves to next phase with clean git state

### Phase 1: Orchestration (4 agents)
**Executed**: ✅ Commit `72f8df8`

| Old Name | New Name | Role |
|----------|----------|------|
| `void-runner` | `operator` | General purpose executor |
| `grid-sync` | `orchestrator` | Master orchestrator (delegates) |
| `zen-planner` | `planner` | Strategic planning consultant |
| `dark-runner` | `executor` | Focused executor (no delegation) |

**Hooks Renamed**:
- `zen-planner-md-only/` → `planner-md-only/`
- `dark-runner-notepad/` → `executor-notepad/`
- `grid-sync/` → `orchestrator/`

---

### Phase 2: Code Review (5 agents)
**Executed**: ✅ Commit `fbe56f2`

| Old Name | New Name | Role |
|----------|----------|------|
| `void-review-rails` | `reviewer-rails` | Kieran Rails (DHH philosophy) |
| `void-review-python` | `reviewer-python` | Kieran Python |
| `void-review-ts` | `reviewer-typescript` | Kieran TypeScript |
| `zen-review-rails` | `reviewer-rails-dh` | DHH Rails (architectural) |
| `mono-review` | `reviewer-simplicity` | Code Simplicity (YAGNI) |

---

### Phase 3: Research (5 agents)
**Executed**: ✅ Commit `1e9f06e`

| Old Name | New Name | Role |
|----------|----------|------|
| `docs-scan` | `researcher-docs` | Framework Docs Researcher |
| `learnings-scan` | `researcher-learnings` | Learnings Researcher (institutional) |
| `best-practices-scan` | `researcher-practices` | Best Practices Researcher |
| `git-scan` | `researcher-git` | Git History Analyzer |
| `eye-scan` | `analyzer-media` | Multimodal Media Analyzer |

---

### Phase 4: Design (5 agents)
**Executed**: ✅ Commit `4aff90a`

| Old Name | New Name | Role |
|----------|----------|------|
| `flow-check` | `designer-flow` | Spec Flow Analyzer |
| `figma-sync` | `designer-sync` | Figma Design Sync |
| `design-loop` | `designer-iterator` | Design Iterator (iterative refinement) |
| `design-check` | `analyzer-design` | Design Implementation Reviewer |
| `ui-build` | `designer-builder` | Frontend Design (production UI) |

---

### Phase 5: Advisory/Architecture/Documentation (8 agents)
**Executed**: ✅ Commit `4c32b78`

| Old Name | New Name | Role |
|----------|----------|------|
| `agent-arch` | `advisor-architecture` | Agent-Native Architecture |
| `war-mind` | `advisor-strategy` | Tactician Strategist |
| `eye-ops` | `advisor-plan` | Seer Advisor (architecture, debugging) |
| `null-audit` | `validator-audit` | Glitch Auditor (plan validation) |
| `deploy-check` | `validator-deployment` | Deployment Verification |
| `docs-write-readme` | `writer-readme` | Ankane README Writer |
| `docs-write-gem` | `writer-gem` | Andrew Kane Gem Writer |
| `docs-edit-style` | `editor-style` | Every Style Editor |

**Note**: Last 2 agents are compound agent placeholders.

---

### Phase 6: Legacy Agents (2 agents)
**Executed**: ✅ Commit `4d04a59`

| Old Name | New Name | Role |
|----------|----------|------|
| `scan-ops` | `researcher-codebase` | Codebase search specialist |
| `data-dive` | `researcher-data` | External library and docs researcher |

**Implementation Details**:
- Renamed function exports: `createExploreAgent` → `createResearcherCodebaseAgent`
- Renamed function exports: `createLibrarianAgent` → `createResearcherDataAgent`
- Renamed metadata constants: `EXPLORE_PROMPT_METADATA` → `RESEARCHER_CODEBASE_PROMPT_METADATA`
- Renamed metadata constants: `LIBRARIAN_PROMPT_METADATA` → `RESEARCHER_DATA_PROMPT_METADATA`
- Updated 206 references across 40 files
- Updated configuration schema (3 locations)
- Updated model requirements and tool restrictions
- Removed all legacy compound agent aliases from `agent-display-names.ts`
- Updated all test files with new agent names

---

## Bug Fix: isPlanAgent Word-Boundary Matching

**Commit**: `c126c8d`

### Issue
The `isPlanAgent()` function used substring matching (`includes()`), causing false positives. For example, `advisor-plan` incorrectly matched because it contains "plan", even though `advisor-plan` is not a plan agent.

### Solution
Changed from substring matching to exact-match or prefix-match with word boundaries:

```typescript
// Before (broken):
return PLAN_AGENT_NAMES.some((name) => lowerName === name || lowerName.includes(name));

// After (fixed):
return PLAN_AGENT_NAMES.some((name) => {
  return lowerName === name || lowerName.startsWith(name + "-");
});
```

### Impact
- Agents like `planner` and `planner-md-only` correctly match
- Prevents `advisor-plan` from incorrectly matching `plan`

---

## Verification & Results

### Test Results
- ✅ `bun run typecheck` - PASSED (no type errors)
- ✅ `bun test` - PASSED (1902+ tests pass, 19 pre-existing failures unrelated to renaming)
- ✅ `bun run build` - PASSED (schema generated)

### Code Quality
- ✅ **Zero orphaned references**: grep confirms no old agent names remain
- ✅ **All exports updated**: New function names propagated throughout
- ✅ **Hook directories renamed**: 3 hook directories updated
- ✅ **Tests updated**: All agent-related tests use new names
- ✅ **Schema updated**: Configuration schema reflects new agent IDs

### Documentation
- ✅ **agents.yml is canonical**: Agent metadata centralized in single source of truth
- ✅ **Legacy aliases removed**: No backward compatibility aliases (breaking change)
- ✅ **Git history clean**: 6 sequential commits, each phase validates independently

---

## Files Modified

### Agent Implementations
- **Files renamed**: 26 agent files (24 direct agents + 2 compound placeholders)
  - `src/orchestration/agents/operator.ts`, `orchestrator.ts`, `planner.ts`, `executor.ts`
  - `src/orchestration/agents/reviewer-*.ts` (5 files)
  - `src/orchestration/agents/researcher-*.ts` (6 files)
  - `src/orchestration/agents/analyzer-*.ts` (2 files)
  - `src/orchestration/agents/designer-*.ts` (5 files)
  - `src/orchestration/agents/advisor-*.ts` (2 files)
  - `src/orchestration/agents/validator-*.ts` (2 files)
  - `src/orchestration/agents/writer-*.ts`, `editor-*.ts` (2 files)

### Configuration & Integration
- `src/orchestration/agents/index.ts` - Updated exports
- `src/orchestration/agents/types.ts` - Updated BuiltinAgentName type
- `src/orchestration/agents/utils.ts` - Updated agent factory mappings
- `src/orchestration/agents/model-requirements.ts` - Updated model requirements
- `src/orchestration/agents/agent-tool-restrictions.ts` - Updated tool restrictions
- `src/platform/config/schema.ts` - Updated schema references (3 locations)
- `docs/agents.yml` - Agent metadata (canonical source)

### Tests (18 files)
- `src/integration/shared/agent-display-names.test.ts`
- `src/orchestration/agents/model-requirements.test.ts`
- `src/execution/tools/delegate-task/tools.test.ts`
- `src/execution/features/background-agent/manager.test.ts`
- `src/execution/features/task-toast-manager/manager.test.ts`
- `src/cli/config-manager.test.ts`, `model-fallback.test.ts`
- `src/orchestration/hooks/delegate-task-retry/index.test.ts`, `category-skill-reminder/index.test.ts`
- And 10 more test files

### Cleanup (Phase 6 Final)
- Deleted: `docs/.archive/` (4 files)
- Deleted: `docs/plans/.archive/` (2 files)
- Deleted: `checklists/naming-remediation-plan.md`
- Deleted: `NAMING_REMEDIATION_PLAN.md`, `NAMING_ANALYSIS_SUMMARY.txt`
- Deleted: `ANALYSIS_INDEX.md`
- Moved: `bulk-rename.sh` → `scripts/bulk-rename.sh`

---

## Migration Pattern Reference

For future agent renaming, follow this pattern:

### Key Files to Update (7 layers per agent)
1. **Filename**: `old-name.ts` → `new-name.ts`
2. **Export function**: `createOldNameAgent` → `createNewNameAgent`
3. **Metadata constant**: `OLD_NAME_METADATA` → `NEW_NAME_METADATA`
4. **Compound mappings**: Update `compound/index.ts`
5. **Hook directories**: Rename if agent has hook-specific directory
6. **Configuration schema**: Update `schema.ts` and `agents.yml`
7. **Text references**: Update all imports throughout codebase

### Tools Available
- `scripts/bulk-rename.sh` - Automated renaming with name permutation generation
- Existing phases 1-6 as templates for phased approach

---

## Summary of Changes

**Total Impact**:
- 26 agent files renamed
- 40+ source files updated
- 206 references replaced
- 6 phases of sequential work
- Zero breaking test failures related to renaming
- All legacy naming patterns eliminated

**Before**:
- 7 different naming schemes
- Inconsistent prefix/suffix patterns
- Multiple names per agent (filename, export, alias, ID)
- Difficult to understand agent purpose from name

**After**:
- 8 role-based prefixes
- Consistent, predictable naming
- Single canonical name per agent in agents.yml
- Clear purpose evident from prefix

---

## Git Commit History

```
c605c58 cleanup: remove ANALYSIS_INDEX.md (references deleted archive documents)
7108abe cleanup: remove Phase 6 planning documents from root
4d04a59 phase-6: rename legacy agents and finalize naming convention
4c32b78 phase-5: rename advisory/architecture/documentation agents (8 agents)
4aff90a phase-4: rename design agents (5 agents)
1e9f06e phase-3: rename research agents (5 agents)
fbe56f2 phase-2: rename code review agents (5 agents)
72f8df8 phase-1: rename orchestration agents (4 agents)
c126c8d fix: isPlanAgent word-boundary matching to prevent false positives
```

---

## References

### Related Documentation
- `docs/agents.yml` - Agent metadata (canonical source of truth)
- `src/orchestration/agents/types.ts` - Agent type definitions
- `AGENTS.md` - Project knowledge base overview

### Implementation Examples
- `src/orchestration/agents/*.ts` - All 29 agent implementations
- `src/platform/config/schema.ts` - Configuration schema
- `scripts/bulk-rename.sh` - Renaming utility for future work

---

## FAQ

**Q: How many agents were renamed?**  
A: All 29 agents across 6 phases: 4 + 5 + 5 + 5 + 8 + 2 = 29 agents.

**Q: What about backward compatibility?**  
A: All legacy alias mappings have been removed from `agent-display-names.ts`. This is a breaking change for internal code relying on legacy names.

**Q: Why change isPlanAgent?**  
A: The function used substring matching, causing false positives. The fix uses exact match or prefix match with word boundaries.

**Q: Can I rename an agent myself?**  
A: Yes, use the patterns from Phases 1-6 and the 7-layer pattern above.

**Q: Is agents.yml the source of truth?**  
A: Yes. agents.yml is now the canonical source for agent metadata, models, purposes, and fallbacks.

**Q: What tests are failing?**  
A: 19 pre-existing failures unrelated to agent renaming (tmux timeouts, OAuth, compaction tests). All agent-related tests pass.

---

**Completed By**: Automated refactoring with sequential validation  
**Verified**: 2026-02-20  
**Status**: Ready for deployment
