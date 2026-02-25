# Ghostwire Copilot Instructions

Generated: 2026-02-24

Repository-wide constraints:
- Use technical and scientific language with explicit assumptions and measurable outcomes.
- Apply RED -> GREEN -> REFACTOR for non-trivial code changes.
- Prefer deterministic validation (typecheck, tests, lint, diagnostics) before completion.
- Keep edits minimal and scoped to requested behavior.
- Surface defects by severity, with file evidence and reproducible verification steps.

Full capability export is available via modular artifacts:
- .github/instructions/*.instructions.md
- .github/prompts/*.prompt.md
- .github/skills/*/SKILL.md
- .github/agents/*.agent.md
- .github/hooks/*.json
