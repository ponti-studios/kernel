# Kernel

[![skills.sh](https://skills.sh/b/ponti-studios/kernel)](https://skills.sh/ponti-studios/kernel)

Kernel is a **skill and agent publishing tool**. You author skills and agents once, in a neutral format, and kernel deploys them to whatever AI tools you use — Claude Code, Codex, GitHub Copilot, Pi.

## The Big Idea

Most AI tools have their own directory for skills and agents — `.claude/skills/`, `.codex/skills/`, etc. Each expects a slightly different format. Without kernel, you'd have to maintain separate copies for each tool and keep them in sync manually.

Kernel gives you **one source of truth** and handles the rest.

```
src/templates/skills/kernel-review/  →  discover  →  render per tool  →  ~/.claude/skills/kernel-review/SKILL.md
                                                                        →  ~/.codex/skills/kernel-review/SKILL.md
```

## How It Works

### 1. You write templates

Skills and agents live in `src/templates/skills/` and `src/templates/agents/`. Each is a directory with a `SKILL.md` or `AGENT.md` file — a neutral description of what the skill does, independent of any specific AI tool.

### 2. Kernel discovers them automatically

No manifest, no registration. Add a folder with a `SKILL.md` inside, and `kernel sync` picks it up.

### 3. Kernel detects which AI tools you have installed

It checks your home directory for `.claude`, `.codex`, `.copilot`, `.pi`. If the folder exists, that tool gets the skills.

### 4. Kernel renders each template for each tool

Each AI tool has an **adapter** — a small translator that knows the format that tool expects. The Claude adapter writes `SKILL.md` files with specific frontmatter. The Codex adapter writes `.toml` files. Copilot gets `.agent.md` files. Same content, different format.

### 5. Kernel writes and cleans up

Output files are written into the tool directories. Kernel also maintains a sync manifest so it can remove files whose templates have been deleted — no orphans left behind.

## Repo Workspace

Each repo can also have a `.kernel/` directory — a committed project memory for goals, tasks, and knowledge that lives in the repo itself rather than in chat history.

```text
.kernel/
  work/
    goals/<id>/goal.md
    tasks/active/<id>/task.md
    tasks/archived/<date>-<id>/task.md
  knowledge/
    notes/
    guides/
    learnings/
  state.json
```

## CLI

```bash
kernel sync                              # deploy all skills/agents to installed tools
kernel doctor                            # check what's installed and what's out of sync
kernel goal new "make onboarding fast"
kernel task new "write setup guide" --goal <id>
kernel task status
kernel task done <item>
kernel knowledge list
```

## Quick Start

```bash
npm install -g @hackefeller/kernel
kernel sync
kernel goal new "make onboarding effortless"
kernel task new "write setup guide" --goal make-onboarding-effortless
kernel task status
```

## Local Development

```bash
just ci                 # typecheck, test, build, binary validation
just validate-binary    # smoke test the compiled dist/kernel
just install            # build and install to ~/bin/kernel
```

```bash
just version-dry-run patch
just release-dry-run
just publish-dry-run

just version-bump patch
just release confirm=true
just publish confirm=true
```

## Design Principles

- Define once, deploy everywhere
- No manifests — discovery is filesystem-based
- Host-specific behavior lives in adapters, not templates
- `.kernel/` is the repo's committed project memory
- One markdown file per record; frontmatter is metadata

## References

- [Skill metadata compatibility matrix](docs/skill-metadata-compatibility-matrix.md)
- [Supported skill metadata by provider](docs/skill-metadata-reference.md)
