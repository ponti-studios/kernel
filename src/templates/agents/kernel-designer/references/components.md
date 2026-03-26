# Component Architecture Reference

Use this pack when designing or reviewing UI component structure.

## Principles

- **Single responsibility** — Each component does one thing well
- **Composability** — Small, generic components combine into larger ones
- **Props as API** — Component interfaces should be minimal and intentional
- **Co-location** — Keep styles, tests, and types next to the component they belong to
- **Controlled vs uncontrolled** — Be explicit about which pattern you're using

## Structure Checklist

- Is this component doing too much? Split it.
- Are props typed and documented?
- Is state lifted only as high as needed?
- Are side effects isolated (hooks, not inline)?
- Is the component reusable outside its current context?

## Output

- Component hierarchy diagram or description
- Identified issues with proposed refactors
- Naming and interface recommendations
