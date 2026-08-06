# Stage 0 — Intake (the grill)

Goal: pin down exactly what artwork the user wants before any prompt is
written. Ask questions one or a few at a time — do not dump all 10+ at once as
a form. Adapt wording to what the user already said; skip a question only if
they've already answered it with specificity.

## Required categories (minimum 10 questions, one per category)

1. **Purpose/use-case** — wallpaper, print, gift, brand asset, social post, book cover, something else?
2. **Subject/concept** — what is actually depicted? Get concrete nouns, not themes. If the subject needs a stylized human figure that isn't a specific real person, the brief stage will prefer matching them to an existing character in `references/characters/` over inventing a new one — see `SKILL.md`'s Named Characters section. No extra question needed here; just don't lock in throwaway physical details that would conflict with an existing character's fixed identity.
3. **Style/medium** — large-scale fine art, product photography, or a plain object/creature render (toy-like 3D, etc.)? See `SKILL.md`'s Modes And Plain Renders table. This governs materials for non-character elements, not a named character's own rendering — see Named Characters. If the subject is a named character, this question still applies to the rest of the scene/materials around them.
4. **Fine-art mode** (only if style is fine art) — Baroque, Pop-Symbolist, or Vaggio? See the Fine-Art Mode Selection table.
5. **Mood/emotional tone** — what should the viewer feel?
6. **Color palette** — dominant colors, warm/cool, muted/saturated, any colors to avoid?
7. **Composition/framing** — aspect ratio, focal point, negative space, close-up vs. wide?
8. **Lighting** — direction, hardness, time of day, studio vs. natural? Each mode/material has a default lighting environment (`references/environment/README.md`) — only ask this if the user might want to blend a different one in (e.g. dramatic tenebrist lighting on a toy-3D object); otherwise the default applies without asking.
9. **Level of detail/complexity** — minimal and graphic, or dense and intricate?
10. **References/inspirations** — specific artists, brands, or existing images to echo?
11. **Technical constraints** — final resolution/orientation, where it'll be displayed?

Do not ask about iteration count. Every generation run always produces 3
versions — this is fixed by the skill, not a question for the user.

Do not ask how a human figure should be rendered. Every human figure always
renders per `references/anime/style-guide.md` (flat cel-shaded traditional
anime) — this is fixed by the skill regardless of mode or material. Only
ask about the human figure's specific appearance (hair color, expression,
build, etc.), never about which rendering style to use for them.

Do not ask how a named character (Lucy, Wyatt, Benny, Void) should be
rendered — their style is fixed by `references/characters/<name>.md` and
`references/anime/style-guide.md`, never a question. Only ask about their
environment, body position, and outfit (if different from their default).

## Gate

Do not advance to the brief stage until every required category above has a
specific answer. "Something cool" or "surprise me" is not specific — ask a
sharper follow-up (offer 2-3 concrete options to choose from if the user is
stuck, rather than accepting vagueness). Explicit user instruction to skip a
category ("I don't care about lighting, you decide") satisfies the gate for
that category — record the delegation and move on.

Named-character and product requests may already have most answers
pre-supplied by their own reference doc (`references/characters/`,
`references/product/`) — still confirm the character/product-specific
fields explicitly, don't assume. A named character's identity and rendering
style are both fixed by `references/characters/<name>.md`; what still needs
confirming is their environment, body position, outfit, and any other
scene-specific details (setting, other subjects).

**Vaggio requests are the one explicit shortcut**: if the user says "vaggio,"
style/mood/palette are locked by `references/abstract/vaggio-mode.md` and
lighting by its default environment (`references/environment/tenebrism.md`)
— skip categories 3-9 above and only ask about subject/scene, the modern
object or brand detail to keep legible, and orientation.
