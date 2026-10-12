# Kernel

[![skills.sh](https://skills.sh/b/ponti-studios/kernel)](https://skills.sh/ponti-studios/kernel)

A collection of independently installable agent skills for software development and content production. The repository structure and catalog are validated by `scripts/validate_skills.py`.

## Install

```bash
# All skills
npx skills add ponti-studios/kernel --all --yes

# Specific skills
npx skills add ponti-studios/kernel --skill kernel-design --yes
npx skills add ponti-studios/kernel --skill kernel-dev-react-native --yes
```

## Skills

### Writing

- `write-docs` (repo docs, PRDs, task plans, audit reports, runbooks)
- `write-essay` (approval-driven short-form essays → posts/video)
- `write-video-script` (direct idea-to-camera scripts)
- `write-brief` (transcript → operational research brief)
- `write-incident-report`

### Studio Ops

- `film-production`
- `plan-to-tasks`
- `project-operations`
- `workshop-design`

### Image

- `kernel-image`

### Development

- `kernel-dev-api`
- `kernel-dev-auth`
- `kernel-dev-build`
- `kernel-dev-database`
- `kernel-dev-docker`
- `kernel-dev-react`
- `kernel-dev-react-native`
- `kernel-dev-testing`
- `kernel-dev-typescript`
- `kernel-git-commit`
- `kernel-clean-code` (consolidated: AI-slop removal, code smells, branch deslop, tech-debt audit)

### Brand

- `kernel-animate` (consolidated: build, Emil's craft philosophy, vocabulary, opportunities, improve, review, recipes, standards)
- `kernel-design` (consolidated: Apple design, brand governance, a11y audit, brandkit, token build, Figma, image-to-code, design-system interop, library selection, performance, redesign, UX writing, personal style rules)

General UI/design-system guidance isn't a kernel skill — use [anthropics/skills](https://github.com/anthropics/skills) (`frontend-design`) and [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) instead.

### Audit

- `kernel-audit-integration-security`
- `kernel-audit-security` (consolidated: OWASP domain reviews + exploit-evidence offensive audit methodology)
- `kernel-audit-monorepo`
- `kernel-audit-review`
- `kernel-audit-swiftui`
- `kernel-audit-trace`

### Operations

- `kernel-ops-production`
- `kernel-ops-ship`

---

## Library structure

Each skill is a directory under `skills/` with a `SKILL.md` entrypoint, listed in [skills.sh.json](skills.sh.json). See [AGENTS.md](AGENTS.md) for the catalog rules, validation contract, and deployment workflow.

```bash
python3 scripts/validate_skills.py
```

Licensed under the MIT License.

Skills authored by [Ponti Studios](https://github.com/ponti-studios).
