# Design-System Interop Protocol

Use this protocol to map design systems by role rather than by matching names.

## Directions

- **From external to shared:** map external values to shared semantic tokens and
  adopt the external look through aliases or a documented theme.
- **From shared to external:** map shared tokens to the external system and
  theme its primitives without changing semantic meaning.
- **Migration:** audit current usage, map roles, add a temporary bridge layer,
  migrate screen by screen, then remove the bridge after verification.

## Crosswalk Method

For every role, map these six axes:

1. Color roles: surface, text, action, feedback, focus, disabled.
2. Type scale: family, size, weight, line height, and tracking.
3. Spacing unit and density.
4. Radius tiers.
5. Elevation or border separation.
6. Motion properties, duration, and reduced-motion behavior.

Map by intent. Never map a destructive role to a primary action because the
names happen to match.

## Bridge Rules

- Keep aliases in one direction.
- Do not duplicate token values in consuming components.
- Keep semantic roles stable during migration.
- Record unmapped roles and intentional differences.
- Remove bridge aliases only after all scoped screens and states are verified.

## Verification

Verify light and dark modes, all relevant component states, contrast, focus,
keyboard behavior, reduced motion, and responsive continuity. Report the exact
screens and token pairs checked.
