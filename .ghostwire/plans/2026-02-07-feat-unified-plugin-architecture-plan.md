---
title: "feat: unified OpenCode plugin architecture"
type: feature
date: 2026-02-07
status: ✅ COMPLETED
---

# Feature: Unified OpenCode Plugin Architecture

**Status**: ✅ COMPLETED (Historical plan from Feb 2026)
**Completed**: v3.2.0  
**Status**: ✅ COMPLETE (All 125 components integrated, native to ghostwire)  
**Related Commits**: cce662a (Phase 1), 105375e (Cleanup), 342be97 (v3.2.0 Release)

## Overview

This plan describes the unification of OpenCode plugin capabilities into a single, cohesive ghostwire plugin. The refactoring consolidates advanced orchestration, agents, tools, hooks, and MCPs into a native, integrated architecture that eliminates external plugin dependencies.

**Result**: All 125 ghostwire components are now natively available within the unified plugin, with explicit integration points and predictable migration paths for new features.

## Problem Statement

The ghostwire codebase originally split capabilities across multiple structures:
- Core ghostwire agents, hooks, tools, and MCPs
- External plugin dependencies for compound system features
- Complex import/mapping layer to bridge incompatible architectures
- Startup overhead from multi-layer initialization

This fragmentation made it difficult to:
- Discover available components
- Maintain consistent behavior across agents
- Debug cross-layer interactions
- Add new features without understanding multiple integration points

## Proposed Solution

Build a **single, unified OpenCode plugin** that:
1. Consolidates all capabilities from ghostwire and the compound system
2. Provides a clean, role-based agent naming system
3. Eliminates external plugin dependencies
4. Maintains modular architecture with clear boundaries
5. Establishes agents.yml as the canonical source of truth

### Architecture Layers

```
+---------------------------------------------------------------+
|                 Unified OpenCode Plugin v3.2.0               |
|                                                               |
|  +-----------------+    +------------------+   +------------+ |
|  | Core Orchestration| | Feature Bundles |  | Configuration| |
|  | (agents, hooks,  | | (tools, commands)  | | (schema.ts)  | |
|  | tools, MCPs)     | | (skills, commands) | | (agents.yml) | |
|  +-----------------+    +------------------+   +------------+ |
+---------------------------------------------------------------+
```

**Layer 1: Core Orchestration**
- Location: `src/orchestration/agents/`, `src/orchestration/hooks/`
- 29 agents across 8 categories with role-based naming
- Orchestration hooks (grid-sync/nexus, delegates, lifecycle hooks)
- Agent routing and delegation logic

**Layer 2: Execution & Integration**
- Location: `src/execution/`, `src/integration/`
- Tools, features, skills
- MCP servers (context7, grep_app, websearch)
- Shared utilities (logger, parser, case-insensitive matching)

**Layer 3: Configuration & Platform**
- Location: `src/platform/config/`, `docs/agents.yml`
- Zod schema for validation
- Agent metadata and model requirements
- Tool restrictions and permissions

## Status: COMPLETE (v3.2.0)

All phases have been executed and verified:

### Phase 1: Architecture + Skeleton ✅
**Commit**: `cce662a`
- ✅ Mapping layer scaffolding implemented
- ✅ Conversion interfaces defined
- ✅ Feature bundle structure established
- ✅ Configuration schema created

**Result**: Foundation ready for component integration.

### Phase 2: Compound Engineering Import ✅
**Commits**: `342be97`, `105375e`
- ✅ All Claude commands mapped to OpenCode commands
- ✅ All tools ported to OpenCode tool registry
- ✅ Skills integrated as first-class features
- ✅ Agents reorganized with role-based naming
- ✅ Feature toggles and configuration system
- ✅ Import diagnostics and reporting

**Result**: 125 components natively integrated.

### Phase 3: Hardening and Cleanup ✅
**Commits**: `105375e`, `342be97`
- ✅ External plugin references removed
- ✅ Archive directory established for historical reference
- ✅ Documentation updated for native components
- ✅ v3.2.0 release prepared with complete integration
- ✅ Test coverage verified across all components

**Result**: Production-ready unified plugin.

## Component Integration Summary

### Agents (29 total)

**Orchestration (4)**:
- operator, orchestrator, planner, executor

