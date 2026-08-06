# Environment: Tenebrism

Single-source dramatic lighting derived from Old Master oil painting
(Caravaggio's tenebrism). This is the default environment for Baroque and
Vaggio fine-art modes, and can be loaded alongside any other material/mode
when the user asks to blend ("a dramatically-lit 3D render," "toy version
of the Vaggio piece").

## Core Directives

- Single directional light source per scene — never flat or evenly lit.
- Let everything outside the light's reach dissolve into near-total black —
  a velvety void, not a lit-but-underexposed shadow.
- Catch bright, defined highlights on skin, hands, and fabric/material
  folds; the falloff from lit to unlit should be sharp, not gradual.
- Visible dust or particulate floating in the light shaft is a nice touch
  where the scene calls for it (interiors, shafts of light).

## Negative Constraints

Avoid: flat/even lighting, multiple competing light sources, soft gradual
falloff, bright ambient fill that softens the blacks.

## Notes For Specific Framing

- **Classical/historical framing** (Baroque mode's default): an unseen
  high-angle source, like a cellar window — brutal and directional.
- **Modern framing** (Vaggio mode's default): a recognizable modern light
  source — a window, a car's ambient interior glow, a table lamp — warm in
  color.
- **Blended with another material** (e.g. `toy-3d-material.md`): keep the
  single-source falloff and near-black negative space, but let the light
  itself read as a clean studio spotlight rather than a literal window or
  lamp, so it stays consistent with that material's own logic.
