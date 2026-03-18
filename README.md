# Jinn

**Harness-agnostic AI agent distribution for any coding assistant.**

Jinn is a CLI that generates agents, skills, and commands for 24+ AI coding tools from a single source of truth. Run `jinn init` once and get a complete AI workflow suite installed across every tool in your project — OpenCode, Cursor, Claude Code, GitHub Copilot, and more.

---

## How It Works

Jinn uses a **generator-adapter pattern**:

1. **Templates** — Tool-agnostic definitions of agents, skills, and commands
2. **Adapters** — Per-tool translators that know where files go and how to format them
3. **Generator** — Reads your config, runs templates through adapters, writes files

```
jinn init
  └── Reads .jinn/config.yaml
        └── For each configured tool
              └── For each agent / skill / command template
                    └── Adapter formats + writes to tool's directory
```

Your AI tools pick up the generated files automatically. The same agents and commands work in every tool without any per-tool configuration.

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
# Detect which AI tools are installed in your project
jinn detect

# Initialize jinn (auto-detects tools, writes config, generates files)
jinn init

# Regenerate after updating jinn or changing config
jinn update
```

---

## CLI Reference

### `jinn init`

Initialize jinn in the current project. Detects installed tools, writes `.jinn/config.yaml`, and generates all agent/skill/command files.

```bash
jinn init [options]

Options:
  -t, --tools <tools>      Comma-separated tool IDs, or "all"
  -p, --profile <profile>  Profile to use: core | extended  (default: core)
  -d, --delivery <mode>    What to install: skills | commands | both  (default: both)
  -y, --yes                Use all detected tools without prompting
```

### `jinn update`

Regenerate all files from current templates. Run this after upgrading jinn or changing your config.

```bash
jinn update [options]

Options:
  -f, --force         Force regeneration of all files
  -t, --tool <tool>   Update a single tool only
```

### `jinn config`

View and modify `.jinn/config.yaml`.

```bash
jinn config show                    # Print current config
jinn config add-tool <tool-id>      # Add a tool
jinn config remove-tool <tool-id>   # Remove a tool
jinn config set <key> <value>       # Set a config value
```

### `jinn detect`

Scan the project for installed AI tools and show which are configured.

```bash
jinn detect
```

---

## Configuration

Jinn stores its config in `.jinn/config.yaml`:

```yaml
version: "1.0.0"
tools:
  - claude
  - cursor
  - github-copilot
