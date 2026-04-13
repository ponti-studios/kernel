# Kernel

`kernel` is a local-first brain and workflow OS for coding agents.

It gives you one canonical place on your machine to define skills, agents, packages, and command aliases, then syncs that brain into the dot-directories your agent hosts already use.

It also gives each repo a lightweight local workflow system under `kernel/work/` so planning and execution stay visible, durable, and tool-agnostic.

## what i

- Stores your canonical agent brain in `~/.kernel/brain/`
- Syncs that brain into enabled hosts like `.codex`, `.claude`, `.copilot`, `.pi`, and OpenCode
- Keeps host-specific formatting at the edge through small materializers
- Manages local work items in `kernel/work/<id>/`
- Avoids remote SaaS dependencies and host-specific authoring

## Layout

### User brain

```text
~/.kernel/
  config.yaml
  brain/
    skills/<id>/SKILL.md
    agents/<id>/AGENT.md
    packages/<id>.yaml
    commands/<id>.yaml
  state/
    sync-manifest.json
```

### Repo workflow

```text
kernel/
  work/<id>/
    work.yaml
    brief.md
    plan.md
    tasks.md
    journal.md
```

## CLI

```text
kernel init
kernel sync
kernel doctor
kernel package list
kernel package add <package>
kernel host list
kernel work new "<goal>"
kernel work plan [id]
kernel work next [id]
kernel work status [id]
kernel work done <task>
kernel work archive [id]
```

## Quick Start

```bash
npm install -g @hackefeller/kernel
kernel init
kernel host list
kernel work new "build analytics dashboard"
kernel work next
```

## Default Packages

- `core-brain`: core orchestration agents and foundational coding skills
- `workflow-local`: local work-management command aliases
- `git`: git strategy and history guidance
- `review`: review and sign-off helpers

Optional built-ins currently include:

- `frontend`
- `mobile`
- `database`

## Design Principles

- Define once locally, sync everywhere
- Local files are the source of truth
- Host-specific behavior stays in small adapters/materializers
- Packages keep the default install small and composable
- Local work state should be visible in the repo, not hidden in chat

## Notes

- Legacy generator, vault, and workflow modules still exist in the repo during the transition, but the primary CLI surface is now `init`, `sync`, `doctor`, `package`, `host`, and `work`.
- `kernel init` seeds the built-in brain, imports existing `~/.codex/skills` content when present, and syncs enabled hosts.
- `kernel sync` is idempotent and tracks generated output in `~/.kernel/state/sync-manifest.json`.
