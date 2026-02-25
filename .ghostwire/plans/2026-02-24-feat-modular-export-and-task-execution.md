---
title: "feat: Full-Parity Ghostwire Export for Copilot and Codex"
type: feat
date: 2026-02-24
status: completed
issue_tracker: github
issue_url: pending
feature_description: "Export full Ghostwire capability set into GitHub Copilot and OpenAI Codex environments with no curated subset limits (all agents, all skills, all prompt/command templates, all supported hooks/instructions)."
---

# feat: Full-Parity Ghostwire Export for Copilot and Codex

## Problem Statement
Current export behavior is selective and does not emit the complete Ghostwire capability surface, resulting in partial behavioral parity in Copilot/Codex environments.

## Goals and Non-Goals
### Goals
- [x] Export all available Ghostwire agents into Copilot-compatible agent files.
- [x] Export all applicable skills into Copilot skill directories.
- [x] Export all command/prompt templates into Copilot prompt files.
- [x] Preserve concise root instructions while emitting complete scoped artifact coverage.
- [x] Keep Codex output aligned with full capability catalog (no arbitrary subset cap).
- [x] Validate parity via deterministic coverage checks and manifest auditing.
### Non-Goals
- [ ] Rebuild Ghostwire runtime internals for host-native execution.
- [ ] Add unsupported Copilot artifact types outside documented customization primitives.

## Brainstorm Decisions
- Replace curated arrays with discovery-driven emitters sourced from canonical metadata/manifests.
- Enforce “no exceptions” via strict parity validator comparing source inventories to emitted inventories.
- Keep root instruction file concise; push full breadth into modular artifacts.
- Introduce machine-checkable coverage metrics in export manifest.

## Research Summary
### Local Findings
- [src/cli/export.ts:110] Prompt emitter currently exports only a fixed small set.
- [src/cli/export.ts:144] Skill emitter currently exports only a fixed small set.
- [src/cli/export.ts:180] Agent emitter currently exports a single static agent profile.
- [src/cli/export.ts:35] Codex catalog currently uses a top-N subset, not full manifest.
- [src/execution/features/agents-manifest.ts:1] Embedded manifest can serve as complete source-of-truth for agent inventory.
### External Findings
- [GitHub Copilot custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions): root instructions should remain concise and complemented with modular customization.
- [GitHub Copilot prompt files](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file): prompt files support reusable workflow invocation.
- [GitHub Copilot skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills): skills are first-class reusable capability units.
- [GitHub Copilot hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks): hook files support policy enforcement at lifecycle boundaries.
### Risks and Unknowns
- Some internal prompts/skills may require normalization to match Copilot file-format constraints.
- Full export size may increase significantly; mitigation via group flags and strict validation.

## Proposed Approach
Implement inventory-driven full export:
1. Build source inventory collectors for agents, skills, prompts/templates, scoped instructions, and hooks.
2. Generate one target artifact per source item with deterministic naming and stable ordering.
3. Remove hard-coded top-N and curated subset behavior.
4. Add parity validator: emitted_count == source_count (per artifact class).
5. Extend export manifest with coverage section (source_count, emitted_count, missing_ids).

## Execution Waves
### Wave 1
- `task-001`: Build canonical source inventory loaders for agents/skills/prompts/hooks.
- `task-002`: Define normalized `ExportInventory` + mapping rules for Copilot/Codex targets.

### Wave 2
- `task-003`: Implement full agent emitter (all agents -> `.github/agents/*.agent.md`).
- `task-004`: Implement full skill emitter (all skills -> `.github/skills/*/SKILL.md`).
- `task-005`: Implement full prompt emitter (all command/template prompts -> `.github/prompts/*.prompt.md`).
- `task-006`: Implement scoped instruction emitter expansion from available policy sources.
- `task-007`: Remove Codex subset cap and emit full catalog references.

### Wave 3
- `task-008`: Add parity coverage validator and manifest coverage metrics.
- `task-009`: Add strict-mode failure on parity gaps (`missing_ids.length > 0`).
- `task-010`: Update CLI/docs for full export semantics and expected artifact volumes.

### Wave 4
- `task-011`: Add exhaustive tests for full inventory emission and parity accounting.
- `task-012`: Run integration/smoke verification on `--target copilot`, `--target codex`, and `--target all`.

## Acceptance Criteria
- [x] All agents from source manifest are exported as Copilot agent artifacts.
- [x] All eligible skills are exported as Copilot skills.
- [x] All eligible prompt/template sources are exported as Copilot prompt files.
- [x] Codex export reflects full source capability catalog (no hard-coded truncation).
- [x] Export manifest reports zero missing IDs per class in strict mode.
- [x] `ghostwire export --target all --strict` passes with full parity checks.

