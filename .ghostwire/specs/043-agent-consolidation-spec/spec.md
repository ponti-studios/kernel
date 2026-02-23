# Feature Specification: Agent Consolidation

**Ticket**: `043-agent-consolidation-spec`  
**Epic**: Consolidate ghostwire to use one correct way of defining agents  
**Status**: Planning Phase  
**Date**: 2026-02-20

## Problem Statement

Ghostwire currently has a **dual agent system** that creates confusion and maintenance burden:

1. **Code-defined agents** (TypeScript files in `src/orchestration/agents/*.ts`)
   - 38 agents with factory functions
   - Loaded via `createBuiltinAgents()` 
   - Named using pattern: `reviewer-security`, `validator-bugs`, `oracle-performance`

2. **Plugin markdown agents** (YAML frontmatter in `src/plugin/agents/*.md`)
   - 29 agents in markdown format
   - Loaded via `loadPluginAgents()`
   - Named using different pattern: `security-sentinel`, `bug-reproduction-validator`, `performance-oracle`

Both systems are loaded and merged in `config-composer.ts`, causing:
- **Duplicate agent definitions** with inconsistent names
- **Unclear which agent to use** (code or markdown version)
- **Maintenance complexity** when updating agent prompts or behavior
- **Migration burden** when users reference agent names

## Goals

1. **Consolidate to markdown-only agents** in `src/orchestration/agents/`
2. **Use code-defined agent naming convention** (e.g., `reviewer-security.md` not `security-sentinel.md`)
3. **Maintain all agent functionality** - no loss of prompts, behavior, or metadata
4. **Remove all TypeScript agent definitions** from `src/orchestration/agents/`
5. **Remove duplicate plugin markdown agents** from `src/plugin/agents/`
6. **Update agent loading system** to read markdown files instead of TypeScript code

## Success Criteria

- [x] All 38 code-defined agents converted to markdown format in `src/orchestration/agents/`
- [ ] All markdown files use code-defined naming convention (kebab-case: `reviewer-security.md`)
- [x] All duplicate TypeScript files removed from `src/orchestration/agents/`
- [x] All duplicate/redundant markdown files removed from `src/plugin/agents/`
- [x] Agent loading system updated to use markdown-only approach
- [ ] All agents maintain original functionality and metadata
- [ ] No breaking changes to agent names visible to end users
- [x] Build passes, all tests pass (594 test files)

## Scope

### In Scope

- Convert all code-defined agents to markdown format
- Update agent naming to be consistent
- Update agent loading mechanism
- Remove duplicate agent definitions
- Update COMPOUND_AGENT_MAPPINGS if needed
- Update type definitions if needed

### Out of Scope

- Adding new agents beyond current 38
- Changing agent prompts or behavior (migration-only)
- Migrating all plugin features to code (just deduplication)
- Changing user-facing agent names (maintain compatibility via aliases if needed)

## Technical Requirements

### Current Architecture

```
ghostwire/
├── src/orchestration/agents/
│   ├── [38 TypeScript files]      # Code-defined agents (TO BE REMOVED)
│   ├── index.ts                   # COMPOUND_AGENT_MAPPINGS
│   ├── utils.ts                   # createBuiltinAgents()
│   └── types.ts                   # Agent type defs
│
└── src/plugin/agents/
    ├── review/                    # 14 markdown agent files
    ├── research/                  # 5 markdown agent files
    ├── design/                    # 3 markdown agent files
    ├── docs/                      # 1 markdown agent file
    └── workflow/                  # 6 agent markdown files
```

### Desired Architecture

```
ghostwire/
├── src/orchestration/agents/
│   ├── [38 markdown files]        # Markdown-only agents (NEW)
│   │   ├── reviewer-security.md
│   │   ├── validator-bugs.md
│   │   ├── oracle-performance.md
│   │   └── [46 more...]
│   ├── index.ts                   # Updated to load markdown
│   ├── utils.ts                   # Updated loadMarkdownAgents()
│   └── types.ts                   # Updated type defs if needed
│
└── src/plugin/agents/
    └── [Only user/community agents] # NO duplicates
```

### Key Files to Modify

1. **Agent definitions** (CONVERT):
   - Each agent: `src/orchestration/agents/[agent-name].ts` → `src/orchestration/agents/[agent-name].md`

2. **Agent loading system** (UPDATE):
   - `src/orchestration/agents/index.ts` - COMPOUND_AGENT_MAPPINGS export
   - `src/orchestration/agents/utils.ts` - createBuiltinAgents() function
   - `src/platform/opencode/config-composer.ts` - Agent merging logic (lines 317-334)

3. **Plugin loader** (UPDATE/SIMPLIFY):
   - `src/execution/features/claude-code-plugin-loader/loader.ts` - loadPluginAgents() function
   - May need to filter out duplicates vs code-defined agents

## Current State

### Code-Defined Agents (38 total)

Recent additions (9 new agents, already in code):
1. `reviewer-security` - Security code review (NEW)
2. `validator-bugs` - Bug reproduction validation (NEW)
3. `guardian-data` - Data integrity review (NEW)
4. `expert-migrations` - Database migration expert (NEW)
5. `resolver-pr` - PR comment resolver (NEW)
6. `oracle-performance` - Performance optimization (NEW)
7. `reviewer-races` - Frontend race condition review (NEW)
8. `analyzer-patterns` - Pattern recognition analysis (NEW)
9. `researcher-repo` - Repository research (NEW)

