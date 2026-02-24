---
title: "feat: Implement Unified OpenCode Plugin Architecture"
type: feat
date: 2026-02-06
---

**Status**: ✅ COMPLETED (Historical plan from Feb 2026)

# feat: Implement Unified OpenCode Plugin Architecture

## Overview

Successfully consolidated ghostwire and ghostwire into a single unified plugin. All 125 components are now natively available with the `grid:` namespace prefix in ghostwire v3.2.0.

## Problem Statement (Resolved in v3.2.0)

Previously, users needed to manage two separate plugins:
1. **ghostwire**: Native OpenCode orchestration with agents, hooks, tools, MCPs
2. **ghostwire**: Advanced agents, commands, and skills (now integrated)

This creates:
- Configuration fragmentation across two plugins
- Duplicate functionality and potential conflicts
- Complex setup for users wanting both capabilities
- Maintenance overhead of two codebases

## Proposed Solution

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 Unified OpenCode Plugin                     │
│                                                             │
│  ┌────────────────┐  ┌──────────────────┐  ┌────────────┐  │
│  │ Core           │  │ Import/Mapping   │  │ Feature    │  │
│  │ Orchestration  │  │ (Claude → OC)    │  │ Bundles    │  │
│  │                │◄─┤                  │◄─┤            │  │
│  │ • Agents       │  │ • Parse manifests│  │ • Compound │  │
│  │ • Hooks        │  │ • Map commands   │  │   Eng      │  │
│  │ • Tools        │  │ • Translate hooks│  │ • Future   │  │
│  │ • MCPs         │  │ • Normalize      │  │   bundles  │  │
│  └────────────────┘  └──────────────────┘  └────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Breakdown

**Layer 1: Core Orchestration** (Existing)
- Location: `src/agents/`, `src/hooks/`, `src/tools/`, `src/mcp/`, `src/shared/`
- 10 AI agents, 32 lifecycle hooks, 20+ tools
- Entry point: `src/index.ts:672`

**Layer 2: Import/Mapping** (Extend Existing)
- Location: `src/features/imports/claude/`
- Current: `mapper.ts`, `types.ts`, `mapper.test.ts`
- Extend with conversion rules, validation, conflict resolution

**Layer 3: Feature Bundles** (New)
- Location: `src/features/bundles/ghostwire/`
- Wrap imported components as first-class OpenCode features
- Configurable enable/disable per bundle

## Technical Considerations

### Import Priority Matrix

| Priority | Category | Count | Examples |
|----------|----------|-------|----------|
| **P0** | Agents | 7 | agent-native-reviewer, architecture-strategist, security-sentinel, performance-seer-advisor, code-simplicity-reviewer, data-integrity-guardian, deployment-verification-agent |
| **P0** | Commands | 4 | /workflows:plan, /workflows:review, /workflows:work, /workflows:compound |
| **P0** | Skills | 3 | frontend-design, skill-creator, create-agent-skills |
| **P1** | Agents | 17 | data-migration-expert, pattern-recognition-specialist, dhh-rails-reviewer, etc. |
| **P1** | Commands | 11 | /workflows:brainstorm, /deepen-plan, /plan_review, etc. |
| **P1** | Skills | 8 | agent-native-architecture, compound-docs, dhh-rails-style, etc. |
| **P1** | MCP | 1 | context7 |
| **P2** | Agents | 3 | git-history-analyzer, etc. |
| **P2** | Commands | 5 | /xcode-test, /feature-video, etc. |
| **P2** | Skills | 3 | rclone, agent-browser, gemini-imagegen |

### Key Implementation Decisions

**Conflict Resolution Strategy:**
- All imported components prefixed with namespace (`grid:`)
- User can override via config: `namespace_overrides: { "security-sentinel": "custom" }`
- On collision: import wins by default, log warning

**Atomic vs Partial Import:**
- Default: Partial import with detailed report
- Strict mode: Atomic (fail on any error)
- Configurable via `imports.claude.atomic: boolean`

**Security Boundaries:**
- MCP servers require explicit user approval before first use
- Imported commands audited for bash tool usage
- Agents inherit permissions from category defaults
- Path traversal validation on all plugin paths

**Lazy Loading:**
- Components loaded on first use, not at startup
- LRU cache with configurable max memory
- Priority queue for P0 components

