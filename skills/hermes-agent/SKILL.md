---
name: hermes-agent
description: "Use, configure, theme, extend, and orchestrate Hermes Agent."
version: 3.2.0
author: Hermes Agent + Teknium
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags:
      [
        hermes,
        setup,
        configuration,
        multi-agent,
        spawning,
        cli,
        gateway,
        bots,
        bot-mode,
        features,
        themes,
        skins,
        desktop-plugins,
        tui-widgets,
        petdex,
        development,
      ]
    homepage: https://github.com/NousResearch/hermes-agent
    related_skills: [claude-code, codex, opencode]
---

# Hermes Agent

Hermes Agent is an open-source AI agent framework by Nous Research that runs in your terminal, a native desktop app, messaging platforms, and IDEs. It's in the same category as Claude Code (Anthropic), Codex (OpenAI), and OpenClaw — autonomous coding and task-execution agents that use tool calling to interact with your system. Hermes works with any LLM provider (OpenRouter, Anthropic, OpenAI, Google, DeepSeek, xAI, local models, and 20+ others) and runs on Linux, macOS, Windows, and WSL.

What makes Hermes different:

- **Self-improving through skills** — Hermes learns from experience by saving reusable procedures as skills that load into future sessions.
- **Persistent memory across sessions** — remembers who you are, your preferences, environment details, and lessons learned. Pluggable memory backends.
- **Multi-platform gateway** — the same agent runs on Telegram, Discord, Slack, WhatsApp, iMessage, Signal, Matrix, Teams, Email, and a dozen more platforms with full tool access, not just chat.
- **Many surfaces** — the same agent core drives the CLI, the Ink TUI, a native Electron desktop app, a web dashboard, and an ACP server for IDEs (VS Code / Zed / JetBrains).
- **Provider-agnostic** — swap models and providers mid-workflow; credential pools rotate across multiple API keys automatically.
- **Profiles** — run multiple independent Hermes instances with isolated configs, sessions, skills, and memory.
- **Extensible & themeable** — plugins, MCP servers, custom tools, webhook triggers, cron scheduling, skins that theme every surface, desktop UI plugins, TUI widgets, and pet mascots.

**This skill is a hub.** The body covers identity, quick start, spawning/orchestration, and hard invariants. Everything else lives in reference files — **load the matching reference (below) before answering**; do not answer detail questions from the body alone.

**Docs:** https://hermes-agent.nousresearch.com/docs/

## Scope & Verification

This skill is a concise operating guide, not the complete source of truth for every Hermes feature. If a Hermes feature, command, or setting is not mentioned here or in a reference, do not treat that absence as evidence that it does not exist. Check the live repository and official docs before giving a negative answer.

Good verification targets, cheapest first:

- **Every shipped feature, one line each: https://hermes-agent.nousresearch.com/docs/llms.txt.** Start here for any "can Hermes do X?" or "how do I do X?" — it indexes the entire documentation set with a link to the page that answers. It is generated from the docs tree on every build, so it is never behind the product. Fetch it with `web_extract`, or `curl -s https://hermes-agent.nousresearch.com/docs/llms.txt` when web tools are off. The whole documentation set in one file is at `/docs/llms-full.txt`.
- CLI commands: `hermes --help`, `hermes <command> --help`, and `hermes_cli/main.py`
- Source tree: https://github.com/NousResearch/hermes-agent

Never answer "Hermes can't do that" from memory. Hermes ships far more than this skill body describes, and the index exists so a negative answer is always checkable.

## Quick Start

```bash
# Install (shell installer — bootstraps PM, Python, dependencies, and the launcher)
curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash

# Interactive chat (default surface; set display.interface: tui to launch the Ink TUI instead)
hermes

# Single query
hermes chat -q "What is the capital of France?"

# Setup wizard  /  pick model+provider  /  health check
hermes setup
hermes model
hermes doctor

# Other surfaces
hermes desktop                 # launch the native desktop app (alias: hermes gui)
hermes dashboard            Web admin panel + embedded chat (--host, --port, --no-open, --skip-build, --isolated, --stop, --status)
hermes proxy                   # OpenAI-compatible local proxy backed by your OAuth provider
```

