# AGENTS.md

## Deployment

This repo has no build or release step — the git repository itself is the deployed artifact. Consumers install skills directly from GitHub via the `skills` CLI (`npx skills`), so shipping a change is just: validate, commit, push to `main`.

### Pipeline

1. **Validate locally.**
   ```bash
   python3 scripts/validate_skills.py
   python3 -m unittest discover -s tests
   ```
   The validator enforces standard Agent Skills fields, known-field handling,
   skill names, local links, and catalog parity. Existing kernel-only fields
   (`when`, `outputs`, `termination`, and related extensions) warn during the
   migration period. New skills should use standard frontmatter and put
   instructions in the Markdown body. Run
   `python3 scripts/validate_skills.py --strict-frontmatter` to see whether
   the catalog is ready to reject all legacy fields.

2. **Commit and push to `main`.**
   ```bash
   git add skills/<changed-skill>/SKILL.md
   git commit -m "..."
   git push origin main
   ```
   There is no staging environment and no release tag — a merge to `main` *is* the deploy. Treat `main` accordingly: run the validator before pushing, not after.

3. **CI re-validates.** [.github/workflows/validate-skills.yml](.github/workflows/validate-skills.yml) runs `validate_skills.py` on every push and PR that touches `skills/**`, `skills.sh.json`, the validator, or the workflow file itself. It's a backstop, not the primary gate — always run the validator locally first.

4. **Consumers pull explicitly.** Nothing is pushed to installed copies. Anyone who installed a skill from this repo (`npx skills add ponti-studios/kernel ...`) only gets the change when they run:
   ```bash
   npx skills update            # everything installed from this source
   npx skills update <skill> -g # a single global skill
   ```
   Check what's actually installed from this repo with `npx skills list --json` / `npx skills list -g --json` (look for `sourceUrl: https://github.com/ponti-studios/kernel.git`) before assuming an update is even relevant.

### Adding or renaming a skill

A new skill directory needs an entry in [skills.sh.json](skills.sh.json)'s `groupings` or the validator fails with `missing from skills.sh.json`. Renaming `name:` in frontmatter without renaming the directory (or vice versa) fails with a `name '...' does not match directory '...'` error — keep them in lockstep.

### Vendored content is exempt

Nested `SKILL.md` files vendored under a parent skill (e.g. `skills/kernel-audit-security/reviews/*/SKILL.md`, `skills/kernel-audit-security/audit-methodology/SKILL.md`) are not separately catalogued in `skills.sh.json` and are loaded on demand by their parent skill's instructions rather than installed independently — they don't need to satisfy the top-level catalog-parity check, only valid frontmatter.
