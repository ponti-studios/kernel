# PROJECT KNOWLEDGE BASE

**Generated:** 2026-02-19T14:00:00+09:00
**Commit:** Phase 4 complete
**Branch:** 042-reorganize-repo-topology

---

## **IMPORTANT: PULL REQUEST TARGET BRANCH**

> **ALL PULL REQUESTS MUST TARGET THE `main` BRANCH.**
>
> Use feature branches and submit PRs against `main` for review.

---

## OVERVIEW

OpenCode plugin: multi-model agent orchestration (Claude Opus 4.5, GPT-5.2, Gemini 3 Flash, Grok Code). 39 lifecycle hooks, 14 tools (LSP, AST-Grep, delegation), 10 specialized agents, full Claude Code compatibility. "oh-my-zsh" for OpenCode.

## PROJECT CONSTITUTION

> **Project principles and governance are defined in `.ghostwire/constitution.md`**
>
> All development work must comply with the core principles outlined in the constitution:
> - Library-First Architecture
> - CLI Interface
> - Test-First Development (NON-NEGOTIABLE)
> - Integration Testing
> - Observability
>
> See the constitution file for detailed guidelines and amendment process.

## METADATA

- `docs/agents.yml`: Agent metadata (names, models, purposes, fallbacks)
- `docs/hooks.yml`: Hook metadata (names, triggers, descriptions)
- `docs/tools.yml`: Tool metadata (names, categories, descriptions)
- `docs/features.yml`: Feature metadata (names, capabilities, descriptions)

## STRUCTURE

```
ghostwire/
├── src/
│   ├── orchestration/  # Agents + Hooks (what orchestrates)
│   │   ├── agents/        (what agents exist)
│   │   └── hooks/         (when to call agents)
│   ├── execution/      # Features + Tools (what does work)
│   │   ├── features/      (what capabilities)
│   │   └── tools/         (what actions can be taken)
│   ├── integration/    # Shared utilities + MCPs (what integrates)
│   │   ├── shared/        # Cross-cutting utilities (logger, parser, etc.)
│   │   └── mcp/           # Built-in MCPs (websearch, context7, grep_app)
│   ├── platform/       # Config + Platform-specific (what configures)
│   │   ├── config/        # Zod schema, migrations, permission compat
│   │   ├── opencode/      # OpenCode-specific config
│   │   └── claude/        # Claude-specific config
│   ├── cli/            # CLI installer, doctor
│   └── index.ts        # Main plugin entry
├── script/             # build-schema.ts, build-binaries.ts
├── packages/           # 7 platform-specific binaries
└── dist/               # Build output (ESM + .d.ts)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add agent | `src/orchestration/agents/` | Create .md with YAML frontmatter and prompt |
| Add hook | `src/orchestration/hooks/` | Create dir with `createXXXHook()`, register in index.ts |
| Add tool | `src/execution/tools/` | Dir with index/types/constants/tools.ts |
| Add MCP | `src/integration/mcp/` | Create config, add to index.ts |
| Add skill | `src/execution/features/skills/` | Create dir with SKILL.md |
| Add command | `src/execution/features/commands/` | Add template + register in commands.ts |
| Config schema | `src/platform/config/schema.ts` | Zod schema, run `bun run build:schema` |
| Background agents | `src/execution/features/background-agent/manager.ts` | Task lifecycle, concurrency (1419 lines) |
| Orchestrator | `src/orchestration/hooks/grid-sync/index.ts` | Main orchestration hook (757 lines) |

## TDD (Test-Driven Development)

**MANDATORY.** RED-GREEN-REFACTOR:
1. **RED**: Write test → `bun test` → FAIL
2. **GREEN**: Implement minimum → PASS
3. **REFACTOR**: Clean up → stay GREEN

**Rules:**
- NEVER write implementation before test
- NEVER delete failing tests - fix the code
- Test file: `*.test.ts` alongside source (594 test files)
- BDD comments: `//#given`, `//#when`, `//#then`

## CONVENTIONS

- **Package manager**: Bun only (`bun run`, `bun build`, `bunx`)
- **Types**: bun-types (NEVER @types/node)
- **Build**: `bun build` (ESM) + `tsc --emitDeclarationOnly`
- **Exports**: Barrel pattern via index.ts
- **Naming**: kebab-case dirs, `createXXXHook`/`createXXXTool` factories
- **Testing**: BDD comments, 594 test files
- **Temperature**: 0.1 for code agents, max 0.3

## ANTI-PATTERNS

| Category | Forbidden |
|----------|-----------|
| Package Manager | npm, yarn - Bun exclusively |
| Types | @types/node - use bun-types |
| File Ops | mkdir/touch/rm/cp/mv in code - use bash tool |
| Publishing | Direct `bun publish` - GitHub Actions only |
| Versioning | Local version bump - CI manages |
| Type Safety | `as any`, `@ts-ignore`, `@ts-expect-error` |
| Error Handling | Empty catch blocks |
| Testing | Deleting failing tests |
| Agent Calls | Sequential - use `delegate_task` parallel |
| Hook Logic | Heavy PreToolUse - slows every call |
| Commits | Giant (3+ files), separate test from impl |
| Temperature | >0.3 for code agents |
| Trust | Agent self-reports - ALWAYS verify |

## AGENT MODELS

**Source of truth:** `agents.yml`  
This table is intentionally maintained in `agents.yml` to avoid drift. Please refer there for current agent names, models, purposes, and fallbacks.

## COMMANDS

```bash
bun run typecheck      # Type check
bun run build          # ESM + declarations + schema
bun run rebuild        # Clean + Build
bun test               # 594 test files
```

## DEPLOYMENT

**GitHub Actions workflow_dispatch ONLY**
1. Commit & push changes
2. Trigger: `gh workflow run publish -f bump=patch`
3. Never `bun publish` directly, never bump version locally

## COMPLEXITY HOTSPOTS

| File | Lines | Description |
|------|-------|-------------|
| `src/execution/features/skills/skills.ts` | 1729 | Skill definitions |
| `src/execution/features/background-agent/manager.ts` | 1419 | Task lifecycle, concurrency |
| `src/execution/tools/delegate-task/tools.ts` | 1414 | Category-based delegation |
| `src/orchestration/agents/planner.ts` | 1283 | Planning agent (planner) |
| `src/index.ts` | 940 | Main plugin entry |
| `src/orchestration/hooks/grid-sync/index.ts` | 757 | Main orchestration hook (orchestrator) |
| `src/cli/config-manager.ts` | 741 | JSONC config parsing |

## MCP ARCHITECTURE

Three-tier system:
1. **Built-in**: websearch (Exa), context7 (docs), grep_app (GitHub)
2. **Claude Code compat**: .mcp.json with `${VAR}` expansion
3. **Skill-embedded**: YAML frontmatter in skills

## CONFIG SYSTEM

- **Zod validation**: `src/platform/config/schema.ts`
- **JSONC support**: Comments, trailing commas
- **Multi-level**: Project (`.opencode/`) → User (`~/.config/opencode/`)

## NOTES

- **OpenCode**: Requires >= 1.0.150
- **Flaky tests**: overclock-loop (CI timeout), session-state (parallel pollution)
- **Trusted deps**: @ast-grep/cli, @ast-grep/napi, @code-yeongyu/comment-checker
