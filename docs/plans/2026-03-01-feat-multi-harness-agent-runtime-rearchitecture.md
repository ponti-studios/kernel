---
title: "feat: Multi-Harness Agent Runtime Rearchitecture"
type: feat
date: 2026-03-01
status: draft
issue_tracker: github
issue_url: pending
feature_description: "Rearchitect Ghostwire to run natively across Claude Code, OpenAI Codex CLI, and GitHub Copilot with explicit `/` command and `@` agent primitives, deterministic routing, and host adapters."
---

# feat: Multi-Harness Agent Runtime Rearchitecture

## Problem Statement

Ghostwire currently mixes command intent, prompt assets, profile metadata, runtime routing, and export behavior inside overlapping directory conventions. The resulting architecture is difficult to reason about and host coupling is implicit rather than explicit. This blocks reliable parity across Claude Code, OpenAI Codex CLI, and GitHub Copilot.

## User Scenarios & Testing (Mandatory)

### User Story 1 (P1): Harness-Agnostic Command Invocation
- Narrative: As a user, I can invoke a Ghostwire workflow using `/` command semantics in my chosen harness (Claude, Codex, Copilot) and get deterministic behavior.
- Independent test: Run equivalent `/ghostwire:workflows:plan <request>` flow in each harness adapter and compare normalized execution trace.
- Acceptance scenarios:
  - Given the same command + inputs, when executed through Claude adapter, then normalized trace matches canonical intent contract.
  - Given the same command + inputs, when executed through Codex adapter, then normalized trace matches canonical intent contract.
  - Given the same command + inputs, when executed through Copilot adapter, then normalized trace matches canonical intent contract.

### User Story 2 (P1): Explicit Agent Targeting
- Narrative: As a user, I can target specialized behavior via `@agent` semantics and get deterministic routing to the expected profile/capability set.
- Independent test: Execute `@planner`, `@researcher_data`, and `@reviewer_security` across harness adapters and verify route + tool policy.
- Acceptance scenarios:
  - Given `@planner`, when request is dispatched, then route resolves to canonical planner profile contract.
  - Given `@researcher_data`, when request is dispatched, then web/retrieval policy is enforced.
  - Given `@reviewer_security`, when request is dispatched, then security review policy set is applied.

### User Story 3 (P2): Maintainer Clarity and Extensibility
- Narrative: As a maintainer, I can add a command or agent once and ship it to all supported harnesses via generated catalogs.
- Independent test: Add one synthetic command + one synthetic agent, regenerate catalogs, validate all adapters consume new artifacts without manual patching.
- Acceptance scenarios:
  - Given one new intent spec, when generation runs, then all adapter catalogs include it.
  - Given one new agent profile, when generation runs, then `@` resolution tables update for all adapters.

### Edge Cases
- Harness lacks native `@` syntax: adapter must provide an equivalent participant/role mapping fallback.
- Harness lacks one tool primitive (e.g., browser or patch): adapter must degrade predictably with explicit capability error.
- Conflicting user-local instructions across harnesses: precedence must remain deterministic and documented.
- Host-specific feature drift over time: adapter conformance must detect semantic regression quickly.

## Requirements (Mandatory)

### Functional Requirements
- **FR-001**: Introduce canonical, harness-agnostic command intent model with strict schemas.
- **FR-002**: Introduce canonical, harness-agnostic agent profile model for `@agent` resolution.
- **FR-003**: Separate prompt assets from runtime routing and from generated catalogs.
- **FR-004**: Implement adapter layer per harness (Claude, Codex, Copilot) translating canonical contracts to host-native semantics.
- **FR-005**: Generate single source-of-truth catalogs used by runtime + export pipelines.
- **FR-006**: Enforce deterministic precedence rules for instructions, policies, and profile bindings.
- **FR-007**: Provide parity verification framework that asserts behavior equivalence across harness adapters.
- **FR-008**: Remove legacy command/profile loading pathways from runtime architecture.

### Key Entities
- **CommandIntentSpec**: declarative command contract (id, args, acceptance checks, lifecycle hints).
- **AgentProfileSpec**: declarative agent contract (id, role, route, tool policy, model policy hints).
- **PromptAsset**: immutable textual template asset.
- **ExecutionPlan**: runtime composition mapping intent + profile + prompt + policy.
- **HarnessAdapter**: translation boundary for one host runtime.
- **GeneratedCatalog**: compiled read-only artifact consumed by runtime + exporter.

