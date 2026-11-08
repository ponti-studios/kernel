# GitHub Issues Management

Create, search, triage, and manage GitHub issues. Each section shows `gh` first, then the `curl` fallback.

## Prerequisites

- Authenticated with GitHub (see `references/auth.md`)
- `SKILL_DIR` below is the directory containing this skill's `SKILL.md`
- Inside a git repo with a GitHub remote, or specify the repo explicitly

### Setup

```bash
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  AUTH="gh"
else
  AUTH="git"
  if [ -z "$GITHUB_TOKEN" ]; then
    if _hermes_env="${HERMES_HOME:-$HOME/.hermes}/.env"; [ -f "$_hermes_env" ] && grep -q "^GITHUB_TOKEN=" "$_hermes_env"; then
      GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" "$_hermes_env" | head -1 | cut -d= -f2 | tr -d '\n\r')
    elif grep -q "github.com" ~/.git-credentials 2>/dev/null; then
      GITHUB_TOKEN=$(uv run python "$SKILL_DIR/scripts/git-credential-token.py")
    fi
  fi
fi

REMOTE_URL=$(git remote get-url origin)
OWNER_REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]||; s|\.git$||')
OWNER=$(echo "$OWNER_REPO" | cut -d/ -f1)
REPO=$(echo "$OWNER_REPO" | cut -d/ -f2)
```

---

## 1. Viewing Issues

**With gh:**

```bash
gh issue list
gh issue list --state open --label "bug"
gh issue list --assignee @me
gh issue list --search "authentication error" --state all
gh issue view 42
```

**With curl:**

```bash
# List open issues
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/issues?state=open&per_page=20" \
  | python -c "
import sys, json
for i in json.load(sys.stdin):
    if 'pull_request' not in i:  # GitHub API returns PRs in /issues too
        labels = ', '.join(l['name'] for l in i['labels'])
        print(f\"#{i['number']:5}  {i['state']:6}  {labels:30}  {i['title']}\")"

# Filter by label
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/issues?state=open&labels=bug&per_page=20" \
  | python -c "
import sys, json
for i in json.load(sys.stdin):
    if 'pull_request' not in i:
        print(f\"#{i['number']}  {i['title']}\")"

# View a specific issue
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42 \
  | python -c "
import sys, json
i = json.load(sys.stdin)
labels = ', '.join(l['name'] for l in i['labels'])
assignees = ', '.join(a['login'] for a in i['assignees'])
print(f\"#{i['number']}: {i['title']}\")
print(f\"State: {i['state']}  Labels: {labels}  Assignees: {assignees}\")
print(f\"Author: {i['user']['login']}  Created: {i['created_at']}\")
print(f\"\n{i['body']}\")"

# Search issues
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/search/issues?q=authentication+error+repo:$OWNER/$REPO" \
  | python -c "
import sys, json
for i in json.load(sys.stdin)['items']:
    print(f\"#{i['number']}  {i['state']:6}  {i['title']}\")"
```

## 2. Creating Issues

**With gh:**

```bash
gh issue create \
  --title "Login redirect ignores ?next= parameter" \
  --body "## Description
After logging in, users always land on /dashboard.

## Steps to Reproduce
1. Navigate to /settings while logged out
2. Get redirected to /login?next=/settings
3. Log in
4. Actual: redirected to /dashboard (should go to /settings)

## Expected Behavior
Respect the ?next= query parameter." \
  --label "bug,backend" \
  --assignee "username"
```

**With curl:**

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues \
  -d '{
    "title": "Login redirect ignores ?next= parameter",
    "body": "## Description\nAfter logging in, users always land on /dashboard.\n\n## Steps to Reproduce\n1. Navigate to /settings while logged out\n2. Get redirected to /login?next=/settings\n3. Log in\n4. Actual: redirected to /dashboard\n\n## Expected Behavior\nRespect the ?next= query parameter.",
    "labels": ["bug", "backend"],
    "assignees": ["username"]
  }'
```

### Bug Report Template

```
## Bug Description
<What's happening>

## Steps to Reproduce
1. <step>
2. <step>

## Expected Behavior
<What should happen>

