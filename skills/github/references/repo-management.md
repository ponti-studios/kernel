# GitHub Repository Management

Create, clone, fork, configure, and manage GitHub repositories. Each section shows `gh` first, then the `git` + `curl` fallback.

## Prerequisites

- Authenticated with GitHub (see `references/auth.md`)
- `SKILL_DIR` below is the directory containing this skill's `SKILL.md`

### Setup

```bash
if command -v gh &>/dev/null && gh auth status &>/dev/null; then
  AUTH="gh"
else
  AUTH="git"
  if [ -z "$GITHUB_TOKEN" ]; then
    if _hominem_env="${HOMINEM_HOME:-$HOME/.hominem}/.env"; [ -f "$_hominem_env" ] && grep -q "^GITHUB_TOKEN=" "$_hominem_env"; then
      GITHUB_TOKEN=$(grep "^GITHUB_TOKEN=" "$_hominem_env" | head -1 | cut -d= -f2 | tr -d '\n\r')
    elif grep -q "github.com" ~/.git-credentials 2>/dev/null; then
      GITHUB_TOKEN=$(uv run python "$SKILL_DIR/scripts/git-credential-token.py")
    fi
  fi
fi

# Get your GitHub username (needed for several operations)
if [ "$AUTH" = "gh" ]; then
  GH_USER=$(gh api user --jq '.login')
else
  GH_USER=$(curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user | python -c "import sys,json; print(json.load(sys.stdin)['login'])")
fi
```

If you're inside a repo already:

```bash
REMOTE_URL=$(git remote get-url origin)
OWNER_REPO=$(echo "$REMOTE_URL" | sed -E 's|.*github\.com[:/]||; s|\.git$||')
OWNER=$(echo "$OWNER_REPO" | cut -d/ -f1)
REPO=$(echo "$OWNER_REPO" | cut -d/ -f2)
```

---

## 1. Cloning Repositories

Cloning is pure `git` — works identically either way:

```bash
# Clone via HTTPS (works with credential helper or token-embedded URL)
git clone https://github.com/owner/repo-name.git

# Clone into a specific directory
git clone https://github.com/owner/repo-name.git ./my-local-dir

# Shallow clone (faster for large repos)
git clone --depth 1 https://github.com/owner/repo-name.git

# Clone a specific branch
git clone --branch develop https://github.com/owner/repo-name.git

# Clone via SSH (if SSH is configured)
git clone git@github.com:owner/repo-name.git
```

**With gh (shorthand):**

```bash
gh repo clone owner/repo-name
gh repo clone owner/repo-name -- --depth 1
```

## 2. Creating Repositories

**With gh:**

```bash
# Create a public repo and clone it
gh repo create my-new-project --public --clone

# Private, with description and license
gh repo create my-new-project --private --description "A useful tool" --license MIT --clone

# Under an organization
gh repo create my-org/my-new-project --public --clone

# From existing local directory
cd /path/to/existing/project
gh repo create my-project --source . --public --push
```

**With git + curl:**

```bash
# Create the remote repo via API
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user/repos \
  -d '{
    "name": "my-new-project",
    "description": "A useful tool",
    "private": false,
    "auto_init": true,
    "license_template": "mit"
  }'

# Clone it
git clone https://github.com/$GH_USER/my-new-project.git
cd my-new-project

# -- OR -- push an existing local directory to the new repo
cd /path/to/existing/project
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/$GH_USER/my-new-project.git
git push -u origin main
```

To create under an organization:

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/orgs/my-org/repos \
  -d '{"name": "my-new-project", "private": false}'
```

### From a Template

**With gh:**

```bash
gh repo create my-new-app --template owner/template-repo --public --clone
```

**With curl:**

```bash
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/owner/template-repo/generate \
  -d '{"owner": "'"$GH_USER"'", "name": "my-new-app", "private": false}'
```

## 3. Forking Repositories

**With gh:**

```bash
gh repo fork owner/repo-name --clone
```

**With git + curl:**

```bash
# Create the fork via API
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/owner/repo-name/forks

# Wait a moment for GitHub to create it, then clone
sleep 3
git clone https://github.com/$GH_USER/repo-name.git
cd repo-name

