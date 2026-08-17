# Token Build Workflow

Use this workflow to generate platform outputs from the canonical
[`@ponti-studios/ui` token source](https://github.com/ponti-studios/ui/tree/main/src/styles/tokens/source).
Tokens are authored once; platform files are generated.

To validate the canonical source directly from this repository, run:

```bash
python3 scripts/fetch_ui_tokens.py --ref main
```

Use `--ref` with a release tag or commit for reproducible validation. Use
`--output ./tmp/ui-tokens` when the downloaded files need to be inspected.

## 1. Establish the Source

Record:

- Token source directory and format. For Ponti Studios UI, use
  `src/styles/tokens/source/*.tokens.json` in the UI repository.
- Tool: Style Dictionary, Tokens Studio, W3C DTCG tooling, or a repository
  script.
- Output platforms and committed artifact paths.
- Theme modes and override files.
- Validation and generation commands available in the consuming project.

Use DTCG-compatible token data. Do not edit generated platform files as a
source of truth. Generated files in the UI repository are produced by
`pnpm run tokens:build` and checked by `pnpm run tokens:check`.

## 2. Validate the Token Model

Require three layers:

1. **Primitive:** raw scales and values, consumed only through aliases.
2. **Semantic:** roles such as text, surface, border, action, feedback, focus,
   and disabled.
3. **Component:** component-specific aliases and states.

Check that:

- Every alias resolves.
- Token types match their values.
- Names are stable and semantic where consumed by components.
- Dark, brand, and density modes contain deltas only.
- Semantic colors preserve their meaning across modes.
- Components consume semantic or component tokens, not raw primitives.
- `@ponti-studios/ui` remains the shared UI source of truth for consuming apps;
  this skill's local `tokens/` files are validation fixtures only.

## 3. Generate Outputs

Generate only the requested targets, such as:

- CSS `:root` variables and dark-mode overrides.
- Tailwind v4 `@theme` values.
- Typed JavaScript or TypeScript exports.
- iOS asset catalogs, `Color.DS`, and spacing constants.
- Android `colors.xml` and Compose theme values.

Resolve aliases according to the target platform. Preserve token names and
metadata where the platform supports them. Keep generated output deterministic.

## 4. Wire Validation

On token-source changes, run:

1. Token parsing and alias validation.
2. Contrast validation for required light and dark pairs.
3. Theme-reference validation so every consumed variable exists.
4. Generation and a clean-artifact comparison.
5. Component tests or a focused UI build.

Use the UI repository's actual token commands when operating on its source. Use
`fetch_ui_tokens.py` when the source is not checked out locally. If a command or script does not
exist, report it as unavailable and do not substitute a passing result.

## 5. Review Changes

Before accepting generated output, inspect:

- Added, removed, and changed tokens.
- Alias graph and unresolved references.
- Base and mode override size.
- Semantic color role changes.
- Component state coverage.
- Cross-platform naming and type compatibility.
- Whether any generated file was manually edited.

## Definition of Done

The build is complete only when:

- All aliases resolve.
- Generated artifacts are reproducible with no diff after regeneration.
- Dark, brand, and density files contain deltas rather than duplicated bases.
- Required contrast and theme-reference checks pass.
- Components consume the generated shared tokens.
- The output paths and validation evidence are recorded.

## Output

Return the source and tool, targets generated, validation commands and results,
changed artifacts, unresolved token or contrast issues, and regeneration steps.
