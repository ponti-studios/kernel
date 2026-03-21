# Kernel

**Turn a dumb AI agent into a super intelligent and capable agent.**

Kernel is a CLI that generates skills and native agents for 6 AI coding tools from a single source of truth. Run `kernel init` once and get a complete AI workflow suite installed across every tool in your project — OpenCode, Cursor, Claude Code, GitHub Copilot, Codex, and Gemini.

You write the templates once. Kernel makes them work everywhere.

---

## Install

```bash
npm install -g @hackefeller/kernel
# or
bunx kernel init
```

---

## Quick Start

```bash
# Detect which AI tools are installed
kernel detect

# Initialize kernel (auto-detects tools, writes config, generates files)
kernel init

# Regenerate after upgrading kernel or changing config
kernel update
```

---

## The Core Workflow

**propose → explore → apply → archive** — all powered by Linear via Linear MCP.

| Command    | What it does                                                                          |
| ---------- | ------------------------------------------------------------------------------------- |
| `/propose` | Create a Linear project with top-level issues and sub-issues for implementation tasks |
| `/explore` | Read Linear project state, explore tradeoffs, write decisions back to Linear          |
| `/apply`   | Pick up the next unblocked sub-issue from Linear, implement it, update Linear         |
| `/archive` | Close out the Linear project, finish remaining issues, report deferred work           |

Linear is the source of truth. No local `proposal.md` files. No sticky notes. No "I'll just jot this down in a text file." The issue tracker IS the plan.

---

## CLI Reference

### `kernel init`

Initialize kernel in a project. Detects installed tools, writes `.agents/kernel.config.yaml`, generates everything.

```bash
kernel init [options]

  -t, --tools <tools>      Tool IDs to configure: opencode, claude, codex, github-copilot, gemini, cursor, "all"
                           (default: all detected)
  -p, --profile <profile>  Profile: core | extended  (default: core)
  -d, --delivery <mode>    What to generate: skills | both  (default: both)
  -y, --yes                Use all detected tools without prompting
      --path <path>        Project path (default: current directory)
```

**Delivery modes:**

| Mode             | Skills | Native Agents |
| ---------------- | ------ | ------------- |
| `both` (default) | Yes    | Yes           |
| `skills`         | Yes    | No            |

When you choose `both`, kernel generates skills for every configured tool and native agents only for tools that support them. Skills-only tools such as Cursor still receive the full skill set.

### `kernel update`

Regenerate all files from current templates. Run after upgrading kernel, editing your config, or when your AI tool is acting weird and a clean slate sounds appealing.

```bash
kernel update [options]

  -f, --force              Regenerate everything, no questions
  -t, --tool <tool>        Update a single tool only
      --path <path>        Project path (default: current directory)
```

### `kernel config`

View and modify `.agents/kernel.config.yaml`.

```bash
kernel config [action] [key] [value] [options]

  show                    Print current config
  add-tool <tool-id>      Add a tool
  remove-tool <tool-id>   Remove a tool
  set <key> <value>       Set any config value

      --path <path>       Project path (default: current directory)
```

### `kernel detect`

Scan the project for installed AI tools. Reports which ones are present and which ones you haven't bothered to install yet.

```bash
kernel detect [--path <path>]
```

### `kernel vault compile`

Compile your personal vault skills into each configured AI tool's native format.

Your vault is a directory (conventionally `~/.codex/skills/`) containing skills you want to use everywhere. Each skill is a `SKILL.md` with optional `references/` subdirectory. `kernel vault compile` reads the vault and writes cross-compiled skills into the current project for every configured tool.

```bash
kernel vault compile [options]

  -v, --vault <path>      Vault root (overrides vaultPath in config; ~ supported)
  -t, --tools <tools>    Tools to compile for (default: all configured tools)
      --dry-run           Preview what would be written
```

**Vault structure:**

```text
~/.codex/skills/
  my-secret-weapon/
    SKILL.md              # YAML frontmatter + markdown body
    references/
      context.md          # Supporting docs (loaded automatically)
      patterns.md
```

Skills in the vault are yours. Kernel just helps them multiply and dress up for each tool's party.

---

## Configuration

Kernel stores config in `.agents/kernel.config.yaml`:

```yaml
version: "1.0.0"
tools:
  - opencode
  - claude
profile: core
delivery: both
vaultPath: ~/.codex # optional — for kernel vault compile
metadata:
  name: my-project
  description: Important work
```

| Field       | Values                       | Description                            |
| ----------- | ---------------------------- | -------------------------------------- |
| `version`   | `"1.0.0"`                    | Config schema version                  |
| `tools`     | 6 tool IDs                   | Which AI tools to generate files for   |
| `profile`   | `core`, `extended`           | Which workflow set to install          |
| `delivery`  | `skills`, `both`             | What to generate                       |
| `vaultPath` | path string                  | Path to your personal vault (optional) |

