# Agent Consolidation Migration Guide

## Overview

Ghostwire now uses markdown-only agents in `src/orchestration/agents/`.
Legacy TypeScript agent factories and duplicate plugin agents were removed.

## What Changed

- Agents are defined in markdown with YAML frontmatter.
- Agent IDs use kebab-case filenames (e.g., `reviewer-security.md`).
- Plugin agent duplicates under `src/plugin/agents/` were removed.

## Updating References

If you referenced plugin agent names, update to builtin IDs:

- `security-sentinel` -> `reviewer-security`
- `bug-reproduction-validator` -> `validator-bugs`
- `performance-oracle` -> `oracle-performance`
- `julik-frontend-races-reviewer` -> `reviewer-races`
- `pattern-recognition-specialist` -> `analyzer-patterns`
- `repo-research-analyst` -> `researcher-repo`

Full mapping: `specs/043-agent-consolidation-spec/agent-plugin-mapping.md`.

## Adding New Agents

Use the markdown format contract:

- `specs/043-agent-consolidation-spec/contracts/agent-markdown-format.md`
- `specs/043-agent-consolidation-spec/quickstart.md`

## Validation

Run the standard checks after updating agents:

```bash
bun test
bun run typecheck
bun run build
```
