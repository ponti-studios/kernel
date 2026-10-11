# Motion Choreography

Use motion to communicate state, hierarchy, and continuity. Motion is optional;
clarity and reduced-motion support are mandatory.

## Rules

- Prefer CSS transitions for simple state changes.
- Animate only `transform` and `opacity` for frequent interactions.
- Use motion tokens from `@ponti-studios/ui` when available.
- Keep interaction transitions within 100-300ms unless the interaction requires
  a documented longer duration.
- Do not block input during transitions.
- Do not animate layout properties in high-frequency interactions.
- Respect `prefers-reduced-motion` by removing or shortening non-essential
  motion while preserving state visibility.
- Use springs or an animation library only for gesture, interruption, layout, or
  exit behavior that CSS cannot express.

## Review

For each animation, record its purpose, trigger, properties, duration or token,
interruption behavior, reduced-motion behavior, and performance evidence.