## Actual Behavior
<What actually happens>

## Environment
- OS: <os>
- Version: <version>
```

### Feature Request Template

```
## Feature Description
<What you want>

## Motivation
<Why this would be useful>

## Proposed Solution
<How it could work>

## Alternatives Considered
<Other approaches>
```

## 3. Managing Issues

### Add/Remove Labels

**With gh:**

```bash
gh issue edit 42 --add-label "priority:high,bug"
gh issue edit 42 --remove-label "needs-triage"
```

**With curl:**

```bash
# Add labels
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/labels \
  -d '{"labels": ["priority:high", "bug"]}'

# Remove a label
curl -s -X DELETE \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/labels/needs-triage

# List available labels in the repo
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/labels \
  | python -c "
import sys, json
for l in json.load(sys.stdin):
    print(f\"  {l['name']:30}  {l.get('description', '')}\")"
```

### Assignment

**With gh:**

```bash
gh issue edit 42 --add-assignee username
gh issue edit 42 --add-assignee @me
```

**With curl:**

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/assignees \
  -d '{"assignees": ["username"]}'
```

### Commenting

**With gh:**

```bash
gh issue comment 42 --body "Investigated — root cause is in auth middleware. Working on a fix."
```

**With curl:**

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42/comments \
  -d '{"body": "Investigated — root cause is in auth middleware. Working on a fix."}'
```

### Closing and Reopening

**With gh:**

```bash
gh issue close 42
gh issue close 42 --reason "not planned"
gh issue reopen 42
```

**With curl:**

```bash
# Close
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42 \
  -d '{"state": "closed", "state_reason": "completed"}'

# Reopen
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/issues/42 \
  -d '{"state": "open"}'
```

### Linking Issues to PRs

Issues are automatically closed when a PR merges with the right keywords in the body:

```
Closes #42
Fixes #42
Resolves #42
```

To create a branch from an issue:

**With gh:**

```bash
gh issue develop 42 --checkout
```

**With git (manual equivalent):**

```bash
git checkout main && git pull origin main
git checkout -b fix/issue-42-login-redirect
```

## 4. Issue Triage Workflow

When asked to triage issues:

1. **List untriaged issues:**

```bash
# With gh
gh issue list --label "needs-triage" --state open

# With curl
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/issues?labels=needs-triage&state=open" \
  | python -c "
import sys, json
for i in json.load(sys.stdin):
    if 'pull_request' not in i:
        print(f\"#{i['number']}  {i['title']}\")"
```

2. **Read and categorize** each issue (view details, understand the bug/feature)

3. **Apply labels and priority** (see Managing Issues above)

4. **Assign** if the owner is clear

5. **Comment with triage notes** if needed

## 5. Bulk Operations

For batch operations, combine API calls with shell scripting:

**With gh:**

```bash
# Close all issues with a specific label
gh issue list --label "wontfix" --json number --jq '.[].number' | \
  xargs -I {} gh issue close {} --reason "not planned"
```

**With curl:**

```bash
# List issue numbers with a label, then close each
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/issues?labels=wontfix&state=open" \
  | python -c "import sys,json; [print(i['number']) for i in json.load(sys.stdin)]" \
  | while read num; do
    curl -s -X PATCH \
      -H "Authorization: token $GITHUB_TOKEN" \
      https://api.github.com/repos/$OWNER/$REPO/issues/$num \
      -d '{"state": "closed", "state_reason": "not_planned"}'
    echo "Closed #$num"
  done
```

## 6. Filing a batch from a prioritised list

When the ask is "turn these into issues so we can work through them one by one", file one issue per item in
one pass — and make the resulting list usable.

- **Write bodies to files and pass `--body-file`.** A markdown body with backticks, quotes, an em dash or a
  table will not survive shell quoting intact; a file has no quoting layer at all. Keep a TSV manifest
  (`repo<TAB>title<TAB>body-path`) and loop it, so the batch is re-runnable:

```bash
while IFS=$'\t' read -r repo title body; do
  [ -n "$repo" ] || continue
  gh issue create --repo "$repo" --title "$title" --body-file "$body"
done < manifest.tsv
```

- **File in reverse priority order.** `gh issue list` sorts newest first, so creating the least urgent item
  first and the most urgent last leaves the list reading top-down in the order you would work it. Name the
  top item rather than making the user infer it.
- **One issue per actionable item; split anything bundled.** "Notarize the DMG and add an update path" is two
  deliverables with different blockers, and one issue hides whichever finishes first.
- **Every body carries its own evidence, its place in the code, and a "done when".** The measured numbers,
  file and symbol names, and the check that proves it — an issue that restates its title is a note, not work
  a later session can pick up cold.
- **File what the list did not include, and say so.** Open decisions from earlier in the conversation, and
  fixes belonging to a _different_ repo (a shared library, the site), get forgotten otherwise — add them,
  put the cross-repo one in that repo, and label which ones were yours to add.
- **Verify the batch landed:** count them back
  (`gh issue list --repo <o>/<r> --limit 30 --json number,title --jq length`) against what you filed, and
  `gh issue view N --json body --jq .body` once to prove a body arrived with its formatting intact.
- **Close with the evidence, not the claim.** Carry what was verified (the measured line, the end-to-end run,
  the test count), what was deliberately **not** done and why, and where the remainder of the idea moved to. A
  close without that reads as abandoned work. **Put the comment in a file and pass it as
  `gh issue close N --comment "$(cat comment.md)"`** — a multi-paragraph body inline, or one interpolated from
  another language's quoted string, fails on the newlines with `unexpected EOF while looking for matching '`
  and leaves the issue _open_ while the command appears to have run. Confirm it took:
  `gh issue view N --json state,comments --jq '"\(.state) \(.comments|length)"'`.

## 7. Moving issues to another repository

`gh issue transfer <N> <destination-repo> --repo <source>` works private→private and public→public, and is
**refused for private→public**: `GraphQL: Old issue cannot be transferred from private repository to public
repository`. That is policy, not a permission you can grant. When a private app repo is folded into a public
one, recreate instead — and the numbering survives, because numbers are assigned in creation order and a fresh
destination has none.

```bash
# snapshot title, body, state and the whole discussion
gh issue view N --repo <source> --json title,body,state,comments > issue.json
# recreate in ascending order, then replay each comment as its own comment (not appended to the body)
gh issue create --repo <destination> --title "…" --body-file body.md
gh issue comment <new-number> --repo <destination> --body-file comment.md
# restore the state, keeping the original reason where it was "not planned"
gh issue close <new-number> --repo <destination> --reason completed
```

- **Check the destination is empty first** (`gh issue list --repo <destination> --state all --json number --jq
  length`). If it already has issues, the originals cannot keep their numbers, so say which mapping you used.
- **Verify the thread, not just the issue.** Compare `--json comments --jq '.comments|length'` old against new
  on the ones that had discussion; a body-only copy loses the reasoning that made the issue re-openable.
- **The loop-breakers:** an **archived** repo refuses every write (unarchive, migrate, re-archive), and the
  source must still be readable to snapshot it — so migrate before archiving, never after.
- **Note the origin** in each copy (one line: carried over from `<repo>`), so a gap or a re-numbered issue is
  explainable a year later.

## Quick Reference Table

| Action       | gh                                   | curl endpoint                            |
| ------------ | ------------------------------------ | ---------------------------------------- |
| List issues  | `gh issue list`                      | `GET /repos/{o}/{r}/issues`              |
| View issue   | `gh issue view N`                    | `GET /repos/{o}/{r}/issues/N`            |
| Create issue | `gh issue create ...`                | `POST /repos/{o}/{r}/issues`             |
| Add labels   | `gh issue edit N --add-label ...`    | `POST /repos/{o}/{r}/issues/N/labels`    |
| Assign       | `gh issue edit N --add-assignee ...` | `POST /repos/{o}/{r}/issues/N/assignees` |
| Comment      | `gh issue comment N --body ...`      | `POST /repos/{o}/{r}/issues/N/comments`  |
| Close        | `gh issue close N`                   | `PATCH /repos/{o}/{r}/issues/N`          |
| Search       | `gh issue list --search "..."`       | `GET /search/issues?q=...`               |
