# TypeScript, React, React Native, Expo

## TypeScript
- **Schema first for anything read from outside the program** (disk files, JSON, native-module
  payloads, network bodies). Use Zod, not hand-written `typeof` chains or `is…` guards. *(word)*
  - One schema per shape, kept in one file (Thames: `src/core/schemas.ts`).
  - The plain type is the source of truth; end each schema with `satisfies z.ZodType<Type>` so drift
    fails the type check.
  - Use `z.looseObject` for saved files so fields from a newer build survive.
  - `safeParse` once at the boundary, then trust the typed value. Never parse the same data twice.
  - Not for matching an error message or a one-line comparison; a schema adds noise there.
- Strict mode. No `any`; `unknown` plus a schema at the edge. No non-null `!` outside tests. No
  `as` casts that hide a mismatch; fix the type.
- Derive types (`z.infer`, `typeof`, `keyof`) instead of retyping them. One owner per type.
- Discriminated unions with an exhaustive `switch` (a `never` check) instead of flag soup.
- `Record<Key, Value>` lookup tables replace if/else and ternary ladders.
- Async: `async`/`await`, errors handled where they can be acted on, no floating promises.
- No barrel files that only re-export unless the repo already uses them.

## React and React Native
- **No inline styles.** Every style lives in a StyleSheet or the repo's themed style hook
  (Thames: `useStyles(makeStyles)`). Keep `react-native/no-inline-styles` clean. A dynamic value
  becomes a named variable first. *(word)*
- Components are small and pure; state lives with its owner; derive instead of syncing state.
  Effects only for real side effects.
- A screen draws from local data first and refreshes from the network quietly. Loading, empty,
  error and offline states exist for every screen.
- Reuse the repo's components and tokens (colour, spacing, type, radius, motion). No one-off values
  scattered through screens.
- Lists are virtualised; keys are stable ids.
- Accessibility: every control has a label (icons keep a word for VoiceOver), touch targets are big
  enough, Reduce Motion has a calm path, Dynamic Type does not break layout.
- Motion on the UI thread (Reanimated worklets), driven by gestures, spring with weight; haptics
  only at real boundaries.
- Platform scope is stated by the repo: when an app is Apple-only (Omiro, Thames), add no Android
  or web fallbacks.
- Keep native and JS responsibilities clean: native owns audio, storage, sync and decisions that must
  be right; React Native draws the state it is sent.

## Tooling defaults (when the repo has not chosen)
- oxlint for lint, oxfmt for format. No ESLint or Prettier next to them. Run the type check, lint
  and tests before finishing.
- pnpm monorepos use `pnpm check` style gates; use the repo's, scope with `--filter=...` to include
  dependents, never to skip checks.
