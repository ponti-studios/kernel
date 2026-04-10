# Multi-Tool AI Workflow Generator

Generate skills, commands, and native agents for multiple coding assistants from one shared template set.

Run `kernel init` once to detect supported tools in the current project, write global kernel configuration, and emit the files each tool expects.

---

## Quick Start Guide

### Installation

```bash
npm install -g @hackefeller/kernel
# or
bunx kernel init
```

### Quick Start

#### 1. Initialize Your Project

```bash
# Navigate to your project
cd your-project

# Initialize with auto-detection
kernel init --yes

# Or specify tools manually
kernel init --tools claude,cursor
```

#### 2. Use The Installed Workflows

In your AI tool, invoke the generated workflows, commands, skills, and agents for planning, exploration, execution, and review.

#### 3. Update Generated Files

```bash
# Regenerate all files
kernel update

# Update specific tool
kernel update --tool cursor
```

### Configuration

Initialization creates `~/.kernel/config.yaml`. The full supported schema is documented in [Configuration](#configuration).

### Supported Tools

Supported output targets currently include 6 AI coding tools:

| Tool           | ID               | Directory    |
| -------------- | ---------------- | ------------ |
| Claude Code    | `claude`         | `.claude/`   |
| OpenAI Codex   | `codex`          | `.codex/`    |
| GitHub Copilot | `github-copilot` | `.github/`   |
| Google Gemini  | `gemini`         | `.gemini/`   |
| Cursor         | `cursor`         | `.cursor/`   |
| Pi             | `pi`             | `.pi/`       |

### Example Workflows

#### Starting New Work

1. Use the propose workflow to define the change
2. Use the explore workflow if you need to research
3. Use the apply workflow to implement
4. Use the archive workflow when done

#### Code Review

1. Invoke the review workflow or review agent
2. The generated review system will analyze and provide feedback

#### Performance Optimization

1. Use the planning or execution workflow to scope the optimization
2. Delegate to the relevant specialist or skill

### Troubleshooting

#### No tools detected

```bash
# Check what tools are available
kernel detect
```

#### Config issues

```bash
# View current config
kernel config show
```

#### Regenerate files

```bash
# Force regeneration
kernel update --force
```

### Next Steps

- Review the CLI Reference below

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

## Releases

Releases are driven by Changesets.

1. Add a changeset file in `.changeset/` for any change that should ship in a release.
2. Commit the changeset with the code it describes.
3. When changesets land on `main`, GitHub Actions opens a version PR that updates `package.json` and the changelog.
4. Merging that version PR triggers the release workflow, which tags the repo and creates the GitHub release.

---

## CLI Reference

### `init`

Initialize a project. Detect installed tools, write `~/.kernel/config.yaml`, and generate the configured output for the current repository.

```bash
kernel init [options]

  -t, --tools <tools>      Tool IDs to configure: claude, codex, github-copilot, gemini, cursor, pi, "all"
                           (default: all detected)
  -p, --profile <profile>  Profile: core | extended  (default: core)
  -d, --delivery <mode>    What to generate: skills | both  (default: both)
  -y, --yes                Use all detected tools without prompting
      --path <path>        Project path (default: current directory)
```

**Delivery modes:**

| Mode             | Skills | Commands | Native Agents |
| ---------------- | ------ | -------- | ------------- |
| `both` (default) | Yes    | Yes      | Yes           |
| `skills`         | Yes    | Yes      | No            |

Commands are always generated. When you choose `both`, the generator also emits native agents for tools that support them. Skills-only tools such as Cursor still receive the full skill and command catalogs.

### `update`

Regenerate all files from the current templates. Use it after editing configuration, changing templates, or refreshing generated output.

```bash
kernel update [options]

  -f, --force              Regenerate everything, no questions
  -t, --tool <tool>        Update a single tool only
      --path <path>        Project path (default: current directory)
```

### `config`

View and modify `~/.kernel/config.yaml`.

```bash
kernel config [action] [key] [value]

  show                    Print current config
  add-tool <tool-id>      Add a tool
  remove-tool <tool-id>   Remove a tool
  set <key> <value>       Set any config value

```

### `detect`

Scan the project for supported tool directories and report which ones are present.

```bash
kernel detect [--path <path>]
```

### `vault compile`

Compile your personal vault skills into each configured AI tool's native format.

The vault is a directory, often `~/.codex/skills/`, containing skills to reuse across projects. Each skill is a `SKILL.md` with an optional `references/` subdirectory. `kernel vault compile` reads that vault and writes tool-native output into the current project for every configured tool.

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

The source material stays in one place; the command handles the per-tool translation.

---

## Configuration

Kernel reads global configuration from `~/.kernel/config.yaml`.

The minimal valid config is:

```yaml
version: "1.0.0"
tools:

profile: core
delivery: both
```

The full accepted schema is:

```yaml
version: "1.0.0"
tools:

  - claude
profile: core
delivery: both
customWorkflows:
  - propose
featureFlags:
  example: false
vaultPath: ~/.codex
metadata:
  name: my-project
  description: Important work
  version: "0.1.0"
```

| Field | Required | Allowed values | Current behavior |
| ----- | -------- | -------------- | ---------------- |
| `version` | no | any string, defaults to `"1.0.0"` | Schema version marker. Parsed and preserved. |
| `tools` | yes | `claude`, `codex`, `github-copilot`, `gemini`, `cursor`, `pi` | Drives detection, adapter selection, generation, `update`, and `vault compile`. Must contain at least one valid tool ID. |
| `profile` | no | `core`, `extended`, `custom`; defaults to `core` | Accepted and shown by the CLI, but generation currently uses the same built-in skill and agent catalog for every profile. |
| `customWorkflows` | no | array of strings | Accepted by the schema and saved if present, but not currently consumed by generation. |
| `delivery` | no | `skills`, `both`; defaults to `both` | Active. `skills` skips native agent generation. `both` generates skills plus native agents for tools that support them. |
| `featureFlags` | no | map of string keys to boolean values | Accepted and saved, but not currently consumed elsewhere in the codebase. |
| `vaultPath` | no | path string | Active only for `kernel vault compile` when `--vault` is not passed. `~` expansion is supported there. |
| `metadata` | no | object with optional `name`, `description`, `version` | Accepted and saved, but not currently used by generation. |

### Defaults

If you omit optional fields, kernel defaults to:

```yaml
version: "1.0.0"
profile: core
delivery: both
featureFlags: {}
```

You still must provide at least one entry in `tools`.

### Tool IDs

Use these IDs in `tools`, `kernel init --tools`, `kernel update --tool`, and `kernel vault compile --tools`:

| Tool | ID | Detected by |
| ---- | -- | ----------- |
| Pi | `pi` | `.pi/` |
| Claude Code | `claude` | `.claude/` |
| OpenAI Codex | `codex` | `.codex/` |
| GitHub Copilot | `github-copilot` | `.github/` |
| Google Gemini | `gemini` | `.gemini/` |
| Cursor | `cursor` | `.cursor/` |

### Runtime Notes

- `kernel init` writes `~/.kernel/config.yaml` from the selected tools plus `profile` and `delivery`.
- `kernel config show`, `kernel update`, and `kernel vault compile` all read `~/.kernel/config.yaml`.
- `kernel config add-tool`, `remove-tool`, and `set` write raw YAML updates without re-validating the full schema.
- The deprecated `commands` delivery mode is not part of the supported schema and should not be used.

---

## Supported Tools

Generated output is supported for 6 AI coding tools:

| Tool           | ID               | Directory    | Notes                                                 |
| -------------- | ---------------- | ------------ | ----------------------------------------------------- |
| Claude Code    | `claude`         | `.claude/`   | Native agent format with `skills:` preloading         |
| OpenAI Codex   | `codex`          | `.codex/`    | TOML agent format with `[[skills.config]]` references |
| GitHub Copilot | `github-copilot` | `.github/`   | `.agent.md` format, skill discovery via skill tool    |
| Google Gemini  | `gemini`         | `.gemini/`   | Native agent files, skills discovered by description  |
| Cursor         | `cursor`         | `.cursor/`   | Skills only                                           |
| Pi             | `pi`             | `.pi/`       | Skills only                                           |

---

## What Gets Generated

### Agents

Agents are emitted as native agent files on tools that support them. On skills-only tools, agent templates are not forced into a different format.

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

The generated skill catalog covers:

- workflow execution and project-state handling (`propose`, `explore`, `apply`, `archive`, `review`, `check`, `sync`, `triage`, `unblock`, `ready-for-prod`)
- engineering support (`git-master`, `frontend-design`, `code-quality`, `docs-workflow`, `dev-environment`)
- project lifecycle work (`project-init`, `build`, `deploy`, `conventions`, `map-codebase`)
- OpenSpec workflows (`kernel-openspec-propose`, `kernel-openspec-explore`, `kernel-openspec-apply-change`, `kernel-openspec-archive-change`, `kernel-gh-pr-errors`)

### Commands

Kernel also installs legacy command entrypoints such as `opsx-*`, `speckit.*`, and `gh-pr-errors`.

- Claude receives native command files under `.claude/commands/kernel/`
- Other tools receive compatibility command artifacts under their tool-local `commands/` directory
- Compatibility artifacts preserve the command name, description, invocation guidance, and backing skill when one exists

### Workflow Entry Points

Workflow entrypoints such as `/propose`, `/explore`, `/apply`, `/archive`, `opsx-*`, and `speckit.*` are now generated as command artifacts alongside the skill and agent catalogs.

---

## Architecture

Kernel is a config-driven code generator. The project keeps one shared catalog of tool-agnostic skills, commands, and agents, then translates that catalog into each tool's native file layout at generation time.

At a high level, the runtime flow is:

```text
CLI command
  -> config load / tool detection
  -> template catalog selection
  -> adapter lookup per configured tool
  -> skill / command / manifest / agent generation
  -> file writes into tool-native directories
```

### Core Modules

The codebase is organized around five layers:

1. **CLI layer** in `src/cli/`
   `init`, `update`, `config`, `detect`, and `vault compile` are thin entrypoints. They parse flags, load project state, and hand off to library code rather than embedding generation logic directly in command handlers.

2. **Configuration and discovery** in `src/core/config/` and `src/core/discovery/`
   Config is validated with Zod and loaded from `~/.kernel/config.yaml`. Tool discovery is directory-based: if a known tool directory such as `.claude/` or `.codex/` exists, kernel can detect that tool without any plugin system.

3. **Template catalog** in `src/templates/`
   Skills, commands, and agents are authored once as TypeScript templates. A template carries the portable intent of the artifact: name, description, instructions, metadata, routing hints, references, and platform-relevant options such as available skills or sandbox mode.

4. **Adapters** in `src/core/adapters/`
   Each supported tool implements `ToolCommandAdapter`. An adapter decides where a file lives for that tool and how to format it. Skills, commands, agents, and optional manifests all use the same adapter contract, which keeps per-tool behavior isolated instead of scattering format branches across the generator.

5. **Generation and vault compilation** in `src/core/generator/` and `src/core/vault/`
   The generator expands built-in templates into output files for every configured tool. The vault pipeline does the same for user-owned skills loaded from a personal `.codex/skills/` vault, including copying reference files and rewriting paths where a platform needs a different syntax.

### Data Model

Kernel has three primary content types:

- **Skill templates** are reusable workflow or specialist instructions that become `SKILL.md` files in each tool's skills directory.
- **Command templates** are user-facing entrypoints or compatibility shims that preserve command names across tools.
- **Agent templates** are native agent personas for tools that support first-class agents. They extend the skill template shape with agent-only fields such as model overrides, permission or sandbox settings, and acceptance checks.

Both types can carry sidecar reference files. The generator emits those reference files next to the main generated artifact rather than inlining everything into one prompt file.

### Generation Pipeline

Built-in generation is deterministic and straightforward:

1. Load config and resolve the configured tool IDs.
2. Build an adapter registry containing all supported tool adapters.
3. Filter the registry to the configured tools.
4. Load the default skill, command, and agent catalogs.
5. Generate skill files for every configured tool.
6. Generate command files for every configured tool.
7. Generate discovery manifests for tools whose adapters support them.
8. Generate native agents only when `delivery` is not `skills` and the adapter implements agent formatting.
8. Create directories up front and write files in parallel.

This is why the main generator stays small: skill generation, command generation, agent generation, manifest generation, and reference-file collection are split into focused modules rather than one large exporter.

### Adapter Pattern

Adapters are the architectural boundary that makes the system multi-tool without duplicating template content.

For a given template, the core generator never asks "is this Claude?" or "is this Codex?" It asks the adapter:

- where should this skill be written?
- how should this skill be formatted?
- does this tool support native agents?
- if so, where should the agent go and how should it be rendered?
- does this tool need a skills manifest?

That keeps tool-specific knowledge in one place per platform. Adding a new tool means implementing one adapter and registering it:

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

No plugin system. No dynamic loading. Just typed adapters and a registry.

### Configuration and Runtime Semantics

Configuration controls target selection and generation mode, not template authoring. Today the fields that materially affect runtime behavior are:

- `tools`: selects which adapters run
- `delivery`: chooses whether native agents are emitted in addition to skills
- `vaultPath`: supplies the default source directory for `kernel vault compile`

Other accepted schema fields such as `profile`, `customWorkflows`, `featureFlags`, and `metadata` are preserved in config but are not currently used to change the generated built-in catalog.

### Discovery and Supported Tools

Kernel does not inspect tool binaries or run provider-specific detection commands. It uses a cheap filesystem heuristic: known directories such as `.pi/`, `.claude/`, `.codex/`, `.github/`, `.gemini/`, and `.cursor/` signal that a tool is present in the project. That keeps detection fast and stable across environments.

The same tool IDs then drive adapter lookup and output generation, so the config schema, discovery layer, and generator all speak the same identifiers.

### Vault Architecture

The vault subsystem is intentionally separate from the built-in catalog:

- The built-in catalog comes from `src/templates/`.
- The personal vault comes from a user directory containing `.codex/skills/<name>/SKILL.md`.

`kernel vault compile` loads each vault skill, parses optional frontmatter, discovers `references/*.md`, and emits equivalent tool-native skill directories for the requested adapters. Most tools keep relative reference paths untouched; GitHub Copilot gets path rewriting so references can auto-attach inside the IDE.

This keeps reusable personal knowledge out of the repo-local template catalog while still letting the same adapter layer target every supported tool.

### Design Principles

- **Single source of truth for content**: author each built-in skill or agent once, then translate it per tool.
- **Tool-specific behavior at the edge**: formatting and path conventions live in adapters, not in templates or CLI code.
- **Filesystem-first discovery**: directories are the contract; no plugin runtime is needed.
- **Small modules over framework magic**: config loading, discovery, generation, manifests, and vault compilation are separate focused units.
- **Graceful capability differences**: tools that do not support native agents still receive the shared skill set.

---

## Development

```bash
bun test               # Run tests
bun run typecheck      # Type-check
bun run build          # Build the binary
bun run dev:cli         # Run without building
bun run build:dev && bun run link:dev  # Dev binary + link
make test-init          # Smoke-test the CLI with the default generation modes
make test-all          # Full CLI integration test suite
```

---

## Engineering Notes

A few principles baked into the codebase:

- **The folder that just works** — Directories are the discovery mechanism. Don't build a plugin system when `ls` already works.
- **The abstraction tax** — Every abstraction is a loan against future understanding. Every `export *` barrel is a ticking time bomb.
- **Configuration is a text file** — Extend existing configs rather than inventing new schema systems.
- **Library-first** — Every feature starts as a standalone library. The CLI is a thin wrapper.
- **TDD is non-negotiable** — tests are mandatory and they all pass.

---

## License

SUL-1.0
