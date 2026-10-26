# AGENTS.md

This repo has no build or release step. The git repository is the deployed artifact: consumers install skills straight from GitHub with `npx skills`, so shipping a change is validate, commit, push to `main`.

## Pipeline

1. **Validate locally.** The kernel validator plus the unit tests, then `muse` for format:
   ```bash
   python3 scripts/validate_skills.py
   python3 -m unittest discover -s tests
   muse skills validate skills/<skill> --json
   ```
   The kernel validator enforces only what `muse` cannot: a parseable frontmatter block with a usable `name` and `description`, `name` matching its directory, local links resolving, and every skill catalogued in [skills.sh.json](skills.sh.json). Any top-level frontmatter keys are accepted — format ownership belongs to `muse skills validate`, so a skill must pass there too before it ships.

2. **Commit with a Conventional Commits message.** Stage exactly the skill you touched — never `git add -A`:
   ```bash
   git add skills/<skill>/SKILL.md
   git commit -m "feat(skills): ..."
   git push origin main
   ```
   No branches, no tags, no staging environment: a merge to `main` *is* the deploy. Run the validator before pushing, not after.

3. **CI re-validates.** [.github/workflows/validate-skills.yml](.github/workflows/validate-skills.yml) runs both validator modes plus the unit tests on every push and PR touching `skills/**`, `skills.sh.json`, the validator, or the workflow itself. It is a backstop, not the gate — the gate is step 1.

4. **Consumers pull explicitly.** Nothing is pushed to installed copies:
   ```bash
   npx skills update -g --yes          # everything global
   npx skills update <skill> -g --yes  # one global skill
   cd ~/Developer/<repo> && npx skills experimental_install --yes  # restore a repo's lockfile
   ```
   Check what is actually installed from this repo with `npx skills list --json` / `npx skills list -g --json` (look for `sourceUrl: https://github.com/ponti-studios/kernel.git`) before assuming an update matters.

## Adding or renaming a skill

A new directory under `skills/` needs an entry in `skills.sh.json`'s `groupings`, or validation fails with `missing from skills.sh.json`. Frontmatter `name:` must equal the directory name — a mismatch fails with `name '...' does not match directory '...'`. Keep all three in lockstep, and list the skill in `README.md` under its group.

## Consuming from a repo

Repos install only the skills they execute (e.g. `ship-ios` + `studio-dev` for the shipping pipeline) via project-scope install, which writes `skills-lock.json` plus `.agents/skills/` copies and `.claude/skills` links:

```bash
cd ~/Developer/<repo>
npx skills add ponti-studios/kernel --skill ship-ios --skill studio-dev --yes
```

Repo code resolves the installed skills through paths derived at runtime (`justfile_directory()`, `BASH_SOURCE`, explicit `--path` / `--skills-dir` flags). Never hardwire a checkout location, and never hand-copy or symlink a skill into a repo — the tool owns the copies.

## Vendored content is exempt

Nested `SKILL.md` files under a parent skill (e.g. `skills/kernel-audit-security/reviews/*/SKILL.md`, `skills/kernel-audit-security/audit-methodology/SKILL.md`) are not separately catalogued in `skills.sh.json`. They load on demand through their parent skill's instructions rather than installing independently, so they need valid frontmatter only — no catalog-parity entry.