## Success Criteria (Mandatory)
- **SC-001**: ≥ 95% command parity for top-priority command set across Claude, Codex, Copilot adapters.
- **SC-002**: 100% deterministic schema validation for all canonical artifacts at build time.
- **SC-003**: Zero duplicate command IDs and zero duplicate agent IDs in generated catalogs.
- **SC-004**: 100% of runtime commands resolved through generated catalog path (no direct template import).
- **SC-005**: Adapter conformance suite passes for all supported hosts in CI.

## Goals and Non-Goals

### Goals
- [ ] Define and implement canonical `/` and `@` architecture independent of host-specific filesystem conventions.
- [ ] Eliminate naming ambiguity and source-of-truth duplication in command/profile/prompt topology.
- [ ] Achieve stable behavioral parity across Claude Code, OpenAI Codex CLI, and GitHub Copilot.
- [ ] Deliver a clean greenfield runtime with no legacy coupling.
- [ ] Ensure maintainers can add features once and publish everywhere via generators.

### Non-Goals
- [ ] Rebuild each host’s native UX beyond adapter boundaries.
- [ ] Guarantee parity for host capabilities that do not exist (unsupported primitives remain explicit limitations).
- [ ] Preserve old architecture paths during implementation.
- [ ] Introduce unrelated new workflow commands.

## Technical Context
- Language/Version: TypeScript (strict mode), Bun runtime.
- Primary Dependencies: Existing execution/orchestration stack + host adapters.
- Storage: Repository metadata + generated catalogs + docs artifacts.
- Testing: Unit + contract + adapter conformance + integration snapshots.
- Target Platform: Claude Code, OpenAI Codex CLI, GitHub Copilot.
- Constraints:
  - New architecture is greenfield and does not carry backward-compatibility requirements.
  - Must keep generated artifacts deterministic and diff-stable.
- Scale/Scope: Full execution command layer, agent profile layer, export layer, and hook integration surfaces.

## Constitution Gate
- Gate status: PASS (draft)
- Violations and justifications:
  - None identified at planning stage.
  - Assumption: host adapters can expose deterministic command + agent invocation boundaries.

## Brainstorm Decisions
- Use canonical contract model + host adapters rather than host-specific architecture branches.
- Treat `/` commands and `@` agents as first-class typed primitives.
- Move all composition to build/generation stage where possible; minimize runtime mutation.
- Remove legacy command/profile/template coupling from runtime path.

## Clarifications
- Open questions discovered:
  - Copilot-specific `@` invocation UX can vary by surface (chat participant vs custom agent route).
  - Codex-specific command surface may include host-defined behaviors not 1:1 with Claude slash command implementation.
- Resolutions:
  - Adapter contract abstracts host invocation mechanism while preserving canonical semantics.
  - Conformance tests validate semantic equivalence, not literal transport parity.

## Research Summary

### Local Findings
- [src/commands/commands.ts](src/commands/commands.ts) currently builds runtime definitions from generated manifest.
- [src/script/build-commands-manifest.ts](src/script/build-commands-manifest.ts) generates catalog from `commands/commands/*.ts`.
- [src/commands/profiles.ts](src/commands/profiles.ts) currently overlays prompt data and usage rendering in one module.
- [src/cli/export.ts](src/cli/export.ts) separately reads templates for export prompt generation.
- [docs/engineering/002-command-system-first-principles.md](docs/engineering/002-command-system-first-principles.md) already identifies first-principles separation requirement.

### External Findings
- Claude/Codex/Copilot all expose command-style invocation and agent-targeting patterns, but with host-specific transport details.
- Common pattern: strict separation of instruction layers, command metadata, tool policy, and runtime adapter behavior.
- Common pattern: generated manifests/catalogs as runtime source-of-truth to reduce drift.

### Risks and Unknowns
- **R-001 (medium)**: Host capabilities differ for `@` transport; risk of adapter complexity.
- **R-002 (medium)**: Export scripts may assume previous template topology and require explicit updates.
- **R-003 (medium)**: Team adoption friction during naming/structure transition.
- **R-004 (low-medium)**: Team adoption friction during naming/structure transition.

## Proposed Approach

Design a canonical architecture with five layers:

1. **Intent Layer** (`/` primitives)
   - Defines command IDs, argument contracts, acceptance checks, and lifecycle metadata.
2. **Profile Layer** (`@` primitives)
   - Defines agent contracts: route, allowed tools, model policy hints, risk class.
3. **Asset Layer**
   - Stores prompt/template content as immutable assets.
4. **Composition Layer**
   - Produces execution plans by composing intents + profiles + assets + policy.
5. **Adapter Layer**
   - Maps execution plans into host-native runtime behaviors for Claude/Codex/Copilot.

All runtime and export surfaces consume generated catalogs from a single build pipeline.

## Target Architecture (Directory Blueprint)

