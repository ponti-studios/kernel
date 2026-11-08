# Auditing an installed skill library

An installed skill keeps loading after its source moves, its provenance disappears, or a second copy
shadows it. None of that raises an error: `skill_view` returns the skill, `skills list` prints it as healthy,
and the failure only shows up weeks later when an update silently skips it or discards an edit. Run this
audit before any skill-library work, and after any bulk install.

## Three checks, cheapest first

```bash
# 1. Provenance: installed copies the installer holds no record for.
#    `Source: local` in `skills list -g` is not a location — it means the lock has no entry,
#    so `npx skills update -g` skips that skill without a word, forever.
python3 - <<'PY'
import json, os
home = os.path.expanduser("~")
lock = json.load(open(f"{home}/.agents/.skill-lock.json"))["skills"]
installed = {d for d in os.listdir(f"{home}/.agents/skills") if os.path.isdir(f"{home}/.agents/skills/{d}")}
print("unprovenanced:", sorted(installed - set(lock)))
print("stale lock entries:", sorted(set(lock) - installed))
PY

# 2. Collisions: one name in two tiers means neither copy loads (category dir + installed link).
#    Intersect the names of real SKILL.md dirs under $HERMES_HOME/skills with the symlink names there.

# 3. Drift, both directions, against the library repo.
diff -rq "$REPO/skills/<name>" ~/.agents/skills/<name>
```

The runnable implementation of all three — logical-tree comparison included — is
`node scripts/skills_audit.mjs` in the kernel library repo (`ponti-studios/kernel`); it exits non-zero on
any finding and prints nothing when clean, so it can run from a weekly launchd job.

## Order of operations

Reconciling is a sequence, and each step's order exists because the wrong order loses content.

1. **Read the drift in both directions before touching anything.** The store drifts _forward_ too: an agent
   editing `~/.agents/skills/<name>` leaves the repo missing sections the install has. A reinstall
   overwrites the store from the source and deletes them silently.
2. **Decide the direction per file, not per skill.** One skill can be richer in the store and stale in the
   repo at the same time. Take the fuller body, keep the repo's frontmatter shape, bump the version, copy
   any `references/` the repo lacks.
3. **Commit and push the repo first.** Installs read from the remote, so an install run before the push
   reproduces the old content and the audit reports the same drift again.
4. **Re-add from the library**, several at once: `npx skills add <repo> --skill <a> --skill <b> -g --yes`.
   This restores both the lock entry and the update path.
5. **Delete loose profile copies last**, only after `diff -rq` proves the installed copy carries everything.
6. **Re-run the audit** and expect a zero exit. Prove the check can fail (append a line to an installed
   `SKILL.md`, expect a finding, revert) before trusting a clean result — a check that cannot fail is not
   evidence.

## Traps that cost the most time

- **A materialised symlink reads as drift.** A skill keeping `references -> ../../data` installs as real
  directories, because the installer dereferences the link; `diff -rq` then reports every sibling as
  `Only in …/references`. Compare the link's target instead:
  `diff -rq "$(readlink -f <repo>/skills/<name>/references)" ~/.agents/skills/<name>/references`. Without
  this you `remove` + `add` a healthy copy chasing a phantom.
- **`skills add` overlays, it does not replace.** Files the new version dropped survive the update, so
  parity fails on a tree the repo does not describe. Remove first, then add.
- **A `.DS_Store` inside a skill directory is enough to make a skill look stale.** The installer ignores it
  (it ships from git), so a parity check that does not exclude it reports noise as drift. Exclude
  `.DS_Store`, `.venv`, `__pycache__`, `.pytest_cache` in every comparison.
- **`Source:` in `skills list -g` is the only provenance the CLI shows.** A skill whose source path no
  longer exists still lists, still loads, and can never be updated. `git log --all -- skills/<name>` in the
  library repo answers whether it was ever there: a skill the library already removed is a leftover install
  and safe to delete; one that never existed lives only in the store, so preserve it into the repo first.
- **Deleting an install is not the same as deleting a file.** `npx skills remove -g -s <name> -y` clears the
  store entry and every agent link the installer wired; deleting `~/.agents/skills/<name>` or the profile
  symlink by hand leaves the other half behind and the loader keeps listing a skill that no longer resolves.

## Reporting the result

Report counts, not adjectives: installed, with-provenance, collisions, drift. A group of skills that
"looked fine" is exactly what the audit exists to disprove, so any claim that the library is healthy needs
the four numbers beside it.
