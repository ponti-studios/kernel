---
title: Knowledge Index Contract
id: vault.knowledge-index-contract
knowledge_type: contract
domain: vault.agent-system
scope: maintaining-agent-canon-and-discovery
status: active
updated: 2026-08-27
applies_to:
  - ".agents/**"
---

# Knowledge Index Contract

The agent system has three layers: shared truth in `.agents/canon/`, narrow workflows in `.agents/skills/`, and generated discovery in `.agents/index.json`.

## Canon

- A canon file MUST have a unique stable `id`, `title`, `knowledge_type`, `domain`, `scope`, `status`, and `updated`.
- Canon owns cross-cutting facts, contracts, and standards. A workflow MUST declare canon it requires in `agents/skill-manifest.yaml`; it MUST NOT copy canon prose into a local reference.
- Canon is loaded only when a selected workflow declares it or a task directly requires it.

## Workflows

- Every `SKILL.md` MUST declare a matching `name` and discriminating `description`. Its `agents/skill-manifest.yaml` MUST declare the matching `id`, an `invocation` mode (`implicit` or `explicit`), and a `canon` list.
- `agents/openai.yaml` MUST agree with the manifest invocation mode.
- Workflow-local references contain task-specific procedures, templates, or examples. Their owner is the containing skill.
- A skill entrypoint is a router: it states purpose, boundary, dependencies, and the few references to load. It does not duplicate detailed procedures.

## Discovery

1. Read `.agents/index.json`.
2. Select one primary skill by capability and boundary.
3. Resolve only that skill's declared canon and requested local reference.
4. Apply contracts as binding constraints, processes in order, standards as conventions, and references as supporting context.

`.agents/index.json` and `.agents/INDEX.md` are generated artifacts. Regenerate them after any canon or workflow-reference change:

```bash
python3 .agents/skills/vault-maintenance/scripts/generate_knowledge_index.py
```
