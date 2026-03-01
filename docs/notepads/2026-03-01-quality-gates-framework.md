# Quality Gates Framework

**Date**: 2026-03-01  
**Task**: Phase 0.2 - Define Rollout Quality Gates  
**Status**: Draft  

## Overview

Release gates enforce architecture invariants and prevent regressions. All gates must pass before promotion to the next phase.

---

## Gate 1: Schema Validation Gate

**Description**: All canonical specs validate successfully against strict type contracts.

**Trigger**: On every build (CI/pre-commit)

**Checks**:
- [ ] All CommandIntentSpec files parse and validate (0 errors)
- [ ] All AgentProfileSpec files parse and validate (0 errors)
- [ ] All PromptAsset files parse and validate (0 errors)
- [ ] All schema cross-references resolve (no missing IDs)
- [ ] No duplicate IDs exist in any catalog

**Exit Criteria**:
- Zod schema validation succeeds
- No duplicate ID collisions
- All required fields present

**Failure Behavior**: Build fails with diagnostic output listing exact schema violations

**Threshold**: 100% pass (no tolerance for failures)

---

## Gate 2: Generation Determinism Gate

**Description**: Generated catalogs are stable, reproducible, and diff-clean across identical inputs.

**Trigger**: On every catalog generation (build step)

**Checks**:
- [ ] Generated command catalog has stable sort order
- [ ] Generated agent catalog has stable sort order
- [ ] Generation digest matches prior run for identical source
- [ ] No transitive timestamp or random elements in output
- [ ] File diffs are minimal (only intended changes visible)

**Exit Criteria**:
- Catalog generation is 100% deterministic
- Snapshot hash verification passes
- Generated diff shows only logical changes

**Failure Behavior**: Generation fails; indicates source change or nondeterminism bug

**Threshold**: 100% deterministic (no exceptions)

---

## Gate 3: Adapter Conformance Gate

**Description**: All supported harness adapters achieve semantic parity for critical command/profile operations.

**Trigger**: After adapter implementation (Phase 3+)

**Checks**:
- [ ] Command conformance: P1 command set ≥ 95% pass rate across all adapters
- [ ] Agent conformance: @ routing ≥ 95% pass rate across all adapters
- [ ] Policy conformance: Tool policy translation ≥ 95% pass rate across all adapters
- [ ] Fallback behavior: Unsupported capabilities emit explicit diagnostic metadata
- [ ] No Sev-1 regressions in adapter behavior across harnesses

**Exit Criteria**:
- SC-001: ≥ 95% parity for P1 command set
- SC-005: Conformance suite green across all adapters
- No unhandled exceptions or silent failures

**Failure Behavior**: CI blocks deploy; detailed parity report generated for triage

**Threshold**: ≥ 95% pass rate for command/agent, 100% for fallback diagnostics

---

## Gate 4: Runtime / Export Parity Gate

**Description**: Runtime and export consumption paths produce semantically equivalent outputs.

**Trigger**: Before Phase 2 completion (Task 2.4)

**Checks**:
- [ ] Runtime loads commands only from generated catalog
- [ ] Export loads commands only from generated catalog
- [ ] Prompt composition semantics (profile + asset) identical between paths
- [ ] No direct template filesystem reads in runtime path
- [ ] Manifest snapshot matches export snapshot

**Exit Criteria**:
- SC-004: 100% of runtime commands loaded via generated catalog path
- Export pipeline produces identical output to runtime expectations
- No legacy template import pathways invoked

**Failure Behavior**: CI fails with list of runtime/export divergence points

**Threshold**: 100% (single path, zero tolerance for dual loading)

---

## Gate 5: Build Smoke Test Gate

**Description**: No Sev-1 regressions in build or runtime behavior after architecture changes.

**Trigger**: After each major phase completion; before release

**Checks**:
- [ ] `bun run typecheck` passes (0 errors)
- [ ] `bun run test` passes (0 failures in regression suite)
- [ ] Runtime command loading succeeds (all commands resolves)
- [ ] Profile resolution succeeds (all profiles resolve)
- [ ] No console errors or warnings in compliance check
- [ ] CLI help text regenerates without corruption

