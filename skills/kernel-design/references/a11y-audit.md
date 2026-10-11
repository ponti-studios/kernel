
# Skill: Accessibility Audit

Evaluate against WCAG 2.2 and the project's ARIA patterns.

## Steps
1. Organize by POUR (Perceivable, Operable, Understandable, Robust) and triage P0/P1/P2.
2. Check the mandatory P0 set per component: keyboard navigable, focus visible (≥3:1), screen-reader name/role/state, contrast (4.5:1 text / 3:1 UI), target size ≥24×24, no color-only signaling.
3. Verify WCAG 2.2 additions: Focus Not Obscured (2.4.11), Target Size (2.5.8), Accessible Authentication (3.3.8).
4. **Contrast — measure, don't eyeball.** For loose color pairs, run `python3 ../scripts/contrast.py "<fg>" "<bg>"`; for token sources run `python3 ../scripts/validate_contrast.py`. If the consuming project provides rendered-HTML contrast gates, run those too and report their actual output. Never state a ratio you did not measure.
5. Check reduced-motion handling (`../taste/motion-choreography.md`).

## Output
A findings table: WCAG criterion (e.g. 1.4.3) · severity (P0/P1/P2) · what fails · specific fix. Confirm passes explicitly. Accessibility may never be traded for aesthetics.
