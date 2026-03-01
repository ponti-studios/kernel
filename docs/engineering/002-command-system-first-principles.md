# Command System V2: First-Principles Architecture

Date: 2026-03-01  
Status: Proposal

## Problem Statement

The current command subsystem conflates multiple concerns under a single lexical namespace (`commands/*`):

- runtime registry (`commands/commands/*.ts`)
- authoring templates (`commands/templates/*.ts`)
- prompt fragments (`commands/prompts/*.ts`)
- generated artifact (`commands-manifest.ts`)
- agent profile metadata (`profiles.ts`)

This creates semantic ambiguity and weakens maintainability. The same term (`command`) currently means at least four different entities (source definition, rendered template, generated registry, invocation token). The architecture exhibits duplicated source-of-truth and hidden coupling.

## Deterministic Findings (Current State)

1. Manifest generation compiles from `src/execution/commands/commands/*.ts`.
2. Several runtime commands import templates from `src/execution/commands/templates/**`.
3. Export pipeline also reads `src/execution/commands/templates/**` directly for docs export.
4. `profiles.ts` overlays `AGENT_PROMPTS` and injects profile usage strings into command templates.
5. Effective behavior is a mixed graph of direct literals + imported templates + generated manifest.

This is not merely naming debt; it is architectural role confusion.

## First-Principles Model

From first principles, the subsystem must separate **intent**, **execution**, and **documentation**.

### Core domain entities

1. **Intent Spec** (declarative)
   - What the command means.
   - Stable identifier, arguments schema, constraints, acceptance contract.
2. **Execution Plan** (runtime)
   - How runtime builds the prompt and routes work.
   - Includes profile routing, tool policy, model hints.
3. **Prompt Asset** (textual)
   - Reusable narrative body used by execution plan.
   - Pure content, no registry logic.
4. **Published Catalog** (generated)
   - Read-only compiled artifact consumed by runtime + export surfaces.

These entities must be represented in distinct directories and types.

## Proposed Target Topology

```text
src/execution/
  intents/
    specs/
      code.review.intent.ts
      workflows.plan.intent.ts
    schema.ts
    index.ts

  runtime/
    plans/
      code.review.plan.ts
      workflows.plan.plan.ts
    registry.ts
    loader.ts

  prompts/
    assets/
      code.review.prompt.md
      workflows.plan.prompt.md
    renderer.ts

  profiles/
    specs/
      reviewer_security.profile.ts
      researcher_codebase.profile.ts
    resolver.ts

  generated/
    command-catalog.ts
```

### Naming invariants

- `intent` = declarative contract (never runtime side effects)
- `plan` = executable wiring for runtime dispatch
- `asset` = plain prompt content
- `catalog` = generated, read-only projection

Forbidden naming patterns:

- `commands/commands`
- `commands/templates`
- overloaded `prompts` under command namespace

## Type Contracts (Proposed)

```ts
export interface IntentSpec {
  id: string;
  description: string;
  args: ArgumentContract;
  acceptance: ReadonlyArray<string>;
}

export interface RuntimePlan {
  intentId: string;
  profileBindings: ReadonlyArray<string>;
  promptAssetId: string;
  route: "do" | "research";
  toolPolicy: ReadonlyArray<string>;
}

export interface PromptAsset {
  id: string;
  body: string;
}
```

No field should be duplicated across these layers unless generated.

## Profile System Reframe

Current `profiles.ts` behaves as a hybrid of:

- profile descriptor registry
- prompt overlay mechanism
- command usage doc generator

V2 separation:

- `profiles/specs/*` stores profile metadata + route + tools
- `profiles/resolver.ts` resolves `[profile: x]` to the profile prompt at runtime
- command help text is generated from profile metadata in one pass (not hand-embedded in templates)

## Build Pipeline (Single Source of Truth)

1. Validate all `IntentSpec` files
2. Validate matching `RuntimePlan` exists for each intent
3. Validate referenced `PromptAsset` and profiles exist
4. Generate `generated/command-catalog.ts`
5. Runtime and export both consume the same catalog

This removes dual ingestion paths and eliminates current drift risk.

## Migration Plan (Low-Risk, Phased)

### Phase A — Introduce V2 model in parallel

- Add new directories (`intents`, `runtime`, `prompts/assets`, `profiles/specs`, `generated`).
- Keep existing command system untouched.
- Add adapters that map V2 catalog -> current `CommandDefinition` shape.

### Phase B — Port 5 high-traffic commands

- Port: `workflows:plan`, `workflows:work`, `workflows:review`, `code:review`, `code:refactor`.
- Ensure parity tests compare old and new rendered output semantics.

### Phase C — Cut over runtime loader

- Runtime loader consumes only `generated/command-catalog.ts`.
- Legacy `commands/*` remains read-only fallback until parity complete.

### Phase D — Remove legacy topology

- Delete `src/execution/commands/commands/*` and `src/execution/commands/templates/*`.
- Keep compatibility shim for one release cycle.

## Verification Strategy

Deterministic checks required:

1. `typecheck` passes with strict contracts.
2. Catalog generation fails on any missing link (intent/plan/asset/profile).
3. Snapshot tests verify prompt rendering parity for migrated commands.
4. Runtime smoke test validates command loading and invocation route integrity.

## Quantified Confidence

- Confidence this resolves naming confusion: **0.93**
- Confidence migration can be incremental without runtime breakage: **0.84**
- Primary uncertainty: hidden dependencies in export tooling and docs scripts (**0.16 risk mass**)

## Decision Request

Approve this architecture and execute Phase A + B in next PR.  
If approved, implementation should start with V2 scaffolding and migration of `workflows:plan` as the proving path.
