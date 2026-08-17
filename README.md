# Kernel

[![skills.sh](https://skills.sh/b/ponti-studios/kernel)](https://skills.sh/ponti-studios/kernel)

A collection of 31 independently installable agent skills for software development and content production. The repository structure and catalog are validated by `scripts/validate_skills.py`.

## Install

```bash
# All skills
npx skills add ponti-studios/kernel --all --yes

# Specific skills
npx skills add ponti-studios/kernel --skill kernel-write --yes
npx skills add ponti-studios/kernel --skill kernel-dev-react-native --yes
```

## Skills

### Writing
- `kernel-write`
- `write-incident-report`

### Music
- `kernel-music-rap`
- `kernel-music-song`

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
- `kernel-ui` (consolidated: Apple design, brand governance, a11y audit, brandkit, token build, Figma, image-to-code, design-system interop, library selection, performance, redesign, UX writing)

General UI/design-system guidance isn't a kernel skill — use [anthropics/skills](https://github.com/anthropics/skills) (`frontend-design`) and [plugin87/ux-ui-agent-skills](https://github.com/plugin87/ux-ui-agent-skills) instead.

### Hominem
- `kernel-hominem-database`
- `kernel-hominem-resource`
- `kernel-hominem-workflow` (pre-push validation + commit scopes)

### Audit
- `kernel-audit-integration-security`
- `kernel-audit-monorepo`
- `kernel-audit-review`
- `kernel-audit-swiftui`
- `kernel-audit-trace`

### Operations
- `kernel-ops-docs-publish`
- `kernel-ops-production`
- `kernel-ops-ship`

---

## Library structure

See [docs/SKILL-LIBRARY.md](docs/SKILL-LIBRARY.md) for the canonical skill layout, entrypoint contract, catalog rules, and contribution workflow.

```bash
python3 scripts/validate_skills.py
```

Licensed under the MIT License.

Skills authored by [Ponti Studios](https://github.com/ponti-studios).
