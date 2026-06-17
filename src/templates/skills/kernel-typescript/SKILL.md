---
name: kernel-typescript
description: Enforces strict TypeScript behavior, type ownership, and derived-type patterns across the codebase. Use when adding or reviewing types, schemas, generics, async boundaries, tsconfig settings, or shared package types where full type safety must be preserved.
license: MIT
compatibility: TypeScript 5+ / TypeScript 7 (tsgo).
metadata:
  author: project
  version: "1.0"
  category: Engineering
  tags:
    - typescript
    - types
    - type-safety
    - schemas
    - zod
    - monorepo
    - tsconfig
    - boundaries
when:
  - user is adding or reviewing TypeScript types, interfaces, or generics
  - user is defining a schema and needs types to stay aligned with it
  - user is deciding where a shared type should live in the package graph
  - user is configuring tsconfig.json or resolving shared type boundaries
  - user asks why a type is wider, duplicated, or less safe than expected
  - user is introducing assertions, ignores, or escape hatches to bypass a type error
applicability:
  - Use when enforcing strict type safety in application or shared code
  - Use when reviewing for duplicated type definitions or `any` leakage
  - Use when deriving types from schemas, generated output, or existing source types
  - Use when a type needs clear ownership in a monorepo or package graph
termination:
  - Types have a clear single source of truth
  - No unsafe widening or duplicated parallel type definitions remain
  - Boundary types are derived from authoritative schemas or source types
  - Strictness settings and package boundaries remain intact
outputs:
  - Tightened type ownership and derivation plan
  - Corrected shared or exported types
  - Schema-derived or source-derived type definitions
  - Type-safety findings and required fixes
---

Enforce full TypeScript strictness and keep types derived, owned, and non-duplicated. This skill exists to stop the LLM from weakening the type system or creating parallel truth.

## Non-Negotiables

- Do not use `any` in exported, shared, or boundary-facing types.
- Do not silence type errors with `@ts-ignore`, unsafe assertions, or widening casts unless the user explicitly approves a temporary exception.
- Do not create parallel type definitions when a type can be derived from a schema, generated artifact, or existing source type.
- Do not hand-edit generated type files.
- Do not weaken strict compiler settings to make code compile.

Required strictness:

- `strict`
- `exactOptionalPropertyTypes`
- `noUncheckedIndexedAccess`

## Ownership Rules

Every important type must have one authoritative source.

Prefer deriving types from:

- Zod schemas
- generated database or API artifacts
- existing exported source types
- function return types or object literals when that preserves a single source of truth

Do not maintain:

- one runtime schema and a second handwritten TypeScript type for the same shape
- one server type and a second manually synchronized client copy when a shared or derived contract exists
- one generated type and a second "cleaned up" alias that silently drifts

A type belongs in the lowest-level package that truly owns it. Do not hoist a type to a shared package until more than one consumer genuinely needs it.

## Enforcement Focus

Use this skill to enforce:

- full strictness instead of convenience escapes
- derivation instead of duplication
- narrow exported contracts instead of widened internal shapes
- package-boundary correctness instead of direct `src/` imports
- explicit boundary typing for async results, schemas, and shared contracts

When a type error appears, fix the mismatch at the source of truth instead of layering casts on top of it.

## Structural Decisions

See `references/architecture.md` for:

- type ownership in a monorepo package graph
- tsconfig project references
- package exports boundaries
- circular dependency avoidance for shared types and generated output

## Guardrails

- Never use `any` where `unknown` plus narrowing would preserve safety.
- Never duplicate a type shape just because it is inconvenient to derive.
- Never import from another package's `src/` directly; use published exports.
- Never widen a boundary contract to avoid fixing upstream typing.
- Never let schema, generated types, and exported contracts drift apart.