profile: core
delivery: both
```

| Field | Values | Description |
|---|---|---|
| `tools` | See supported tools below | Which AI tools to generate files for |
| `profile` | `core`, `extended` | Which command set to install |
| `delivery` | `skills`, `commands`, `both` | What to generate |

---

## Supported Tools

Jinn generates files for 24 AI coding tools:

| Tool | Directory | Notes |
|---|---|---|
| **OpenCode** | `.opencode/` | |
| **Cursor** | `.cursor/` | Custom YAML frontmatter |
| **Claude Code** | `.claude/` | Native agent format with tools/model |
| **GitHub Copilot** | `.github/prompts/` | `.prompt.md` extension |
| **Continue** | `.continue/prompts/` | `.prompt` extension |
| **Cline** | `.cline/` | |
| **Amazon Q Developer** | `.amazonq/` | |
| **Windsurf** | `.windsurf/` | |
| **Augment** | `.augment/` | |
| **Supermaven** | `.supermaven/` | |
| **Tabnine** | `.tabnine/` | |
| **Codeium** | `.codeium/` | |
| **Sourcegraph Cody** | `.cody/` | |
| **Gemini** | `.gemini/` | |
| **Mistral** | `.mistral/` | |
| **Ollama** | `.ollama/` | |
| **LM Studio** | `.lmstudio/` | |
| **Text Generation WebUI** | `.webui/` | |
| **KoboldCpp** | `.koboldcpp/` | |
| **Tabby** | `.tabby/` | |
| **GPT4All** | `.gpt4all/` | |
| **Jan** | `.jan/` | |
| **HuggingFace Chat** | `.hfchat/` | |
| **Phind** | `.phind/` | |

---

## What Gets Generated

### Agents (10)

Agents are autonomous task specialists. On Claude Code they become native subagents (`.claude/agents/*.md` with YAML frontmatter). On other tools they're installed as skills.

#### Orchestrators — coordinate the workflow

| Agent | When to use |
|---|---|
| `plan` | Pre-implementation: analyze intent, surface requirements, create a sequenced plan |
| `do` | Execution: work through a plan step by step, delegate to specialists |
| `review` | Quality gate: correctness, security, performance, and code quality review |

#### Specialists — domain experts

| Agent | When to use |
|---|---|
| `architect` | Architecture review: patterns, anti-patterns, structural design decisions |
| `designer` | Frontend: UI components, design implementation, user flow mapping |
| `git` | Advanced git: branch strategy, commit hygiene, conflict resolution |

#### Researchers — fast, read-only information gathering

| Agent | When to use |
|---|---|
| `search-code` | Locate files, functions, and patterns in the local codebase |
| `search-docs` | Find external documentation, API references, and best practices |
| `search-history` | Analyze git history to understand why code changed over time |
| `search-learnings` | Surface past solutions and documented lessons from the project |

---

### Skills (7)

Skills are persistent instruction sets that change how your AI tool behaves.

#### Workflow skills

| Skill | Description |
|---|---|
| `propose` | Start a new change — generates proposal.md, design.md, and tasks.md in one step |
| `explore` | Thinking partner mode — explore ideas, investigate the codebase, map tradeoffs. Read-only, no implementation. |
| `apply` | Execute a change's task list step by step until complete or blocked |
| `archive` | Move a completed change to archive with date-stamped directory |
| `ready` | Pre-deployment checklist — code quality, security, testing, documentation, deployment readiness |

#### Domain skills

| Skill | Description |
|---|---|
| `git` | Advanced git workflows: branching, commit hygiene, conflict resolution, rebase patterns |
| `frontend-design` | Frontend best practices: component architecture, responsive design, accessibility |

---

### Commands (32)

Commands are slash-command prompts your AI tool can execute on demand. They're installed into each tool's commands directory.

#### Workflow — change lifecycle

| Command | Description |
|---|---|
| `propose` | Propose a new change with all artifacts generated |
| `explore` | Explore and investigate before committing to an approach |
| `apply` | Implement tasks from a change |
| `archive` | Archive a completed change |
| `workflows:plan` | Create a detailed work plan |
| `workflows:execute` | Execute a work plan |
| `workflows:review` | Review completed work |
| `workflows:status` | Check current workflow status |
| `workflows:stop` | Stop the current workflow |
| `workflows:complete` | Mark work as complete |
| `workflows:create` | Create a new workflow |
| `workflows:brainstorm` | Brainstorm ideas and approaches |
| `workflows:learnings` | Document lessons learned |

#### Code

| Command | Description |
|---|---|
| `code:format` | Format code consistently |
| `code:refactor` | Refactor for readability and maintainability |
| `code:review` | Review code for correctness, security, and quality |
| `code:optimize` | Optimize for performance |

#### Git

| Command | Description |
|---|---|
| `git:smart-commit` | Craft a well-structured commit message |
| `git:branch` | Create and manage branches |
| `git:cleanup` | Clean up stale branches and history |
| `git:merge` | Merge with conflict resolution guidance |

#### Documentation

| Command | Description |
|---|---|
| `docs:deploy` | Generate deployment documentation |
| `docs:feature-video` | Create feature demo scripts |
| `docs:release` | Write release notes |
| `docs:test-browser` | Document browser testing steps |

#### Project

| Command | Description |
|---|---|
| `project:build` | Run and troubleshoot the build |
| `project:deploy` | Deploy the project |
| `project:constitution` | Define project rules and conventions |
| `project:init` | Initialize a new project |
| `project:map` | Map the project structure and architecture |

#### Utility

| Command | Description |
|---|---|
| `util:clean` | Clean build artifacts and temp files |
| `util:doctor` | Diagnose project configuration issues |

---

## The Jinn Workflow

The core workflow is **propose → explore → apply → archive**:

```
/propose   Create a change with proposal, design, and task artifacts
/explore   Think through the approach, investigate tradeoffs (optional)
/apply     Execute the task list
/archive   Move the completed change to archive
```

Changes live in `jinn/changes/<name>/`:

```
jinn/changes/add-auth/
  proposal.md   — what & why
  design.md     — how
  tasks.md      — implementation checklist
```

Completed changes are archived to `jinn/changes/archive/YYYY-MM-DD-<name>/`.

---

## Architecture

```
src/
├── cli/
│   └── jinn/               # CLI commands (init, update, config, detect)
├── core/
│   ├── adapters/           # Per-tool file format adapters
│   │   ├── base.ts         # createAdapter() factory
│   │   ├── claude.ts       # Native .claude/agents/ format
│   │   ├── cursor.ts       # YAML frontmatter format
│   │   └── *.ts            # One file per tool
│   ├── config/             # Config loading, validation, schema
│   ├── discovery/          # Tool auto-detection
│   ├── generator/          # Orchestrates template → adapter → file
│   └── templates/          # Shared type definitions
└── templates/
    ├── agents/             # 10 agent definitions
    ├── commands/           # 32 command templates
    └── skills/             # 7 skill templates
```

Adding a new tool requires one file:

```typescript
// src/core/adapters/my-tool.ts
import { createAdapter } from './base.js';
export const myToolAdapter = createAdapter({
  toolId: 'my-tool',
  toolName: 'My Tool',
  skillsDir: '.my-tool',
});
```

---

## Development

```bash
# Run tests
bun test

# Type-check
bun run typecheck

# Build the binary
bun run build

# Run without building
bun run dev:cli

# Build a dev binary and link it
bun run build:dev && bun run link:dev
```

---

## License

SUL-1.0
