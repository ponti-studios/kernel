# Environment: Dramatic Spotlight

Single-source dramatic lighting derived from Old Master oil painting
(Caravaggio's tenebrism). This file is also the full style contract for the
two fine-art modes built on it — **Classical Oil Painting** and **Modern
Oil Painting**, below — bundling each mode's material/technique/palette
rules together with the dramatic-spotlight lighting they both default to.
It can also be loaded as pure lighting on its own, blended alongside any
other material/mode when the user asks to blend ("a dramatically-lit 3D
render," "toy version of the Modern Oil Painting piece") without pulling in
either mode's material rules.

## Core Lighting Directives

- Single directional light source per scene — never flat or evenly lit.
- Let everything outside the light's reach dissolve into near-total black —
  a velvety void, not a lit-but-underexposed shadow.
- Catch bright, defined highlights on skin, hands, and fabric/material
  folds; the falloff from lit to unlit should be sharp, not gradual.
- Visible dust or particulate floating in the light shaft is a nice touch
  where the scene calls for it (interiors, shafts of light).

## Lighting Negative Constraints

Avoid: flat/even lighting, multiple competing light sources, soft gradual
falloff, bright ambient fill that softens the blacks.

## Framing By Mode

- **Classical/historical framing** (Classical Oil Painting mode's
  default): an unseen high-angle source, like a cellar window — brutal and
  directional.
- **Modern framing** (Modern Oil Painting mode's default): a recognizable
  modern light source — a window, a car's ambient interior glow, a table
  lamp — warm in color.
- **Blended with another material** (e.g. `toy-3d-material.md`): keep the
  single-source falloff and near-black negative space, but let the light
  itself read as a clean studio spotlight rather than a literal window or
  lamp, so it stays consistent with that material's own logic.

## Classical Oil Painting Mode

Use this mode for Caravaggio-style image prompts — a "Baroque" request
maps here.

### Core Goal

Move beyond generic dark shadows. Emphasize physicality, psychological
weight, and 17th-century oil-paint technique.

### Prompt Core

Act as a Baroque master artist. Reinterpret the composition and figures of
the provided image or scene into a high-drama oil painting in the style of
Caravaggio.

Preserve basic subject positioning, but translate the environment and
emotional presence into the 17th-century Baroque era.

### Core Directives

#### Lighting

Classical/historical framing, per Framing By Mode above (an unseen
high-angle source, like a cellar window; brutal and directional). Discard
the scene's original light sources entirely.

#### Dirty Realism

- Avoid idealized beauty in the environment and materials — weathered
  surfaces, grime, dirt, wear.
- Avoid digital smoothness anywhere in the piece.
- **Exception — human figures**: per the skill's Universal Human Rendering
  Rule, do not apply pore-level physical realism, weathered wrinkles, or
  sweat sheen to a human figure's skin — the figure renders per
  `references/anime/style-guide.md`'s flat cel-shaded anime treatment
  instead, set against this mode's dramatic-spotlight, physically-grimy
  environment. "Bodies feel visceral and physically present" now applies
  to posture, gesture, and psychological weight, not skin-level realism.

#### Action-Stasis

- If subjects are moving, capture the pregnant moment at the peak of action.
- If subjects are still, heighten psychological gaze.
- Expressions should feel heavy with unspoken internal conflict, revelation,
  or dread.

#### Materiality And Drapery

- Replace modern fabrics with heavy linens and thick wools where
  appropriate.
- Emphasize deep folds where shadows pool.
- Make fabric tactile and weighty.

#### Palette

- Restrict colors to earthy tones.
- Use burnt umber, raw sienna, deep ochre, and one dramatic Caravaggio red
  such as madder lake or crimson.
- Avoid broad modern colorfulness.

#### Technical Finish

- Apply aged oil on heavy linen canvas.
- Use subtle impasto on the highest highlights.
- Add faint natural craquelure in the darkest shadows.

### Named Characters Do Not Follow Classical Oil Painting's Material Rules

If the subject is a named character from `references/characters/` (Wyatt,
Benny, Lucy, Void), their entire rendering — face, body, clothing —
follows `references/anime/style-guide.md` instead, not this mode's
oil-paint technique. Classical Oil Painting mode still governs the
environment and any non-character elements in the scene.

### Negative Constraints

Avoid:

- clean digital smoothness
- modern glossy lighting
- neon palettes
- soft glamour portraiture
- generic fantasy art
- overly clean hands or skin
- modern fabrics unless the user explicitly asks to preserve them
- flat lighting

## Modern Oil Painting Mode

Use this mode when the user says "vaggio" or wants Old Master
oil-painting technique applied to an ordinary, contemporary scene.

### Core Goal

Render a mundane, present-day moment — a rideshare, a coffee-shop morning, a
candid portrait, a still life, getting dressed — with the gravity and
technique of a 17th-century Old Master painting. The tension is the point:
Caravaggisti light and brushwork colliding with recognizably modern subject
matter, objects, and branding.

### Prompt Core

Act as an Old Master oil painter in the Caravaggisti tradition. Paint the
given contemporary scene exactly as described — same subjects, same
setting, same modern objects — using 17th-century dramatic-spotlight
lighting and technique. Do not update the scene into a historical setting;
the modernity stays, only the rendering changes.

### Core Directives

#### Lighting

Modern framing, per Framing By Mode above (a recognizable modern light
source — a window, a car's ambient interior glow, a table lamp — warm in
color).

#### Preserve The Modern Subject — Do Not Historicize

- Keep modern clothing, technology, interiors, and any visible brand text or
  logos (rideshare interiors, athletic wear, appliances) exactly as given.
  This inverts Classical Oil Painting mode's guardrail against modern
  objects — in Modern Oil Painting mode, the modern object staying legible
  is the whole point.
- Keep the scene mundane and specific: a kiss in the back of a car, a person
  holding a coffee cup, someone putting on socks — not myth, not allegory.

#### Emotional Register

- Subjects should carry quiet, heavy emotional weight — exhaustion,
  tenderness, private grief, wry amusement — rendered with the same
  psychological seriousness as an Old Master portrait, even when the moment
  is small.
- Expressions and gestures should feel caught mid-moment, not posed.

#### Palette

- Near-black or deep umber backgrounds dominate the frame.
- One warm accent color per scene (burnt orange, rust, amber) carries the
  rest of the warmth; skin tones stay warm and lifelike, not desaturated.
- Avoid broad modern colorfulness outside the single warm accent.

#### Materiality And Technical Finish

- Hyperrealistic oil-paint rendering: visible fabric weave, environmental
  texture (grime, refuse, upholstery, wood grain).
- Aged oil on canvas quality, visible brushwork, subtle impasto on the
  brightest highlights.
- Avoid airbrushed digital smoothness — the finish should read as painted,
  not photographed or rendered.
- **Exception — human skin, face, and hair**: per the skill's Universal
  Human Rendering Rule, any human figure's skin/pores/face/hair is not
  rendered hyperrealistically here — it follows
  `references/anime/style-guide.md`'s flat cel-shaded anime treatment
  instead, set against this mode's painterly oil environment. Do not blend
  the figure toward photorealism to match the environment; the contrast is
  intentional (see that file's Hybrid Scenes section).

#### Composition

- Tight framing on the subject(s), with large fields of negative black
  space.
- Portrait or square orientation for single figures/objects; landscape when
  the scene calls for it (e.g. a car's back seat).

### Negative Constraints

Avoid:

- flat or even lighting
- bright, evenly lit modern photography look
- historicizing the setting, clothing, or objects
- removing or obscuring visible brand names/logos that were in the source
  scene
- glossy digital rendering
- cheerful or neutral color grading

### Named Characters Do Not Follow Modern Oil Painting's Material Rules

If the subject is a named character from `references/characters/` (Wyatt,
Benny, Lucy, Void), their entire rendering — face, body, clothing —
follows `references/anime/style-guide.md` instead, not this mode's
oil-paint technique. Modern Oil Painting mode still governs the environment
and any non-character elements in the scene.

### Intake Shortcut

When the user explicitly says "vaggio," treat style, mood, palette, and
lighting as locked to this mode — do not re-ask those categories during
intake. Only ask what's needed to pin down the specific scene: subject(s),
setting, the one modern object/brand detail to keep legible, and
orientation.
