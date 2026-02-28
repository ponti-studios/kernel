# Quickstart: Scoped Skills Simplification

## Objective

Implement and validate a canonical `.agents/skills` discovery model with single-pipeline resolution and runtime/export parity.

## Prerequisites

- Bun installed and available in PATH.
- Repository dependencies installed (`bun install`).
- Branch checked out with feature files under `specs/001-simplify-agent-framework`.

## Implementation Sequence

1. Add or update canonical discovery policy in skill loader modules.
2. Remove duplicate discovery/composition paths; route all consumers through one resolver pipeline.
3. Align manifest/export generators with runtime resolved semantics.
4. Update docs to describe canonical path and collision policy.

## Validation Sequence (RED → GREEN → REFACTOR)

1. Add/adjust tests for:
   - scope walk precedence
   - duplicate ID collision handling
   - runtime/export semantic parity
2. Run targeted tests:

```bash
bun run src/cli/task.ts test tests/skills.test.ts
bun run src/cli/task.ts test tests/workflows-integration.test.ts
```

3. Run static and full checks:

```bash
bun run src/cli/task.ts typecheck
bun run src/cli/task.ts test
```

## Migration Verification

1. Create fixture skills in `.agents/skills` at multiple scopes.
2. Confirm only canonical sources are loaded and ordering is deterministic.
3. Confirm generated manifests match runtime resolved output.

## Done Criteria

- Canonical `.agents/skills` discovery is implemented.
- Parallel skill composition paths are removed or subsumed.
- Deterministic collision diagnostics are emitted.
- Test suite and typecheck pass with updated expectations.
- Documentation reflects new canonical behavior.