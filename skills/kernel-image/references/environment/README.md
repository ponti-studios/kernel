# Environment — Materials & Lighting Layer

Files in this directory describe **how a scene renders** — either its
material/surface treatment for objects, or its lighting/mood — independent
of subject matter. There is no separate "3D render" type; a plain object or
creature render is just a combination of environment files, same as
anything else.

## Two Kinds Of Environment File

- **Material** — how non-character objects/creatures/surfaces are built and
  surfaced (e.g. `toy-3d-material.md`). Fine-art modes
  (`dramatic-spotlight.md`'s Classical Oil Painting Mode and Modern Oil
  Painting Mode sections) and product photography
  (`references/product/product-photography.md`) define their own material
  treatment internally (oil paint, photographic) and don't need a
  material environment file layered on top.
- **Lighting** — light source count/direction, contrast, shadow behavior,
  mood (e.g. `dramatic-spotlight.md`, or `lighting.md`'s Soft Diffused
  Studio and Poster Graphic sections). Always applies, regardless of which
  material is in play.

## Composable Axes

A prompt is built from up to three independent layers:

1. **Subject's rendering source** — either a fine-art mode
   (`dramatic-spotlight.md`'s Classical Oil Painting Mode / Modern Oil
   Painting Mode sections), product photography
   (`references/product/product-photography.md`), or, for a plain
   object/creature with no fine-art or product framing, a material
   environment file from this directory (default: `toy-3d-material.md` for
   "3D render," "Pixar-style," "premium CGI" requests).
2. **Character** (`references/characters/`) — fixed identity + fixed style
   (`references/anime/style-guide.md`) for any named cast member; not
   affected by material or lighting.
3. **Lighting environment** (this directory) — independent of the other two.

This is what makes "a toy-3D object under Modern Oil Painting's dramatic
lighting" a coherent, buildable request: `toy-3d-material.md` supplies the
material logic, `dramatic-spotlight.md` supplies the light.

## Default Vs. Explicit Blend

Every fine-art mode and `toy-3d-material.md` has a default lighting
environment baked into its own identity (e.g. Classical and Modern Oil
Painting are built around dramatic-spotlight lighting; `toy-3d-material.md`
and clean product shots default to `lighting.md`'s Soft Diffused Studio
section). Use the default unless the user explicitly asks to blend — e.g.
"3D render but dramatically lit," "toy version of the Modern Oil Painting
piece." When blending, the material source still governs surfaces; only the
lighting/mood comes from the requested environment file instead of the
default.

## Library

| Environment | Kind | Feel | Default for |
|---|---|---|---|
| `toy-3d-material.md` | Material | Toy-like premium 3D geometry/surfacing | Plain object/creature renders ("3D render," "Pixar-style") |
| `dramatic-spotlight.md` | Lighting (+ bundles the full Classical/Modern Oil Painting material contracts) | Single dramatic light source, near-black negative space | Classical Oil Painting, Modern Oil Painting |
| `lighting.md` — Soft Diffused Studio section | Lighting | Soft, diffused, multi-light, no drama | `toy-3d-material.md`, clean-studio Product shots |
| `lighting.md` — Poster Graphic section | Lighting | Crisp, evenly lit, high-contrast, shadow-minimal, built for iconic clarity | None (opt-in blend for a bold, poster-like read) |