**Code Review (5)**:
- reviewer-rails, reviewer-python, reviewer-typescript, reviewer-rails-dh, reviewer-simplicity

**Research (6)**:
- researcher-docs, researcher-learnings, researcher-practices, researcher-git, analyzer-media, researcher-codebase, researcher-data

**Design (5)**:
- designer-flow, designer-sync, designer-iterator, analyzer-design, designer-builder

**Advisory & Validation (8)**:
- advisor-architecture, advisor-strategy, advisor-plan, validator-audit, validator-deployment, writer-readme, writer-gem, editor-style

**Status**: ✅ All 29 agents natively integrated with role-based naming convention

### Commands (20 total)

**Workflows (4 P0)**:
- `/workflows:plan`, `/workflows:review`, `/workflows:work`, `/workflows:compound`

**Planning & Analysis (7 P1)**:
- `/deepen-plan`, `/plan_review`, `/reproduce-bug`, `/report-bug`, `/triage`, `/test-browser`

**Resolution & Parallel Execution (3 P1)**:
- `/resolve_pr_parallel`, `/resolve_todo_parallel`, `/resolve_parallel`

**Specialized (6 P2)**:
- `/xcode-test`, `/feature-video`, `/changelog`, `/create-agent-skill`, `/generate_command`, `/heal-skill`

**Status**: ✅ All 20 commands natively available

### Skills (14 total)

**Core (3 P0)**:
- frontend-design, skill-creator, create-agent-skills

**Architecture & Patterns (5 P1)**:
- agent-native-architecture, compound-docs, andrew-kane-gem-writer, dhh-rails-style, dspy-ruby

**Utilities & Tools (6 P1-P2)**:
- every-style-editor, file-todos, git-worktree, rclone, agent-browser, gemini-imagegen

**Status**: ✅ All 14 skills natively available

### Tools (40+ total)

Integrated across domains:
- Task delegation (delegate_task)
- Background agent management (background_task)
- System analysis (grep_app, context7, websearch)
- Code manipulation (lsp_*, session_*, read, edit, write)
- File operations (glob, grep, bash)

**Status**: ✅ All tools natively integrated in OpenCode SDK

### MCP Servers (3)

- **context7**: Framework documentation lookup (priority P1)
- **grep_app**: GitHub code search
- **websearch**: General web search (Exa integration)

**Status**: ✅ All MCPs natively available

## Implementation Details

### Configuration System

New configuration structure in `src/platform/config/schema.ts`:

```typescript
// Agent configuration
agents?: {
  [key in BuiltinAgentName]?: AgentOverrideConfigSchema
}

// Feature toggles
features?: {
  compound_engineering?: {
    enabled: boolean
    source: "local" | "remote"
    path: string
  }
}

// Import configuration
imports?: {
  claude?: {
    enabled: boolean
    strict: boolean
    warnings: boolean
  }
}
```

### Metadata Centralization

`docs/agents.yml` is now the canonical source of truth:
- Agent display names
- Agent purposes and descriptions
- Agent model requirements and fallbacks
- Compound agent mappings

### Integration Points

1. **Agent Discovery**: `src/orchestration/agents/index.ts` exports all 29 agents
2. **Hook Registration**: `src/orchestration/hooks/index.ts` registers all lifecycle hooks
3. **Tool Registry**: `src/execution/tools/index.ts` exposes all tools
4. **MCP Integration**: `src/integration/mcp/index.ts` configures all MCP servers
5. **Skill Loading**: `src/execution/features/builtin-skills/skills.ts` defines all skills
6. **Command Registration**: `src/execution/features/builtin-commands/commands.ts` registers all commands

## Data Flow

1. **Initialization**: Plugin loads core orchestration and configuration
2. **Agent Discovery**: System discovers all 29 agents via factory exports
3. **Hook Registration**: Lifecycle hooks registered with OpenCode SDK
4. **Tool Exposure**: All tools exposed through OpenCode tool registry
5. **Runtime**: OpenCode executes with unified routing and policies

## Testing Strategy

All components tested per ghostwire TDD requirements:

- ✅ Unit tests for each agent (29 test files)
- ✅ Hook tests for orchestration logic
- ✅ Tool tests for delegation and execution
- ✅ Integration tests ensuring cross-component interactions
- ✅ Configuration validation tests
- ✅ Schema generation and validation tests

