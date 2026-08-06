# Vaggio Style Contract

Use this reference when the user says "vaggio" or wants Old Master oil-painting
tenebrism applied to an ordinary, contemporary scene.

## Core Goal

Render a mundane, present-day moment — a rideshare, a coffee-shop morning, a
candid portrait, a still life, getting dressed — with the gravity and
technique of a 17th-century Old Master painting. The tension is the point:
Caravaggisti light and brushwork colliding with recognizably modern subject
matter, objects, and branding.

## Prompt Core

Act as an Old Master oil painter in the Caravaggisti tradition. Paint the
given contemporary scene exactly as described — same subjects, same setting,
same modern objects — using 17th-century tenebrism and technique. Do not
update the scene into a historical setting; the modernity stays, only the
rendering changes.

## Core Directives

### Lighting

Environment: `references/environment/tenebrism.md` — this mode's default,
modern framing (a recognizable modern light source — a window, a car's
ambient interior glow, a table lamp — warm in color).

### Preserve The Modern Subject — Do Not Historicize

- Keep modern clothing, technology, interiors, and any visible brand text or
  logos (rideshare interiors, athletic wear, appliances) exactly as given.
  This inverts the standard Baroque-mode guardrail against modern objects —
  in Vaggio mode, the modern object staying legible is the whole point.
- Keep the scene mundane and specific: a kiss in the back of a car, a person
  holding a coffee cup, someone putting on socks — not myth, not allegory.

### Emotional Register

- Subjects should carry quiet, heavy emotional weight — exhaustion, tenderness,
  private grief, wry amusement — rendered with the same psychological
  seriousness as an Old Master portrait, even when the moment is small.
- Expressions and gestures should feel caught mid-moment, not posed.

### Palette

- Near-black or deep umber backgrounds dominate the frame.
- One warm accent color per scene (burnt orange, rust, amber) carries the
  rest of the warmth; skin tones stay warm and lifelike, not desaturated.
- Avoid broad modern colorfulness outside the single warm accent.

### Materiality And Technical Finish

- Hyperrealistic oil-paint rendering: visible fabric weave, environmental
  texture (grime, refuse, upholstery, wood grain).
- Aged oil on canvas quality, visible brushwork, subtle impasto on the
  brightest highlights.
- Avoid airbrushed digital smoothness — the finish should read as painted,
  not photographed or rendered.
- **Exception — human skin, face, and hair**: per the skill's Universal Human
  Rendering Rule, any human figure's skin/pores/face/hair is not rendered
  hyperrealistically here — it follows `references/anime/style-guide.md`'s
  flat cel-shaded anime treatment instead, set against this mode's painterly
  oil environment. Do not blend the figure toward photorealism to match the
  environment; the contrast is intentional (see that file's Hybrid Scenes
  section).

### Composition

- Tight framing on the subject(s), with large fields of negative black space.
- Portrait or square orientation for single figures/objects; landscape when
  the scene calls for it (e.g. a car's back seat).

## Negative Constraints

Avoid:

- flat or even lighting
- bright, evenly lit modern photography look
- historicizing the setting, clothing, or objects
- removing or obscuring visible brand names/logos that were in the source scene
- glossy digital rendering
- cheerful or neutral color grading

## Named Characters Do Not Follow This File

If the subject is a named character from `references/characters/` (Wyatt,
Benny, Lucy, Void), their entire rendering — face, body, clothing —
follows `references/anime/style-guide.md` instead, not this file's oil-paint
technique. This file still governs the environment and any non-character
elements in the scene.

## Intake Shortcut

When the user explicitly says "vaggio," treat style, mood, palette, and
lighting as locked to this contract — do not re-ask those categories during
intake. Only ask what's needed to pin down the specific scene: subject(s),
setting, the one modern object/brand detail to keep legible, and orientation.
