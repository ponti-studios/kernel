# Reclaiming disk space on macOS

> Invoke with: the disk that is full, or the folder suspected of holding the space.
> Related: [macOS complete uninstall](../macos-complete-uninstall/WORKFLOW.md).

## When to Use

- A macOS machine is low on space and you need to find what is actually consuming it.
- A large deletion reported "no space freed" and you need to explain the gap.
- You need to reclaim space without destroying user data (models, photos, source, credentials).
- An app's leftover data is suspected of hogging space (caches, VM images, private model stores).

Not for: a full app uninstall — use the [macOS complete uninstall](../macos-complete-uninstall/WORKFLOW.md)
procedure for that. This procedure covers disk pressure and storage mechanics; the two overlap when an
uninstall frees nothing.

A Mac that reports "no space freed" after a large deletion usually has **two** problems, not one:
the files are gone but their blocks are still referenced, and something else large is hiding. Work
the causes in order of size, and measure after each step rather than trusting an estimate.

## 1. Survey before deleting

Run the read-only inventory first. It prints sizes for home folders, known caches and build dirs,
and files untouched for 180+ days. It deletes nothing:

```bash
just disk-inventory   # run from the computer-workflows skill folder
```

It walks all of `~/Library`, so it takes a few minutes. Use the numbers to pick targets, then
measure them again before and after any deletion.

```bash
df -h /System/Volumes/Data
du -sh ~/Library ~/.ollama ~/.local ~/.npm ~/.cache 2>/dev/null | sort -rh
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

Measure a specific app's cache before clearing it — some "caches" are the only copy of real data
(a private model store inside an app's support dir, for instance).

### Clearing Xcode caches

`clean-xcode.sh` clears the rebuildable Xcode caches. It keeps the newest iOS DeviceSupport build for each
device model. It is a dry run unless you pass `--yes`, and it refuses to apply while Xcode is open.

```bash
just clean-xcode          # dry run
just clean-xcode --yes    # apply: DerivedData and older DeviceSupport builds go to ~/.Trash
```

Unavailable simulators are listed but **not** deleted by default. `xcrun simctl delete` is permanent and skips
the Trash, so it runs only when you pass both flags and have confirmed with the user:

```bash
just clean-xcode --yes --include-simulators   # PERMANENT: ask the user first
```

Trashed items take no space on disk until the Trash is emptied. Report the `df` figure after emptying the
Trash, not the size the script moved.

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

Deleting a **local** snapshot releases the blocks of everything already deleted, but it cannot be undone.
Before running `deletelocalsnapshots`, **ask the user**: name the snapshot date, say what it pins, and say that
it cannot be restored. Independent backup restore points
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

To reclaim: **ask the user first** (in-place `VACUUM` rewrites the live database). Then take a backup you
can restore from, for example `VACUUM INTO '<backup path>'`, and keep it until the user confirms the
result. Stop whatever holds the database open (a `KeepAlive` launchd job, for instance —
`launchctl bootout gui/$(id -u)/<label>`), then `VACUUM` in place, then restore the job with
`launchctl bootstrap gui/$(id -u) <plist>`. Verify with `pragma integrity_check` and a row count
before and after. `VACUUM INTO` writes a new file and works while a reader is attached, but the
service still needs restarting to pick it up.

## 4. iCloud containers

`~/Library/Mobile Documents` holds one container per app that used iCloud. Removing one requires
write permission on the **parent**, which is `dr-x------` by design. The `rm -rf` below is **permanent**
(no Trash), so **ask the user first**, name the container, and confirm it is not the only copy of their data:

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

Names can belong to the OS rather than the app you are cleaning: Apple can ship components that
carry a third-party product's name under `com.apple.*` ids or Apple's team id, while the vendor's own
paths use the vendor's bundle prefix. Deleting the Apple-owned ones breaks system features. Check the
owning team's id and the container metadata before deleting.

## 6. Report honestly

Separate the three outcomes and say which is which:

- **freed** — measured by `df` after the change
- **inert residue** — present but harmless; see
  [Inert residue](../macos-complete-uninstall/references/macos-residue-locations.md#8-inert-residue--report-dont-fight)
- **blocked** — needs the user's action (a snapshot they have not approved deleting, a file another
  process holds open)

Do not report a deleted-file size as reclaimed space. Re-run `df` at the end and quote it.
