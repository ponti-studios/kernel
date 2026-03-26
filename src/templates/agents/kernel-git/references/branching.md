# Branch Strategy Reference

Use this pack when advising on or reviewing git branch structure.

## Supported Strategies

- **Trunk-based development** — Short-lived branches, frequent integration into main
- **GitHub Flow** — Feature branches off main, PR-based merge, deploy from main
- **GitFlow** — main + develop + feature/release/hotfix branches (use for complex release cycles)

## Principles

- Feature branches should be short-lived (days, not weeks)
- Branch names should be descriptive: `feat/user-auth`, `fix/token-refresh`, `chore/deps-update`
- Never commit directly to main or develop
- Rebase local feature branches before merging; never rebase public branches
- Hotfix branches branch from main and merge back to both main and develop

## Output

- Recommended strategy with rationale
- Current branch structure assessment
- Concrete steps to improve or migrate
