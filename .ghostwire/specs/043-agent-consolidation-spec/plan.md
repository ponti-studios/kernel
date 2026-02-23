# Implementation Plan: Agent Consolidation

**Branch**: `043-agent-consolidation-spec` | **Date**: 2026-02-20 | **Spec**: `/specs/043-agent-consolidation-spec/spec.md`
**Input**: Feature specification from `/specs/043-agent-consolidation-spec/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Consolidate ghostwire's dual agent system (49 code-defined TypeScript agents + 29 plugin markdown agents) into a single source of truth using markdown-only agents with consistent naming convention in `src/orchestration/agents/`. This eliminates duplicate definitions, simplifies maintenance, and provides a clear developer experience. Current state: 9 new agents created in code-only form; ready for full consolidation.

## Technical Context

**Language/Version**: TypeScript 5.3+ (with Bun runtime)  
**Primary Dependencies**: Bun (package manager), Zod (validation), OpenCode >= 1.0.150  
**Storage**: File-based (markdown + YAML frontmatter)  
**Testing**: Bun test runner with 594 existing test files  
**Target Platform**: OpenCode plugin system (Node.js + Bun)  
**Project Type**: Monorepo with agent orchestration system  
**Performance Goals**: Agent loading < 500ms, no impact on existing performance  
**Constraints**: Must maintain backwards compatibility, no breaking API changes, all existing tests must pass  
**Scale/Scope**: 49 agents to migrate, 29 markdown files to consolidate, 594 test files to maintain

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Project Principles (from AGENTS.md)

1. **Test-Driven Development (MANDATORY)**
   - RED-GREEN-REFACTOR cycle strictly enforced
   - 594 existing test files must continue to pass
   - New tests for markdown loading must be written before implementation
   - BDD comments (`//#given`, `//#when`, `//#then`) required
   - ✅ **PASSES**: This consolidation is refactoring existing functionality (GREEN→REFACTOR)

2. **Convention-Driven Development**
   - Package manager: Bun only (NO npm, yarn)
   - Types: bun-types (NOT @types/node)
   - Build: `bun build` (ESM) + `tsc --emitDeclarationOnly`
   - Naming: kebab-case dirs, `createXXXHook`/`createXXXTool` factories
   - Temperature: 0.1 for code agents, max 0.3
   - ✅ **PASSES**: Markdown agent files use kebab-case naming (reviewer-security.md)

3. **No Breaking Changes**
   - Must maintain backwards compatibility with agent loading
   - Agent interface must remain unchanged
   - User agent references must work (with aliases if needed)
   - ✅ **PASSES**: Using same agent IDs from code-defined agents, maintaining compatibility

4. **Clarity Over Cleverness**
   - Single source of truth for agent definitions
   - Consistent naming conventions
   - Clear migration path
   - ✅ **PASSES**: Consolidating dual system into single markdown-based approach

### Architecture Check

- **Single responsibility**: Agent loading from one location (markdown files)
- **No duplication**: All 49 agents in one format, duplicate plugins removed
- **Type safety**: Markdown format with Zod validation for frontmatter
- ✅ **PASSES**: Architecture is cleaner than current dual system

### Complexity Justification

| Aspect | Justification |
|--------|---------------|
| Complexity increase | None - this reduces complexity by consolidating dual systems |
| Type safety | Maintained via Zod validation of YAML frontmatter |
| Performance | Loading time < 500ms (same as current file-based loading) |
| Breaking changes | None - using same agent IDs, maintaining interface |

## Project Structure

### Documentation (this feature)

```text
specs/043-agent-consolidation-spec/
├── plan.md              # This file
├── research.md          # Phase 0 output: research on markdown agent format
├── data-model.md        # Phase 1 output: agent format schema & loading system
├── quickstart.md        # Phase 1 output: migration guide for contributors
└── contracts/           # Phase 1 output: markdown agent format spec
    └── agent-markdown-format.md   # YAML frontmatter + content format
```

### Source Code (repository root)

```text
# Current state (BEFORE consolidation)
src/orchestration/agents/
├── [49 TypeScript files]      # Code-defined agents (e.g., reviewer-security.ts)
├── index.ts                   # COMPOUND_AGENT_MAPPINGS export
├── utils.ts                   # createBuiltinAgents() function
└── types.ts                   # Agent type definitions

src/plugin/agents/
├── review/                    # 14 markdown agent files
├── research/                  # 5 markdown agent files
├── design/                    # 3 markdown agent files
├── docs/                      # 1 markdown agent file
└── workflow/                  # 6 markdown agent files

# Desired state (AFTER consolidation)
src/orchestration/agents/
├── [49 markdown files]        # e.g., reviewer-security.md, validator-bugs.md
│   ├── reviewer-security.md
│   ├── validator-bugs.md
│   ├── guardian-data.md
│   └── [46 more...]
├── index.ts                   # Updated to load markdown + export COMPOUND_AGENT_MAPPINGS
├── utils.ts                   # Updated loadMarkdownAgents() function
└── types.ts                   # Type definitions (may need updates)

src/plugin/agents/
└── [Only community/user-defined agents] # NO duplicates of ghostwire agents

src/execution/features/claude-code-plugin-loader/
└── loader.ts                  # Updated loadPluginAgents() to filter duplicates
```

**Structure Decision**: This feature consolidates agents into single location (`src/orchestration/agents/`) using markdown format with YAML frontmatter. TypeScript agent definitions will be removed. Plugin markdown agents will be deduplicated (keeping markdown originals in orchestration/).

## Complexity Tracking

> No violations - this consolidation REDUCES complexity by eliminating dual agent systems

| Aspect | Status | Notes |
|--------|--------|-------|
| Dual agent system | RESOLVED | Consolidating 49 code agents + 29 plugin agents into single markdown format |
| Naming inconsistency | RESOLVED | Using code-defined naming convention (kebab-case: reviewer-security) |
| Type safety | MAINTAINED | Zod validation for YAML frontmatter |
| Backwards compatibility | MAINTAINED | Using same agent IDs, preserving agent interface |
| Performance | IMPROVED | Single loading mechanism instead of dual system |
| Test coverage | MAINTAINED | All 594 existing tests continue to pass |
