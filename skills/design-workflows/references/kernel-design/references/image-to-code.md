
# Skill: Image to Code

Reconstruct a design from a visual reference as a real design system, not a one-off copy. Match the *system* (color/type/spacing language), never lift copyrighted imagery or brand assets.

## Steps
1. **Read the reference like a designer.** Infer and write down:
   - **Palette** — 1 dominant surface family, text colors, 1 primary action + at most 1 accent (sample the hues; don't guess random hex).
   - **Type** — family feel (geometric/grotesk/serif), the scale jumps, display vs. body contrast, weights.
   - **Spacing & density** — base unit, section rhythm, card padding; airy vs. compact.
   - **Radius & depth** — radius language (sharp/soft/pill), shadow vs. hairline separation.
   - **Layout archetype + sequence** — full-bleed hero / asymmetric split / bento / editorial stack (`../taste/design-taste.md` → Variance Mandate).
2. **Anchor to a known system** if it's close — browse `../taste/aesthetic-systems.md` / `python3 ../scripts/design_systems.py search <term>` and adopt that recipe to stabilize decisions.
3. **Build the token theme** from the inferred values → 3-tier DTCG (`token-build.md`); generate a single `theme.css`. Verify every color pair with `../scripts/contrast.py` / `../scripts/validate_contrast.py` (light + dark) — a sampled brand color that fails AA gets adjusted; taste never overrides POUR.
4. **Rebuild layout + components** token-driven with the project's component patterns: one shared primitive layer, all 8 states, a11y wired, no emoji (lucide), single theme. Apply taste (`../taste/design-taste.md`) so it doesn't regress to generic.
5. **Verify against the reference** — render and screenshot it, compare side-by-side to the reference; run `../scripts/validate_contrast.py` and `../scripts/lint_hardcodes.py` over the result.

## Verification (definition of done)
- Token aliases resolve, contrast passes AA light+dark, and no hardcoded values remain.
- The rebuilt UI uses ONE inferred token theme — no per-section palettes.
- A screenshot of the result visibly matches the reference's design language.

> Honest limit: this matches the design **system**, not a pixel-perfect copy. Do not reproduce the reference's photographs, logos, or copyrighted copy — substitute your own or generic placeholders.
