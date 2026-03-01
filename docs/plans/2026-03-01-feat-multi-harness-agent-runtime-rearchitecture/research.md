# Research: Multi-Harness Agent Runtime Rearchitecture

**Date**: 2026-03-01  
**Status**: Complete  
**Plan**: [../2026-03-01-feat-multi-harness-agent-runtime-rearchitecture.md](../2026-03-01-feat-multi-harness-agent-runtime-rearchitecture.md)

## Objective

Establish evidence-backed constraints and opportunities for rearchitecting Ghostwire to support Claude Code, OpenAI Codex CLI, and GitHub Copilot with canonical `/` command and `@` agent semantics.

## Research Questions

1. Which interaction primitives are common across target harnesses?
2. What host-specific differences must be adapter-isolated?
3. What current Ghostwire architecture patterns conflict with multi-harness parity?
4. What implementation strategy minimizes greenfield architecture risk?

## Findings

### Finding 1: Shared Interaction Grammar Exists at Semantic Level

**Observation**
- All three harnesses support command-style invocation and role/agent-directed workflows.
- Transport differs (slash command systems, participants, role routing), but semantics are convergent.

**Implication**
- Ghostwire should standardize on semantic primitives (`CommandIntent`, `AgentTarget`) and translate at adapter boundaries.

**Confidence**: 0.93

---

### Finding 2: Adapter Boundary Is Mandatory for Reliability

**Observation**
- Tool permissions, model selection controls, and invocation routing differ materially between hosts.
- Attempting to encode host behavior inside command assets creates drift.

**Implication**
- Host-specific logic must be isolated in `adapters/<host>/` modules.
- Core artifacts must remain host-agnostic and declarative.

**Confidence**: 0.90

---

### Finding 3: Current Ghostwire Has Source-of-Truth Duplication

**Evidence**
- [src/execution/commands/commands.ts](../../../src/execution/commands/commands.ts) builds runtime definitions from generated manifest.
- [src/script/build-commands-manifest.ts](../../../src/script/build-commands-manifest.ts) generates command catalog from `commands/commands/*.ts`.
- [src/cli/export.ts](../../../src/cli/export.ts) independently reads templates from `commands/templates/*` for export.
- [src/execution/commands/profiles.ts](../../../src/execution/commands/profiles.ts) overlays prompt data and usage text in runtime module.

**Implication**
- Runtime and export paths should consume the same generated catalogs.
- Prompt/profile composition should be compile-time deterministic, not runtime mutation.

**Confidence**: 0.95

---

### Finding 4: Naming Collisions Are Architectural, Not Cosmetic

**Observation**
- `commands/commands`, `commands/templates`, and profile mutation in command layer create role ambiguity.

**Implication**
- Replatform around explicit domain folders:
  - intents
  - profiles
  - prompt-assets
  - composition
  - adapters
  - generated

**Confidence**: 0.97

---

### Finding 5: Greenfield Build Requires Strong Conformance Gates

**Observation**
- A fresh architecture can move faster, but only if adapter conformance and schema gates are enforced from the start.

**Implication**
- Use phased greenfield delivery with strict conformance gates and no legacy loading path.

**Confidence**: 0.89

## Capability Matrix (Semantic)

| Capability | Claude | Codex | Copilot | Canonical Contract Strategy |
|------------|--------|-------|---------|-----------------------------|
| `/` command invocation | Yes | Yes | Yes | `CommandIntentSpec` + adapter command binding |
| `@` agent/participant targeting | Yes | Yes | Yes* | `AgentProfileSpec` + adapter target mapping |
| Tool policy controls | Yes | Yes | Yes* | `ToolPolicySpec` translated per adapter |
| Model selection controls | Yes | Yes | Yes | `ModelPolicySpec` translated per adapter |
| Generated artifact ecosystem | Yes | Yes | Yes | `generated/*-catalog.ts` as single source |

\*Host surfaces vary; adapter mapping required.

## Constraints

1. Generated catalogs must be deterministic and diff-stable.
2. Instruction precedence must be explicit and testable.
3. Adapter capability matrices must be versioned and testable.

## Risks

| Risk ID | Description | Likelihood | Impact | Mitigation |
|---------|-------------|------------|--------|------------|
| R-001 | Adapter behavior drift across harness updates | Medium | High | Conformance suite + capability matrix versioning |
| R-002 | Adapter semantic drift between harnesses | Medium | High | Conformance suite + strict adapter contracts |
| R-003 | Export/runtime divergence persists | Medium | Medium | Enforce catalog-only consumption in CI |
| R-004 | Team confusion during transition | Medium | Medium | Migration docs + strict naming conventions |

## Recommended Decisions

1. Make generated catalogs authoritative for both runtime and export.
2. Compile profile+prompt composition before runtime execution.
3. Introduce explicit adapter contracts and forbid host logic in core intent/profile assets.
4. Gate release on measurable parity thresholds.

## Open Unknowns

1. Copilot participant transport details may vary by IDE surface.
2. Codex and Claude approval semantics may require non-trivial policy translation.
3. Export file-format requirements may impose additional adapter-level projection rules.

## Verification Readiness

- Research evidence is sufficient to proceed with `spec.md` and execution `tasks.md`.
- Remaining unknowns are implementation-phase adapter details, not architecture blockers.
