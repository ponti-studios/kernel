---
title: "feat: Build Modular Copilot and Codex Export Pipeline"
type: feat
date: 2026-02-24
status: draft
issue_tracker: github
issue_url: pending
feature_description: "Enable Ghostwire to export its capabilities for GitHub Copilot and OpenAI Codex using modular artifacts (prompt files, skills, hooks, and scoped instructions) instead of a monolithic instructions file."
---

# feat: Build Modular Copilot and Codex Export Pipeline

## Problem Statement
The current export implementation emits a high-entropy, monolithic instructions artifact for Copilot, which degrades maintainability, violates platform customization granularity, and risks instruction truncation or reduced retrieval utility in downstream Copilot workflows.

## Goals and Non-Goals
### Goals
- [ ] Replace monolithic Copilot export with a compositional artifact graph aligned to GitHub Copilot customization primitives.
- [ ] Preserve Codex compatibility while minimizing duplicated instruction payload.
- [ ] Introduce deterministic export generation with stable paths, idempotent writes, and test coverage.
### Non-Goals
- [ ] Rebuild Ghostwire runtime to execute natively inside Copilot/Codex host runtimes.
- [ ] Migrate all historical Ghostwire prompts into Copilot artifacts in a single release.

## Brainstorm Decisions
- Adopt a compiler-style export architecture: shared normalized intermediate model -> target-specific emitters.
- Keep repository-level Copilot instructions minimal and push domain/task detail into scoped files.
- Map Ghostwire command intent to Copilot prompt files and map high-value operational guardrails to skills/hooks.
- Preserve AGENTS.md for Codex while constraining verbosity and linking to modular assets where applicable.

## Research Summary
### Local Findings
- [src/cli/export.ts:28] Current exporter builds a single shared content block with embedded full system protocol, causing oversized target artifacts.
- [src/cli/export.ts:89] Copilot target currently emits only `.github/copilot-instructions.md`, with no support for `.github/instructions`, `.github/prompts`, `.github/skills`, `.github/agents`, or `.github/hooks`.
- [src/cli/index.ts:123] Export command already exists and can be extended without CLI surface redesign.
- [src/execution/features/commands/templates/workflows/plan.ts:68] Canonical planning schema requires strict frontmatter and section contract, supporting disciplined implementation governance.
- [AGENTS.md:165] Project constitution enforces test-first development and integration testing, implying RED->GREEN->REFACTOR for exporter refactor.
### External Findings
- [GitHub Docs: Repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions): recommends keeping repository instructions concise and using additional customization mechanisms for specificity.
- [GitHub Docs: Prompt files tutorial](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file): prompt files provide reusable slash-command style task templates.
- [GitHub Docs: About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills): skills are file-based capability bundles with structured metadata and task instructions.
- [GitHub Docs: About hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks): hooks provide lifecycle policy enforcement with JSON configuration and event-driven execution.
- [GitHub Docs: Customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet): documents customization matrix and indicates practical limits/placement concerns for instruction files.
### Risks and Unknowns
- Copilot feature availability differs by environment (web/IDE/CLI), so emitted artifacts may have partial runtime effect; mitigation: capability flags and docs matrix.
- Hook semantics can change across Copilot agent versions; mitigation: versioned hook templates and schema validation.
- Over-fragmentation can create discoverability cost; mitigation: top-level index and deterministic naming conventions.

## Proposed Approach
Implement a modular export subsystem with a normalized `ExportModel` and target emitters:
1. Add `compileExportModel()` to aggregate Ghostwire system prompt constraints, agent metadata, command templates, and policy fragments into a normalized in-memory representation.
2. Replace direct string assembly in `src/cli/export.ts` with emitter modules:
   - `emitCopilotRepoInstructions()` -> `.github/copilot-instructions.md` (minimal core rules only).
   - `emitCopilotScopedInstructions()` -> `.github/instructions/*.instructions.md` with `applyTo` scopes.
   - `emitCopilotPromptFiles()` -> `.github/prompts/*.prompt.md` for top Ghostwire workflows.
   - `emitCopilotSkills()` -> `.github/skills/*/SKILL.md` for reusable operating patterns.
   - `emitCopilotAgents()` -> `.github/agents/*.agent.md` for specialist role profiles.
   - `emitCopilotHooks()` -> `.github/hooks/*.json` for guardrail lifecycle checks.
   - `emitCodexAgents()` -> concise `AGENTS.md` plus optional references to modular assets.
3. Add deterministic file manifest output (`export-manifest.json`) containing hashes and generator version for reproducibility.
4. Add configuration flags to select artifact groups and strict mode validation.
5. Update CLI help and docs to explain artifact topology and compatibility matrix.

## Acceptance Criteria
- [ ] `ghostwire export --target copilot` emits modular artifact tree (`.github/copilot-instructions.md`, `.github/instructions/`, `.github/prompts/`, `.github/skills/`, `.github/agents/`, `.github/hooks/`) with deterministic paths.
- [ ] Copilot repository-level instruction file remains concise and excludes full system prompt dump.
- [ ] `ghostwire export --target codex` emits concise `AGENTS.md` aligned to scientific/technical instruction style and references modular policies.
- [ ] Export behavior is idempotent: repeated runs without source changes produce byte-identical outputs.
- [ ] Test suite covers overwrite behavior, per-target artifact sets, and content-shape validation for each emitted file class.