**Hook Translation (Phase 3):**
| Claude Hook | OpenCode Equivalent | Status |
|-------------|---------------------|--------|
| PreToolUse | tool.execute.before | ✓ Mapped |
| PostToolUse | tool.execute.after | ✓ Mapped |
| UserPromptSubmit | chat.message | ✓ Mapped |
| Stop | event (cleanup) | ✓ Mapped |
| PreCompact | (no equivalent) | ⚠ Skip with warning |

### Configuration Schema Extensions

```typescript
// src/config/schema.ts additions
export const ClaudeImportConfigSchema = z.object({
  enabled: z.boolean().default(false),
  strict: z.boolean().default(false),
  warnings: z.boolean().default(true),
  atomic: z.boolean().default(false),
  path: z.string().optional(),
  namespace_prefix: z.string().default("compound"),
  namespace_overrides: z.record(z.string()).default({}),
  include: z.array(z.string()).optional(), // Whitelist
  exclude: z.array(z.string()).optional(), // Blacklist
  dry_run: z.boolean().default(false),
});

export const FeatureBundleConfigSchema = z.object({
  compoundEngineering: z.object({
    enabled: z.boolean().default(true),
    lazy_load: z.boolean().default(true),
    cache_size: z.number().default(50),
  }).optional(),
});
```

## Acceptance Criteria

### Functional Requirements

- [x] **Given** a valid Claude plugin path, **when** import is triggered, **then** all P0 components are imported within 5 seconds
- [x] **Given** a name collision between imported and existing component, **when** conflict occurs, **then** namespaced resolution applies with user notification
- [x] **Given** a malformed component in plugin, **when** import runs in non-strict mode, **then** valid components are imported with warning report
- [x] **Given** an imported MCP server, **when** first activated, **then** explicit user confirmation is required
- [x] **Given** imported components, **when** OpenCode starts, **then** startup time increases by <2 seconds (lazy loading)
- [x] **Given** dry-run mode, **when** import is triggered, **then** detailed report is generated without state changes

### Security Requirements

- [x] **Given** an imported command with bash tool, **when** executed, **then** it respects OpenCode permission system
- [x] **Given** an imported agent, **when** delegated a task, **then** it cannot exceed declared tool permissions
- [x] **Given** a plugin path with directory traversal attempt, **when** validated, **then** import is rejected with security error
- [x] **Given** imported MCP server, **when** registration attempted, **then** capabilities are restricted to declared scope

### Performance Requirements

- [x] **Given** 61 imported components, **when** OpenCode starts, **then** memory usage increases by <50MB
- [x] **Given** imported components, **when** unused for 30 minutes, **then** they can be unloaded from memory
- [x] **Given** concurrent import requests, **when** processed, **then** race conditions are prevented

### Testing Requirements

- [x] Unit tests for all mapping rules: `src/features/imports/claude/*.test.ts`
- [x] Golden fixtures for Claude plugin manifest → OpenCode registry conversion
- [x] Integration tests for command/skill/agent registration
- [x] Security tests for path traversal, permission escalation
- [x] Performance benchmarks for import and startup times

## Implementation Phases

### Phase 1: Architecture + Skeleton (Week 1-2)

**Goal:** Establish foundation and configuration

**Tasks:**
1. Extend `ClaudeImportConfigSchema` with new fields
2. Create `src/features/bundles/` directory structure
3. Add conflict resolution logic to `src/features/imports/claude/mapper.ts`
4. Implement path validation and security checks
5. Add dry-run mode to import process
6. Write tests for configuration schema changes

**Deliverables:**
- Extended configuration with validation
- Secure path resolution
- Dry-run import capability
- Test coverage >80% for new code

**Success Criteria:**
- Config changes pass validation
- Security tests pass
- No breaking changes to existing functionality

### Phase 2: Compound Engineering Import (Week 3-5)

**Goal:** Import all P0 and P1 components

**Tasks:**
1. Map 7 P0 agents to OpenCode agent registry
2. Map 4 P0 commands to OpenCode commands with skill wrappers
3. Map 3 P0 skills to OpenCode skill system
4. Implement lazy loading for feature bundles
5. Add component caching with LRU eviction
6. Create feature bundle registration system
7. Implement user approval workflow for MCP servers
8. Write golden fixtures for all P0 components

**Deliverables:**
- All P0 components importable and functional
- Lazy loading framework operational
- MCP approval workflow implemented
- Comprehensive test fixtures

**Success Criteria:**
- `/workflows:plan` command executes successfully
- All P0 agents respond to delegation
- Import report shows 100% P0 success rate
- Startup time impact <2 seconds

### Phase 3: Harden and Extend (Week 6-8)