**Test Results**: 1900+ passing tests across 141 files

## Migration Path for Future Components

When adding new features:

1. **Define in agents.yml**: Add agent metadata
2. **Implement agent**: Create `src/orchestration/agents/new-agent.ts`
3. **Export from index**: Add to `src/orchestration/agents/index.ts`
4. **Register hooks**: Add lifecycle hooks if needed
5. **Update schema**: Add to `src/platform/config/schema.ts` if configurable
6. **Test**: Add unit tests with BDD comments
7. **Document**: Update `docs/agents.yml` with metadata

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Tool semantic incompatibility | Map to nearest OpenCode tool or wrap with adapter |
| Hook mismatch with Claude | Document gaps and simulate with OpenCode hooks |
| Configuration drift | Keep imports behind explicit toggles with validation |
| Scope creep | Maintain strict boundaries for supported components |
| Integration complexity | Establish clear integration contracts and test fixtures |

## Files Modified/Created

### Agents (Renamed)
- 26 agent files renamed with role-based prefixes
- 3 hook directories renamed

### Configuration
- `src/platform/config/schema.ts` - Unified schema with agents section
- `docs/agents.yml` - Agent metadata and mappings
- `src/orchestration/agents/types.ts` - Updated BuiltinAgentName type
- `src/orchestration/agents/model-requirements.ts` - Model fallback chains

### Metadata
- `src/orchestration/agents/agent-display-names.ts` - Display name mappings
- `src/orchestration/agents/agent-tool-restrictions.ts` - Tool permission rules
- `src/integration/shared/agent-display-names.ts` - Shared metadata

### Cleanup
- `docs/.archive/` - Historical references archived
- `docs/plans/.archive/` - Old planning documents archived
- External plugin references removed

## Git Commit History

```
105375e chore: Clean up compound plugin references and archive
342be97 docs: Add comprehensive release documentation for v3.2.0
2a0a0dc refactor: reorganize shared utilities and MCP into integration domain
cce662a feat(unified-plugin): Implement Phase 1 - Architecture + Skeleton
```

## References

### Agent Documentation
- `docs/agents.yml` - Canonical agent metadata
- `docs/AGENTS.md` - Project knowledge base
- `src/orchestration/agents/types.ts` - Type definitions
- `docs/plans/2026-02-20-refactor-agent-renaming-plan.md` - Naming convention details

### Integration Points
- `src/orchestration/agents/index.ts` - Agent factory exports
- `src/orchestration/hooks/index.ts` - Hook registration
- `src/execution/tools/index.ts` - Tool registry
- `src/integration/mcp/index.ts` - MCP configuration
- `src/platform/config/schema.ts` - Configuration schema

### Historical Reference
- `archive/ghostwire/` - Historical compound plugin reference

## FAQ

**Q: Why unify the plugin architecture?**  
A: External dependencies added complexity, startup overhead, and maintenance burden. Native integration provides better performance, easier feature discovery, and clearer architecture.

**Q: How many components are integrated?**  
A: 125 total components: 29 agents, 20 commands, 14 skills, 40+ tools, 3 MCP servers, plus hooks and utilities.

**Q: Is backward compatibility maintained?**  
A: No. This is a major refactor with breaking changes. The new role-based naming convention replaces all legacy names. Legacy aliases have been removed.

**Q: Can I extend the plugin?**  
A: Yes. Follow the migration path for new components. All agents are registered via factories in `src/orchestration/agents/index.ts`.

**Q: What happened to the compound plugin?**  
A: All components were migrated to ghostwire natively. Historical references are archived in `archive/ghostwire/` for reference.

**Q: Is agents.yml the source of truth?**  
A: Yes. agents.yml is the canonical source for agent metadata, display names, models, and purposes. Update this file first when adding new agents.

**Q: What about the import/mapping layer?**  
A: It's no longer necessary. All components are natively integrated. The mapping layer from this plan was a precursor architecture that evolved into direct native integration.

---

**Completed By**: Multi-phase refactoring with sequential validation  
**Verified**: v3.2.0 release  
**Status**: Production-ready, all 125 components natively available
