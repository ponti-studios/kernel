# topic-map generator

Owns the marked regions of `TOPIC_MAP.md` (`census`, `canon`, `anchors`).
Everything outside the markers is hand-written prose — the generator never
touches it.

- `overlay.json` — curated judgment: anchors (id, label, paths), thesis
  locks, open items. Edit this when anchors change, not the map.
- `generate.mts` — dependency-free (node built-in only). Run from the
  workspace root: `node tools/topic-map/generate.mts`
- Exit code is 1 when any anchor path is missing (broken-anchor alarm).

Run it after every structural pass (moves, merges, splits, deletes).