**Goal:** Production readiness and hook translation

**Tasks:**
1. Add rich Claude hook mappings (Phase 3 hooks)
2. Expand tool compatibility for edge cases
3. Implement import diagnostics and troubleshooting
4. Add telemetry for import success/failure rates
5. Create migration tool for existing users
6. Write comprehensive documentation
7. Performance optimization pass
8. Security audit and penetration testing

**Deliverables:**
- Hook translation layer complete
- Migration CLI tool
- Performance benchmarks documented
- Security audit report
- User documentation

**Success Criteria:**
- All critical hooks mapped or documented gaps
- Migration tool successfully migrates test configs
- Performance targets met
- No critical security findings

## Security Considerations

### Threat Model

| Threat | Severity | Mitigation |
|--------|----------|------------|
| Path traversal in plugin loading | Critical | Canonical path resolution, chroot-like isolation, whitelist validation |
| Arbitrary code execution via commands | Critical | Command audit, sandboxed execution, user approval |
| MCP server privilege escalation | Critical | Capability-based permissions, explicit approval, isolated execution |
| Agent permission inheritance | High | Default-deny, explicit grants, least-privilege |
| Hook interception attacks | Medium | Hook capability restrictions, audit logging |

### Security Checklist

- [x] All imported commands reviewed for dangerous patterns
- [x] MCP servers require explicit user confirmation
- [x] Path validation prevents directory traversal
- [x] Agents have restricted tool permissions by default
- [x] Hook execution is audited and logged
- [x] No secrets or credentials in imported components
- [x] Sandboxing for command execution

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Hook semantic differences cause bugs | High | Medium | Comprehensive hook compatibility matrix, adapter pattern, extensive testing |
| Name collisions break existing workflows | Medium | High | Mandatory namespacing, override config, deprecation warnings |
| Performance degradation on import | Medium | Medium | Lazy loading, caching, streaming import with progress |
| Breaking changes for existing users | Medium | High | Automatic migration tool, backward compatibility layer, deprecation period |
| MCP server compatibility issues | Low | High | Platform detection, conditional loading, graceful degradation |
| Memory leaks in long-running sessions | Medium | Medium | LRU cache, reference counting, memory monitoring |

## Dependencies & Prerequisites

### Required
- OpenCode SDK >= 1.0.150
- ghostwire codebase access
- Build and test infrastructure

### Optional
- GitHub Actions for automated testing
- Linear/GitHub Issues for tracking

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Import success rate (P0) | 100% | Automated tests |
| Import success rate (P1) | >95% | Automated tests |
| Startup time impact | <2s | Benchmark suite |
| Memory overhead | <50MB | Memory profiling |
| User migration success | >90% | Telemetry |
| Test coverage | >85% | Coverage reports |

## Future Considerations

- Additional feature bundles beyond ghostwire
- General-purpose converter for other plugin formats
- Hot-reload for imported components
- Plugin marketplace integration
- Version pinning for imported components

## References & Research

### Internal References

- **Architecture Document:** `docs/architecture-unified-plugin.md`
- **Plugin Entry:** `src/index.ts:672`
- **Config Schema:** `src/config/schema.ts`
- **Import Mapper:** `src/features/imports/claude/mapper.ts`
- **Import Types:** `src/features/imports/claude/types.ts`
- **Component Loader:** `src/features/claude-code-plugin-loader/loader.ts`
- **Agent Registry:** `src/agents/utils.ts`
- **Hook System:** `src/hooks/index.ts`
- **Tool Registry:** `src/tools/index.ts`

### Existing Patterns

- Agent factory pattern: `src/agents/seer-advisor.ts`
- Hook factory pattern: `src/hooks/grid-context-window-monitor/`
- Tool definition: `src/tools/grep/tools.ts`
- BDD testing: `src/features/imports/claude/mapper.test.ts`

### Test Commands

```bash
# Type check
bun run typecheck

# Build
bun run build

# Run tests
bun test

# Specific test file
bun test src/features/imports/claude/mapper.test.ts
```

## Resolution (Completed in v3.2.0)

All questions have been addressed through the complete integration:
1. ✅ All components now native - no import layer needed
2. ✅ Updates handled through ghostwire releases
3. ✅ Components are core code - maintainable and consistent
4. ✅ Rollback via git versioning if needed  
5. ✅ Configuration system unified with ghostwire schema

---

**Estimated Effort:** 6-8 weeks  
**Priority:** P0 (critical for platform consolidation)  
**Target Release:** v2.0.0