# Add the original repo as "upstream" remote
git remote add upstream https://github.com/owner/repo-name.git
```

### Keeping a Fork in Sync

```bash
# Pure git — works everywhere
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

**With gh (shortcut):**

```bash
gh repo sync $GH_USER/repo-name
```

## 4. Repository Information

**With gh:**

```bash
gh repo view owner/repo-name
gh repo list --limit 20
gh search repos "machine learning" --language python --sort stars
```

**With curl:**

```bash
# View repo details
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO \
  | python -c "
import sys, json
r = json.load(sys.stdin)
print(f\"Name: {r['full_name']}\")
print(f\"Description: {r['description']}\")
print(f\"Stars: {r['stargazers_count']}  Forks: {r['forks_count']}\")
print(f\"Default branch: {r['default_branch']}\")
print(f\"Language: {r['language']}\")"

# List your repos
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/user/repos?per_page=20&sort=updated" \
  | python -c "
import sys, json
for r in json.load(sys.stdin):
    vis = 'private' if r['private'] else 'public'
    print(f\"  {r['full_name']:40}  {vis:8}  {r.get('language', ''):10}  ★{r['stargazers_count']}\")"

# Search repos
curl -s \
  "https://api.github.com/search/repositories?q=machine+learning+language:python&sort=stars&per_page=10" \
  | python -c "
import sys, json
for r in json.load(sys.stdin)['items']:
    print(f\"  {r['full_name']:40}  ★{r['stargazers_count']:6}  {r['description'][:60] if r['description'] else ''}\")"
```

## 5. Repository Settings

**With gh:**

```bash
gh repo edit --description "Updated description" --visibility public
gh repo edit --enable-wiki=false --enable-issues=true
gh repo edit --default-branch main
gh repo edit --add-topic "machine-learning,python"
gh repo edit --enable-auto-merge
```

**With curl:**

```bash
curl -s -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO \
  -d '{
    "description": "Updated description",
    "has_wiki": false,
    "has_issues": true,
    "allow_auto_merge": true
  }'

# Update topics
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.mercy-preview+json" \
  https://api.github.com/repos/$OWNER/$REPO/topics \
  -d '{"names": ["machine-learning", "python", "automation"]}'
```

## 6. Branch Protection

```bash
# View current protection
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/branches/main/protection

# Set up branch protection
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/branches/main/protection \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["ci/test", "ci/lint"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "required_approving_review_count": 1
    },
    "restrictions": null
  }'
```

## 7. Secrets Management (GitHub Actions)

**With gh:**

```bash
gh secret set API_KEY --body "your-secret-value"
gh secret set SSH_KEY < ~/.ssh/id_rsa
gh secret list
gh secret delete API_KEY
```

**With curl:**

Secrets require encryption with the repo's public key — more involved via API:

```bash
# Get the repo's public key for encrypting secrets
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/secrets/public-key

# Encrypt and set (requires Python with PyNaCl)
python -c "
from base64 import b64encode
from nacl import encoding, public
import json, sys

# Get the public key
key_id = '<key_id_from_above>'
public_key = '<base64_key_from_above>'

# Encrypt
sealed = public.SealedBox(
    public.PublicKey(public_key.encode('utf-8'), encoding.Base64Encoder)
).encrypt('your-secret-value'.encode('utf-8'))
print(json.dumps({
    'encrypted_value': b64encode(sealed).decode('utf-8'),
    'key_id': key_id
}))"

# Then PUT the encrypted secret
curl -s -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/secrets/API_KEY \
  -d '<output from python script above>'

# List secrets (names only, values hidden)
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/secrets \
  | python -c "
import sys, json
for s in json.load(sys.stdin)['secrets']:
    print(f\"  {s['name']:30}  updated: {s['updated_at']}\")"
```

Note: For secrets, `gh secret set` is dramatically simpler. If setting secrets is needed and `gh` isn't available, recommend installing it for just that operation.

## 8. Releases

**With gh:**

