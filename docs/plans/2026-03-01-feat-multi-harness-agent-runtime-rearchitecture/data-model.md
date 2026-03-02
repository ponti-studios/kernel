# Data Model: Multi-Harness Agent Runtime Rearchitecture

## Entity: CommandIntentSpec

- **Description**: Canonical declaration of `/` command behavior independent of host runtime.
- **Fields**:
  - `id` (string, required): globally unique command identifier.
  - `description` (string, required): concise semantic contract summary.
  - `argsSchema` (object, required): strict argument schema used for validation.
  - `acceptanceChecks` (array<string>, required): deterministic behavior checks.
  - `defaultRoute` (string, required): canonical runtime route class.
  - `lifecycleHints` (object, optional): execution phase hints.
- **Validation rules**:
  - `id` must match `/^[a-z0-9][a-z0-9:-]*$/`.
  - `acceptanceChecks.length >= 1`.
  - `argsSchema` must be serializable and deterministic.

## Entity: AgentSpec

- **Description**: Canonical declaration of `@agent` routing and policy behavior.
- **Fields**:
  - `id` (string, required): globally unique agent identifier.
  - `role` (string, required): semantic role class (`planner`, `reviewer`, etc.).
  - `runtimeRoute` (string, required): canonical route destination.
  - `toolPolicy` (object, required): allowed/denied capability set.
  - `modelPolicyHint` (string, optional): host-agnostic inference hint.
  - `acceptanceChecks` (array<string>, required): deterministic route/policy checks.
- **Validation rules**:
  - Duplicate IDs are rejected at compile time.
  - `toolPolicy` must have explicit default behavior.
  - `runtimeRoute` must map to a known route class.

## Entity: PromptAsset

- **Description**: Immutable prompt payload referenced by composition, never mutated at runtime.
- **Fields**:
  - `id` (string, required)
  - `kind` (enum, required): `command | agent | shared`.
  - `body` (string, required): instruction text.
  - `version` (string, required): semantic version tag.
  - `origin` (string, required): source provenance.
- **Validation rules**:
  - `body` must be non-empty.
  - `version` must use semantic version format.
  - `id + version` pair must be unique.

## Entity: ExecutionPlan

- **Description**: Deterministic composition output binding intent + profile + prompt + policy.
- **Fields**:
  - `intentId` (string, required)
  - `profileBindings` (array<string>, required)
  - `promptAssetId` (string, required)
  - `resolvedPolicy` (object, required)
  - `adapterHints` (object, optional)
- **Validation rules**:
  - Every `intentId`, `profileBinding`, and `promptAssetId` must resolve to existing specs.
  - `resolvedPolicy` must preserve canonical precedence order.

## Entity: HarnessAdapterContract

- **Description**: Host translation boundary from canonical execution plans to transport-specific actions.
- **Methods**:
  - `bindCommand(plan, context)`
  - `resolveAgentTarget(target, context)`
  - `translatePolicy(policy, capabilities)`
  - `emitCapabilities()`
- **Validation rules**:
  - Translation must be deterministic for identical inputs.
  - Unsupported capabilities must emit explicit degradation metadata.

## Entity: GeneratedCatalog

- **Description**: Read-only compilation artifact consumed by runtime and exporter.
- **Fields**:
  - `commands` (array<CommandIntentSpec>)
  - `profiles` (array<AgentSpec>)
  - `executionPlans` (array<ExecutionPlan>)
  - `digest` (string): deterministic generation hash.
- **Validation rules**:
  - Sorted canonical ordering is required.
  - No duplicate IDs across command/profile collections.
  - `digest` must be reproducible for identical source inputs.

## Relationships

- `CommandIntentSpec` 1..* -> `ExecutionPlan`
- `AgentSpec` 1..* -> `ExecutionPlan`
- `PromptAsset` 1..* -> `ExecutionPlan`
- `HarnessAdapterContract` 1..* -> translated runtime events from `ExecutionPlan`
- `GeneratedCatalog` aggregates all canonical entities

## State Transitions

1. **Declared**: specs authored in canonical schema directories.
2. **Validated**: schema and cross-reference checks pass.
3. **Compiled**: execution plans generated.
4. **Cataloged**: read-only generated artifacts emitted.
5. **Translated**: adapters map canonical plans to host transport.
6. **Conformed**: normalized adapter outputs satisfy parity suite.
