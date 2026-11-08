---
name: macos-disk-space-recovery
description: "Use when reclaiming disk space on a macOS machine."
license: MIT
metadata:
  author: charlesponti
  version: "1.0"
  hermes:
    tags: [macos, disk, cleanup, storage]
    related_skills: [macos-complete-uninstall]
---

# Reclaiming disk space on macOS

## When to Use

- A macOS machine is low on space and you need to find what is actually consuming it.
- A large deletion reported "no space freed" and you need to explain the gap.
- You need to reclaim space without destroying user data (models, photos, source, credentials).
- An app's leftover data is suspected of hogging space (caches, VM images, private model stores).

Not for: a full app uninstall — use `macos-complete-uninstall` for that. This skill covers disk
pressure and storage mechanics; the two overlap when an uninstall frees nothing.

A Mac that reports "no space freed" after a large deletion usually has **two** problems, not one:
the files are gone but their blocks are still referenced, and something else large is hiding. Work
the causes in order of size, and measure after each step rather than trusting an estimate.

## 1. Survey before deleting

```bash
df -h /System/Volumes/Data
du -sh ~/Library ~/Developer ~/.ollama ${HERMES_HOME:-$HOME/.hermes} ~/.local ~/.npm ~/.cache 2>/dev/null | sort -rh
du -sh ~/Library/* 2>/dev/null | sort -rh | head -12
```

Then drill into the leaders. Common large buckets, in the order they usually appear:

| Bucket                                                          | Why it's big                      | Safe to clear?                                     |
| --------------------------------------------------------------- | --------------------------------- | -------------------------------------------------- |
| `~/Library/Group Containers/*`                                  | OrbStack/Docker VM images         | Prune inside the tool first, not the container dir |
| `~/Library/Developer/Xcode/DerivedData`                         | Rebuildable build cache           | Yes — Xcode regenerates                            |
| `~/Library/Developer/CoreSimulator`                             | Simulator devices + runtimes      | Per-device; check which are used                   |
| `~/Library/Developer/Xcode/iOS DeviceSupport`                   | One copy per iOS build per device | Older builds; Xcode re-downloads                   |
| `~/Library/Caches/*`                                            | App caches, often multi-GB        | Yes, per app                                       |
| `~/Library/pnpm`, `~/.npm/_cacache`, `~/.cache/uv`, `~/.gradle` | Package stores                    | Yes — re-downloadable                              |
| `~/.ollama/models`                                              | Model weights                     | Only models the user no longer wants               |
| `${HERMES_HOME:-~/.hermes}/models`                                              | Local GGUF weights                | Check the model is not a configured provider       |

Measure a specific app's cache before clearing it — some "caches" are the only copy of real data
(a private model store inside an app's support dir, for instance).

## 2. The snapshot trap — check this before believing your deletion did nothing

If Time Machine's destination is **on the same disk**, its APFS snapshots keep the blocks of every
deleted file. `df` then shows no change, and the space looks unrecoverable even though the files
are gone.

```bash
tmutil destinationinfo                      # where is the backup destination?
diskutil apfs listSnapshots /System/Volumes/Data
tmutil listlocalsnapshots /
```

A snapshot may be annotated _"This snapshot limits the minimum size of APFS Container"_. Drop it:

```bash
tmutil deletelocalsnapshots <yyyy-mm-dd-hhmmss>
```

Deleting a **local** snapshot releases the blocks of everything already deleted — one snapshot
freed ~110 GB in one step, alongside a 3.7 GB SQLite vacuum. Independent backup restore points
(`/Volumes/com.apple.TimeMachine.localsnapshots/Backups.backupdb/<host>/<date>/`) are separate and
survive; only the _snapshots_ pin space.

Take the measurement lesson with you: **delete the data first, then check `df`. If `df` doesn't
move, look for a snapshot before concluding the deletion failed.**

## 3. SQLite freelist bloat

A long-lived SQLite file can be mostly dead pages. Detect and reclaim:

```bash
python3 -c "
import sqlite3, os, sys
p = os.path.expanduser(sys.argv[1])
c = sqlite3.connect('file:%s?mode=ro' % p, uri=True)
pc = c.execute('pragma page_count').fetchone()[0]
ps = c.execute('pragma page_size').fetchone()[0]
fl = c.execute('pragma freelist_count').fetchone()[0]
print('file %.2f GB, live %.2f GB, reclaimable %.2f GB' % (
    os.path.getsize(p)/1e9, (pc-fl)*ps/1e9, fl*ps/1e9))
" <path/to.db>
```

To reclaim: stop whatever holds the database open (a `KeepAlive` launchd job, for instance —
`launchctl bootout gui/$(id -u)/<label>`), then `VACUUM` in place, then restore the job with
`launchctl bootstrap gui/$(id -u) <plist>`. Verify with `pragma integrity_check` and a row count
before and after. `VACUUM INTO` writes a new file and works while a reader is attached, but the
service still needs restarting to pick it up.

Known instance: `~/.local/share/opencode/opencode.db` grew to 4.3 GB with 0.88 GB of live data.

## 4. iCloud containers

`~/Library/Mobile Documents` holds one container per app that used iCloud. Removing one requires
write permission on the **parent**, which is `dr-x------` by design:

```bash
chmod u+w ~/Library/Mobile\ Documents
rm -rf ~/Library/Mobile\ Documents/iCloud~com~vendor~app
chmod u-w ~/Library/Mobile\ Documents      # restore
```

`chflags` on the child can never work — the parent is what blocks the unlink.

**Containers are dataless FileProvider placeholders.** `stat`/`ls` on one can fail with "No such
file or directory" while `du` reports its full logical size, because the data is not materialized
locally. Never report user data as deleted on the strength of a failed `stat` — verify with
`du -sh` and by listing the parent directory. `brctl` on current macOS has only
diagnose/log/dump/status/accounts/monitor/quota; there is no eviction command. Finder's "Remove
Download" or the app's own iCloud uninstall is the supported route.

The container's server-side registration persists in
`~/Library/Application Support/CloudDocs/session/containers/<domain>.plist` even after the local
directory is gone, so iCloud still lists the app on this Mac.

## 5. Distinguish vendor files from Apple built-ins

Names can belong to the OS rather than the app you are cleaning. `com.apple.pixelmator.*` and
`4R6749AYRE.com.pixelmator` are **macOS 27.2's own Photos components** (Apple's team id) — the
third-party app's own paths use `com.pixelmatorteam.*`. Deleting the `com.apple.*` ones breaks the
system image pipeline. Check the owning team's id and the container metadata before deleting.

## 6. Report honestly

Separate the three outcomes and say which is which:

- **freed** — measured by `df` after the change
- **inert residue** — present but harmless (a tombstone, an override row, a text mention)
- **blocked** — needs the user's action (a foreign worktree pinning objects, an immutable PR ref)

Do not report a deleted-file size as reclaimed space. Re-run `df` at the end and quote it.
