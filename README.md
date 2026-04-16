# Kernel

`kernel` is a local-first brain and workflow OS for coding agents.

It gives you one canonical place on your machine to define skills, agents, and commands, then syncs that brain into the dot-directories your agent hosts already use.

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

## When To Use What

### System

- `kernel-init`: first-time setup for the local Kernel home and host integration
- `kernel-sync`: push the current catalog into enabled hosts after template or configuration changes
- `kernel-doctor`: diagnose drift, missing generated files, or host setup problems

### Workflow

- `kernel-work-new`: start a new repo-local work item from a natural-language goal
- `kernel-work-plan`: tighten the brief, plan, tasks, risks, and acceptance criteria
- `kernel-work-next`: pick the next unchecked task as the single execution target
- `kernel-work-done`: mark a verified task complete
- `kernel-work-status`: inspect current progress and the next task
- `kernel-work-archive`: close and preserve a completed work item

### Specialist

- `gh-pr-errors`: inspect the latest GitHub Actions failure on the open pull request

## Design Principles

- Define once locally, sync everywhere
- Local files are the source of truth
- Host-specific behavior stays in small adapters/materializers
- Tags categorize skills and agents for discovery
- Local work state should be visible in the repo, not hidden in chat

## Notes

- The canonical workflow surface is `kernel work`; older spec and change command families are no longer shipped.
- `kernel init` seeds the built-in brain, imports existing `~/.codex/skills` content when present, and syncs enabled hosts.
- `kernel sync` is idempotent and tracks generated output in `~/.kernel/state/sync-manifest.json`.
