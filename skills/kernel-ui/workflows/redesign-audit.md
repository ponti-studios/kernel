# Redesign Audit Workflow

Use this workflow for a visual redesign that must preserve product behavior,
routes, data, and accessibility.

## 1. Scan

Record:

- Routes and screens in scope.
- Framework and rendering model.
- Styling method and current token/theme source.
- Shared components and `@ponti-studios/ui` primitives in use.
- User flows, routes, data contracts, and semantics that must not change.
- Existing light/dark, responsive, keyboard, and reduced-motion behavior.
- Current screenshots or measurements for comparison.

Inspect the implementation, not only screenshots. Identify local colors,
spacing, typography, component variants, and ad hoc theme overrides.

## 2. Diagnose

Produce a prioritized findings table with evidence:

| Priority | Finding | Evidence | User impact | Smallest correction |
| --- | --- | --- | --- | --- |
| Must fix | Correctness, accessibility, token violation, or unstable layout | File and line or measured result | Observable impact | Minimal repair |
| Should fix | Clear convention or maintainability divergence | File and line | Consistency or maintenance cost | Local alignment |
| Consider | Philosophy-based improvement without defect evidence | Inference or comparison | Potential benefit | Optional change |

Check the component philosophy audit, accessibility reference, and performance
workflow for relevant dimensions. Do not use aesthetic preference alone to call
a defect.

## 3. Direct

Choose the smallest visual direction that fits the brief and existing product.
Then define the target before changing code:

- One shared theme from `@ponti-studios/ui`.
- Semantic tokens for color, type, spacing, radius, elevation, and motion.
- Layout and responsive rules.
- Component states and interaction behavior.
- Content hierarchy and copy changes.

Do not create per-page palettes or local replacements for missing shared UI
exports. Request a shared UI change when the target needs a missing primitive.

## 4. Apply

Apply changes in this order:

1. Shared tokens and theme mappings.
2. Typography, spacing, sizing, and layout.
3. Component anatomy and states.
4. Content and copy.
5. Motion and performance refinements.

Preserve routes, data flow, public semantics, and working interactions. Fix
accessibility issues when required; do not remove accessible behavior for visual
consistency.

## 5. Verify

Run the same user flows before and after the redesign. Verify:

- All previously working routes and actions still work.
- Light and dark modes use the single shared theme.
- Desktop and mobile layouts preserve task meaning.
- Keyboard navigation and visible focus work.
- Screen-reader semantics and labels remain correct.
- Contrast meets WCAG AA requirements.
- Reduced-motion behavior works.
- Performance budgets and layout stability remain within the performance
  workflow requirements.
- No changed code contains local visual values where shared exports exist.

If a required project validator is unavailable, report that as a verification
gap rather than claiming the check passed.

## Output Completeness

Return the scan summary, prioritized findings, target direction, files changed,
preserved behavior, verification results, screenshots or measurements, and
remaining risks.
