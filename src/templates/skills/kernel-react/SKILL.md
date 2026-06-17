---
name: kernel-react
description: Enforces React web component boundaries, state ownership, shared UI package purity, and approved async data patterns. Use when building or reviewing React web components, hooks, query or mutation flows, or shared UI code that must stay presentational and environment-agnostic.
license: MIT
compatibility: React web applications in this project structure. For React Native, use kernel-react-native.
metadata:
  author: project
  version: "1.0"
  category: Frontend
  tags:
    - react
    - components
    - hooks
    - state
    - monorepo
    - package-boundaries
    - tanstack-query
    - data-fetching
    - ui
when:
  - user is building or reviewing a React web component or custom hook
  - user is deciding where state or async data logic should live
  - user is wiring query, mutation, pagination, or optimistic update flows
  - user is adding code to a shared UI package that must stay presentational
  - a component is importing from auth, API, routing, or database layers and may be crossing a boundary
  - user is fixing React code that stores derived state, fetches data in the wrong place, or mixes concerns
applicability:
  - Use when enforcing React component and hook boundaries
  - Use when reviewing shared UI package purity and app/package separation
  - Use when enforcing approved server-state and typed API-client flow
  - Use when deciding the correct ownership of local, shared UI, and remote state
termination:
  - Component and hook responsibilities are clearly separated
  - State is owned at the correct level with no duplicated derived state
  - Shared UI code is presentational and environment-agnostic
  - Remote data flows through the approved query/mutation boundary
outputs:
  - Boundary-correct React component or hook structure
  - Shared UI purity findings and required fixes
  - Approved server-state flow for the feature
  - State ownership decision and rationale
---

Enforce the React structure this project expects. This skill exists to stop the LLM from mixing presentation, data fetching, routing, and domain logic into the wrong layer.

## Non-Negotiables

- Presentational components receive data via props; they do not fetch their own data.
- Shared UI packages stay presentational and environment-agnostic.
- Remote data flows through query or mutation hooks and the typed API client, not direct component fetches.
- Derived state is computed, not stored.
- Hooks and components each have a single responsibility.

Forbidden behavior:

- Do not import auth, API, routing, or database code into shared UI package components.
- Do not fetch remote data directly inside presentational components.
- Do not store server state in `useState`.
- Do not use `useEffect` to derive state that can be computed inline.
- Do not import from another package's private internals to make a component "just work."

## Boundary Rules

Use this layering model:

- app-level containers own data fetching, routing, and business orchestration
- shared UI components own rendering, interaction, and styling
- feature hooks own reusable domain or screen logic
- query and mutation hooks own remote data access

All remote data should follow this path:

`component -> query or mutation hook -> typed API client -> server boundary`

Apps never import the database layer directly.

## State Ownership

Choose the narrowest correct owner for each kind of state:

- local UI state: component-level state
- shared UI state: local shared store or context where justified
- remote server state: query library
- derived values: compute from source data

When state feels duplicated, prefer deleting the copy and deriving it from the authoritative source.

## Shared UI Package Rules

`packages/ui` (or the equivalent shared UI package) must remain reusable outside any one app context.

Checklist:

- no auth imports
- no API or RPC imports
- no routing hooks
- no direct environment variable access
- no direct remote data fetching
- no database imports

If a component needs any of those, it belongs in an app or feature package, not in shared UI.

## Async Data Rules

- Remote reads go through query hooks.
- Remote writes go through mutation hooks.
- Query keys must be structured and include all variables that affect the result.
- Mutation success must update or invalidate affected query state deliberately.
- Suspense, inline loading, and error handling should follow the repo's established pattern for that surface.

See `references/data-fetching.md` for concrete query, mutation, suspense, pagination, and optimistic update patterns.

## Guardrails

- Never mix fetching, routing, and presentation in a shared component.
- Never keep a component generic by hiding a forbidden dependency behind a convenience helper.
- Never use array index keys for reorderable or filterable lists.
- Never call hooks conditionally.
- Never let shared UI code depend on app-only providers or runtime context unless that dependency is passed in explicitly as a prop boundary.
