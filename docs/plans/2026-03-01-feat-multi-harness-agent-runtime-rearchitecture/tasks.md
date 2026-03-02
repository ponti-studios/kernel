# Tasks: Multi-Harness Agent Runtime Rearchitecture

**Date**: 2026-03-01  
**Spec**: [./spec.md](./spec.md)  
**Plan**: [../2026-03-01-feat-multi-harness-agent-runtime-rearchitecture.md](../2026-03-01-feat-multi-harness-agent-runtime-rearchitecture.md)  
**Status**: Draft

## Task Breakdown

### Phase 0: Program Setup & Baseline

#### Task 0.1: Capture current command/profile baseline
- **Description**: Snapshot current command IDs, profile IDs, and runtime loading paths.
- **Acceptance Criteria**:
  - [ ] Baseline manifest report generated.
  - [ ] Current dependency graph documented.
  - [ ] Top P1 command set identified for parity testing.
- **Dependencies**: None

#### Task 0.2: Define rollout quality gates
- **Description**: Add architecture release gates for schema, conformance, and smoke checks.
- **Acceptance Criteria**:
  - [ ] Gates documented and wired in CI pipeline.
  - [ ] Gate thresholds are explicit and measurable.
  - [ ] Failed gates block release automatically.
- **Dependencies**: Task 0.1

---

### Phase 1: Canonical Schema Layer

#### Task 1.1: Implement `CommandIntentSpec` schema
- **Description**: Create strict schema + validator module for command intents.
- **Acceptance Criteria**:
  - [ ] Schema includes id, args, acceptance checks, route hints.
  - [ ] Invalid artifacts fail fast with actionable errors.
  - [ ] Unit tests cover boundary and malformed cases.
- **Dependencies**: Task 0.2

#### Task 1.2: Implement `AgentSpec` schema
- **Description**: Create strict schema + validator for agent routing contracts.
- **Acceptance Criteria**:
  - [ ] Schema includes runtime route, tool policy, model hints.
  - [ ] Duplicate ID detection enforced.
  - [ ] Unit tests cover policy shape failures.
- **Dependencies**: Task 0.2

#### Task 1.3: Implement `PromptAsset` schema
- **Description**: Define immutable prompt asset model with origin metadata.
- **Acceptance Criteria**:
  - [ ] Versioned prompt asset schema implemented.
  - [ ] Asset parsing/validation tests pass.
  - [ ] No runtime mutation API exposed.
- **Dependencies**: Task 0.2

#### Task 1.4: Implement `ExecutionPlan` composition contract
- **Description**: Define typed composition output from intents/profiles/assets.
- **Acceptance Criteria**:
  - [ ] Contract includes resolved policy + adapter hints.
  - [ ] Compiler input/output interfaces typed strictly.
  - [ ] Unit tests validate deterministic composition.
- **Dependencies**: Tasks 1.1, 1.2, 1.3

---

### Phase 2: Generation Pipeline

#### Task 2.1: Build command catalog generator
- **Description**: Generate canonical command catalog from intent specs.
- **Acceptance Criteria**:
  - [ ] Generated file is deterministic and sorted.
  - [ ] Duplicate IDs rejected with explicit diagnostics.
  - [ ] Snapshot tests stable across repeated runs.
- **Dependencies**: Task 1.1

#### Task 2.2: Build agent catalog generator
- **Description**: Generate canonical agent catalog from profile specs.
- **Acceptance Criteria**:
  - [ ] Generated file includes route and policy metadata.
  - [ ] Duplicate IDs rejected.
  - [ ] Snapshot tests pass.
- **Dependencies**: Task 1.2

#### Task 2.3: Build execution-plan catalog generator
- **Description**: Compile composed execution plans and emit read-only catalog.
- **Acceptance Criteria**:
  - [ ] Catalog generation validates all cross-references.
  - [ ] Missing prompt/profile references fail build.
  - [ ] Snapshot tests pass.
- **Dependencies**: Tasks 1.4, 2.1, 2.2

#### Task 2.4: Wire runtime + export to generated catalogs
- **Description**: Route runtime + export through generated catalogs only.
- **Acceptance Criteria**:
  - [ ] Runtime path reads only generated artifacts.
  - [ ] Export path reads only generated artifacts.
  - [ ] Runtime no longer depends on direct template filesystem reads.
- **Dependencies**: Tasks 2.1, 2.2, 2.3

---

### Phase 3: Adapter Layer

#### Task 3.1: Implement Claude adapter
- **Description**: Map canonical `/` and `@` semantics to Claude transport.
- **Acceptance Criteria**:
  - [ ] Command binding contract implemented.
  - [ ] Agent target resolution contract implemented.
  - [ ] Policy translation tests pass.
