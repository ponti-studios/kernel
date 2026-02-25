---
title: "Host-Native Runtime Port (Deferred)"
date: 2026-02-24
status: deferred
owner: ghostwire-core
related_plan: .ghostwire/plans/2026-02-24-feat-modular-export-and-task-execution.md
---

# Host-Native Runtime Port (Deferred)

## Context
During full-parity export work for Copilot/Codex, we explicitly excluded runtime internals migration.

## Deferred Topic
"Rebuild Ghostwire runtime internals for host-native execution" means porting Ghostwire from OpenCode-plugin-centric runtime assumptions to native execution models in external hosts (e.g., GitHub Copilot/Codex), rather than only exporting instructions/prompts/skills/hooks.

## Why Deferred
- Current objective was file-based capability parity export, not runtime migration.
- Runtime port is a substantially larger architectural effort with different risk profile.
- Existing export solution now provides full capability distribution without requiring runtime rewrite.

## Scope Candidates (Future)
- Abstract platform lifecycle hooks from OpenCode-specific plugin interfaces.
- Build host adapter layer for Copilot/Codex event/tool semantics.
- Port task-queue + delegation orchestration to host-native execution APIs.
- Rework config/model/provider integration away from OpenCode-only paths.
- Redesign verification/telemetry pipeline for multi-host runtime compatibility.

## Open Questions
- What is the minimum host-native feature parity target (MVP)?
- Which host APIs can support delegated multi-agent execution directly?
- How should security and permission boundaries map across host runtimes?
- Do we run a shared core runtime library with thin host adapters or separate runtimes?

## Trigger To Revisit
Re-open this brainstorm when users require direct host-native orchestration behavior that cannot be satisfied by exported artifacts.
