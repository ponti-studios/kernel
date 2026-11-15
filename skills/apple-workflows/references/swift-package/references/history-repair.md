# Repairing git history that drifted

Two shapes, both routine when a shared package has been around a while: commits sitting on a branch they
must not be on, and a tag that is not an ancestor of the default branch.

## Commits landed on the default branch

**Read the repo's own rules before the first commit, not after.** A repository can carry agent instructions —
`AGENTS.md`, `CLAUDE.md`, `.claude/skills/<name>/` (commonly a `ship` skill) — that override the default commit
cadence: one branch and one open PR per body of work, commit and push without being asked but **never merge or
deploy until told**, a required PR description shape, a check suite to report verbatim.

```bash
ls AGENTS.md CLAUDE.md 2>/dev/null; ls .claude/skills .agents/skills 2>/dev/null
```

A protected instruction file (fetch or edit blocked) is not an obstacle to route around: leave it alone and say
which line of it is now out of date.

Check before committing, not once at session start — a `git reset`, a stash pop or a checkout in another
window leaves you on the default branch and the commit lands where the repo forbids it.

```bash
git branch --show-current
git log --oneline '@{u}..HEAD'      # what is ahead of the published branch
```

With the commits already made and nothing else in the tree:

```bash
git switch -c <branch>                      # the commits are now on <branch>
git switch main && git reset --hard '@{u}'   # default back to its published state
git switch <branch>
```

With uncommitted work in progress the safe order is `git stash -u` (the `-u` matters: new files are the
thing a plain stash loses), cut the branch from `origin/main`, re-apply the change there, then reset the
local default and drop the stash.

Two traps in the recovery itself:

- **Do not `git reset --hard` while a cherry-pick or stash pop left unmerged paths.** The reset refuses and
  the index stays poisoned (`needs merge` on every later command). Abort the cherry-pick first, then
  re-apply.
- **A cherry-pick onto a moved base conflicts on every file upstream touched.** Re-applying a small change by
  hand on a fresh branch is faster and safer than resolving that, and it keeps the diff honest.

## A tag that is not an ancestor of the default branch

Symptom: a file appears to have vanished with no deletion commit, and `git tag --contains <commit>` answers
the wrong question.

```bash
for t in $(git tag | sort -V); do
  git merge-base --is-ancestor "$t" main || echo "$t is not on main's line"
done
git log --graph --oneline --decorate --all -20
```

The graph shows the side line. Find what only it holds — `git diff --name-status <tag> main`, and read the
`D` rows (present in the tag, missing from the default branch). Then connect the histories with a merge that
keeps the current code:

```bash
git merge --no-ff -X ours <tag-tip> -m "Merge <branch>: <tag> tagged a branch that was never merged"
```

`-X ours` keeps the current tree for conflicting files and still takes files that exist only on the other
line. Confirm with `git diff --name-status <before> HEAD` that only the intended changes arrived, then build
and test: a stray test file from the old line can land in the same merge and fail on a path you did not
change.

Rules that keep this honest:

- **Never repoint a published tag.** Existing tags still will not `--contains` the grafted commit, and that
  is correct — they were genuinely built without it. Only later tags descend from both lines.
- **Say which question the merge answers.** Ancestry is repaired for future releases; historical tags keep
  describing what they described.
- **Name the merge commit for the reader**, so an unrelated-looking merge carries its reason with it.
- **Tag a release only if content moved.** Docs or tests landing change nothing a consumer resolves.
