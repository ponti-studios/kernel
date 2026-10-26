---
name: dependabot-batch
description: Consolidate open Dependabot update pull requests into one reviewed dependency update pull request for this repository.
---

# Dependabot batch updates

Use this skill when asked to perform the pending Dependabot updates as one PR.

- Inspect all open Dependabot-authored PRs and summarize their package, version, ecosystem, changed files, and CI status. Include every open Dependabot update in the batch unless the user narrows the scope.
- Work from a clean, isolated branch based on the current default branch. Preserve unrelated user changes in the primary checkout.
- Consolidate compatible updates in dependency manifests, workspace catalogs, lockfiles, GitHub Actions, and Docker files as applicable. Keep the repository's package manager and generated lockfile workflow authoritative; do not hand-edit generated lockfiles when the package manager can regenerate them.
- Resolve overlapping version changes by retaining all requested updates. Review the final diff to confirm no update disappeared during conflict resolution and no unrelated changes entered the branch.
- Follow repository `AGENTS.md` and relevant operations documentation. If an update changes environment variables, routes, databases, authentication, cross-service ownership, or deployment behavior, read the required operations guides before editing.
- Run the repository's relevant dependency installation and CI checks when feasible. Report any failed or unavailable checks clearly.
- Open one PR that lists the included updates and validation performed. Once that replacement PR exists, close the individual Dependabot PRs as superseded and reference the combined PR in the close reason. Do not merge or deploy the combined PR unless explicitly asked.
- Report the combined PR and any updates excluded, blocked, or failing validation.
