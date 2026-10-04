#!/usr/bin/env python3
"""Vault consistency checks — replaces python3 -c duplication probes.

Checks:
  1. slug == filename for every notes/*.md and references/*.md
  2. required frontmatter fields per vault-knowledge-base SKILL
  3. duplication between notes/ and content/ (if content/ exists)
  4. hash comparison for intersecting paths

Bash covers simple cases (`wc -l`, `grep -r`); this script handles
structured frontmatter and cross-directory hashing.

Usage:
  python3 .agents/skills/vault-knowledge-base/scripts/check_vault.py
  python3 .agents/skills/vault-knowledge-base/scripts/check_vault.py --notes notes/culture.the-target-shirt.md
  python3 .agents/skills/vault-knowledge-base/scripts/check_vault.py --duplication-only
  python3 .agents/skills/vault-knowledge-base/scripts/check_vault.py --json

Exit 0 if all checks pass, 1 otherwise.
"""

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path

FM_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
REQUIRED_NOTE_FM = ["slug", "updated", "status", "visibility", "type"]


def parse_frontmatter(text: str) -> dict:
    m = FM_RE.match(text)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        if line[:1] not in (" ", "-", "\t"):
            k, _, v = line.partition(":")
            fm[k.strip()] = v.strip().strip("'\"")
    return fm


def collect_files(root: Path, pattern: str = "*.md"):
    return [p for p in root.rglob(pattern) if p.is_file()]


def check_slug(path: Path) -> str | None:
    try:
        text = path.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError) as e:
        return f"{path}: unreadable ({e})"
    fm = parse_frontmatter(text)
    if not fm:
        return None  # not every file needs frontmatter
    slug = fm.get("slug")
    if slug and slug.strip().strip("\"'") != path.stem:
        return f"{path}: slug '{slug}' != filename stem '{path.stem}'"
    return None


def check_required_frontmatter(path: Path) -> list[str]:
    text = path.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    if not fm:
        return []
    # Only check REQUIRED for notes/ and references/ with type note/essay/reference
    if fm.get("type") not in ("note", "essay", "reference"):
        return []
    errs = []
    for k in REQUIRED_NOTE_FM:
        if k not in fm or not fm[k]:
            errs.append(f"{path}: missing required field '{k}'")
    return errs


def duplication_report(vault_root: Path) -> dict:
    content = vault_root / "content"
    notes = vault_root / "notes"
    if not content.is_dir():
        return {
            "content_exists": False,
            "msg": "content/ does not exist — notes/ is canonical (OK)",
        }
    if not notes.is_dir():
        return {
            "content_exists": True,
            "msg": "notes/ missing — unexpected",
            "errors": ["notes/ directory not found"],
        }

    def file_map(root: Path) -> dict[str, str]:
        out = {}
        for p in root.rglob("*"):
            if p.is_file() and p.name != ".DS_Store":
                rel = str(p.relative_to(root))
                try:
                    out[rel] = hashlib.md5(p.read_bytes()).hexdigest()
                except Exception:
                    out[rel] = "ERR"
        return out

    c_map = file_map(content)
    n_map = file_map(notes)
    intersect = set(c_map) & set(n_map)
    only_c = set(c_map) - set(n_map)
    only_n = set(n_map) - set(c_map)
    diff = [k for k in intersect if c_map[k] != n_map[k]]

    return {
        "content_exists": True,
        "content_files": len(c_map),
        "notes_files": len(n_map),
        "intersect": len(intersect),
        "diff": diff,
        "only_in_content": sorted(only_c),
        "only_in_notes": sorted(only_n)[:20],  # cap for readability
        "identical": len(intersect) - len(diff),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Vault consistency checks")
    ap.add_argument(
        "--notes",
        nargs="*",
        help="Specific files to check (default: all notes/**/*.md)",
    )
    ap.add_argument(
        "--duplication-only",
        action="store_true",
        help="Only run content/ vs notes/ duplication check",
    )
    ap.add_argument("--json", action="store_true", help="Emit JSON")
    ap.add_argument(
        "vault_root", nargs="?", default=".", help="Vault root (default: .)"
    )
    args = ap.parse_args()

    vault_root = Path(args.vault_root).resolve()
    errors, warns = [], []
    info = {}

    if args.duplication_only:
        dup = duplication_report(vault_root)
        if args.json:
            print(json.dumps(dup, indent=2))
        else:
            if not dup.get("content_exists"):
                print(f"OK: {dup['msg']}")
            else:
                print(
                    f"content/ {dup['content_files']} files, notes/ {dup['notes_files']} files, intersect {dup['intersect']} ({dup['identical']} identical, {len(dup['diff'])} differ)"
                )
                if dup["diff"]:
                    print("  differing (keep notes/ — it is newer canonical):")
                    for k in dup["diff"][:10]:
                        print(f"    ~ {k}")
                if dup["only_in_content"]:
                    print(
                        f"  only in content/ ({len(dup['only_in_content'])}): {dup['only_in_content']}"
                    )
                if (
                    len(dup.get("diff", [])) == 0
                    and len(dup.get("only_in_content", [])) == 0
                    and dup["identical"] > 0
                ):
                    print(
                        "  FAIL: content/ is full duplicate of notes/ — safe to `git rm -r content` per vault-knowledge-base (notes is canonical 2026-08-26)"
                    )
                    return 1
                if dup["only_in_content"]:
                    warns.append(
                        f"{len(dup['only_in_content'])} file(s) only in content/ need migration before deletion"
                    )
        return 1 if warns else 0

    # slug + required frontmatter checks
    paths = (
        [Path(p) for p in args.notes]
        if args.notes
        else collect_files(vault_root / "notes")
    )
    # also check vault-level loose md if no --notes filter
    if not args.notes:
        paths += [p for p in vault_root.glob("*.md") if p.is_file()]

    for p in paths:
        if p.name.startswith("_") or p.name == "README.md":
            continue
        e = check_slug(p)
        if e:
            errors.append(e)
        errors.extend(check_required_frontmatter(p))

    dup = duplication_report(vault_root)
    info["duplication"] = dup

    if args.json:
        print(
            json.dumps(
                {"errors": errors, "warns": warns, "info": info, "checked": len(paths)},
                indent=2,
            )
        )
    else:
        for e in errors:
            print(f"FAIL {e}")
        if dup.get("content_exists"):
            if (
                dup["identical"] > 0
                and len(dup["diff"]) == 0
                and not dup["only_in_content"]
            ):
                print(
                    f"FAIL duplication: content/ duplicates notes/ ({dup['identical']} identical) — delete content/"
                )
                errors.append("content/ duplicates notes/")
            elif dup["only_in_content"]:
                print(
                    f"WARN duplication: {len(dup['only_in_content'])} only-in-content files: {dup['only_in_content'][:5]}"
                )
                warns.append("only-in-content files need migration")
            else:
                print(
                    f"OK duplication: content {dup['content_files']} vs notes {dup['notes_files']}, {dup['identical']} identical"
                )
        else:
            print(f"OK duplication: {dup['msg']}")
        if not errors and not warns:
            print(f"OK: checked {len(paths)} file(s) — all slugs and frontmatter pass")
        elif not errors:
            print(f"OK with warns: checked {len(paths)} file(s)")

    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
