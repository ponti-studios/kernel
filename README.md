# Kernel

[![skills.sh](https://skills.sh/b/ponti-studios/kernel)](https://skills.sh/ponti-studios/kernel)

58 independently installable agent skills. One repo is the canonical source; everything else — laptops, repos, agents — installs from it with `npx skills` and never copies by hand.

## Install

```bash
# Everything, globally
npx skills add ponti-studios/kernel --all --yes

# One skill, globally
npx skills add ponti-studios/kernel --skill kernel-design --yes

# Into a repo (pinned in that repo's skills-lock.json)
cd ~/Developer/<repo>
npx skills add ponti-studios/kernel --skill ship-ios --skill studio-dev --yes
```

Refresh with `npx skills update -g --yes` (global) or `npx skills experimental_install --yes` from a repo root (restores its lockfile). Nothing is ever pushed to installed copies — an update only lands when the consumer pulls it.

## Skills

Grouped as in [skills.sh.json](skills.sh.json). Every directory under `skills/` is one skill; each has a `SKILL.md` entrypoint plus optional `scripts/`, `references/`, and `agents/` material.

### Writing

- `write-docs` (repo docs, PRDs, task plans, audit reports, runbooks)
- `write-essay` (approval-driven short-form essays → posts/video)
- `write-video-script` (direct idea-to-camera scripts)
- `write-brief` (transcript → operational research brief)
- `write-incident-report`
- `phrase-audit` (stock-phrase audit for a Markdown corpus)

### Development

- `kernel-dev-api`, `kernel-dev-auth`, `kernel-dev-build`, `kernel-dev-database`, `kernel-dev-docker`
- `kernel-dev-react`, `kernel-dev-react-native`, `native-ios-builder`, `kernel-dev-testing`, `kernel-dev-typescript`
- `kernel-git-commit`, `kernel-clean-code`
- `pr-comments` (PR review triage), `react-doctor` (React health), `ponti-principles` (the standing laws, all domains)

### UI & Brand

- `kernel-animate`, `kernel-design`
- `brand-asset-sourcing`

General UI/design-system guidance isn't a kernel skill — use [anthropics/skills](https://github.com/anthropics/skills) (`frontend-design`) and [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) instead.

### Audit

- `kernel-audit-integration-security`, `kernel-audit-security`, `kernel-audit-monorepo`, `kernel-audit-review`
- `kernel-audit-swiftui`, `kernel-audit-trace`
- `deep-repo-code-scan`

### Operations

- `kernel-ops-production`, `kernel-ops-ship`
- `ship-ios` (unified branch-to-TestFlight lifecycle), `dependabot-batch`

### Studio Ops

- `film-production`, `plan-to-tasks`, `project-operations`, `workshop-design`
- `studio-dev` (studio repo convention: shared verbs, ports, habits)

### Studio

- `studio-core`, `studio-script`, `studio-scenes`, `studio-clips`, `studio-essay`, `studio-social`, `studio-video`
- `studio-imagegen`, `studio-mediagen`, `studio-podcastgen`, `studio-ledger`, `studio-universe`

### Media & Data

- `image-model-craft`, `programmatic-video`, `llm-structured-extraction`, `file-organization`, `macos-complete-uninstall`

---

Each skill is a directory under `skills/`. See [AGENTS.md](AGENTS.md) for the contribution contract (frontmatter, catalog parity, validation, deployment).

```bash
python3 scripts/validate_skills.py              # structure, names, catalog parity
muse skills validate skills/<skill> --json     # format (must report valid: true)
```

Licensed under the MIT License. Skills authored by [Ponti Studios](https://github.com/ponti-studios).