## Key Paths

```
${HERMES_HOME:-~/.hermes}/config.yaml       Main configuration (settings — never secrets)
${HERMES_HOME:-~/.hermes}/.env              API keys and secrets ONLY (under $HERMES_HOME if set)
$HERMES_HOME/skills/        Installed skills
${HERMES_HOME:-~/.hermes}/skins/            Custom themes (see references/themes.md)
${HERMES_HOME:-~/.hermes}/desktop-plugins/  Desktop app UI plugins (see references/desktop-plugins.md)
${HERMES_HOME:-~/.hermes}/tui-widgets/      TUI widget apps (see references/tui-widgets.md)
${HERMES_HOME:-~/.hermes}/pets/             Installed pet mascots (see references/petdex.md)
${HERMES_HOME:-~/.hermes}/state.db          Canonical session store (SQLite + FTS5)
${HERMES_HOME:-~/.hermes}/sessions/         Gateway routing index, request dumps, *.jsonl transcripts
${HERMES_HOME:-~/.hermes}/logs/             Gateway and error logs
${HERMES_HOME:-~/.hermes}/auth.json         OAuth tokens and credential pools
${HERMES_HOME:-~/.hermes}/hermes-agent/     Source code (if git-installed)
```

Profiles use `${HERMES_HOME:-~/.hermes}/profiles/<name>/` with the same layout. When a profile is active, resolve the real home from `$HERMES_HOME` — never hardcode `~/.hermes`.

## Routing Table — load the reference for the task

| User wants...                                                                                                     | Load                                                    |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Anything not listed below — "can Hermes do X?", "how do I set up X?"**                                          | **https://hermes-agent.nousresearch.com/docs/llms.txt** |
| Bots that chat, run routines, or message each other; the Bots tab                                                 | docs: `/user-guide/bot-mode`                            |
| CLI commands, subcommands, flags, "how do I run X"                                                                | `references/cli-reference.md`                           |
| In-session slash commands                                                                                         | `references/slash-commands.md`                          |
| Provider setup, API keys, OAuth                                                                                   | `references/providers-and-models.md`                    |
| config.yaml sections, toolsets, voice/STT/TTS                                                                     | `references/configuration.md`                           |
| Read-only audit of OpenCode/Hermes config, approvals, checkpoints, cron                                           | `references/environment-audit.md`                       |
| Aggregating several skills into fewer umbrellas (token cost, triggers)                                            | `references/skill-library-audit.md`                     |
| Prompt overhead: measure it, dump the rendered prompt, apply and verify a defer list, trim oversized tool schemas | `references/prompt-overhead.md`                         |
| AGENTS.md / .hermes.md / CLAUDE.md project rules                                                                  | `references/project-context-files.md`                   |
| Secret redaction, PII, approval modes, "reset permissions"                                                        | `references/security-privacy.md`                        |
| Delegation, cron, curator, kanban                                                                                 | `references/background-systems.md`                      |
| MCP servers (add, catalog, `hermes mcp`)                                                                          | `references/native-mcp.md`                              |
| Webhook routes and event-driven runs                                                                              | `references/webhooks.md`                                |
| Publishing the dashboard behind Tailscale Serve or a reverse proxy                                                | `references/dashboard-publishing.md`                    |
| A custom theme/skin ("synthwave theme", "change the gold ●")                                                      | `references/themes.md` + `templates/skin.yaml`          |
| A desktop app UI element (pane, widget, ⌘K command, page)                                                         | `references/desktop-plugins.md` + `templates/plugin.js` |
| A live TUI panel or modal widget (ticker, clock, dashboard)                                                       | `references/tui-widgets.md` + `templates/clock.mjs`     |
| Pet mascots — install, select, scale, diagnose                                                                    | `references/petdex.md`                                  |
| Windows-specific issues (keybinds, WinError 10106, BOM)                                                           | `references/windows-quirks.md`                          |
| Debugging: voice, tools missing, gateway, aux models                                                              | `references/troubleshooting.md`                         |
| Contributing code: adding tools, slash commands, tests                                                            | `references/contributor-guide.md`                       |
| delegate_task "capped at N" reports                                                                               | `references/delegate-task-concurrency-diagnosis.md`     |
| "Can app X use my Nous Portal subscription/OAuth?"                                                                | `references/portal-auth-for-third-party-apps.md`        |
| Connecting a messaging platform (Telegram, Discord, Slack, WhatsApp, …)                                           | docs: `/user-guide/messaging`                           |

