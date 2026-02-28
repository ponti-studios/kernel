# Branch Consolidation: dev → main only

## Status: ✅ COMPLETE

Created: 2026-02-22
Plan: `.opencode/plans/branch-workflow-consolidation-main-only.md`

## Execution Summary

### Phase 1: Local Cleanup ✅

- Deleted local `master` branch (which was created during initial planning)

### Phase 2-4: File Updates ✅

**Workflows (2 files)**

- .github/workflows/ci.yml: Updated to `branches: [main]`, removed master/dev checks
- .github/workflows/cla.yml: Updated CLA trigger branch to "main"

**Issue Templates (3 files)**

- .github/ISSUE_TEMPLATE/bug_report.yml
- .github/ISSUE_TEMPLATE/feature_request.yml
- .github/ISSUE_TEMPLATE/general.yml
  All updated: `blob/dev/` → `blob/main/`

**Documentation (4 files)**

- AGENTS.md: Updated PR target instruction to reference `main`
- README.md: Updated both installation links to reference `main`
- docs/getting-started/installation.md: Updated both refs to `main`
- docs/skills.yml: Updated metadata branch to "main"

**Total: 9 files updated**

### Phase 5: Remote Cleanup ✅

- Deleted remote `dev` branch via `git push origin --delete dev`
- Deleted local `dev` branch via `git branch -d dev`

## Verification Results

✅ Branches: No dev or master branches remain
✅ Workflows: Both CI and CLA target `main` only
✅ References: Zero dev/master refs found (except external links like ankane/_, ollama/_)
✅ Documentation: All internal refs updated to `main`
✅ Git: All changes committed with atomic commits

## Commits Created

1. 171dee9 - ci: update workflows to target main branch instead of dev
2. 0490de3 - docs: update issue templates to reference main branch
3. 008dd56 - docs: update all documentation to reference main branch

## Final Branch State

Local branches:

- main (active)
- 042-reorganize-repo-topology
- 043-agent-consolidation-spec
- refactor/compound-agent-renaming
- refactor/compound-to-learnings
- refactor/repo-topology

Remote branches:

- origin/main (default)
- origin/043-agent-consolidation-spec
- origin/backup-before-filter-20260222
- origin/refactor/\* branches
- origin/042-reorganize-repo-topology

## Next Steps

1. Push commits to remote: `git push origin main`
2. Set `main` as default branch in GitHub UI (if not already)
3. Update any CI/CD settings to use `main`
4. Archive or delete any old docs referencing `dev`
