# File Organization

Consolidate files of one kind that are scattered across a tree into a single destination directory, with deduplication and a provenance manifest. Works for resumes, receipts, contracts, or any repeated document type.

## Procedure

1. **Define scope and destination.** Confirm source root and target directory. Check whether the target already exists and what it contains; never overwrite existing files without a plan.

2. **Find candidates by name.** Use the available file search tool (for example `rg --files` or a document connector) for filename patterns (`*resume*`, `*cv*`, etc.). Record full paths.

3. **Find candidates by content when names are unreliable.** For document types like PDFs, extract text with `pdftotext` and match strong keywords (e.g. `professional summary`, `work experience`, `core skills`). Derive matching criteria from the requested document type: for receipts, look for merchant, date, total and payment evidence; for resumes, look for employment and education evidence. Inspect ambiguous matches.

4. **Review false positives manually.** Content scans produce false positives. Inspect borderline files before moving anything.

5. **Dedupe by exact hash.** Compute MD5/SHA-256 for each candidate. Group byte-identical files; keep one per group and record duplicate paths. Remove duplicates only within an authorized deduplication scope; otherwise retain or archive them. Removals go to `~/.Trash`, never `rm`. Do not delete near-duplicates (same text, different PDF metadata or wording) without checking content.

5a. **Confirm the plan before touching files.** List every planned move and every duplicate to be trashed, with paths and counts. Get the user's go-ahead in chat before running any of it. Dry-run output counts as the plan, not as the approval.

6. **Move, don't copy.** Move the chosen unique files into the destination. Preserve original basenames where they are meaningful; rename generic or colliding names (e.g. `resume.pdf`, `resume (1).pdf`) so each file is identifiable, and record the mapping.

7. **Write a provenance manifest.** Create `manifest.json` in the destination with each file's new name, original path, hash, and a short description. This makes renames reversible and auditable.

8. **Verify.** List the destination, count files, and re-run the candidate search excluding the destination. Only expected leftovers (unrelated files that happened to match) should remain.

## Pitfalls

- Content keyword scans false-positive on documents that contain words like "education" or "skills"; choose strong criteria appropriate to the requested document type plus supporting evidence.
- Filename scans false-positive on tokens embedded in other words (`cv` in CVS/CVG, `resume` in essay titles); inspect matches and filter by content before moving.
- Exact-hash dedup catches byte-identical duplicates only; near-duplicate PDFs can differ in metadata or wording and need manual review.
- Moving files breaks any references or scripts that pointed at the old paths; check before moving shared assets, and leave a symlink at the original path when apps or scripts still reference it.
- iCloud/CloudStorage paths can be dataless placeholders; verify files are materialized before hashing or moving. See [iCloud containers](../disk-space-recovery/WORKFLOW.md#4-icloud-containers).
- macOS `Documents` and other TCC-protected folders require terminal access; if a scan returns nothing, confirm permissions rather than assuming no files.
- When the destination lives inside the source tree, exclude it from candidate scans to avoid reprocessing moved files.
- Filenames with spaces and parentheses need careful quoting in shell commands.

## Verification

- Destination contains the expected number of unique files.
- No candidate files remain in the source tree except the destination and known unrelated matches.
- `manifest.json` lists every moved file with original path and hash.