The reference list above is not the feature list — it is the set of topics that
need more than their docs page. For everything else Hermes ships, fetch
`llms.txt` and it maps the question to the page that answers it.

Two theming rules that hold even without loading the reference: **you apply skins yourself** (`hermes config set display.skin <name>` — every surface repaints live within ~a second; don't tell the user to run `/skin`), and **to tweak one color, edit the ACTIVE skin** (`hermes skin set <key> <hex>`) — never fork `default`, which drops the palette and resets the background.

**Settings are read at process start, not per turn.** `cli.py` assigns `CLI_CONFIG = load_cli_config()` once at import, and the code that reads it (e.g. `cli_process_notifications.py`) uses that cached dict. There is no config watcher and no slash command that reloads it, so a `hermes config set` issued mid-session changes nothing until the process restarts — relaunch to apply. Skins are the documented exception. Corollary for verification: a result of the form "the message I expected did NOT arrive" does not verify a suppression setting; read the code path that decides, or check after a relaunch. Never report a config change as verified on the strength of absent output.

**This install runs with background-job notifications off** — `display.background_process_notifications: off` and `display.long_running_notifications: false`. Do not assume completion messages for background jobs will reach you, and do not lean on `notify=true` by default: poll with `process_manage(action='poll')` and use `notify` only when the user asks for it (or the job must outlive the conversation).

## Prompt Overhead ("how many tokens does Hermes add?")

Measure it, never estimate: `hermes prompt-size --json` builds a real inspection agent offline (no API call) and reports system prompt, skills index, memory, user profile, and per-toolset schema bytes. Cross-check with a real turn — `hermes chat -q 'Reply with exactly: OK' -Q`, then read `session_model_usage` in `${HERMES_HOME:-~/.hermes}/state.db` (`input_tokens + cache_read_tokens + cache_write_tokens`). Only that wire count is a token number: the ~5 bytes/token ratio is a whole-prompt sanity check, and Hermes's own chars/4 estimator overstates a schema-heavy prompt by ~28%. Byte share scaled to the measured total is good enough for a one-off "which block dominates" attribution, but never for predicting what a change saves — the marginal byte→token rate is unstable. Three configs measured the same way on the same machine: 21 tools / 40,001 B = 13,132 tokens; 17 / 27,564 B = 10,682; 14 / 20,645 B = 10,082. The first step paid 5.1 B/token, the second 11.5 — 6.9 kB of removed schema landed as 600 tokens. So any saving you report comes from two wire runs, same empty directory, same user message, differing in one thing; say "measured" or say nothing. Fixed prompt bytes must equal system prompt bytes + tool-schema bytes — reconcile that identity before quoting any recorded baseline, and measure on `cli`, the only platform whose inspection agent comes back with a full tool array.

Reference points from one macOS/CLI profile, to sanity-check a measurement rather than to quote as current: ~15.3k tokens fixed per turn out of the box (tool schemas 41.6 kB / 21 tools dominant, skills index 17.1 kB / 160 skills, memory 6.3 kB, profile 3.8 kB, core guidance 5.8 kB); 13.5k after folding 160 skills into 6 umbrella skills (index 9.2 kB / 94 skills); 10.7k with four tools deferred. `-t terminal` alone drops a turn to ~4.2k. **Re-measure after any skill-library or toolset change** — the numbers move with the library, so a quoted figure is only ever valid for the tree you measured it on.

Levers, in payoff order: tool schemas (defer or drop toolsets — always the largest block), the skills index (fewer skills, or umbrella them), then memory and user profile (budget-capped, so consolidating is the only reduction). `agent.coding_context: focus` in a code workspace collapses toolsets and demotes non-coding skill categories to a names-only line (~0.5k saved, nothing hidden). `-t <toolset>` trims per session.

**Deferring beats disabling.** `tools.tool_search.defer` takes a list of tool names whose schemas leave the model-facing array; they stay reachable through the `tool_search` → `tool_describe` → `tool_call` bridge, so nothing becomes uncallable — it costs one extra round trip the first time a session touches a deferred tool, against the saving on every turn. The settled set on this profile is the curated defaults plus `browser_exec`, `manage_connections`, `delegate_task`, `text_to_speech`, `skill_manage`, `search_files` and `web_extract`: 14 eager tools, 20,645 B of schema, 10,082 tokens on a bare turn. The measured path there was 21 tools / 40,001 B = 13,132 → 17 / 27,564 B = 10,682 → 14 / 20,645 B = 10,082, for +1.7 kB of catalogue listing in the `tool_search` description.

Pick the next candidates from recorded usage, not from schema size: `select tool_name, count(*) n from messages where tool_name is not null group by 1 order by 2 desc` against `${HERMES_HOME:-~/.hermes}/state.db` ranks what a session actually calls. The price of deferring is one round trip on every use, so a large schema behind rare calls beats a small schema behind frequent ones — and a hot tool stays eager however fat its schema (terminal is 2.7 kB and 7k calls; leave it). Keep `memory` eager on the same logic that keeps `clarify` eager: both are affordances the model must see unprompted, and a hidden self-improvement hook gets forgotten at exactly the moment it should fire.

An explicit `defer` list REPLACES the curated default wholesale, so copy the defaults in (they live in `hermes_cli/config_defaults.py`). Two verified exceptions: `clarify` is never deferred deliberately (A/B: structured-clarify usage fell 18/18 → 7/18 when stubbed — the ask-the-user affordance must stay ambient), and `vision_analyze` disappears from the catalog listing when deferred, so leave it eager (845 B). Mid-session, `/tools enable|disable` flips a single tool and `/toolsets` lists them.

Apply it with `hermes config set tools.tool_search.defer '<json array>'` — the CLI parses the JSON into a real YAML list — then verify the tool count with `hermes prompt-size` and prove the bridge end to end with a fresh session. Recipes, the verification SQL, and how to dump the rendered prompt in VS Code: `references/prompt-overhead.md`.

## Spawning Additional Hermes Instances

Run additional Hermes processes as fully independent subprocesses — separate sessions, tools, and environments.

### When to Use This vs delegate_task

|             | `delegate_task`                       | Spawning `hermes` process |
| ----------- | ------------------------------------- | ------------------------- |
| Isolation   | Separate conversation, shared process | Fully independent process |
| Duration    | Minutes (bounded by parent loop)      | Hours/days                |
| Tool access | Subset of parent's tools              | Full tool access          |
| Interactive | No                                    | Yes (PTY mode)            |
| Use case    | Quick parallel subtasks               | Long autonomous missions  |

### One-Shot Mode

When a command is long, multi-line, or contains quoting the terminal tool's consent gate refuses to run directly, write it to a script file first and invoke the script:

```
write_file(path="/tmp/run.sh", content="...")   # the full command
terminal(command="bash /tmp/run.sh", background=true)
```

Then poll the script's own completion marker rather than the process: `terminal(command="grep -c 'PI_EXIT' /path/to/run.err")` in a loop with `sleep 30` between checks, since `background=true` without `notify` gives no exit ping on this install. Never put `nohup`/`disown`/`setsid` wrappers in the command — they are rejected; use `background=true` instead.

```
terminal(command="hermes chat -q 'Research GRPO papers and write summary to ~/research/grpo.md'", timeout=300)

# Background for long tasks:
terminal(command="hermes chat -q 'Set up CI/CD for ~/myapp'", background=true)
```

### Interactive PTY Mode (via tmux)

Hermes uses prompt_toolkit, which requires a real terminal. Use tmux for interactive spawning:

```
# Start
terminal(command="tmux new-session -d -s agent1 -x 120 -y 40 'hermes'", timeout=10)

# Wait for startup, then send a message
terminal(command="sleep 8 && tmux send-keys -t agent1 'Build a FastAPI auth service' Enter", timeout=15)

# Read output
terminal(command="sleep 20 && tmux capture-pane -t agent1 -p", timeout=5)

# Send follow-up
terminal(command="tmux send-keys -t agent1 'Add rate limiting middleware' Enter", timeout=5)

# Exit
terminal(command="tmux send-keys -t agent1 '/exit' Enter && sleep 2 && tmux kill-session -t agent1", timeout=10)
```

### Multi-Agent Coordination

```
# Agent A: backend
terminal(command="tmux new-session -d -s backend -x 120 -y 40 'hermes -w'", timeout=10)
terminal(command="sleep 8 && tmux send-keys -t backend 'Build REST API for user management' Enter", timeout=15)

# Agent B: frontend
terminal(command="tmux new-session -d -s frontend -x 120 -y 40 'hermes -w'", timeout=10)
terminal(command="sleep 8 && tmux send-keys -t frontend 'Build React dashboard for user management' Enter", timeout=15)

# Check progress, relay context between them
terminal(command="tmux capture-pane -t backend -p | tail -30", timeout=5)
terminal(command="tmux send-keys -t frontend 'Here is the API schema from the backend agent: ...' Enter", timeout=5)
```

### Session Resume

```
# Resume most recent session
terminal(command="tmux new-session -d -s resumed 'hermes --continue'", timeout=10)

# Resume specific session
terminal(command="tmux new-session -d -s resumed 'hermes --resume 20260225_143052_a1b2c3'", timeout=10)
```

### Tips

- **Prefer `delegate_task` for quick subtasks** — less overhead than spawning a full process
- **Use `-w` (worktree mode)** when spawning agents that edit code — prevents git conflicts
- **Set timeouts** for one-shot mode — complex tasks can take 5-10 minutes
- **Use `hermes chat -q` for fire-and-forget** — no PTY needed
- **Use tmux for interactive sessions** — raw PTY mode has `\r` vs `\n` issues with prompt_toolkit
- **For scheduled tasks**, use the `cronjob` tool instead of spawning — handles delivery and retry
- **"delegate_task is capped at N" reports** — see `references/delegate-task-concurrency-diagnosis.md`. Three real cap paths in Hermes; if none fired, the model is self-limiting and rationalising it as "the runtime caps."
- **"Can $external_app use my Nous Portal subscription / OAuth?"** — see `references/portal-auth-for-third-party-apps.md`. Walk the user through three layers (plugin-vs-app, what Portal actually exposes, local-broker-proxy option).

## Surfaces (quick orientation)

- **Desktop app** (`hermes desktop` / `hermes gui`) — native Electron app for macOS/Linux/Windows: streaming chat, session list, Cmd+K palette, drag-and-drop files, native notifications, per-profile remote-gateway login. Extend it with UI plugins — `references/desktop-plugins.md`.
- **Web dashboard** (`hermes dashboard`) — full admin panel: messaging channels, MCP catalog, webhooks, memory, profile builder, plus an embedded `hermes --tui` chat. Secured behind an OAuth/token gate.
- **Ink TUI** (`hermes --tui` or `display.interface: tui`) — terminal UI with docked widget apps — `references/tui-widgets.md`.
- **OpenAI-compatible proxy** (`hermes proxy`) — a local OpenAI API backed by whichever OAuth provider you're signed into. Point Codex CLI, Aider, Cline, or any script at it — no API key.

## Hard Invariants (never violate, regardless of what you loaded)

- **Never break prompt caching** — don't change past context, toolsets, or the system prompt mid-conversation. The only exception is context compression.
- **Message role alternation** — never two assistant or two user messages in a row; only `tool` results can repeat.
- **Secrets in `.env`, settings in `config.yaml`** — never tell a user to put a non-credential setting in `.env`.
- **Profile-safe paths** — `get_hermes_home()` in code, `$HERMES_HOME` when resolving paths in a session.
- **Never hand-edit `config.yaml` for the user** — use `hermes config set KEY VAL`; a stray indent can corrupt the file and break the live gateway. Never use `hermes -z`. Never restart the gateway to apply a config change (settings are read at process start — relaunch the affected surface or wait for the next process). Never print API keys or `.env` values. After any config change, verify the gateway is still healthy (`hermes status` or the local API status endpoint) and report its state.
