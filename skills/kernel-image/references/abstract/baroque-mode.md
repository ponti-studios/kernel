# Caravaggio Style Contract

Use this reference for Caravaggio-style image prompts.

## Core Goal

Move beyond generic dark shadows. Emphasize physicality, psychological weight, and 17th-century oil-paint technique.

## Prompt Core

Act as a Baroque master artist. Reinterpret the composition and figures of the provided image or scene into a high-drama oil painting in the style of Caravaggio.

Preserve basic subject positioning, but translate the environment and emotional presence into the 17th-century Baroque era.

## Core Directives

### Lighting

Environment: `references/environment/tenebrism.md` — this mode's default,
classical/historical framing (an unseen high-angle source, like a cellar
window; brutal and directional). Discard the scene's original light
sources entirely.

### Dirty Realism

- Avoid idealized beauty in the environment and materials — weathered
  surfaces, grime, dirt, wear.
- Avoid digital smoothness anywhere in the piece.
- **Exception — human figures**: per the skill's Universal Human Rendering
  Rule, do not apply pore-level physical realism, weathered wrinkles, or
  sweat sheen to a human figure's skin — the figure renders per
  `references/anime/style-guide.md`'s flat cel-shaded anime treatment
  instead, set against this mode's tenebrist, physically-grimy environment.
  "Bodies feel visceral and physically present" now applies to posture,
  gesture, and psychological weight, not skin-level realism.

### Action-Stasis

- If subjects are moving, capture the pregnant moment at the peak of action.
- If subjects are still, heighten psychological gaze.
- Expressions should feel heavy with unspoken internal conflict, revelation, or dread.

### Materiality And Drapery

- Replace modern fabrics with heavy linens and thick wools where appropriate.
- Emphasize deep folds where shadows pool.
- Make fabric tactile and weighty.

### Palette

- Restrict colors to earthy tones.
- Use burnt umber, raw sienna, deep ochre, and one dramatic Caravaggio red such as madder lake or crimson.
- Avoid broad modern colorfulness.

### Technical Finish

- Apply aged oil on heavy linen canvas.
- Use subtle impasto on the highest highlights.
- Add faint natural craquelure in the darkest shadows.

## Named Characters Do Not Follow This File

If the subject is a named character from `references/characters/` (Wyatt,
Benny, Lucy, Void), their entire rendering — face, body, clothing —
follows `references/anime/style-guide.md` instead, not this file's oil-paint
technique. This file still governs the environment and any non-character
elements in the scene.

## Negative Constraints

Avoid:

- clean digital smoothness
- modern glossy lighting
- neon palettes
- soft glamour portraiture
- generic fantasy art
- overly clean hands or skin
- modern fabrics unless the user explicitly asks to preserve them
- flat lighting
