---
name: kernel-image
license: MIT
kind: skill
tags:
  - creative
  - art
  - image-generation
description: >
  Interrogates the user in depth about the artwork they want, then generates and
  saves an actual image via OpenRouter. Covers large-scale fine art
  (Classical Oil Painting / Modern Oil Painting) and product photography as full modes,
  plain object/creature renders (toy-like 3D, etc.) built from the
  `references/environment/` library, and a fixed-style named-character cast
  (Lucy, Wyatt, Benny, Void). Use when the user wants a 3D render, says
  "make art," mentions one of the named characters, wants product photography
  for a physical object, or asks to generate any AI image.
when:
  - user wants a toy-like 3D character or object render
  - user says "premium character render," "Pixar-style," or "CGI"
  - user wants a large-scale fine-art piece or says "make art" in a non-character context
  - user wants Caravaggio-style visual output
  - user says "vaggio" or wants Old Master painting technique applied to an ordinary, modern scene
  - user mentions Lucy, Wyatt, Benny, or Void
  - user wants product photography for a physical product
  - user asks for MØNØTØNÉ Districts book photography
  - user invokes /kernel-image
outputs:
  - 3 output folders on the user's Desktop, one per generated image
  - Each folder holds that variant's image file and a sidecar brief recording
    the full Q&A and final prompt used
termination:
  - Intake gate passed (10+ specific answers across all required categories)
  - Brief confirmed by the user before any generation call
  - All 3 output folders (image + sidecar brief each) saved to the Desktop
allowedTools:
  - Read
  - Bash
argumentHint: subject, character, product, or image-type request
---

# Kernel Image — Grill, Brief, Generate

Grills the user on exactly what artwork they want, compiles a final prompt, then
actually generates and saves the image via OpenRouter — it does not just hand
back a prompt. Do not skip the interrogation and do not call the generation
script until the user has confirmed the brief.

## Universal Human Rendering Rule

**Every human figure, in every type and mode, renders per
`references/anime/style-guide.md` — flat cel-shaded traditional anime, not
Pixar/3D-CGI, not photoreal, not painterly, not ink/halftone.** This is fixed
and unconditional; it does not require the user to say "anime." Only the
human figure(s) render this way — everything else in the piece (objects,
environments, materials, non-human elements) follows the rest of the
prompt's medium unchanged. See the Cross-Type Guardrails section below, and
Named Characters below for the stricter fixed-style rule that applies to the
named cast specifically.

## Pipeline

Content moves through four stages. Do not skip stages. Each gate must pass
before the next stage.

| # | Stage | Action | Load | Gate |
|---|---|---|---|---|
| 0 | **Intake** | Grill the user, 10+ specific answers | `references/stages/intake.md` | every required category answered with specificity |
| 1 | **Brief** | Compile answers + style contract into one final prompt | `references/stages/brief.md` | no contradictions, user confirms before spending |
| 2 | **Generate** | Run `scripts/generate-image.ts` via bun, 3 times | `references/stages/generate.md` | all 3 runs exit 0, image + sidecar written each |
| 3 | **Deliver** | Confirm paths, offer iteration | `references/stages/deliver.md` | user has file paths, knows how to iterate |

## Modes And Plain Renders

There are two full **modes** — richer contracts with their own composition,
palette, and intake shortcuts — plus a fallback for everything else, which
is composed directly from `references/environment/`.

| Source | Use when | Reference | Default lighting | Human figures |
|---|---|---|---|---|
| **Fine art** | Large-scale, emotionally charged art; "make art" in a non-character context | `references/environment/dramatic-spotlight.md` (Classical Oil Painting, Modern Oil Painting — bundles material and lighting together in one file) | Built into `dramatic-spotlight.md` | `references/anime/style-guide.md` |
| **Product** | Product photography for any physical object; MØNØTØNÉ Districts | `references/product/product-photography.md` | `references/environment/lighting.md`'s Soft Diffused Studio section (clean studio) | `references/anime/style-guide.md` if a model appears |
| **Plain object/creature render** | Anything else — toy-like 3D render, "Pixar-style," "premium CGI," or no style specified for a non-character subject | `references/environment/toy-3d-material.md` (material) | `references/environment/lighting.md`'s Soft Diffused Studio section | `references/anime/style-guide.md` |

A plain object/creature render isn't a distinct "type" with its own
directory — it's just a material environment file plus a lighting
environment file, same composition model as everything else. See
`references/environment/README.md`.

## Environment

