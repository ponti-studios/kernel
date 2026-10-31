
# Skill: Token Build

Turn the project's canonical DTCG token source
into platform-ready outputs. Tokens are authored once; every platform output is
generated.

## Steps
1. Read `../workflows/token-build.md` (architecture, tool options, resolution rules, output targets, CI).
2. Use the project's `tokens:build` and `tokens:check` equivalents
	when working with the canonical source.
3. Pick the tool: **Style Dictionary** (multi-platform, the default), **Tokens Studio** (Figma-owned tokens — pairs with `figma-integration`), W3C DTCG export, or a small custom script (model on `../scripts/validate_tokens.py`).
4. Honor the resolution rules: resolve aliases to final values per platform; expose semantic + component tokens (primitives stay internal); emit base + dark/brand/density overrides as deltas only; format by `$type`.
5. Generate the requested target(s): CSS `:root` vars, Tailwind v4 `@theme`, typed JS/TS, iOS Asset Catalog + `Color.DS`/`Spacing`, Android `colors.xml`/Compose theme.
6. Wire CI: on a canonical token change, run the project's token checks, regenerate, and fail if committed artifacts are stale; use this skill's scripts only for local checks.

## Verification (definition of done)
- `python3 scripts/validate_tokens.py` passes (no unresolved aliases).
- Regenerating produces no diff vs. committed artifacts.
- Dark/brand/density outputs contain only deltas, not full duplicates.