- **Dependencies**: Task 2.3

#### Task 3.2: Implement Codex adapter
- **Description**: Map canonical `/` and `@` semantics to Codex transport.
- **Acceptance Criteria**:
  - [ ] Command binding and target resolution implemented.
  - [ ] Policy translation tested.
  - [ ] Capability matrix emitted.
- **Dependencies**: Task 2.3

#### Task 3.3: Implement Copilot adapter
- **Description**: Map canonical `/` and `@` semantics to Copilot participant/agent transport.
- **Acceptance Criteria**:
  - [ ] Participant/agent route mapping implemented.
  - [ ] Unsupported transport fallback deterministic.
  - [ ] Capability matrix emitted.
- **Dependencies**: Task 2.3

#### Task 3.4: Build shared adapter conformance harness
- **Description**: Create adapter-independent test harness for semantic parity.
- **Acceptance Criteria**:
  - [ ] Common fixtures for command and agent scenarios.
  - [ ] Adapter outputs normalized for comparison.
  - [ ] Conformance baseline snapshots committed.
- **Dependencies**: Tasks 3.1, 3.2, 3.3

---

### Phase 4: Full Runtime Rebuild

#### Task 4.1: Migrate top 10 command intents
- **Description**: Implement full command intent catalog from canonical specs.
- **Acceptance Criteria**:
  - [ ] All runtime commands are available through canonical catalogs.
  - [ ] Command conformance pass rate ≥95%.
  - [ ] No runtime command is loaded from deprecated paths.
- **Dependencies**: Tasks 2.4, 3.4

#### Task 4.2: Migrate top 10 agent profiles
- **Description**: Implement full agent profile catalog from canonical specs.
- **Acceptance Criteria**:
  - [ ] All runtime profiles are available via adapter `@` resolution.
  - [ ] Policy parity checks pass.
  - [ ] Profile route parity validated.
- **Dependencies**: Tasks 2.4, 3.4

#### Task 4.3: Add parity diff logger and observability
- **Description**: Emit normalized parity telemetry and adapter-level discrepancy diagnostics.
- **Acceptance Criteria**:
  - [ ] Resolver precedence deterministic and documented.
  - [ ] Diff telemetry emitted for mismatches.
  - [ ] Adapter discrepancy diagnostics include root-cause class.
- **Dependencies**: Tasks 4.1, 4.2

---

### Phase 5: CI Gating and Release

#### Task 5.1: Add CI gates for schemas/generation/conformance
- **Description**: Enforce architecture invariants in CI.
- **Acceptance Criteria**:
  - [ ] Schema validation gate enabled.
  - [ ] Generation determinism gate enabled.
  - [ ] Adapter conformance gate enabled.
- **Dependencies**: Task 4.3

#### Task 5.2: Release catalog-only runtime architecture
- **Description**: Release catalog-only runtime architecture.
- **Acceptance Criteria**:
  - [ ] Catalog-only runtime architecture enabled.
  - [ ] Release gate evidence attached to release artifact.
  - [ ] No Sev-1 regressions in smoke suite.
- **Dependencies**: Task 5.1

---

### Phase 6: Stabilization

#### Task 6.1: Remove obsolete mixed topology paths
- **Description**: Remove deprecated direct command/template/profile pathways.
- **Acceptance Criteria**:
  - [ ] Deprecated pathways removed.
  - [ ] No remaining runtime imports from retired modules.
  - [ ] Build and tests pass.
- **Dependencies**: Task 5.2

#### Task 6.2: Harden adapter contracts and telemetry
- **Description**: Complete post-release hardening for adapter behavior and observability.
- **Acceptance Criteria**:
  - [ ] Capability matrices versioned and documented.
  - [ ] Telemetry dashboards cover command and agent conformance signals.
  - [ ] CI remains green.
- **Dependencies**: Task 6.1

#### Task 6.3: Publish maintainer guide
- **Description**: Document add-command/add-agent workflow in canonical architecture.
- **Acceptance Criteria**:
  - [ ] Maintainer guide includes examples for all three harness adapters.
  - [ ] Troubleshooting section includes adapter parity debugging.
  - [ ] Docs reviewed for consistency with architecture terminology.
- **Dependencies**: Task 6.1

---

## Parallelization Notes

- Phase 1 tasks 1.1–1.3 can run in parallel after Phase 0.
- Phase 3 adapter tasks 3.1–3.3 can run in parallel once generation is stable.
- Phase 4 tasks 4.1 and 4.2 can run in parallel if resolver framework is prepped.

## Exit Criteria

- [ ] SC-001 through SC-005 from spec are all satisfied.
- [ ] New architecture is catalog-only for runtime and export.
- [ ] Deprecated topology removed.
- [ ] Stabilization hardening complete.