```bash
gh release create v1.0.0 --title "v1.0.0" --generate-notes
gh release create v2.0.0-rc1 --draft --prerelease --generate-notes
gh release create v1.0.0 ./dist/binary --title "v1.0.0" --notes "Release notes"
gh release list
gh release download v1.0.0 --dir ./downloads

**Pitfalls (releases):**
- A repository must have at least one commit before `gh release create` — an empty repo returns HTTP 422 "Repository is empty."
- Create the repo, push an initial commit, then create the release.
- Prefer `gh release create v1.0.0 ./dist/binary` to attach the asset in one step.
```

**With curl:**

```bash
# Create a release
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/releases \
  -d '{
    "tag_name": "v1.0.0",
    "name": "v1.0.0",
    "body": "## Changelog\n- Feature A\n- Bug fix B",
    "draft": false,
    "prerelease": false,
    "generate_release_notes": true
  }'

# List releases
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/releases \
  | python -c "
import sys, json
for r in json.load(sys.stdin):
    tag = r.get('tag_name', 'no tag')
    print(f\"  {tag:15}  {r['name']:30}  {'draft' if r['draft'] else 'published'}\")"

# Upload a release asset (binary file)
RELEASE_ID=<id_from_create_response>
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/octet-stream" \
  "https://uploads.github.com/repos/$OWNER/$REPO/releases/$RELEASE_ID/assets?name=binary-amd64" \
  --data-binary @./dist/binary-amd64
```

## 9. GitHub Actions Workflows

**With gh:**

```bash
gh workflow list
gh run list --limit 10
gh run view <RUN_ID>
gh run view <RUN_ID> --log-failed
gh run rerun <RUN_ID>
gh run rerun <RUN_ID> --failed
gh workflow run ci.yml --ref main
gh workflow run deploy.yml -f environment=staging
```

**With curl:**

```bash
# List workflows
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/workflows \
  | python -c "
import sys, json
for w in json.load(sys.stdin)['workflows']:
    print(f\"  {w['id']:10}  {w['name']:30}  {w['state']}\")"

# List recent runs
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/repos/$OWNER/$REPO/actions/runs?per_page=10" \
  | python -c "
import sys, json
for r in json.load(sys.stdin)['workflow_runs']:
    print(f\"  Run {r['id']}  {r['name']:30}  {r['conclusion'] or r['status']}\")"

# Download failed run logs
RUN_ID=<run_id>
curl -s -L \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/logs \
  -o ${HOMINEM_HOME:-~/.hominem}/cache/scratch/ci-logs.zip
cd ${HOMINEM_HOME:-~/.hominem}/cache/scratch && unzip -o ci-logs.zip -d ci-logs

# Re-run a failed workflow
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/rerun

# Re-run only failed jobs
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/runs/$RUN_ID/rerun-failed-jobs

# Trigger a workflow manually (workflow_dispatch)
WORKFLOW_ID=<workflow_id_or_filename>
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/$OWNER/$REPO/actions/workflows/$WORKFLOW_ID/dispatches \
  -d '{"ref": "main", "inputs": {"environment": "staging"}}'
```

## 10. Gists

**With gh:**

```bash
gh gist create script.py --public --desc "Useful script"
gh gist list
```

**With curl:**

```bash
# Create a gist
curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/gists \
  -d '{
    "description": "Useful script",
    "public": true,
    "files": {
      "script.py": {"content": "print(\"hello\")"}
    }
  }'

# List your gists
curl -s \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/gists \
  | python -c "
import sys, json
for g in json.load(sys.stdin):
    files = ', '.join(g['files'].keys())
    print(f\"  {g['id']}  {g['description'] or '(no desc)':40}  {files}\")"
```

## 11. GitHub Pages — Static HTML (no Jekyll)

For a standalone HTML page (no Jekyll, no build step), serve from a `docs/` directory on `main`.

**Enable Pages via API:**

```bash
gh api -X POST repos/OWNER/REPO/pages \
  -f "build_type=legacy" \
  -f "source[branch]=main" \
  -f "source[path]=/docs"
```

**Required files in docs/:**

- `index.html` — the page
- `.nojekyll` — empty file that disables Jekyll processing (critical for static HTML; without it, Jekyll may mangle the page)

**Workflow:**

