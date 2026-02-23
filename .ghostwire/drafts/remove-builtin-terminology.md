# Draft: Remove "builtin" Terminology from Codebase

## Requirements (confirmed)

- Remove outdated "builtin" terminology since everything is now built-in to the plugin
- Maintain all existing functionality
- Ensure all 594 tests pass after refactoring
- Build commands (`bun run build`, `bun run typecheck`) must succeed

## Technical Decisions

### Directory Renames
- `src/execution/features/builtin-skills/` → `src/execution/features/skills/`
- `src/execution/features/builtin-commands/` → `src/execution/features/commands/`

### File Renames
- `src/execution/features/builtin-agents-manifest.ts` → `src/execution/features/agents-manifest.ts`
- `script/copy-builtin-skills.ts` → `script/copy-skills.ts`

### Function/Variable Renames (key mappings)
| Old Name | New Name |
|----------|----------|
| `createBuiltinSkills` | `createSkills` |
| `loadBuiltinCommands` | `loadCommands` |
| `builtinTools` | `tools` |
| `BUILTIN_COMMAND_DEFINITIONS` | `COMMAND_DEFINITIONS` |
| `BUILTIN_AGENTS_MANIFEST` | `AGENTS_MANIFEST` |
| `loadBuiltinAgents` | `loadAgents` |
| `BUILTIN_SERVERS` | `LSP_SERVERS` |
| `BUILTIN_MCP_SERVERS` | `MCP_SERVERS` |
| `getBuiltinMcpInfo` | `getMcpInfo` |
| `checkBuiltinMcpServers` | `checkMcpServers` |

### Type/Interface Renames
| Old Name | New Name |
|----------|----------|
| `BuiltinSkill` | `Skill` |
| `BuiltinCommandName` | `CommandName` |
| `BuiltinCommands` | `Commands` |
| `BuiltinCommandConfig` | `CommandConfig` |

### String Literal Changes
- Scope value `"builtin"` in skill/command contexts → `"plugin"` (to distinguish from user/project scopes)
- `"(builtin)"` in command descriptions → remove entirely
- `type: "builtin"` in MCP contexts → `type: "plugin"`

## Research Findings

### Files with "builtin" references (34 source files, 11 test files):

**Core Implementation Files:**
1. `src/index.ts` - Main plugin entry (imports, variable names)
2. `src/execution/tools/index.ts` - `builtinTools` export
3. `src/execution/features/builtin-skills/` - Entire directory
4. `src/execution/features/builtin-commands/` - Entire directory
5. `src/execution/features/builtin-agents-manifest.ts` - Auto-generated manifest
6. `src/execution/features/opencode-skill-loader/` - Multiple files
7. `src/orchestration/agents/utils.ts` - Skill loading
8. `src/orchestration/agents/load-markdown-agents.ts` - Manifest import
9. `src/platform/opencode/config-composer.ts` - Config composition
10. `src/platform/config/schema.ts` - Schema definitions
11. `src/execution/tools/lsp/constants.ts` - `BUILTIN_SERVERS`
12. `src/execution/tools/lsp/config.ts` - Server references
13. `src/cli/doctor/checks/mcp.ts` - `BUILTIN_MCP_SERVERS`, `getBuiltinMcpInfo`
14. `src/cli/doctor/checks/lsp.ts` - Source references
15. `src/cli/doctor/checks/auth.ts` - Plugin source references
16. `src/cli/doctor/constants.ts` - Check IDs
17. `src/cli/doctor/types.ts` - Type definitions
18. `src/execution/tools/slashcommand/` - Command discovery
19. `src/execution/tools/skill/crud.ts` - Skill management
20. `src/execution/tools/delegate-task/tools.ts` - Category descriptions

**Build Scripts:**
1. `script/copy-builtin-skills.ts` - Skill copy script
2. `script/build-agents-manifest.ts` - Manifest generation
3. `Makefile` - Build targets

**Documentation:**
1. `AGENTS.md` - Project knowledge base
2. `CONTRIBUTING.md` - Contribution guide
3. `DEVELOPMENT.md` - Development guide
4. `docs/concepts/system-deep-dive.md`
5. `docs/concepts/plugin-architecture.md`

**Test Files (11 files):**
1. `src/platform/opencode/config-composer.test.ts`
2. `src/platform/config/schema.test.ts`
3. `src/execution/features/opencode-skill-loader/skill-content.test.ts`
4. `src/execution/tools/skill/crud.test.ts`
5. `src/execution/tools/slashcommand/tools.test.ts`
6. `src/execution/tools/delegate-task/tools.test.ts`
7. `src/execution/tools/lsp/config.test.ts`
8. `src/cli/doctor/checks/mcp.test.ts`
9. `src/cli/doctor/checks/lsp.test.ts`
10. `src/cli/doctor/checks/auth.test.ts`
11. `src/orchestration/agents/model-requirements.test.ts`

## Scope Boundaries

### INCLUDE:
- All TypeScript source files with "builtin" terminology
- All test files referencing "builtin"
- Build scripts and Makefile
- Documentation files
- Type definitions and interfaces

### EXCLUDE:
- Third-party dependencies
- Generated files that will be regenerated (e.g., `builtin-agents-manifest.ts` auto-regenerates)
- Skill SKILL.md content files (unless they reference "builtin")

## Open Questions

- None - scope is clear from task description

## Dependency Analysis

### Order of Operations (Critical):
1. **Directory renames MUST happen first** - All import paths depend on this
2. **Type renames MUST happen before function renames** - Functions use types
3. **Test files MUST be updated alongside their source files** - Atomic commits
4. **Build script updates MUST happen after source changes** - Scripts reference source paths

### Import Path Dependencies:
```
src/index.ts → src/execution/features/builtin-skills/
src/orchestration/agents/utils.ts → src/execution/features/builtin-skills/
src/orchestration/agents/load-markdown-agents.ts → src/execution/features/builtin-agents-manifest.ts
src/platform/opencode/config-composer.ts → src/execution/features/builtin-commands/
src/execution/tools/slashcommand/tools.ts → src/execution/features/builtin-commands/
src/execution/features/opencode-skill-loader/merger.ts → src/execution/features/builtin-skills/types.ts
src/execution/features/opencode-skill-loader/skill-content.ts → src/execution/features/builtin-skills/skills.ts
src/execution/tools/skill/crud.ts → src/execution/features/builtin-skills/skills.ts
```
