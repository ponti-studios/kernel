# Accessibility Reference

Use this pack when reviewing or building accessible interfaces.

## Standards

- **WCAG 2.1 AA** is the baseline target
- All interactive elements must be keyboard-navigable
- Focus order must be logical and visible
- Color is never the only way to convey information

## Checklist

- Semantic HTML (`<button>` not `<div onClick>`, `<nav>`, `<main>`, etc.)
- ARIA roles and labels where semantics alone are insufficient
- All images have meaningful `alt` text (or `alt=""` if decorative)
- Form inputs have associated `<label>` elements
- Focus styles are not suppressed
- Touch targets are at least 44×44px
- Screen reader testing (VoiceOver / NVDA)

## Output

- List of accessibility issues with severity (critical / major / minor)
- Suggested fixes with code examples