1. Create `docs/` directory in the repo
2. Put `index.html` and `.nojekyll` in it
3. Commit and push to `main`
4. Enable Pages via the API call above (one-time)
5. Wait 10-30s for build, then verify: `curl -s -o /dev/null -w "%{http_code}" https://OWNER.github.io/REPO/`
6. Check build status: `gh api repos/OWNER/REPO/pages/builds/latest --jq '.status'`

**Pitfalls:**

- Without `.nojekyll`, Jekyll processes the HTML and may break Tailwind CDN scripts, import maps, or inline JS
- The site URL is `https://OWNER.github.io/REPO/` (note the trailing slash and repo name as path)
- Pages can lag 10-30s after push; verify with curl, not memory
- If using Tailwind CDN, ensure the script tag is in `<head>` before any Tailwind classes are used
- For cache busting during testing, append `?v=N` to the URL

**Animated demo pattern (back-and-forth):**
For a "fuzzy text → structured output" demo, use CSS animations + JS:

- Define `@keyframes` for slide-in (messages) and fade-in (output cards)
- Use `setTimeout` chains to sequence messages → outputs with delays
- Add a Replay button that clears containers and re-runs
- Track stats (counts) that update as items appear
- Auto-start on page load with a small delay (1s)

```css
.msg-enter {
  animation: msgSlideIn 0.4s ease-out forwards;
  opacity: 0;
  transform: translateY(12px);
}
@keyframes msgSlideIn {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.mem-enter {
  animation: memFadeIn 0.5s ease-out forwards;
  opacity: 0;
  transform: scale(0.95);
}
@keyframes memFadeIn {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

When a repo serves GitHub Pages from a subdirectory (e.g. `docs/` on a feature branch), treat that directory as the site source — not the repo root.

**Discover the source:**

```bash
gh api repos/OWNER/REPO/pages --jq '{branch:.source.branch,path:.source.path,url:.html_url}'
```

**Workflow:**

1. Clone and check out the pages source branch (`git checkout <branch>`).
2. Work inside the source path (`cd <path>`). Add pages as Markdown or HTML.
3. For a **standalone HTML page** that should not be wrapped by the site layout, set `layout: null` in the front matter; otherwise Jekyll injects the default layout.
4. When the site uses a `baseurl` (e.g. `/RepoName`), reference assets with Liquid so paths resolve: `{{ '/assets/file.css' | relative_url }}`.
5. Build locally before pushing: `jekyll build --source <path> --destination /tmp/site`. Fix any errors; a failed build blocks the deploy.
6. Commit and push to the pages source branch. Pages rebuilds automatically; allow ~10–30s, then verify the live URL.

**Pitfalls:**

- Editing files at the repo root when Pages source is `docs/` (or vice versa) produces no visible change.
- Standalone HTML without `layout: null` gets wrapped in the default layout, breaking full-page markup/CSS.
- Hard-coded asset paths (`/assets/...`) 404 under a `baseurl`; always use `relative_url`.
- Jekyll pretty permalinks turn `coverage.html` into `/coverage/` (directory with `index.html`) — link to the directory form.
- Pages can lag behind the push by 10–30s; verify with a browser, not memory.

## 12. Consolidating repos, and flipping visibility

Merging a private app repo into a public product/site repo is a routine request and a one-way door.

**Before anything leaves the private repo, scan it — the working tree and the history:**

```bash
# files that should never ship publicly
git ls-files | grep -Ei '\.dmg$|\.log$|\.wav$|\.p8$|\.p12$|\.mobileprovision$|secret|credential'
# key-shaped strings anywhere in history (a secret in an old commit is public forever)
git log --all -p | grep -aE 'BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|password *= *["'][^"']{6,}'
# largest blobs, to catch a binary that should be a release asset
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | awk '$1=="blob" {print $3, $4}' | sort -rn | head
```

Match those hits against `.gitignore` (`dist/`, `.build/`) before pushing; a `dist/` that is already
ignored survives a `git reset --hard` in the working copy, so the DMG stays local without being tracked.

**Merge in a scratch clone of the target, from the repo holding the newest work:**

```bash
git clone <target> /tmp/merged && cd /tmp/merged
git remote add app <source-repo>
git fetch app
git merge --allow-unrelated-histories -m "Fold the app into the product repo" app/main
git status --short | grep -E '^(UU|AA|DU|UD|DD)'   # expect none; both trees are usually disjoint
git build/test                                      # build HERE, before the default branch can break
git remote -v && git push -u origin main
```

Two roots and no rewritten commits is the goal; one merge commit is tidier than two, so clone from whichever
side already contains the other's commits. Then re-point the working clone (`git remote set-url origin`, fetch,
`git reset --hard origin/main`), archive the absorbed repo, and read the push back.

**Pitfalls:**

- **A clone taken from a local path has a local `origin`.** `git clone ~/work/site` sets `origin` to that
  directory, so `git push -u origin main` pushes to a _directory_ — and fails with `branch is currently checked
  out`, which reads like a permissions problem. Run `git remote -v` before the first push of any clone you did
  not fetch from GitHub, and `git remote set-url origin https://github.com/<owner>/<repo>.git`.
- **Archived repositories are read-only, including their issues.** `gh repo archive --yes` before a bulk issue
  operation makes every write fail. Unarchive (`gh repo unarchive --yes`), do the work, archive again.
- **A private repo cannot be the download host.** Release assets on a private repo are visible to collaborators
  only, so a buyer's `releases/download/...` link 404s there while looking fine to the owner; Pages from a
  private repo also needs a paid plan. That, not preference, is what forces "public repo hosts site + releases".
  Check `gh repo view <owner>/<repo> --json visibility` — the _site_ repo is often the public one.
- **A public repo with no `LICENSE` is "all rights reserved", not permission.** Flipping one public publishes
  the source and grants nothing; say so and offer a source-available licence instead of leaving the intent
  implicit.

## 13. Adopting an existing local repo that has no remote

`git remote -v` returning nothing means **create a repo**, not "push and see". Do this once, carefully:

```bash
# 1. Confirm the local project is what you think it is
git log --oneline -5
# 2. Check whether a repo of that name already exists — and what is IN it
gh repo list <owner> --limit 100 --json name,isPrivate,pushedAt
gh api repos/<owner>/<repo>/commits --jq '.[0:5] | .[] | .commit.message'
```

**Read subjects, not names.** A repo whose name resembles this project can be a different product
entirely; adding it as a remote and pushing — especially with `--force` after a history rewrite —
replaces work that has nothing to do with this tree. If the last commits describe another codebase,
create a new repo instead of reusing the name.

```bash
# 3. Create and push in one step, from inside the project
gh repo create <owner>/<name> --private --source=. --remote=origin --push
```

Private is the safe default for internal tooling; state the choice and that flipping it is one
setting, rather than asking nothing and publishing.

**4. Read the push back three ways**, and check the tree, not just the SHA:

```bash
git rev-parse HEAD                        # local
git ls-remote origin refs/heads/main      # remote ref
gh api repos/<owner>/<repo>/git/trees/main?recursive=1 \
  --jq '[.tree[].path | select(test("<path that must be absent>|<path that must be present>"))] | .[]'
```

A rewrite leaves local and remote unrelated, so a plain `git push` is rejected; confirm what the force
would replace (step 2) before using it, and never force onto a repo you have not read.

## Quick Reference Table

| Action         | gh                             | git + curl                                               |
| -------------- | ------------------------------ | -------------------------------------------------------- |
| Clone          | `gh repo clone o/r`            | `git clone https://github.com/o/r.git`                   |
| Create repo    | `gh repo create name --public` | `curl POST /user/repos`                                  |
| Fork           | `gh repo fork o/r --clone`     | `curl POST /repos/o/r/forks` + `git clone`               |
| Repo info      | `gh repo view o/r`             | `curl GET /repos/o/r`                                    |
| Edit settings  | `gh repo edit --...`           | `curl PATCH /repos/o/r`                                  |
| Create release | `gh release create v1.0`       | `curl POST /repos/o/r/releases`                          |
| List workflows | `gh workflow list`             | `curl GET /repos/o/r/actions/workflows`                  |
| Rerun CI       | `gh run rerun ID`              | `curl POST /repos/o/r/actions/runs/ID/rerun`             |
| Set secret     | `gh secret set KEY`            | `curl PUT /repos/o/r/actions/secrets/KEY` (+ encryption) |
