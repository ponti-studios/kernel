# Implementation Plan: Simplify Agentic Framework with Scoped Skills

**Branch**: `001-simplify-agent-framework` | **Date**: 2026-02-27 | **Spec**: `/specs/001-simplify-agent-framework/spec.md`
**Input**: Feature specification from `/specs/001-simplify-agent-framework/spec.md`

## Summary

✅ **STATUS: COMPLETE**  
**Completion**: 2026-02-27 (all implementation & verification tasks finished)

Converge skill discovery and composition onto one canonical scoped model centered on `.agents/skills`, remove parallel loader/composition paths, and align runtime behavior with generated artifacts so maintainers have a single deterministic mental model.

**Verification Results**:
- ✅ All tasks in `tasks.md` are marked complete
- ✅ TypeScript compilation succeeded with no errors during implementation
- ✅ Full test suite executed with no regressions during feature work
- ✅ Export, manifest, and fixture-based parity tests all pass

**Estimated Timeline**: ~8 hours total (phases executed sequentially, exact tracking omitted)


## Technical Context

**Language/Version**: TypeScript 5.7.x on Bun runtime (`type: module`)  
**Primary Dependencies**: `@opencode-ai/plugin`, `@opencode-ai/sdk`, `zod`, `citty`, `commander`, `js-yaml`  
**Storage**: File-system-based configuration and skill metadata (`SKILL.md`)  
**Testing**: Bun test harness (`bun run src/cli/task.ts test`) with unit/integration tests under `src/**/*.test.ts` and `tests/**/*.test.ts`  
**Target Platform**: Cross-platform CLI/plugin runtime (macOS, Linux, Windows package targets)
**Project Type**: CLI + plugin framework  
**Performance Goals**: Skill discovery and merge adds no more than 10% cold-start overhead versus current baseline  
**Constraints**: Strict typing (no `any`/`unknown`), deterministic precedence, no silent fallback behavior  
**Scale/Scope**: Refactor touches skill loading, runtime composition, manifests/exports, and associated tests/docs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Source reviewed: `.specify/memory/constitution.md`.

- **Gate C1: Constitutional enforceability** — **CONDITIONAL PASS**. Constitution file is a template with placeholders and no ratified enforceable principles. Temporary governing constraints are taken from repository engineering instructions (`.github/instructions/typescript.instructions.md`, `.github/instructions/tests.instructions.md`).
- **Gate C2: Test-first requirement** — **PASS**. Plan requires RED → GREEN → REFACTOR for non-trivial changes and targeted regression tests for discovery precedence/collision behavior.
- **Gate C3: Simplicity and determinism** — **PASS**. Primary objective is reduction of duplicate loaders/composers and deterministic discovery semantics.
- **Gate C4: Undefined requirements** — **PASS**. No unresolved `NEEDS CLARIFICATION` items remain after Phase 0 research.

Post-design re-check: **PASS** (no new constitutional violations introduced by Phase 1 artifacts).

## Project Structure

### Documentation (this feature)

```text
specs/001-simplify-agent-framework/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── skill-discovery-contract.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── index.ts
├── execution/
│   └── features/
│       ├── opencode-skill-loader/
│       │   ├── loader.ts
│       │   ├── async-loader.ts
│       │   ├── merger.ts
│       │   ├── skill-content.ts
│       │   └── types.ts
│       ├── skills/
│       │   ├── skills.ts
│       │   └── skills-manifest.ts
│       └── agents-manifest.ts
├── platform/
│   └── opencode/
│       └── config-composer.ts
├── cli/
│   └── export.ts
└── script/
    ├── build-skills-manifest.ts
    └── copy-skills.ts

tests/
├── skills.test.ts
└── workflows-integration.test.ts
```

**Structure Decision**: Single TypeScript project with focused modifications in existing loader/composer/manifests/docs paths; no new top-level modules introduced.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Broad refactor scope | Skills, hooks, and runtime/export semantics are currently coupled across multiple layers | Skills-only edits would leave duplicate composition paths and preserve drift risk |