```text
src/execution/
  intents/
    specs/
    schema.ts
    index.ts

  profiles/
    specs/
    schema.ts
    index.ts

  prompt-assets/
    commands/
    agents/
    schema.ts

  composition/
    execution-plans/
    compiler.ts
    resolver.ts

  adapters/
    claude/
      command-adapter.ts
      agent-adapter.ts
    codex/
      command-adapter.ts
      agent-adapter.ts
    copilot/
      command-adapter.ts
      agent-adapter.ts

  generated/
    command-catalog.ts
    agent-catalog.ts
    execution-plan-catalog.ts
```

## Execution Waves

### Wave 1 — Canonical Contracts and Schemas
- `task-001`: Define `CommandIntentSpec` schema + validators.
- `task-002`: Define `AgentProfileSpec` schema + validators.
- `task-003`: Define `PromptAsset` schema + static validation rules.
- `task-004`: Define execution plan composition schema + compiler interfaces.

### Wave 2 — Build Pipeline and Generated Catalogs
- `task-005`: Implement generator for command catalog.
- `task-006`: Implement generator for agent catalog.
- `task-007`: Implement generator for execution plan catalog.
- `task-008`: Add deterministic generation checks (stable ordering, hash snapshots, duplicate rejection).

### Wave 3 — Adapter Boundaries
- `task-009`: Implement Claude adapter pair (`/`, `@`).
- `task-010`: Implement Codex adapter pair (`/`, `@`).
- `task-011`: Implement Copilot adapter pair (`/`, `@` participant mapping).
- `task-012`: Add adapter capability matrices and graceful degradation pathways.

### Wave 4 — Full Command/Profile Rebuild
- `task-013`: Implement full command intent catalog for all runtime commands.
- `task-014`: Implement full agent profile catalog for all runtime profiles.
- `task-015`: Move prompt/template assets into immutable prompt-assets layer.
- `task-016`: Remove legacy loaders from runtime and export pathways.

### Wave 5 — Parity and Production Hardening
- `task-017`: Build cross-harness conformance suite (command behavior parity).
- `task-018`: Build cross-harness conformance suite (agent routing + policy parity).
- `task-019`: Gate CI on adapter conformance + schema validation + generated artifact checks.
- `task-020`: Release runtime on catalog-only architecture.

### Wave 6 — Stabilization
- `task-021`: Finalize architecture cleanup for `commands/commands`, `commands/templates`, and mixed profile overlay pathways.
- `task-022`: Tighten adapter capability contracts and observability.
- `task-023`: Publish maintainers’ add-a-command/add-an-agent guide.

## Acceptance Criteria
- [ ] Canonical schemas exist and validate 100% of runtime artifacts.
- [ ] Generated catalogs are sole runtime source for commands/profiles.
- [ ] Claude/Codex/Copilot adapters pass conformance suite for P1 command set.
- [ ] Legacy runtime loading paths are removed from active architecture.
- [ ] Maintainer workflow for adding command/profile requires no host-specific file edits.

## Implementation Steps
- [ ] Create `intents`, `profiles`, `prompt-assets`, `composition`, and `adapters` scaffolding.
- [ ] Implement schema validators and generation pipeline (RED → GREEN → REFACTOR per module).
- [ ] Introduce adapter abstraction interfaces and wire to existing runtime entry points.
- [ ] Implement full command/profile catalogs and snapshot output parity.
- [ ] Add conformance suite and CI gates for greenfield runtime.
- [ ] Remove legacy topology from runtime and exporter.

## Testing Strategy
- Unit:
  - Schema validators for intent/profile/asset.
  - Generator deterministic ordering and collision checks.
- Integration:
  - Composition pipeline from canonical specs to execution plans.
  - Adapter translation correctness per harness.
- End-to-end:
  - P1 command workflows across three adapters.
  - `@agent` route and policy enforcement parity.

## Dependencies and Rollout
- Dependencies:
  - Existing command manifest builder and export pipeline.
  - Host adapter integration points in CLI/export and orchestration runtime.
- Sequencing:
  - Contracts → generators → adapters → full rebuild → conformance → stabilization.

## Rollout Strategy
- Greenfield branch-based rollout with no legacy compatibility obligations.
- Promote to default only when adapter conformance and schema gates are green.

## Program Stages

### Stage A: Canonical Foundation
- Add and validate canonical schemas and generated catalogs.

### Stage B: Adapter Completion
- Implement and harden Claude/Codex/Copilot adapters.

### Stage C: Full Runtime Wiring
- Route all runtime command/profile resolution through generated catalogs.

### Stage D: Conformance Hardening
- Enforce parity thresholds and CI quality gates.

