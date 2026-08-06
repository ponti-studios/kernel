# Stage 1 — Brief

Goal: turn the intake answers into one final, detailed, paste-ready image
prompt, and get the user's explicit sign-off before spending on generation.

## Steps

1. Classify the mode/material (and fine-art mode, if applicable) from the
   intake answers, per `SKILL.md`'s Modes And Plain Renders and Fine-Art
   Mode Selection tables. This governs the environment/scene only, never a
   named character's own rendering.
2. Load the matching material reference (`references/abstract/pop-symbolist.md`,
   `references/environment/tenebrism.md`'s Baroque Mode or Vaggio Mode section,
   `references/product/product-photography.md`,
   or, for a plain object/creature render, `references/environment/toy-3d-material.md`)
   and fold its style contract into the prompt for materials and any
   non-character elements.
3. Load the lighting environment reference: the mode/material's default
   (see `SKILL.md`'s Modes And Plain Renders table, or the loaded
   reference's own Lighting section) unless the user explicitly asked to
   blend a different one from `references/environment/`. Fold it into the
   prompt on top of the material rules — environment changes only light
   source/contrast/shadow behavior, never materials. For Baroque/Vaggio this
   step is already satisfied by step 2 — `tenebrism.md` bundles its own
   lighting (see that file's Core Lighting Directives and Framing By Mode
   sections) unless the user asked to blend a different environment in.
4. If the subject includes a named character (Lucy, Wyatt, Benny, Void),
   load `references/characters/<name>.md` and
   `references/anime/style-guide.md`, and use those exclusively for the
   character's own rendering (face, body, clothing) — do not apply the
   loaded material's character-design rules to them. The material and
   environment references from steps 2-3 still govern everything else in
   the scene around the character.
5. If the subject includes any other human figure (not a named character,
   and not a specific real person the user described) — before writing any
   new descriptive language for them, check whether one of the existing
   cast in `references/characters/` already fits the requested role or vibe
   (e.g. a warm, grounded figure with femme-fatale edge fits Lucy). **Prefer
   reusing an existing character over inventing a new
   one-off figure.** If one fits:
   - Treat step 4 as satisfied — load that character's identity file and
     `references/anime/style-guide.md`, adapting only environment, pose, and
     outfit to the current request, exactly as for an explicitly named
     character. Tell the user which existing character you matched them to.
   - This is what guarantees the figure renders identically across all 3
     generated variants — a fixed, detailed identity file is far more
     constraining than freshly-written descriptive language, which tends to
     drift between independent generation calls even when reworded to mean
     the same thing.
   If no existing character fits and the user hasn't given a specific
   real-person likeness, only then compose a new custom human description —
   write it once, in full physical detail (face shape, eyes, hair, build),
   and reuse that exact wording unchanged across all 3 variant prompts;
   never rephrase or vary it between calls. Either way, always load
   `references/anime/style-guide.md` on top of the type's reference — this
   is unconditional, not something the user has to request. It applies even
   when the base mode's own reference dictates its own figure or skin
   treatment (e.g. Baroque's dirty realism, Pop-Symbolist's figure
   rendering, a Vaggio oil-painting scene) — the anime contract supersedes
   that specific figure/skin/face guidance while the rest of the mode's
   reference (environment, lighting, palette, materials) still applies.
6. Compile a single final prompt covering: subject, style/medium, mood,
   palette, composition, lighting, detail level, and any reference/inspiration
   cues — in the prose style the target model expects (dense, descriptive,
   no bullet lists inside the prompt itself). This exact prompt text is what
   gets reused verbatim across all 3 generation calls — never regenerate or
   rephrase the prompt between the 3 runs. When a named character is in the
   scene, explicitly state that this is a single unified image with one
   camera framing and one pose — not a multi-view turnaround/reference
   sheet — since a character's identity file describes fixed traits the
   same way a turnaround prompt does, which otherwise biases the model
   toward generating a multi-panel character sheet instead of the requested
   scene (this showed up repeatedly in testing for non-human named
   characters against plain or minimal backgrounds).
7. Write a short brief summary (the intake answers, condensed) — this becomes
   the sidecar file content, not just the prompt.

## Gate

Show the user the final prompt and ask them to confirm before generating.
This is the point where a real, paid API call happens — do not run the
generate stage without an explicit yes. If the user wants changes, revise the
prompt and re-confirm; don't guess at what "close enough" means.

Generation always produces 3 versions of the confirmed prompt — this is fixed,
do not ask the user how many they want.
