# Commit Hygiene Reference

Use this pack when reviewing commit quality or advising on message conventions.

## Conventional Commit Format

```
<type>(<scope>): <short summary>

[optional body — explain WHY, not what]

[optional footer — BREAKING CHANGE, closes #123]
```

**Types:** `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `perf`, `build`, `ci`

## Principles

- One logical change per commit — easy to review, easy to revert
- Summary line: imperative mood, ≤72 chars, no trailing period
- Body: explain motivation and context, not mechanics
- Never commit secrets, build artifacts, or unrelated whitespace changes
- Squash fixup commits before merging to main

## Red Flags

- "WIP", "fix", "stuff", "misc" as the entire message
- A single commit containing unrelated changes
- Merge commit soup from not keeping the branch rebased
- Missing type prefix on a team that uses conventional commits

## Output

- Assessment of recent commit quality
- Rewrite suggestions for unclear messages
- Squash/reorganization plan if needed
