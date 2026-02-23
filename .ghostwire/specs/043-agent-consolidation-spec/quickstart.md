---
title: Agent Consolidation Quickstart
date: 2026-02-20
phase: 10
---

# Quickstart: Add a Markdown Agent

## 1) Create the file

Create a new markdown file in `src/orchestration/agents/` using a kebab-case filename:

```
src/orchestration/agents/reviewer-accessibility.md
```

## 2) Add YAML frontmatter

Start the file with YAML frontmatter that matches the contract:

```yaml
---
id: reviewer-accessibility
name: Accessibility Reviewer
purpose: Review UI code for accessibility issues
models:
  primary: inherit
temperature: 0.1
category: review
cost: MEDIUM
triggers:
  - domain: UI review
    trigger: Check accessibility and WCAG compliance
useWhen:
  - Reviewing UI changes before release
avoidWhen:
  - Backend-only refactors
---
```

## 3) Write the prompt body

After frontmatter, add the prompt content:

```markdown
# Accessibility Reviewer

You review UI changes for accessibility issues and WCAG compliance.

Focus on actionable, testable recommendations.
```

## 4) Verify loading

Run the tests and build to verify:

```bash
bun test src/orchestration/agents/load-markdown-agents.test.ts
bun run typecheck
bun run build
```

## Notes

- `id` must match the filename.
- Avoid custom YAML fields; use the contract in
  `specs/043-agent-consolidation-spec/contracts/agent-markdown-format.md`.
