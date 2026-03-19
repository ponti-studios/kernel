# Jinn

**Harness-agnostic AI agent distribution for any coding assistant.**

Jinn is a CLI that generates agents, skills, and commands for 6 AI coding tools from a single source of truth. Run `jinn init` once and get a complete AI workflow suite installed across every tool in your project — OpenCode, Cursor, Claude Code, GitHub Copilot, Codex, and Gemini.

You write the templates once. Jinn makes them work everywhere.

---

## Install

```bash
npm install -g @hackefeller/jinn
# or
bunx jinn init
```

---

## Quick Start

```bash
# Detect which AI tools are installed
jinn detect

# Initialize jinn (auto-detects tools, writes config, generates files)
jinn init

# Regenerate after upgrading jinn or changing config
jinn update
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

### `jinn init`

Initialize jinn in a project. Detects installed tools, writes `.jinn/config.yaml`, generates everything.

```bash
jinn init [options]

  -t, --tools <tools>      Tool IDs to configure: opencode, claude, cursor, "all"
                           (default: all detected)
  -p, --profile <profile>  Profile: core | extended  (default: core)
  -d, --delivery <mode>    What to generate: skills | commands | both  (default: both)
  -y, --yes                Use all detected tools without prompting
      --path <path>        Project path (default: current directory)
```

**Delivery modes:**

| Mode             | Commands | Skills | Agents |
| ---------------- | -------- | ------ | ------ |
| `both` (default) | Yes      | Yes    | Yes    |
| `commands`       | Yes      | No     | Yes    |
| `skills`         | No       | Yes    | No     |

Agents live alongside commands unless you explicitly choose `skills`-only mode. Because agents are enhanced command wrappers, not a separate feature — you almost always want them.

### `jinn update`

Regenerate all files from current templates. Run after upgrading jinn, editing your config, or when your AI tool is acting weird and a clean slate sounds appealing.

```bash
jinn update [options]

  -f, --force              Regenerate everything, no questions
  -t, --tool <tool>        Update a single tool only
      --path <path>        Project path (default: current directory)
```

### `jinn config`

View and modify `.jinn/config.yaml`.

```bash
jinn config [action] [key] [value] [options]

  show                    Print current config
  add-tool <tool-id>      Add a tool
  remove-tool <tool-id>   Remove a tool
  set <key> <value>       Set any config value

      --path <path>       Project path (default: current directory)
```

### `jinn detect`

Scan the project for installed AI tools. Reports which ones are present and which ones you haven't bothered to install yet.

```bash
jinn detect [--path <path>]
```

### `jinn vault compile`

Compile your personal vault skills into each configured AI tool's native format.

Your vault is a directory (conventionally `~/.codex/skills/`) containing skills you want to use everywhere. Each skill is a `SKILL.md` with optional `references/` subdirectory. `jinn vault compile` reads the vault and writes cross-compiled skills into the current project for every configured tool.

```bash
jinn vault compile [options]

  -v, --vault <path>      Vault root (overrides vaultPath in config; ~ supported)
  -t, --tools <tools>    Tools to compile for (default: all configured tools)
      --dry-run           Preview what would be written
```

**Vault structure:**

```
~/.codex/skills/
  my-secret-weapon/
    SKILL.md              # YAML frontmatter + markdown body
    references/
      context.md          # Supporting docs (loaded automatically)
      patterns.md
```

Skills in the vault are yours. Jinn just helps them multiply and dress up for each tool's party.

---

## Configuration

Jinn stores config in `.jinn/config.yaml`:

```yaml
version: "1.0.0"
tools:
  - opencode
  - claude
profile: core
delivery: both
vaultPath: ~/.codex # optional — for jinn vault compile
metadata:
  name: my-project
  description: Important work
```

| Field       | Values                       | Description                            |
| ----------- | ---------------------------- | -------------------------------------- |
| `version`   | `"1.0.0"`                    | Config schema version                  |
| `tools`     | 6 tool IDs                   | Which AI tools to generate files for   |
| `profile`   | `core`, `extended`           | Which command set to install           |
| `delivery`  | `skills`, `commands`, `both` | What to generate                       |
| `vaultPath` | path string                  | Path to your personal vault (optional) |

---

## Supported Tools

Jinn generates files for 6 AI coding tools:

| Tool           | ID               | Directory   | Notes                                                        |
| -------------- | ---------------- | ----------- | ------------------------------------------------------------ |
| OpenCode       | `opencode`       | `.opencode/` |                                                             |
| Claude Code    | `claude`         | `.claude/`  | Native agent format, `skills:` YAML, `## Available commands` |
| OpenAI Codex   | `codex`          | `.agents/`  | TOML agent format, `[[skills.config]]`                       |
| GitHub Copilot | `github-copilot` | `.github/`  | `.prompt.md` extension, `.agent.md` format                   |
| Google Gemini  | `gemini`         | `.gemini/`  |                                                              |
| Cursor         | `cursor`         | `.cursor/`  | YAML frontmatter, skills only                                |

