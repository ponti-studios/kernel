---
name: kernel-git-commit
description: "Write Conventional Commits messages, name branches, and commit safely. Use before branching, staging, committing, or pushing code changes."
license: MIT
compatibility: Any git repository that expects Conventional Commits messages.
metadata:
  author: project
  version: "2.0"
  category: Engineering
---

Every commit must follow the Conventional Commits specification: <https://www.conventionalcommits.org/en/v1.0.0/#specification>.

## When to use

- Creating a branch for a change
- Committing or pushing code changes
- Staging files before a commit
- Reviewing whether a commit message conforms to Conventional Commits
- Fixing a non-conforming commit message or rebasing a commit series

## Outputs

- A spec-conforming git commit on the right branch

## Definition of done

- A commit is created whose message conforms to the spec
- The staged diff exactly matches the message
- No unrelated or stray files are staged

## Branching

Work on a feature branch, not `main` or `master`:

```bash
git branch --show-current
git checkout -b <type>/<short-description>
```

Branch name pattern: `<type>/<short-description>` where type matches the commit type (e.g. `feat/add-user-auth`, `fix/null-pointer-error`).

## Message format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

1. **type** — one of `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `build`, `ci`, `perf`, `style`, `deps`, `revert`. Pick the single type that describes the primary intent of the change.
2. **scope** — optional, lowercase, the area changed. Use the package, domain, or module name. Use the same scope consistently with recent history.
3. **description** — imperative mood, lowercase, no trailing period. Summarize what the change does, not how. Max ~72 characters including the type and scope.
4. **body** — optional. Explain the what and why, not how: motivation, contrast with previous behavior when relevant. Wrapped at 72 characters.
5. **footer** — optional. `BREAKING CHANGE: <description>` for breaking changes (correlates with MAJOR in SemVer; `feat`/`fix` map to MINOR/PATCH), or `Refs: #<issue>` / `Closes: #<issue>`.

## Rules

- **A commit may only be made after the change is validated.** Follow the repo's validation rules (typecheck, lint, format, and tests for the affected packages) before committing.
- Each commit is a single, stable change: independently reviewable, and the repository works after each commit.
- Commit related work together. Do not split one logical change into several commits, and do not bundle unrelated changes into one commit.
- Breaking changes MUST have a `BREAKING CHANGE:` footer (or a `!` after type/scope), regardless of type.
- Do not invent types. If none of the standard types fit, prefer `chore` over a custom type.
- Never use generic messages like `update`, `fix`, or `wip` — they do not satisfy the spec.
- Re-read the staged diff with `git diff --cached` before writing the message; the message must describe exactly what is staged.

## Examples

```text
fix(api): handle null response in user endpoint

The user API could return null for deleted accounts, causing a crash
in the dashboard. Add null check before accessing user properties.
```

```text
feat(alerts): add Slack thread replies for alert updates

When an alert is updated or resolved, post a reply to the original
Slack thread instead of creating a new message.
```

```text
feat(api)!: remove deprecated v1 endpoints

Remove all v1 API endpoints that were deprecated in version 23.1.
Clients should migrate to v2 endpoints.

BREAKING CHANGE: v1 endpoints no longer available
```

```text
revert: feat(api): add new endpoint

This reverts commit abc123def456.

Reason: Caused performance regression in production.
```

## Workflow

1. Run `git status` and `git diff` to understand exactly what changed.
2. Stage the intended files with `git add` (never `git add -A` unless everything is intentionally included and you have confirmed nothing stray is staged).
3. Read the staged diff with `git diff --cached` and draft the message from it.
4. Verify the message against the spec above before running the commit.
5. Commit with the single-line message, e.g.:

   ```bash
   git commit -m "feat(api): add finance MCP tools for hominem-owned finance surface"
   ```

   For a body and/or footer, pass them as separate `-m` flags:

   ```bash
   git commit -m "fix(api): reconcile MCP scope tests and finance import cancel route" -m "Scopes now come from a single source of truth in services/api/src/scopes.ts."
   ```

6. Do not push unless the user asked you to push.

## Validation checklist before committing

- [ ] On a feature branch, not `main`/`master`
- [ ] Change is validated (typecheck, lint, format, tests pass for the affected packages)
- [ ] Message uses the correct type and optional scope
- [ ] Description is imperative, lowercase, ≤72 chars, no trailing period
- [ ] Body and `BREAKING CHANGE:`/`Refs:` footers present where needed
- [ ] Staged diff (`git diff --cached`) matches the message
- [ ] Only intended files are staged
