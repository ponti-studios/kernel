# One Branch to Rule Them All: Simplifying Version Control

**Date**: February 2026  
**Audience**: Development teams reconsidering multi-branch strategies

---

## Why This Document Exists

Git branch strategies are among the most debated topics in software engineering. Teams invest significant energy in elaborate branching models—develop branches, release branches, hotfix branches, feature branch prefixes—believing that sophisticated strategies prevent chaos.

This document explains why we consolidated from multiple active branches to a single main branch, what we learned about branch complexity, and how the simplification reduced friction without sacrificing safety.

---

## The Problem: Complexity Without Clarity

### The Starting State

Before consolidation, the repository had three named branches in active use:

- `main`: The primary branch, but with an unclear relationship to development
- `dev`: An integration branch for ongoing work
- `master`: A relic branch created during initial planning, never used

The relationships were unclear:
- What was deployed from which branch?
- When did code move from `dev` to `main`?
- What was `master` for?

### Documentation Fragmentation

The confusion extended to documentation. Files referenced different branches:

- `.github/workflows/ci.yml`: Referenced `dev` in branch filters
- `.github/workflows/cla.yml`: Referenced `main` in branch filters
- `.github/ISSUE_TEMPLATE/*`: Mixed references to `dev` and `main`
- `README.md`: Installation links pointed to `dev`
- `docs/getting-started/installation.md`: Installation links pointed to `dev`
- `docs/skills.yml`: Metadata branch pointed to `dev`

Every piece of documentation was a potential source of confusion. Users following different documents would get different instructions.

### The CI/CD Paradox

Continuous integration should provide fast feedback. But with multiple integration points:

1. Each branch required CI runs
2. Pull requests between branches required additional validation
3. The "correct" branch to target was unclear in ambiguous situations

The complexity was invisible in calm periods and overwhelming during incidents.

---

## The Decision: Main Only

### Why Not Keep Dev?

The most common objection to main-only development is: "But we need somewhere to integrate before production!"

The answer depends on what you mean by "integrate." If integration means "make sure all features work together," this can happen on main through feature flags, branch-by-abstraction, or careful sequencing of deployments.

If integration means "make sure nothing is broken before deploying," this is what CI is for.

### What We Rejected

**GitFlow**: Keep `develop` for integration, `main` for releases, use `feature/*` prefixes, have `release/*` branches for prepared releases, `hotfix/*` for urgent fixes.

Rejected because: The complexity of GitFlow is well-documented. Feature branches merge to develop, develop merges to main, main is tagged for releases. The mental model requires understanding four types of branches and when to use each. For most projects, the overhead exceeds the benefit.

**Trunk-based development with feature flags**: All features behind flags, merged to main continuously, flags control visibility.

Rejected as the primary strategy because: Feature flags work for production code, but the Ghostwire codebase has significant configuration that isn't flaggable. The cognitive overhead of tracking which features are enabled where exceeded the benefit.

**Keep develop, rename master to main**: Minimal change, clear naming.

Rejected because: `dev` and `develop` are the same confusion with different names. The goal was clarity, not cosmetic change.

### What We Chose

Single-branch development:
- `main` is the only protected branch
- All work merges directly to main through pull requests
- CI validates every PR
- Feature branches are short-lived (days, not weeks)
- Hotfixes are just branches merged quickly

---

## The Execution

### Phase 1: Documentation Audit

Before touching branches, we audited all documentation references:

| File Type | Count | Update Required |
|-----------|-------|-----------------|
| Workflows | 2 | Update branch filters |
| Issue Templates | 3 | Update links |
| Documentation | 4 | Update links |
| Config | 1 | Update metadata |

This gave us a complete picture of the blast radius.

### Phase 2: File Updates

All files were updated to reference `main` consistently:

```yaml
# Before (ci.yml)
on:
  push:
    branches: [dev]

# After
on:
  push:
    branches: [main]
```

The changes were mechanical but thorough. Every reference to `dev` or `master` was updated to `main`.

### Phase 3: Branch Cleanup

With documentation updated, the old branches were deleted:

```bash
git push origin --delete dev
git branch -d dev
git branch -d master
```

### Phase 4: GitHub Settings

The final step was updating GitHub repository settings:
- Set `main` as the default branch
- Remove protection rules for `dev` and `master`
- Update any branch restriction rules

---

## What Was Not Changed

**Feature branches**: Developers still create feature branches for work in progress. The naming convention (`042-reorganize-repo-topology`, `refactor/compound-agent-renaming`) remains.

**Pull request workflow**: PRs are still required for merges to main. CI must pass. Code review is still expected.

**Deployment strategy**: The deployment process (whatever it was) remains unchanged. This change affected only source control, not deployment.

---

## Transferable Insights

### 1. Complexity Is a Cost

Every branch is a path that must be maintained, documented, and understood. Every workflow that branches is a workflow that must be explained. The cost of complexity is paid continuously; the benefit is often marginal.

Ask not "what does this complexity protect us from?" but "what does this complexity cost us every day?" Usually, the answer surprises.

### 2. Single Source of Truth

When there's one branch, there's one truth. "Is this in production?" has one answer. "Which version has my fix?" has one answer. "What should I base my work on?" has one answer.

Multiple branches create multiple truths. The reconciliation between them is overhead.

### 3. CI Is the Integration Point

Modern CI systems can validate any change thoroughly. If your CI is slow, fix your CI. If your CI is unreliable, fix your CI. If your CI is missing coverage, add coverage.

But don't maintain parallel integration paths (develop branch) because you don't trust your CI. The develop branch is the expensive, manual solution to a CI problem.

### 4. The Merge is the Integration

In a single-branch model, integration happens at merge time. This is where CI validates the combined state. This is where code review happens. This is where the decision to include or exclude is made.

In a multi-branch model, integration happens twice: once when features merge to develop, and again when develop merges to main. Each integration is an opportunity for conflict and confusion.

### 5. Documentation References Are Fragments

Documentation that references branches is documentation that will become stale or incorrect. The safest documentation refers to concepts, not specific branch names.

If your documentation must reference branches, it should reference the *canonical* branch (the only one), not the many.

---

## The Rule Going Forward

**There is only one branch: `main`.** All work merges to it through pull requests. No other branches are created for integration purposes.

Feature branches are still used for work in progress, but they're short-lived, merged when ready, and deleted after merge.

This rule is enforced through GitHub settings and team convention, not technical constraints.