---

## What Gets Generated

### Agents (10)

Agents are autonomous task specialists. On Claude Code they become native subagents (`.claude/agents/*.md` with YAML frontmatter). On other tools they're installed as skills.

**Orchestrators — coordinate the workflow**

| Agent    | When to use                                                                       |
| -------- | --------------------------------------------------------------------------------- |
| `plan`   | Pre-implementation: analyze intent, surface requirements, create a sequenced plan |
| `do`     | Execution: work through a plan step by step, delegate to specialists              |
| `review` | Quality gate: correctness, security, performance, and code quality review         |

**Specialists — domain experts**

| Agent       | When to use                                                               |
| ----------- | ------------------------------------------------------------------------- |
| `architect` | Architecture review: patterns, anti-patterns, structural design decisions |
| `designer`  | Frontend: UI components, design implementation, user flow mapping         |
| `git`       | Advanced git: branch strategy, commit hygiene, conflict resolution        |

**Researchers — fast, read-only information gathering**

| Agent              | When to use                                                     |
| ------------------ | --------------------------------------------------------------- |
| `search-code`      | Locate files, functions, and patterns in the local codebase     |
| `search-docs`      | Find external documentation, API references, and best practices |
| `search-history`   | Analyze git history to understand why code changed over time    |
| `search-learnings` | Surface past solutions and documented lessons from the project  |

### Skills (7)

**Workflow skills**

| Skill     | Description                                                                   |
| --------- | ----------------------------------------------------------------------------- |
| `propose` | Create a Linear project and seed it with issues and sub-issues via Linear MCP |
| `explore` | Explore tradeoffs using Linear project and issue context via Linear MCP       |
| `apply`   | Execute implementation work from Linear sub-issues via Linear MCP             |
| `archive` | Close out completed Linear projects and issues via Linear MCP                 |
| `ready`   | Pre-deployment checklist: code quality, security, testing, documentation      |

**Domain skills**

| Skill             | Description                                                                       |
| ----------------- | --------------------------------------------------------------------------------- |
| `git`             | Advanced git workflows: branching, commit hygiene, conflict resolution            |
| `frontend-design` | Frontend best practices: component architecture, accessibility, responsive design |

### Commands (32)

Commands are slash-command prompts your AI tool executes on demand.

**Workflow**

```
/propose              Create a Linear project with seeded issues
/explore              Think through tradeoffs with Linear context
/apply                Execute from Linear sub-issues
/archive              Close out completed Linear work
/workflows:plan       Create a detailed work plan
/workflows:execute     Execute a work plan
/workflows:review      Review completed work
/workflows:status      Check current workflow status
/workflows:stop        Stop the current workflow
/workflows:complete    Mark work as complete
/workflows:create      Create a new workflow
/workflows:brainstorm  Brainstorm ideas and approaches
/workflows:learnings   Document lessons learned
```

**Code**

```
/code:format          Format code consistently
/code:refactor        Refactor for readability and maintainability
/code:review           Review code for correctness, security, and quality
/code:optimize         Optimize for performance
```

**Git**

```
/git:smart-commit     Craft a well-structured commit message
/git:branch           Create and manage branches
/git:cleanup          Clean up stale branches and history
/git:merge            Merge with conflict resolution guidance
```

**Documentation**

```
/docs:deploy          Generate deployment documentation
/docs:feature-video   Create feature demo scripts
/docs:release         Write release notes
/docs:test-browser    Document browser testing steps
```

**Project**

```
/project:build        Run and troubleshoot the build
/project:deploy       Deploy the project
/project:constitution Define project rules and conventions
/project:init        Initialize a new project
/project:map          Map the project structure and architecture
```

**Utility**

```
/util:clean           Clean build artifacts and temp files
/util:doctor          Diagnose project configuration issues
```

---

## How It Works

Jinn uses a **generator-adapter pattern**. Three moving parts:

1. **Templates** — Tool-agnostic definitions of agents, skills, and commands
2. **Adapters** — Per-tool translators that know where files go and how to format them
3. **Generator** — Reads your config, runs templates through adapters, writes files

```
.jinn/config.yaml
  └── Generator
        ├── For each configured tool
        │     ├── Adapter formats commands → .opencode/commands/
        │     ├── Adapter formats skills  → .claude/skills/
        │     └── Adapter formats agents   → .claude/agents/ (on capable tools)
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