Lighting, contrast, shadow behavior, and mood are a separate axis from the
material/mode in play — see `references/environment/README.md`. Each
mode/material has a default lighting environment (table above); use it
unless the user explicitly asks to blend a different one in (e.g. "a
dramatically-lit 3D render," "toy version of the Modern Oil Painting
piece"). Blending
changes only the lighting/mood — the material rules (`toy-3d-material.md`,
a fine-art mode's paint/lacquer technique) still apply in full.

## Named Characters

If the subject includes Lucy, Wyatt, Benny, or Void, load their
identity from `references/characters/<name>.md` and render them entirely
per `references/anime/style-guide.md` (their whole body, not just
face/skin/hair) — this is fixed and not something the user can change.
Whichever mode/material the user picked still governs the environment and
any non-character elements around them. The only things the user can vary
for a named character are their environment, body position, and outfit —
never ask which rendering style they want for the character, and never
apply a mode's own character-design rules (`toy-3d-material.md`'s
Object/Creature Design section, a fine-art mode's figure language) to a
named character. See `references/characters/README.md` for the full model.

**Prefer an existing character even when the user didn't name one.** If the
piece needs a stylized human figure that isn't a specific real person, check
whether Lucy or another cast member already fits the requested role/vibe
before inventing a new one-off figure — say which one you matched and why. A fixed identity file renders far more consistently across the 3
generated variants than freshly-written descriptive language, which drifts
between independent generation calls even when it's meant to describe the
same person. Only compose a brand-new custom figure when no existing
character fits and the user hasn't given a specific real-person likeness —
see `references/stages/brief.md` step 5 for the full procedure.

## Fine-Art Mode Selection

When the type is fine art, pick the mode. Explicit instruction overrides all
inference.

| Signal | Mode |
|---|---|
| "Vaggio" | Modern Oil Painting — Old Master painting technique applied to an ordinary, contemporary scene; modern objects/brands stay legible |
| "Caravaggio," "Baroque," "dark oil painting," "tenebrism" (no modern scene/objects implied) | Classical Oil Painting |
| People in physical scenes, portraits with psychological weight, figurative drama | Classical Oil Painting (default) |
| Objects, symbols, surreal compositions, conceptual ideas, "abstract," "large-scale" with no style specified | Classical Oil Painting (default) |

Modern Oil Painting mode locks style/mood/palette/lighting to its bundled
contract in `references/environment/dramatic-spotlight.md`'s Modern Oil
Painting Mode section — during intake, skip those categories and only ask
what's needed to pin down the specific scene (see that section's Intake
Shortcut).

## Workflow

1. Run the intake stage — ask at least 10 specific questions across subject,
   style/medium, mood, palette, composition, lighting, detail level,
   references, and technical constraints. Do not advance on vague answers;
   ask a sharper follow-up instead. Never ask about iteration count.
2. Run the brief stage — classify the mode/material (and fine-art mode, if
   applicable), load its reference plus its default lighting environment (or
   a different one if the user asked to blend), and compile one final
   detailed prompt. Show it to the user and get explicit confirmation before
   generating (this triggers a paid API call).
3. Run the generate stage — invoke `scripts/generate-image.ts` 3 times with
   the confirmed prompt, writing 3 output folders (image + brief sidecar
   each) to the Desktop.
4. Run the deliver stage — report all saved paths and offer to iterate.

## Cross-Type Guardrails

- **Named characters have one fixed style, no exceptions.** Wyatt, Benny, Lucy, and Void always render per `references/anime/style-guide.md` regardless of which mode, material, or environment the rest of the piece uses. The user can change their environment, body position, and outfit — never their rendering style. Don't apply a mode's own character-design rules (`toy-3d-material.md`'s Object/Creature Design, a fine-art mode's figure language) to a named character.
- **Material and lighting are independent.** A mode/material's default lighting environment applies unless the user explicitly asks to blend a different one — never silently swap a mode's signature lighting (e.g. don't drop dramatic-spotlight lighting from a Modern Oil Painting piece without being asked).
- **Product intake.** For product photography, establish product, surface, lighting mood, and brand reference before generating — ask only for what the user hasn't provided.
- **Never generate before confirmation.** The brief stage's gate exists because generation costs money — always get an explicit yes on the final prompt first.
- **Humans render anime, always.** See Universal Human Rendering Rule above and the Modes And Plain Renders table's Human figures column. Never blend the anime figure's flat cel-shaded rendering toward the surrounding medium (painterly, photoreal, ink) — the contrast is intentional.
