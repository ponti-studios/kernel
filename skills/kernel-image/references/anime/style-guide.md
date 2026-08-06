# Traditional Anime Character Style Contract

This is the mandatory, unconditional default for every human figure
kernel-image generates — not something the user has to ask for. It applies
regardless of which top-level image type or mode (3D, Fine Art, Vaggio,
Product) is otherwise active, and regardless of whether the figure was
explicitly described in the prompt — an incidental or background human the
model adds on its own (e.g. a driver in a car scene that wasn't otherwise
specified) still renders anime, not photoreal or painterly, per whichever
mode's material governs the rest of the scene. Anime and Pixar/3D-CGI both
use large eyes, but they are opposite rendering languages — this contract
exists because that similarity causes drift toward Pixar if left unstated.

It is also the **only** rendering style for the named cast in
`references/characters/` — human (Lucy) and non-human (Wyatt, Benny, Void)
alike. A named character's style is not a variable the user can pick a
type for; only their environment, body position, and outfit change between
requests. See "Non-Human Named Characters" below for how this contract
applies to Wyatt, Benny, and Void's non-human head shapes.

## Core Goal

Render the human figure in traditional 2D Japanese anime style — flat
cel-shaded coloring, bold clean linework, hand-drawn character design — never
soft 3D CGI shading, regardless of what the surrounding scene or background
medium is (photoreal, oil painting, etc.).

## Core Directives

### Shading: Flat Cel, Not Soft 3D

- Base color + one or two hard-edged shadow tones per color area. No smooth
  gradients, no soft ambient occlusion, no subsurface scattering.
- Shadow edges are crisp and graphic, not airbrushed or feathered.
- Skin reads as flat cel-shaded color, not glossy or plastic.

### Linework

- Bold, clean, consistent-weight linework outlining the figure and major
  interior forms (eyelids, hair clumps, clothing folds).
- Line weight can vary slightly for depth (heavier outer silhouette, lighter
  interior details) but stays graphic — never a soft painterly edge that
  dissolves the line into the shading.

### Eyes

- Large, detailed, and expressive, but anime-large, not Pixar-round: more
  almond or angular in shape depending on the character, with a detailed
  iris (light streaks, color gradient bands inside the iris itself is fine —
  that detail belongs in the eye, not the skin).
- Sharp, defined eyelashes and eyelid linework.
- Avoid perfectly circular, saucer-like, or googly eye shapes — that reads as
  Western 3D animation, not anime.

### Hair

- Rendered in distinct, graphic clumps and strands with sharp specular
  highlights (the characteristic anime hair shine: a hard-edged bright
  streak, not a soft glow).
- Avoid soft, fuzzy, individually-simulated 3D hair strands — anime hair is
  sculptural and graphic, built from shapes, not simulated physics.

### Nose And Mouth

- Minimal and simplified: a small line, dot, or subtle shadow for the nose;
  simple, graphic mouth shapes. Do not render photorealistic lips or a fully
  modeled 3D nose bridge.

### Proportions

- Standard anime proportions: face slightly elongated, jaw more defined and
  angular than a Pixar/toy-like rounded jaw. Not chibi unless explicitly
  requested.

## Hybrid Scenes (Anime Figure In A Painterly/Photoreal Environment)

When an anime-styled figure appears inside a painterly or photoreal scene
(e.g. a Vaggio oil-painting background), keep the figure's rendering flat
and cel-shaded even as the environment around it stays painterly. The
contrast between a graphic, flat-shaded anime figure and a richly painted
environment is intentional — do not blend the figure toward the
environment's medium to "unify" the look. That blending is exactly what
produces the Pixar-drift this contract exists to prevent.

## Non-Human Named Characters (Wyatt, Benny, Void)

Wyatt, Benny, and Void are not human figures — their identity (box head,
soft oval head, pure black circle head) comes from
`references/characters/<name>.md`. They still render in this same graphic
language, not ink/rubber-hose and not soft 3D-CGI:

- Flat cel-shaded coloring on their bodies and clothing (same Shading rules
  as above), not halftone dot-shading and not gradient-shaded 3D materials.
- Bold, clean, consistent-weight linework outlining their signature shapes
  (Wyatt's box, Benny's oval, Void's circle) — the same Linework rules as
  above, not wet ink brushstroke, not soft CGI bevels.
- Any secondary motion or elasticity described in their identity file (e.g.
  Benny's bounce) reads as a graphic, hand-drawn exaggeration — sharp
  squash-and-stretch silhouettes, not simulated soft-body physics.
- Their signature features (Wyatt's shipping dent and pie-cut eyes, Benny's
  chipped tooth, Void's total absence of features) stay exactly as specified
  in their identity file — this section governs rendering technique only,
  never silhouette or feature changes.

## Negative Constraints

Avoid:

- Pixar, DreamWorks, or any soft 3D-CGI shading or material look
- soft rounded "toy-like" proportions
- subsurface scattering or glossy/plastic skin
- circular, saucer-like, or googly eyes
- soft simulated 3D hair physics
- photorealistic nose/lip modeling
- painterly blending that dissolves the character's linework into the background
