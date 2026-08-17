# Component Philosophy Audit

Audit the requested component against both repository evidence and the user's stated design philosophy before reviewing.

## Establish the standard

1. Read the target component, its diff when one exists, its tests or stories, and its immediate public API.
2. Locate the project's tokens, primitive patterns, and two or three comparable components. Use `rg` first.
3. Treat existing components as evidence, not automatic precedent: prefer current, repeated, token-aligned patterns over isolated or legacy examples.
4. Separate findings into:
   - **Must fix**: broken behavior, accessibility regression, violated token/system contract, or observable visual instability.
   - **Should fix**: a clear divergence from established component conventions that harms maintainability or consistency.
   - **Consider**: a philosophy-based improvement without enough evidence to call it a defect.

## Evaluate

Assess only dimensions relevant to the component:

- **Purpose and API**: Keep primitives small, composable, typed from their underlying primitive when applicable, and predictable to override with `className`.
- **Visual stability**: State changes must not unexpectedly alter geometry. Prefer paint-only affordances when they convey the same information.
- **State clarity**: Make base, disabled, focus-visible, validation, interactive, and selected/open/active states intentional. Use the component library's native data/ARIA selectors.
- **Accessibility**: Preserve semantic primitives, keyboard behavior, visible focus, disabled behavior, target size, and contrast. Do not treat an aesthetic preference as a reason to weaken an accessible state.
- **Token discipline**: Prefer system tokens and semantic utilities. Flag raw visual values only when a project token or semantic alternative exists.
- **Class-string architecture**: Treat each `cn()` argument as a named layer of the component's visual state machine: stable base presentation, disabled behavior, keyboard focus, semantic component states, then caller overrides. Keep related utilities together in their layer; do not collapse all behavior into one opaque string or split individual utilities into arbitrary fragments. Preserve an intentional reading order over mechanical sorting.
- **Motion and performance**: Keep motion restrained and meaningful. Prefer narrow transition properties for new behavior when practical; do not introduce animation merely to make a component feel more polished.
- **Scope**: Preserve the component's contract and avoid unrelated changes.

## Report

Lead with a clear recommendation: **approve**, **approve with changes**, or **needs rework**. Cite the file and line for each actionable finding. Explain the concrete effect, then the smallest appropriate correction.

Include a short `Philosophy read` only when it helps: state what the implementation reveals or reinforces about the user's preferences, and label it as an inference. Do not invent preferences from a single utility class or treat an inference as a project rule.

When asked to implement changes, make the smallest change that resolves confirmed findings. Preserve unrelated working-tree changes and run the narrowest relevant check.
