# Component Philosophy Audit

Audit the requested component against repository evidence and this component
standard before reviewing.

## Standard

Use this as the current baseline. Confirm claimed conventions against the local
system before treating a mismatch as a defect.

### Design posture

- Build calm, low-chrome interfaces with a clear hierarchy.
- Favor subtle layered feedback over decorative visual weight.
- Preserve geometry between states. A selected, focused, or invalid state
   should not cause an avoidable layout shift.
- Use rounded, compact controls where the component's role supports it; do not
   force a pill treatment onto every control.
- Use motion to clarify state changes, never as ornament.

### System posture

- Use semantic design tokens instead of literal colors, ad hoc shadows, or
   isolated scale values.
- Keep component state visually explicit: base, disabled, keyboard focus, and
   active/selected states each need deliberate treatment.
- Prefer semantic state selectors supplied by the underlying primitive, such as
   `data-active`, `data-state`, and ARIA attributes, over application-managed
   styling state.
- Treat keyboard focus and disabled states as non-negotiable behavior.

### Code posture

- Prefer small wrapper components around accessible primitives, preserving the
   primitive's prop type and escape hatches.
- Use the repository class-composition helper and let caller-supplied
   `className` override defaults.
- Organize class strings by intent. A multi-line `cn()` call is a readable
   state map:

   ```tsx
   cn(
      "stable base presentation and layout",
      "disabled behavior",
      "focus-visible behavior",
      "data-active or other semantic component state",
      className,
   )
   ```

   Keep caller overrides last. Keep every group independently legible and
   behaviorally cohesive. Within a group, order utilities from visual
   foundation through interactive states; do not optimize solely for an
   automated class sorter.
- Make focused, local changes. Do not add a variant API, abstraction, or
   dependency for a single visual refinement.
- Make state styling explicit when that improves scanability, even if a base
   declaration partly overlaps it.

### Evidence threshold

- Treat existing components as evidence, not automatic precedent. Prefer
  current, repeated, token-aligned patterns over isolated or legacy examples.
- Classify a mismatch as `Must fix` only for user-visible correctness,
  accessibility, or an established system contract.
- Classify a philosophy-based mismatch without sufficient defect evidence as
  `Should fix` or `Consider`.

## Establish the standard

1. Read the target component, its diff when one exists, its tests or stories, and its immediate public API.
2. Locate the project's tokens, primitive patterns, and two or three comparable components. Use `rg` first.
3. Compare the implementation with the standard and with current, repeated,
   token-aligned local patterns. Treat legacy examples as weaker evidence.
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
