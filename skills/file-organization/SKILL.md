---
name: file-organization
description: "Consolidate scattered files into one directory."
license: MIT
metadata:
  author: Charles Ponti, Hermes Agent
  version: "0.1.0"
  platforms: [macos]
  hermes:
    tags: [files, organization, dedup, consolidation]
---

# File Organization

Consolidate files of one kind that are scattered across a tree into a single destination directory, with deduplication and a provenance manifest. Works for resumes, receipts, contracts, or any repeated document type.

## When to Use

- User asks to gather/organize scattered files of one type into one folder.
- Cleaning up duplicates across drafts, exports, or old project folders.
- Preparing a single canonical location before sharing or archiving.

Don't use for: project lifecycle work under `ponti-studios/` (use `project-operations`), disk-space recovery, or app uninstall residue.

## Procedure

1. **Define scope and destination.** Confirm source root and target directory. Check whether the target already exists and what it contains; never overwrite existing files without a plan.

2. **Find candidates by name.** Use `search_files` (target `files`) for filename patterns (`*resume*`, `*cv*`, etc.). Record full paths.

3. **Find candidates by content when names are unreliable.** For document types like PDFs, extract text with `pdftotext` and match strong keywords (e.g. `professional summary`, `work experience`, `core skills`). Require at least one strong keyword plus several supporting hits to avoid false positives such as vaccine cards, flight itineraries, or essays that merely mention "education".

4. **Review false positives manually.** Content scans produce false positives. Inspect borderline files before moving anything.

5. **Dedupe by exact hash.** Compute MD5/SHA-256 for each candidate. Group byte-identical files; keep one per group and delete the exact duplicates from their original locations. Do not delete near-duplicates (same text, different PDF metadata or wording) without checking content.

6. **Move, don't copy.** Move the chosen unique files into the destination. Preserve original basenames where they are meaningful; rename generic or colliding names (e.g. `resume.pdf`, `resume (1).pdf`) so each file is identifiable, and record the mapping.

7. **Write a provenance manifest.** Create `manifest.json` in the destination with each file's new name, original path, hash, and a short description. This makes renames reversible and auditable.

8. **Verify.** List the destination, count files, and re-run the candidate search excluding the destination. Only expected leftovers (unrelated files that happened to match) should remain.

## Pitfalls

- Content keyword scans false-positive on documents that contain words like "education" or "skills"; require a strong resume/CV keyword plus supporting hits.
- Filename scans false-positive on tokens embedded in other words (`cv` in CVS/CVG, `resume` in essay titles); inspect matches and filter by content before moving.
- Exact-hash dedup catches byte-identical duplicates only; near-duplicate PDFs can differ in metadata or wording and need manual review.
- Moving files breaks any references or scripts that pointed at the old paths; check before moving shared assets. When relocating a directory that apps or scripts reference, leave a symlink at the original path so existing references keep resolving.
- Before deleting or relocating a config file, verify something actually reads it (`lsof`, app `--help`/`config`, or grep the codebase). A config that references nonexistent paths and has no reader is leftover; archive it instead of deleting.
- When a data directory holds mixed kinds (databases, data, scripts, backups, logs), split them into canonical homes and leave symlinks at the original paths so apps and scripts keep resolving.
- SQLite databases have sidecar files (`-wal`, `-shm`) that must move with the `.db`; leaving them behind corrupts the database or loses uncommitted data. Move them together and re-symlink all of them.
- When relocating a logging directory, keep the original path as a symlink so producers writing to the old path still land in the new location. Organize loose logs into year/month subfolders as you move them.
- iCloud/CloudStorage paths can be dataless placeholders; `stat` may fail while `du` reports logical size. Verify files are materialized before hashing or moving.
- macOS `Documents` and other TCC-protected folders require terminal access; if a scan returns nothing, confirm permissions rather than assuming no files.
- When the destination lives inside the source tree, exclude it from candidate scans to avoid reprocessing moved files.
- Filenames with spaces and parentheses need careful quoting in shell commands.
- Near-duplicate PDFs (same text, different metadata or wording) are not caught by hash dedup; review them before deciding which to keep.

## Verification

- Destination contains the expected number of unique files.
- No candidate files remain in the source tree except the destination and known unrelated matches.
- `manifest.json` lists every moved file with original path and hash.
