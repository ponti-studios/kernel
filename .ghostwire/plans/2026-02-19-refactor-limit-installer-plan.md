---
title: Limit installer to OpenCode and Copilot only
type: refactor
date: 2026-02-19
---

**Status**: ✅ COMPLETED (Historical plan from Feb 2026)

# Limit Installer to OpenCode and Copilot Only

## Overview

Refactor the CLI installer to only support installing the Ghostwire plugin into OpenCode and GitHub Copilot, removing all code related to installing into Claude Code.

## Problem Statement

The plugin currently supports installation into multiple platforms:
- OpenCode (primary)
- Claude Code  
- GitHub Copilot

This creates unnecessary complexity in the installer code with platform-specific detection and installation logic.

## Proposed Solution

Remove all Claude Code installation code, keeping only OpenCode and GitHub Copilot support.

## Additional Research Findings

### 1. Tests That Test Claude Code Installation

The following test files contain tests that reference Claude Code and will need updates:

| File | Tests Affected | Action Required |
|------|---------------|-----------------|
| `src/cli/install.test.ts` | Uses `claude: "yes"` in test args (lines 58, 93, 131) | Update test args to use valid provider |
| `src/cli/config-manager.test.ts` | 5 tests use `hasClaude: true` in InstallConfig (lines 271, 298, 370, 431, 453) | Remove `hasClaude: true` test cases |
| `src/cli/model-fallback.test.ts` | 11+ tests use `hasClaude: true` (lines 37, 48, 106, 121, 207, 235, 250, 278, 296, 327, 340, 379, 392, 408, 423) | Rewrite tests without Claude |

### 2. Hooks and Features Depending on Claude Code

#### Core Hooks:
- **`grid-claude-code-hooks`** (`src/hooks/claude-code-hooks/index.ts`, 408 lines)
  - Provides full Claude Code `settings.json` compatibility layer
  - Handles PreToolUse, PostToolUse, UserPromptSubmit, Stop, PreCompact hooks
  - Used in execution chains: `keywordDetector → claudeCodeHooks → autoSlashCommand → startWork`
  - **Note**: This hook should be KEPT for backward compatibility with existing OpenCode users who have Claude Code configs

#### Platform Utilities:
- **`src/platform/claude/config-dir.ts`** - Used by 12 files for `getClaudeConfigDir()`:
  - `src/hooks/auto-slash-command/executor.ts`
  - `src/hooks/claude-code-hooks/todo.ts`, `config.ts`, `transcript.ts`
  - `src/features/claude-code-agent-loader/loader.ts`
  - `src/features/claude-code-mcp-loader/loader.ts`
  - `src/features/opencode-skill-loader/loader.ts`
  - `src/features/claude-code-command-loader/loader.ts`
  - `src/tools/todo-manager/constants.ts`
  - `src/tools/session-manager/constants.ts`
  - `src/tools/slashcommand/tools.ts`

#### Feature Modules (Keep - OpenCode Compatibility):
- `src/features/claude-code-session-state/` - Session state management
- `src/features/claude-code-agent-loader/` - Load Claude Code agents from `~/.claude/agents/`
- `src/features/claude-code-mcp-loader/` - Load MCP servers from `.mcp.json`
- `src/features/claude-code-command-loader/` - Load commands from `~/.claude/commands/`
- `src/features/claude-code-plugin-loader/` - Load marketplace plugins

### 3. Edge Cases and Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| **Orphaned config** | Medium | Users with `claude_code` in ghostwire.json will have unused config - document as no-op |
| **Hardcoded defaults** | Low | `config-manager.ts:705-706` has `hasClaude: true, isMax20: true` - remove/fix |
| **Hook continues working** | Low+ | `grid-claude-code-hooks` will still work for existing users - this is desired |
| **`claude_code_compat`** | Low | Separate from installer - Sisyphus Tasks `claude_code_compat` flag works independently |
| **Missing provider fallback** | Medium | If all providers false, model-fallback uses ultimate fallback - ensure this works |

### 4. Impact on Existing Users

| User Scenario | Impact |
|--------------|--------|
| **New OpenCode users** | No change - installs to OpenCode only |
| **Existing OpenCode users** | No change - plugin works normally |
| **Users with Claude Code configs** | Can still use `~/.claude/settings.json` hooks via `grid-claude-code-hooks` |
| **Users with `claude_code` in config** | Config is ignored - no breaking change |
| **Claude Code installation target** | Completely removed - no new installations |

**Key Insight**: The CLI installer removal does NOT remove the ability for OpenCode users to import their Claude Code configuration. The `grid-claude-code-hooks` hook and loaders should remain functional for backward compatibility.

## Technical Approach

### Files to Modify

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

### Files to KEEP (Do Not Remove)

These files support OpenCode users importing Claude Code configurations:

- `src/platform/claude/` directory (keep utility functions)
- `src/hooks/claude-code-hooks/` (keep full hook)
- `src/features/claude-code-*` (keep all loaders)
- `src/features/claude-code-session-state/`

### Installation Targets After Change

| Platform | Status | Notes |
|----------|--------|-------|
| OpenCode | ✅ Keep | Primary target |
| GitHub Copilot | ✅ Keep | Via Copilot CLI |
| Claude Code | ❌ Remove | CLI installer code deleted |

## Acceptance Criteria

- [x] OpenCode installation works
- [x] Copilot installation works
- [x] No Claude Code installation code remains in installer
- [x] Tests pass (update test files first)
- [x] TypeScript compilation succeeds
- [x] Existing OpenCode users with Claude Code configs still work (backward compat)
- [x] `grid-claude-code-hooks` hook remains functional for OpenCode users

## References

- Installer entry: `src/cli/install.ts:1-100`
- Config detection: `src/cli/config-manager.ts:702-740`
- Types: `src/cli/types.ts`
- Platform stubs: `src/platform/claude/`
- Plugin config: `src/plugin-config.ts:90,127`
- Claude Code hooks hook: `src/hooks/claude-code-hooks/index.ts`
