---
title: Agent Consolidation Data Model
date: 2026-02-20
phase: 10
---

# Agent Consolidation Data Model

## Overview

Ghostwire agents are defined as markdown files with YAML frontmatter in `src/orchestration/agents/`.
The frontmatter provides structured metadata; the markdown body is the agent prompt.

## Entities

### AgentDefinition

**Source**: `src/orchestration/agents/[id].md`

**Fields**:
- `id` (string, required): Kebab-case ID matching filename.
- `name` (string, required): Human-readable display name.
- `purpose` (string, required): One-line purpose statement.
- `models.primary` (string, required): Primary model identifier.
- `models.fallback` (string, optional): Fallback model identifier.
- `temperature` (number, optional): Default temperature.
- `category` (string, optional): Agent category for operator prompts.
- `cost` (string, optional): Relative cost indicator.
- `triggers` (array, optional): Trigger objects with `domain` and `trigger`.
- `useWhen` (string[], optional): Recommended use cases.
- `avoidWhen` (string[], optional): Scenarios to avoid.
- `prompt` (string, required): Markdown body loaded verbatim.

**Constraints**:
- `id` must equal filename (without `.md`).
- `id` must be unique across the directory.
- Required fields must be present in frontmatter.
- `prompt` must be non-empty.

## Relationships

### Builtin Agent Registry

`loadMarkdownAgents()` loads all `AgentDefinition` entries into the builtin registry used by
`createBuiltinAgents()` and `config-composer` during startup.

### Operator Prompt Metadata

Agent frontmatter maps to operator prompt metadata:
- `category`, `cost`, `triggers`, `useWhen`, `avoidWhen`, `promptAlias`, `keyTrigger`, `dedicatedSection`.

## Validation

Validation is performed by `src/orchestration/agents/agent-schema.ts` and
`src/orchestration/agents/load-markdown-agents.ts`.