## Implementation Steps
- [x] Replace curated emitter payloads with inventory-driven generation.
- [x] Add slug/filename normalization + collision handling.
- [x] Add parity and coverage accounting in manifest.
- [x] Enforce strict-mode parity validation errors.
- [x] Expand docs and command reference for full export behavior.
- [x] Implement RED-GREEN-REFACTOR tests for each artifact class and parity logic.

## Task List (Structured JSON Format)
```json
{
  "plan_id": "plan_2026_02_24_full_parity_export",
  "plan_name": "Full-Parity Ghostwire Export for Copilot and Codex",
  "tasks": [
    {
      "id": "task-001",
      "subject": "Build source inventory loaders",
      "description": "Implement inventory collectors for agents, skills, prompts/templates, instructions, and hooks from canonical sources.",
      "category": "ultrabrain",
      "skills": ["agent-native-architecture"],
      "estimatedEffort": "1.5h",
      "status": "completed",
      "blocks": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008"],
      "blockedBy": [],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-002",
      "subject": "Define normalized ExportInventory mapping",
      "description": "Define normalized mapping from source inventory items to target artifact schemas and deterministic filenames.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "completed",
      "blocks": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008"],
      "blockedBy": [],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-003",
      "subject": "Implement full agent emitter",
      "description": "Emit all agents from AGENTS_MANIFEST to .github/agents/*.agent.md with normalized metadata.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "completed",
      "blocks": ["task-008", "task-011", "task-012"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-004",
      "subject": "Implement full skill emitter",
      "description": "Emit all eligible skills as .github/skills/<slug>/SKILL.md with deterministic structure.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "completed",
      "blocks": ["task-008", "task-011", "task-012"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-005",
      "subject": "Implement full prompt emitter",
      "description": "Emit all eligible command/template prompts to .github/prompts/*.prompt.md.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "completed",
      "blocks": ["task-008", "task-011", "task-012"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-006",
      "subject": "Implement expanded scoped instruction emitter",
      "description": "Emit scoped instructions across available policy domains while maintaining concise root instructions.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "completed",
      "blocks": ["task-008", "task-011", "task-012"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-007",
      "subject": "Remove Codex subset cap",
      "description": "Eliminate top-N truncation and include full capability catalog in Codex export.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "30m",
      "status": "completed",
      "blocks": ["task-008", "task-011", "task-012"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-008",
      "subject": "Add parity coverage manifest",
      "description": "Track per-class source_count, emitted_count, and missing_ids in export-manifest coverage section.",
      "category": "deep",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "completed",
      "blocks": ["task-009", "task-011", "task-012"],
      "blockedBy": ["task-003", "task-004", "task-005", "task-006", "task-007"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-009",
      "subject": "Enforce strict-mode parity failures",
      "description": "Make --strict fail when manifest coverage reports missing IDs or count mismatches.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "completed",
      "blocks": ["task-011", "task-012"],
      "blockedBy": ["task-008"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-010",
      "subject": "Update docs for full export semantics",
      "description": "Document exhaustive export behavior, artifact counts, and parity guarantees.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "completed",
      "blocks": ["task-012"],
      "blockedBy": ["task-008"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-011",
      "subject": "Add exhaustive parity tests",
      "description": "Add tests proving emitted inventories equal source inventories for each artifact class.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1.5h",
      "status": "completed",
      "blocks": ["task-012"],
      "blockedBy": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008", "task-009"],
      "wave": 4,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-012",
      "subject": "Run full strict smoke validation",
      "description": "Execute strict export for copilot/codex/all and validate manifest reports zero gaps.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "completed",
      "blocks": [],
      "blockedBy": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008", "task-009", "task-010", "task-011"],
      "wave": 4,
      "createdAt": "2026-02-24T00:00:00Z"
    }
  ],
  "created_at": "2026-02-24T00:00:00Z",
  "breakdown_at": "2026-02-24T00:00:00Z",
  "auto_parallelization": true
}
```

## Testing Strategy
- Unit: inventory collectors, mapping normalizers, and per-class emitter generation.
- Integration: CLI export with `--groups`, `--strict`, and overwrite behavior.
- End-to-end: parity smoke tests asserting zero missing IDs in manifest coverage.

## Dependencies and Rollout
- Dependencies: AGENTS manifest, skills metadata, command/template sources, Copilot artifact schema constraints.
- Sequencing: wave-ordered execution; strict parity enabled after coverage metrics exist.
- Rollback: retain previous curated mode behind feature flag only if parity migration regresses.

## References
- Internal: [src/cli/export.ts:110]
- Internal: [src/cli/export.ts:144]
- Internal: [src/cli/export.ts:180]
- Internal: [src/cli/export.ts:35]
- Internal: [src/execution/features/agents-manifest.ts:1]
- External: [GitHub Copilot custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- External: [GitHub Copilot prompt files](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file)
- External: [GitHub Copilot skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- External: [GitHub Copilot hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks)
- Related issue/PR: pending