### Stage E: Stabilization
- Final cleanup and operational hardening.

## Operational Metrics
- Command parity pass rate by harness.
- Agent route correctness rate by harness.
- Generated catalog drift incidents (target: 0).
- Median onboarding time to add new command/profile (target: reduce by 50%).

## Work Breakdown (Structured JSON)

```json
{
  "plan_id": "plan_2026_03_01_multi_harness_rearchitecture",
  "plan_name": "Multi-Harness Agent Runtime Rearchitecture",
  "waves": 6,
  "tasks": [
    {"id": "task-001", "wave": 1, "subject": "Define CommandIntentSpec schema", "priority": "high"},
    {"id": "task-002", "wave": 1, "subject": "Define AgentProfileSpec schema", "priority": "high"},
    {"id": "task-003", "wave": 1, "subject": "Define PromptAsset schema", "priority": "high"},
    {"id": "task-004", "wave": 1, "subject": "Define execution composition contracts", "priority": "high"},

    {"id": "task-005", "wave": 2, "subject": "Generate command catalog", "priority": "high", "blockedBy": ["task-001", "task-003"]},
    {"id": "task-006", "wave": 2, "subject": "Generate agent catalog", "priority": "high", "blockedBy": ["task-002", "task-003"]},
    {"id": "task-007", "wave": 2, "subject": "Generate execution-plan catalog", "priority": "high", "blockedBy": ["task-004", "task-005", "task-006"]},
    {"id": "task-008", "wave": 2, "subject": "Add deterministic generation guards", "priority": "medium"},

    {"id": "task-009", "wave": 3, "subject": "Implement Claude adapter", "priority": "high", "blockedBy": ["task-007"]},
    {"id": "task-010", "wave": 3, "subject": "Implement Codex adapter", "priority": "high", "blockedBy": ["task-007"]},
    {"id": "task-011", "wave": 3, "subject": "Implement Copilot adapter", "priority": "high", "blockedBy": ["task-007"]},
    {"id": "task-012", "wave": 3, "subject": "Define capability matrix + fallback behavior", "priority": "medium"},

    {"id": "task-013", "wave": 4, "subject": "Migrate top 10 commands", "priority": "high", "blockedBy": ["task-005", "task-009", "task-010", "task-011"]},
    {"id": "task-014", "wave": 4, "subject": "Migrate top 10 profiles", "priority": "high", "blockedBy": ["task-006", "task-009", "task-010", "task-011"]},
    {"id": "task-015", "wave": 4, "subject": "Normalize prompt assets", "priority": "medium"},
    {"id": "task-016", "wave": 4, "subject": "Remove legacy loaders from runtime and export", "priority": "high"},

    {"id": "task-017", "wave": 5, "subject": "Build command conformance suite", "priority": "high", "blockedBy": ["task-013"]},
    {"id": "task-018", "wave": 5, "subject": "Build agent conformance suite", "priority": "high", "blockedBy": ["task-014"]},
    {"id": "task-019", "wave": 5, "subject": "Gate CI on conformance", "priority": "high", "blockedBy": ["task-017", "task-018"]},
    {"id": "task-020", "wave": 5, "subject": "Flip runtime default to new catalogs", "priority": "high", "blockedBy": ["task-019"]},

    {"id": "task-021", "wave": 6, "subject": "Finalize mixed-topology cleanup", "priority": "medium", "blockedBy": ["task-020"]},
    {"id": "task-022", "wave": 6, "subject": "Harden adapter contracts and telemetry", "priority": "medium", "blockedBy": ["task-021"]},
    {"id": "task-023", "wave": 6, "subject": "Publish maintainer migration guides", "priority": "medium"}
  ]
}
```

## Confidence and Assumptions
- Confidence this architecture meets cross-harness goal: **0.89**.
- Confidence greenfield rearchitecture can be completed without major execution risk: **0.83**.
- Main uncertainty concentration:
  - Copilot `@` invocation transport variance across IDE surfaces.
  - Codex/Claude tool approval semantic differences under strict policy modes.

Assumptions:
- Each harness provides enough primitives to model `/` and `@` semantically via adapters.

## References
- Internal:
  - [src/commands/commands.ts](src/commands/commands.ts)
  - [src/script/build-commands-manifest.ts](src/script/build-commands-manifest.ts)
  - [src/commands/profiles.ts](src/commands/profiles.ts)
  - [src/cli/export.ts](src/cli/export.ts)
  - [docs/engineering/002-command-system-first-principles.md](docs/engineering/002-command-system-first-principles.md)
- Related issue/PR:
  - [PR #10](https://github.com/hackefeller/ghostwire/pull/10)
