# Implementation Plan: Multi-Harness Agent Runtime Rearchitecture

**Branch**: `feat/agentic-framework-v2` | **Date**: 2026-03-01 | **Spec**: [./spec.md](./spec.md)
**Input**: Feature specification from [./spec.md](./spec.md)

## Summary

Rebuild Ghostwire’s runtime around canonical `/` command intents and `@` agent profiles, then project those semantics into Claude, Codex, and Copilot through deterministic adapters. Runtime and export surfaces consume generated catalogs only.

**Execution model**: RED -> GREEN -> REFACTOR per non-trivial module.

**Assumptions**:
- Canonical specs can express all currently shipping command/profile behavior with <= 5% semantic loss on first pass.
- Host adapter differences are transport-level, not contract-level.
- CI can run adapter conformance tests in a deterministic environment.

**Uncertainty (estimated)**:
- Adapter transport variability risk: ~0.35 probability of requiring one additional iteration cycle.
- Catalog migration friction risk: ~0.25 probability of transient failures during Phase 4.

## Technical Context

**Language/Version**: TypeScript 5.7.x, Bun runtime (`type: module`)  
**Primary Dependencies**: `zod`, `@opencode-ai/plugin`, `@opencode-ai/sdk`, existing Ghostwire execution/orchestration modules  
**Storage**: Canonical specs + generated catalogs + docs artifacts in-repo  
**Testing**: Unit + integration + adapter conformance + snapshot determinism  
**Target Platforms**: Claude Code, OpenAI Codex CLI, GitHub Copilot  
**Constraints**: strict typing, deterministic generation, catalog-only runtime path, no legacy coexistence path  
**Scope**: command intent layer, agent profile layer, prompt asset layer, composition layer, adapter layer, export/runtime wiring

## Constitution Check

- Gate status: **PASS (draft)**
- Determinism: enforced through schema and generation invariants.
- Test-first rule: all non-trivial implementation tasks require RED-first tests.
- Simplicity constraint: single-source catalog architecture eliminates duplicated load paths.

## Workstream Topology

```text
docs/plans/2026-03-01-feat-multi-harness-agent-runtime-rearchitecture/
├── plan.md
├── research.md
├── spec.md
├── tasks.md
├── data-model.md
├── quickstart.md
└── contracts/
    ├── command-intent-contract.yaml
    ├── agent-profile-contract.yaml
    └── adapter-conformance-contract.yaml
```

## Phase Execution Mapping

- **Phase 0** (Tasks 0.1–0.2): baseline inventory + quality gate definition.
- **Phase 1** (Tasks 1.1–1.4): canonical schemas and composition contracts.
- **Phase 2** (Tasks 2.1–2.4): generation pipeline and catalog-only runtime/export wiring.
- **Phase 3** (Tasks 3.1–3.4): host adapters and shared conformance harness.
- **Phase 4** (Tasks 4.1–4.3): full command/profile rebuild + parity telemetry.
- **Phase 5** (Tasks 5.1–5.2): CI gates and release.
- **Phase 6** (Tasks 6.1–6.3): stabilization, hardening, maintainer documentation.

## Quality Gates

1. **Schema gate**: all canonical specs validate with zero errors.
2. **Generation gate**: regenerated catalogs are stable and duplicate-free.
3. **Conformance gate**: command/agent parity passes adapter thresholds.
4. **Smoke gate**: no Sev-1 regressions in release smoke suite.

## Exit Criteria

- SC-001 through SC-005 from [./spec.md](./spec.md) are satisfied.
- Runtime and export read only generated catalogs.
- Obsolete mixed command/template/profile topology is removed.
- Maintainer guide is published and validated against real add-command/add-agent flow.
