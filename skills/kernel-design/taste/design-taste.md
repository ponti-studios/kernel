# Design Taste Contract

Use this contract to make deliberate UI choices without overriding usability,
accessibility, or the shared token system.

## Default Posture

- Use one clear visual direction per surface.
- Prefer hierarchy, spacing, and typography over decoration.
- Keep content more prominent than chrome.
- Use one dominant surface family, one primary action role, and at most one
  supporting accent role.
- Use the shared tokens and components from `@ponti-studios/ui`.
- Do not introduce a palette, font, radius, shadow, or motion value locally.

## Anti-Defaults

Flag these during review unless the brief requires them:

- Generic card grids used as the entire layout.
- Decorative gradients, blobs, or noise without semantic purpose.
- Excessive pills, badges, borders, or shadows.
- Large hero copy that delays the primary task.
- Arbitrary color changes between pages.
- Animation added only to make a screen feel polished.

## Variance Mandate

Make one deliberate choice that distinguishes the surface, then express it with
existing tokens and primitives. The choice may be layout sequence, density,
type hierarchy, image treatment, or a documented component composition. Do not
create a new visual system for a single page.