Plus 40 existing agents in `src/orchestration/agents/*.ts`

### Duplicate Agent Mappings

These agents exist in BOTH code and plugin markdown forms:

| Code Name | Plugin Name | Location |
|-----------|------------|----------|
| `reviewer-security` | `security-sentinel` | code-only (NEW) / plugin |
| `validator-bugs` | `bug-reproduction-validator` | code-only (NEW) / plugin |
| `oracle-performance` | `performance-oracle` | code-only (NEW) / plugin |
| `reviewer-races` | `julik-frontend-races-reviewer` | code-only (NEW) / plugin |
| `analyzer-patterns` | `pattern-recognition-specialist` | code-only (NEW) / plugin |
| `researcher-repo` | `repo-research-analyst` | code-only (NEW) / plugin |
| [16 more agents with different naming] | - | - |

## Functional Requirements

### Agent Markdown Format

All agents must be converted to markdown with YAML frontmatter:

```yaml
---
id: reviewer-security
name: Security Code Reviewer
purpose: Review code for security vulnerabilities
models:
  primary: claude-opus-4.5
  fallback: gpt-5.2
temperature: 0.1
tags:
  - security
  - code-review
  - vulnerability
---

# Security Code Reviewer

[Agent description and prompt]
```

### Agent Loading

Updated `createBuiltinAgents()` or new `loadMarkdownAgents()` function must:

1. Scan `src/orchestration/agents/` for `.md` files
2. Parse YAML frontmatter from each file
3. Extract agent metadata (id, name, purpose, models, etc.)
4. Return agents in same format as current code-defined agents
5. Maintain backwards compatibility with agent references

### Configuration Merging

Update `config-composer.ts` to:

1. Load markdown agents from `src/orchestration/agents/`
2. Load plugin agents from `src/plugin/agents/` (after filtering)
3. Filter out duplicates (prefer code-defined/markdown versions)
4. Merge with user and project agents

## Non-Functional Requirements

### Quality Standards

- Maintain test coverage (currently 594 test files)
- No breaking changes to agent interface
- Backwards compatible agent naming (use aliases if needed)
- Performance: loading time must be < 500ms
- All agents must pass type checking

### Documentation

- Update AGENTS.md if needed
- Update agent loading documentation
- Document new markdown format for contributors
- Provide migration guide if user agents need updates

## Constraints

### Technology

- Must use Bun package manager (project standard)
- Must use TypeScript for loading system
- Must maintain Zod schema compatibility
- Must work with OpenCode >= 1.0.150

### Naming

- Agent IDs must be kebab-case (e.g., `reviewer-security`)
- Agent files must be `[id].md` format
- Must be unique within `src/orchestration/agents/`

### Process

- Must follow TDD: write tests before implementation
- Must maintain red-green-refactor cycle
- All 594 existing tests must pass
- No breaking changes to public API

## Acceptance Criteria

1. **Conversion Complete**
   - All 38 TypeScript agent files converted to markdown
   - All markdown files use correct naming convention
   - All agent metadata preserved (id, name, purpose, models, etc.)

2. **System Integration**
   - Agent loading system successfully reads markdown files
   - Agent merging logic works without conflicts
   - config-composer.ts loads agents correctly

3. **Testing**
   - All 594 existing tests pass
   - New tests for markdown loading pass
   - No type errors during build

4. **Cleanup**
   - All TypeScript agent files removed from `src/orchestration/agents/`
   - Duplicate markdown files removed from `src/plugin/agents/`
   - COMPOUND_AGENT_MAPPINGS updated if needed
   - No orphaned references in codebase

5. **Documentation**
   - specs/ directory contains: plan.md, research.md, data-model.md, quickstart.md, contracts/
   - Agent format documented for contributors
   - Migration notes (if any) documented

## Known Issues

- Currently 9 newly created agents only exist in code (no markdown versions)
- Plugin agents have inconsistent naming pattern
- Agent loading happens in two separate systems
- Potential for silent conflicts if same agent defined in both systems

## Dependencies

### Internal

- `src/orchestration/agents/` - All TypeScript agent definitions
- `src/plugin/agents/` - All markdown agent definitions
- `src/orchestration/agents/index.ts` - COMPOUND_AGENT_MAPPINGS
- `src/orchestration/agents/utils.ts` - createBuiltinAgents()
- `src/platform/opencode/config-composer.ts` - Agent merging

### External

- Bun (package manager)
- TypeScript (type system)
- YAML (frontmatter parsing)
- Zod (validation schema)

## Timeline Estimate

- **Phase 0**: Research (existing knowledge, ~2 hours)
- **Phase 1**: Design markdown format, update loading system (~4 hours)
- **Phase 2**: Implementation - convert agents, remove duplicates (~6 hours)
- **Phase 3**: Testing, cleanup, documentation (~3 hours)
- **Total**: ~15 hours

## References

### Key Files

- `AGENTS.md` - Project knowledge base
- `src/orchestration/agents/index.ts` - Agent registry
- `src/platform/opencode/config-composer.ts` - Agent loading config
- `src/plugin/agents/` - Current plugin agent definitions
- `.specify/` - Speckit configuration

### Previous Work

- Phase 1: Investigation complete (AGENTS.md updated)
- Phase 2: 13 duplicate commands removed, 9 new agents created
- Current: Ready for agent consolidation