## Implementation Steps
- [ ] Define `ExportModel` types and `compileExportModel()` from existing Ghostwire metadata and prompts.
- [ ] Refactor exporter into target-specific emitter modules with stable sort/order rules.
- [ ] Implement Copilot emitters for repo instructions, scoped instructions, prompt files, skills, agents, and hooks.
- [ ] Implement concise Codex emitter that avoids monolithic payload duplication.
- [ ] Add manifest generation and strict validation checks (required fields, max-size heuristics, path constraints).
- [ ] Add/expand tests following RED->GREEN->REFACTOR for each emitter and full command integration path.
- [ ] Update CLI docs (`docs/cli/export-help.md`) and add a new reference page describing exported artifact semantics.

## Task List (Structured JSON Format)
```json
{
  "plan_id": "plan_2026_02_24_modular_copilot_codex_export",
  "plan_name": "Modular Copilot and Codex Export Pipeline",
  "tasks": [
    {
      "id": "task-001",
      "subject": "Define normalized export model and compiler",
      "description": "Create ExportModel types and compileExportModel() that aggregates Ghostwire agent metadata, protocol constraints, and command intent into deterministic intermediate representation.",
      "category": "ultrabrain",
      "skills": ["agent-native-architecture"],
      "estimatedEffort": "1h",
      "status": "pending",
      "blocks": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008"],
      "blockedBy": [],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-002",
      "subject": "Refactor exporter into modular emitter architecture",
      "description": "Split monolithic string builder into target-specific emitter modules with deterministic ordering and reusable file writer utilities.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "pending",
      "blocks": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008"],
      "blockedBy": [],
      "wave": 1,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-003",
      "subject": "Implement Copilot core + scoped instructions emitters",
      "description": "Emit minimal .github/copilot-instructions.md and scoped .github/instructions/*.instructions.md artifacts with applyTo targeting and concise policy decomposition.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "pending",
      "blocks": ["task-009", "task-010"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-004",
      "subject": "Implement Copilot prompt file emitter",
      "description": "Map high-value Ghostwire workflows into .github/prompts/*.prompt.md slash-prompt templates with stable naming and metadata.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blocks": ["task-009", "task-010"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-005",
      "subject": "Implement Copilot skills emitter",
      "description": "Generate .github/skills/<skill>/SKILL.md assets from reusable Ghostwire operating patterns and validation guidance.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blocks": ["task-009", "task-010"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-006",
      "subject": "Implement Copilot agents emitter",
      "description": "Generate .github/agents/*.agent.md profiles for selected specialist roles with concise, role-focused behavioral directives.",
      "category": "writing",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blocks": ["task-009", "task-010"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-007",
      "subject": "Implement Copilot hooks emitter",
      "description": "Generate .github/hooks/*.json lifecycle policies for guardrails with schema-compatible versioned hook config.",
      "category": "deep",
      "skills": [],
      "estimatedEffort": "45m",
      "status": "pending",
      "blocks": ["task-009", "task-010"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-008",
      "subject": "Implement concise Codex AGENTS emitter",
      "description": "Replace oversized AGENTS payload generation with concise technical/scientific directives and references to modular policy artifacts.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "30m",
      "status": "pending",
      "blocks": ["task-009", "task-010"],
      "blockedBy": ["task-001", "task-002"],
      "wave": 2,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-009",
      "subject": "Add export manifest, flags, and documentation updates",
      "description": "Add deterministic export-manifest metadata output, CLI options for artifact groups/strict mode, and documentation updates for compatibility matrix and artifact topology.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1h",
      "status": "pending",
      "blocks": ["task-010"],
      "blockedBy": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008"],
      "wave": 3,
      "createdAt": "2026-02-24T00:00:00Z"
    },
    {
      "id": "task-010",
      "subject": "Implement full RED-GREEN-REFACTOR test suite and smoke validation",
      "description": "Add emitter unit tests, export integration tests, overwrite/idempotency checks, and smoke tests for Copilot and Codex targets with deterministic output assertions.",
      "category": "quick",
      "skills": [],
      "estimatedEffort": "1.5h",
      "status": "pending",
      "blocks": [],
      "blockedBy": ["task-003", "task-004", "task-005", "task-006", "task-007", "task-008", "task-009"],
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
- Unit: emitter snapshot/shape tests, model compiler normalization tests, deterministic ordering/hash tests.
- Integration: CLI export command test in temp workspace validating full tree creation and `--force` semantics.
- End-to-end: smoke run against a fixture repo consumed by Copilot customization parser expectations.

## Dependencies and Rollout
- Dependencies: existing `AGENTS_MANIFEST`, `system-prompt.md`, command metadata sources, Bun test runner.
- Sequencing: land model compiler first, then Copilot emitters, then Codex emitter compression, then docs and rollout guide.
- Rollback: retain previous monolithic export behind temporary fallback flag for one release; remove after validation window.

## References
- Internal: [src/cli/export.ts:28]
- Internal: [src/cli/index.ts:123]
- Internal: [src/execution/features/commands/templates/workflows/plan.ts:68]
- Internal: [AGENTS.md:165]
- External: [Add repository custom instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions)
- External: [Your first prompt file](https://docs.github.com/en/copilot/tutorials/customization-library/prompt-files/your-first-prompt-file)
- External: [About agent skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- External: [About hooks](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-hooks)
- External: [Customization cheat sheet](https://docs.github.com/en/copilot/reference/customization-cheat-sheet)
- Related issue/PR: pending
