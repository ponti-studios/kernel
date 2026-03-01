# Quickstart: Multi-Harness Agent Runtime Rearchitecture

## Objective

Execute Phase 0 and Phase 1 to establish canonical schemas, deterministic generation constraints, and release gate foundations for the new multi-harness runtime.

## Prerequisites

- Bun installed and available in `PATH`.
- Dependencies installed with `bun install`.
- Working branch is `feat/agentic-framework-v2`.
- Plan artifacts available in this folder (`research/spec/tasks/plan/data-model/contracts`).

## Execution Sequence (Phase 0 -> Phase 1)

1. Run baseline inventory (`Task 0.1`):
   - Enumerate current command IDs, profile IDs, and runtime loading edges.
   - Store inventory report under `docs/notepads/` or phase artifact location.
2. Define measurable quality gates (`Task 0.2`):
   - Schema gate, generation gate, conformance gate, smoke gate.
   - Encode thresholds in CI config and task scripts.
3. Implement canonical schemas (`Tasks 1.1-1.3`):
   - `CommandIntentSpec`
   - `AgentProfileSpec`
   - `PromptAsset`
4. Implement composition contract (`Task 1.4`):
   - typed compiler I/O for `ExecutionPlan`.

## RED -> GREEN -> REFACTOR Protocol

1. **RED**: write failing tests first for schema and deterministic behavior.
2. **GREEN**: implement minimal code to satisfy tests.
3. **REFACTOR**: simplify structure, keep behavior fixed, and preserve deterministic outputs.

## Validation Commands

```bash
bun run typecheck
bun run test src/index.test.ts src/plugin-config.test.ts
bun run test tests/foundation.test.ts tests/commands.test.ts
```

For broader validation once adapters are introduced:

```bash
bun run test
```

## Expected Evidence Artifacts

- Baseline inventory report for commands/profiles/routes.
- Schema test outputs for malformed and boundary cases.
- Deterministic generation snapshot outputs.
- CI gate definitions and threshold documentation.

## Done Criteria (Phase 1)

- Canonical schema modules exist and are strictly validated.
- Composition contracts compile and are test-covered.
- Deterministic behavior tests pass across repeated runs.
- No runtime path changes bypass generated catalog directionality.