**Exit Criteria**:
- Full test suite passes
- No type errors
- Runtime boots without warnings

**Failure Behavior**: CI blocks release; detailed error report required

**Threshold**: 100% pass (Sev-1 blocking)

---

## Gate 6: Documentation Consistency Gate

**Description**: Architecture documentation reflects implementation reality.

**Trigger**: Before Phase 6 completion (stabilization)

**Checks**:
- [ ] AGENTS.md profiles match AgentProfileSpec definitions
- [ ] Commands markdown list matches generated command catalog
- [ ] Maintainer guide examples run without errors
- [ ] Architecture diagrams match actual directory topology

**Exit Criteria**:
- All docs match code reality
- Maintainer guide validated with synthetic examples
- Topology diagrams accurate

**Failure Behavior**: CI warns (non-blocking) but flag for manual review

**Threshold**: 95% consistency (minor discrepancies flagged for next cycle)

---

## Gate Implementation Roadmap

| Gate | Phase | When to Implement | Effort |
|---|---|---|---|
| Gate 1 (Schema) | 1 | Tasks 1.1-1.4 | ~4h |
| Gate 2 (Determinism) | 2 | Tasks 2.1-2.3 | ~6h |
| Gate 3 (Conformance) | 3-4 | Tasks 3.4, 4.1-4.3 | ~12h |
| Gate 4 (Parity) | 2-3 | Task 2.4 finish | ~4h |
| Gate 5 (Smoke) | All | After each phase | ~2h per gate |
| Gate 6 (Docs) | 6 | Task 6.3 | ~3h |

**Total Implementation Effort**: ~31h across all gates

---

## CI Configuration

### `.github/workflows/architecture-gates.yml` Template

```yaml
name: Architecture Quality Gates

on: [push, pull_request]

jobs:
  schema-validation:
    name: Schema Validation Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run src/script/validate-schemas.ts
      # Fail if any schema errors detected

  determinism:
    name: Generation Determinism Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run src/script/check-determinism.ts
      # Fail if generation is non-deterministic

  conformance:
    name: Adapter Conformance Gate
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && contains(github.ref, 'feat/agentic-framework-v2')
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test tests/adapter-conformance.test.ts
      # Fail if conformance < 95%

  smoke:
    name: Build Smoke Test Gate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run typecheck
      - run: bun run test
      # Fail if any test fails
```

---

## Release Checklist

Before promoting code to main or releasing:

- [ ] All 6 gates pass in CI
- [ ] No open architectural debt items
- [ ] Conformance report attached to release notes
- [ ] P1 command set validated across all adapters
- [ ] Maintainer guide reviewed and validated
- [ ] Rollback procedure documented

---

## Metrics & Observability

### Key Metrics to Track

1. **Schema Validation Success Rate** (target: 100%)
2. **Generation Determinism % Match** (target: 100%)
3. **Adapter Conformance %** by harness (target: ≥95%)
4. **Runtime/Export Parity %** (target: 100%)
5. **Build Success Rate** (target: 100%)
6. **Mean Time to Gate Recovery** (target: < 2h)

### Dashboard Example

```
Architecture Quality Gates Dashboard
────────────────────────────────────
Schema Validation:    ✅ 100%
Generation Determinism: ✅ 100%
Adapter Conformance:  ⚠️  93% (Claude: 95%, Codex: 92%, Copilot: 92%)
Runtime/Export Parity: ✅ 100%
Build Smoke Test:     ✅ 100%
────────────────────────────────────
Overall Status: ⚠️  CONDITIONAL PASS
Gate Blockers: 1 (Conformance threshold not met for Codex, Copilot)
Last Updated: 2026-03-01T14:32:00Z
```

---

## Success Criteria for Phase 0.2

- [ ] All 6 gate definitions documented with check procedures
- [ ] CI workflow template created and schema validated
- [ ] Gate thresholds are explicit and measurable
- [ ] Failure diagnostic procedures defined
- [ ] Metrics dashboard template provided
- [ ] Release checklist complete
