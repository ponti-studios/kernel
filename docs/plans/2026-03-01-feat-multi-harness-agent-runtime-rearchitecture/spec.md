# Feature Specification: Multi-Harness Agent Runtime Rearchitecture

**Feature Branch**: `feat/agentic-framework-v2`  
**Created**: 2026-03-01  
**Status**: Draft  
**Plan**: [../2026-03-01-feat-multi-harness-agent-runtime-rearchitecture.md](../2026-03-01-feat-multi-harness-agent-runtime-rearchitecture.md)  
**Research**: [./research.md](./research.md)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent `/` command semantics across harnesses (Priority: P1)

As a user, I can run Ghostwire command workflows with predictable behavior in Claude, Codex, or Copilot.

**Why this priority**: `/` command execution is the primary entry path. Without parity, multi-harness support is not credible.

**Independent Test**:
- Execute canonical command set in each adapter and compare normalized trace snapshots.

**Acceptance Scenarios**:
1. **Given** `/ghostwire:workflows:plan <request>`, **When** executed via any adapter, **Then** normalized lifecycle phases match canonical execution plan.
2. **Given** command argument validation failures, **When** dispatched via any adapter, **Then** error class and remediation hints are equivalent.
3. **Given** generated catalogs, **When** loading runtime commands, **Then** all adapters resolve commands from canonical catalogs only.

---

### User Story 2 - Deterministic `@` agent routing across harnesses (Priority: P1)

As a user, I can target specialized behavior with `@agent` semantics and get deterministic role, route, and policy binding.

**Why this priority**: Agent routing is core to orchestration quality and safety.

**Independent Test**:
- Execute `@planner`, `@researcher_data`, and `@reviewer_security` via each adapter and assert route + policy contract.

**Acceptance Scenarios**:
1. **Given** `@planner`, **When** resolved, **Then** adapter route maps to canonical planner profile ID and route class.
2. **Given** `@researcher_data`, **When** resolved, **Then** tool policy includes research/web capabilities and excludes unsafe edits unless explicitly allowed.
3. **Given** unsupported host-level agent transport, **When** targeted, **Then** adapter emits deterministic fallback behavior with explicit explanation.

---

### User Story 3 - Single-source maintainer workflow (Priority: P2)

As a maintainer, I can add a command or profile once and have it available to all harnesses after generation.

**Why this priority**: Maintainer efficiency and architectural coherence are key to long-term reliability.

**Independent Test**:
- Add one synthetic command intent and one synthetic profile; regenerate catalogs; verify all adapters expose them without host-specific edits.

**Acceptance Scenarios**:
1. **Given** a new `CommandIntentSpec`, **When** generation runs, **Then** command appears in all adapter catalogs.
2. **Given** a new `AgentProfileSpec`, **When** generation runs, **Then** `@` resolution table updates across adapters.
3. **Given** no host-specific files edited, **When** tests run, **Then** conformance suite passes for synthetic additions.

---

### User Story 4 - Production-grade greenfield rollout (Priority: P2)

As an operator, I can deploy the new architecture with deterministic quality gates and observability.

**Why this priority**: Greenfield rollout still requires strict reliability and release control.

**Independent Test**:
- Run conformance suite + release smoke tests and validate observability outputs.

**Acceptance Scenarios**:
1. **Given** release candidate build, **When** command/agent conformance runs, **Then** thresholds are met for all adapters.
2. **Given** parity threshold breach, **When** release gate evaluates results, **Then** deployment is blocked.
3. **Given** production run, **When** operator inspects logs, **Then** discrepancy class and responsible adapter are reported.

## Requirements

### Functional Requirements

- **FR-001**: Define canonical `CommandIntentSpec` schema and validators.
- **FR-002**: Define canonical `AgentProfileSpec` schema and validators.
- **FR-003**: Define immutable `PromptAsset` schema and validators.
- **FR-004**: Implement composition compiler to generate `ExecutionPlan` artifacts from intent/profile/asset.
- **FR-005**: Implement generated catalogs (`command`, `agent`, `execution-plan`) as single source-of-truth.
- **FR-006**: Implement harness adapters (`claude`, `codex`, `copilot`) that map canonical semantics to host transport.
- **FR-007**: Remove legacy command/profile/template loading pathways from runtime and export architecture.
- **FR-008**: Provide deterministic resolver precedence within canonical architecture.
- **FR-009**: Provide cross-harness conformance suite for command and agent parity.
- **FR-010**: Enforce CI gates for schema validity, deterministic generation, and adapter conformance.

### Non-Functional Requirements

- **NFR-001**: Deterministic generation output (stable ordering, stable IDs, reproducible files).
- **NFR-002**: Zero duplicate command IDs/profile IDs at compile time.
- **NFR-003**: Adapter fallback behavior must be explicit and observable.
- **NFR-004**: Release gate failure must block deployment automatically.

## Key Entities

- **CommandIntentSpec**
  - Fields: `id`, `description`, `argsSchema`, `acceptanceChecks`, `defaultRoute`
- **AgentProfileSpec**
  - Fields: `id`, `intent`, `runtimeRoute`, `toolPolicy`, `modelPolicyHint`, `acceptanceChecks`
- **PromptAsset**
  - Fields: `id`, `kind`, `body`, `version`, `origin`
- **ExecutionPlan**
  - Fields: `intentId`, `profileBindings[]`, `promptAssetId`, `resolvedPolicy`, `adapterHints`
- **HarnessAdapterContract**
  - Methods: `bindCommand`, `resolveAgentTarget`, `translatePolicy`, `emitCapabilities`

## Architecture Constraints

1. Core specs (`intents`, `profiles`, `prompt-assets`) must not import host adapters.
2. Adapters must not mutate canonical specs at runtime.
3. Runtime and export must both consume `generated/*` catalogs.
4. No direct filesystem template reads in runtime pathways.
5. Policy precedence order must be versioned and documented.

## Success Criteria

1. **SC-001**: ≥95% parity for P1 command set across adapters.
2. **SC-002**: 100% schema validation pass on canonical specs in CI.
3. **SC-003**: 0 duplicate IDs in generated catalogs.
4. **SC-004**: 100% migrated commands loaded via generated catalog path.
5. **SC-005**: Conformance suite green across all target adapters.

## Scope

### In Scope
- Canonical schema + generation architecture.
- Adapter layer for Claude/Codex/Copilot.
- Greenfield rollout with parity gates.
- Conformance test infrastructure.
- Documentation and maintainers’ migration guide.

### Out of Scope
- New business workflows unrelated to architecture replatforming.
- Host-specific UI polish beyond adapter translation.
- Support for harnesses outside Claude/Codex/Copilot in this phase.

## Dependencies

- Existing command inventory for extraction and reconstitution.
- Existing orchestration and profile behavior definitions.
- Export tooling updates for catalog-only consumption.

## Risks and Mitigations

- **Adapter drift** → conformance suite with capability matrix snapshots.
- **Resolver ambiguity** → explicit precedence contracts + schema validation.
- **Team migration errors** → strict naming conventions + docs + lint checks.
- **Release regression** → conformance + smoke-test release gates.

## Implementation Readiness

- Ready to move into task execution phase.
- No unresolved blockers at specification level.
