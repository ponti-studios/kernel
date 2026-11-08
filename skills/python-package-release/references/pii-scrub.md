# Scrubbing leaked personal data from a pushed repo

For when the scan in rule 6 ran too late and personal data is already on a public remote.
Order matters: fix the tree, rewrite history, force-push, then prove all three.

## 1. Fix the working tree first

Replace the real value with an obviously fictional one (`Alex Rivera`, `+15550001111`).
A real-looking replacement will sail through the next scan and ship anyway.

## 2. Rewrite every commit that contains it

`git-filter-repo` is the supported tool; `filter-branch` is deprecated.

```bash
printf 'Real Name==>Alex Rivera\nLastName==>Rivera\n' > /tmp/replace.txt
git filter-repo --replace-text /tmp/replace.txt --force
```

Notes:

- Replace the surname and the first name as separate rules as well as the full name — a
  bare first name survives the full-name rule in prose.
- It rewrites blobs in ancestors too, so the _removal_ diff in a later commit no longer
  quotes the leaked value.
- **It deletes `origin`.** Re-add it: `git remote add origin <url>`.
- It is a no-op-looking success on an empty match; confirm with step 4, not by reading the
  command output.

## 3. Force-push

```bash
git push --force origin main
```

## 4. Prove it, from three directions

```bash
# a) every blob in every commit, not just HEAD
python3 - <<'PY'
import re, subprocess
term = r"(?i)real ?name"
hits = 0
for c in subprocess.run(["git","rev-list","--all"],capture_output=True,text=True).stdout.split():
    for f in subprocess.run(["git","ls-tree","-r","--name-only",c],capture_output=True,text=True).stdout.splitlines():
        blob = subprocess.run(["git","show",f"{c}:{f}"],capture_output=True,text=True,errors="ignore").stdout
        hits += len(re.findall(term, blob))
print("history hits:", hits)
PY

# b) what the world actually sees
curl -s https://raw.githubusercontent.com/<owner>/<repo>/main/README.md | grep -c 'Real Name'

# c) local and remote agree
git rev-parse HEAD
git rev-parse origin/main
```

Also re-run the PII script over `git ls-files` and let CI run on the rewritten commit — the
force-push invalidates the previous run's SHAs.

## 5. Say what the rewrite does not undo

The repo was public with the data in it for however long, so:

- anyone who cloned or forked in that window keeps a copy;
- GitHub keeps unreachable objects until it garbage-collects, and the old commit SHAs stay
  resolvable via the API for a while;
- the old value may persist in caches, search indexes and third-party crawlers.

If the exposure was sensitive, tell the user GitHub Support can purge unreachable objects,
and let them decide. Never describe a force-push as deletion.

## Prevention is the cheap path

One pre-push run of `scripts/check_no_pii.py` plus `gitleaks detect --source .`, and the
README read by a human, avoids this entire procedure. A scanner finds phone numbers and
uuids; only a human notices that a code example filters on a real contact's name.
