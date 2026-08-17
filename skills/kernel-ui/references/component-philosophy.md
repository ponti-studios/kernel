# Component Philosophy

Use this as the current baseline. It captures evidence from the shared UI library and the tabs refactor; update it when the user explicitly corrects or expands it.

## Design posture

- Build calm, low-chrome interfaces with a clear hierarchy.
- Favor subtle layered feedback over decorative visual weight.
- Preserve geometry between states. A selected, focused, or invalid state should not cause an avoidable layout shift.
- Use rounded, compact controls where the component's role supports it; do not force a pill treatment onto every control.
- Use motion to clarify state changes, never as ornament.

## System posture

- Use semantic design tokens instead of literal colors, ad hoc shadows, or isolated scale values.
- Keep component state visually explicit: base, disabled, keyboard focus, and active/selected states each need deliberate treatment.
- Prefer semantic state selectors supplied by the underlying primitive (for example, `data-active`, `data-state`, and ARIA attributes) over application-managed styling state.
- Treat keyboard focus and disabled states as non-negotiable component behavior.

## Code posture

- Prefer small wrapper components around accessible primitives, preserving the primitive's prop type and escape hatches.
- Use the repository class-composition helper and let caller-supplied `className` override defaults.
- Organize class strings by intent. A multi-line `cn()` call is a readable state map, not merely a way to satisfy line length:

  ```tsx
  cn(
    "stable base presentation and layout",
    "disabled behavior",
    "focus-visible behavior",
    "data-active or other semantic component state",
    className,
  )
  ```

  Keep caller overrides last. Keep every group independently legible and behaviorally cohesive. Within a group, order utilities so a reader can understand the component from its visual foundation through its interactive states; do not optimize solely for an automated class sorter.
- Make focused, local changes. Do not add a variant API, abstraction, or dependency for a single visual refinement.
- Make state styling explicit when that improves scanability, even if a base declaration partly overlaps it.

## Evidence threshold

The baseline is guidance, not a substitute for the local system. Confirm a claimed convention by checking tokens and comparable components. Classify a mismatch as a blocker only for user-visible correctness, accessibility, or an established system contract; otherwise use `should fix` or `consider`.