---

## Supported Tools

Kernel generates files for 6 AI coding tools:

| Tool           | ID               | Directory    | Notes                                                 |
| -------------- | ---------------- | ------------ | ----------------------------------------------------- |
| OpenCode       | `opencode`       | `.opencode/` | Native agent files plus skills discovery manifest     |
| Claude Code    | `claude`         | `.claude/`   | Native agent format with `skills:` preloading         |
| OpenAI Codex   | `codex`          | `.agents/`   | TOML agent format with `[[skills.config]]` references |
| GitHub Copilot | `github-copilot` | `.github/`   | `.agent.md` format, skill discovery via skill tool    |
| Google Gemini  | `gemini`         | `.gemini/`   | Native agent files, skills discovered by description  |
| Cursor         | `cursor`         | `.cursor/`   | Skills only                                           |

---

## What Gets Generated

### Agents

Agents are autonomous task specialists. On tools with native agent support they are emitted as native agent files. On skills-only tools, kernel does not coerce agents into skills.

#### Orchestrators

| Agent    | When to use                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| `plan`   | Pre-implementation: analyze intent, surface requirements, create a sequenced plan |
| `do`     | Execution: work through a plan step by step, delegate to specialists              |
| `review` | Quality gate: correctness, security, performance, and code quality review         |

#### Specialists

| Agent       | When to use                                                               |
| ----------- | ------------------------------------------------------------------------- |
| `architect` | Architecture review: patterns, anti-patterns, structural design decisions |
| `designer`  | Frontend: UI components, design implementation, user flow mapping        |
| `git`       | Advanced git: branch strategy, commit hygiene, conflict resolution        |

#### Researchers

| Agent              | When to use                                                     |
| ------------------ | --------------------------------------------------------------- |
| `search-code`      | Locate files, functions, and patterns in the local codebase     |
| `search-docs`      | Find external documentation, API references, and best practices |
| `search-history`   | Analyze git history to understand why code changed over time      |
| `search-learnings` | Surface past solutions and documented lessons from the project    |

### Skills

Kernel installs a broader skill catalog that covers:

- workflow execution and project-state handling (`propose`, `explore`, `apply`, `archive`, `review`, `check`, `sync`, `triage`, `unblock`, `ready-for-prod`)
- engineering support (`git-master`, `frontend-design`, `code-quality`, `docs-workflow`, `dev-environment`)
- project lifecycle work (`project-init`, `build`, `deploy`, `conventions`, `map-codebase`)

### Workflow Entry Points

Workflow entrypoints such as `/propose`, `/explore`, `/apply`, and `/archive` are delivered through skills and native agents in the current architecture rather than as a separate generated command layer.

---

## How It Works

Kernel uses a **generator-adapter pattern**. Three moving parts:

1. **Templates** — Tool-agnostic definitions of agents and skills
2. **Adapters** — Per-tool translators that know where files go and how to format them
3. **Generator** — Reads your config, runs templates through adapters, writes files

```text
.agents/kernel.config.yaml
  └── Generator
        ├── For each configured tool
        │     ├── Adapter formats skills  → .claude/skills/
        │     └── Adapter formats agents  → .claude/agents/ (on capable tools)
```

Every AI tool gets its own adapter. Adding a new tool means writing one file:

```typescript
// src/core/adapters/my-tool.ts
import type { ToolCommandAdapter } from "./types.js";
export const myToolAdapter: ToolCommandAdapter = {
  toolId: "my-tool",
  toolName: "My Tool",
  skillsDir: ".my-tool",
  // implement getSkillPath, formatSkill, etc.
};
```

No plugin system. No dynamic loading. Just TypeScript.

---

## Development

```bash
bun test               # Run tests
bun run typecheck      # Type-check
bun run build          # Build the binary
bun run dev:cli         # Run without building
bun run build:dev && bun run link:dev  # Dev binary + link
make test-init          # Smoke-test the CLI with --delivery commands
make test-all          # Full CLI integration test suite
```

---

## The Engineering Philosophy

A few principles baked into the codebase:

- **The folder that just works** — Directories are the discovery mechanism. Don't build a plugin system when `ls` already works.
- **The abstraction tax** — Every abstraction is a loan against future understanding. Every `export *` barrel is a ticking time bomb.
- **Configuration is a text file** — Extend existing configs rather than inventing new schema systems.
- **Library-first** — Every feature starts as a standalone library. The CLI is a thin wrapper.
- **TDD is non-negotiable** — tests are mandatory and they all pass.

---

## License

SUL-1.0
