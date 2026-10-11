#!/usr/bin/env python3
"""Validate distilled notes: frontmatter completeness and internal consistency.

Usage:
    python3 .agents/skills/distill-notes/scripts/check_distillation.py notes/a.md notes/b.md ...

Exit code 0 if all checks pass; 1 otherwise.
"""
import re
import sys
from pathlib import Path

REQUIRED = ["updated", "status", "slug", "visibility", "title", "type", "source"]


def parse_frontmatter(text: str) -> dict:
    m = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not m:
        return {}
    fm = {}
    for line in m.group(1).splitlines():
        if ":" in line and not line.startswith((" ", "-", "\t")):
            key, _, val = line.partition(":")
            fm[key.strip()] = val.strip().strip("'\"")
    return fm


def check(path: Path) -> list[str]:
    errors = []
    text = path.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    if not fm:
        return [f"{path}: no frontmatter found"]

    for field in REQUIRED:
        if field not in fm or not fm[field]:
            errors.append(f"{path}: missing required field '{field}'")

    slug = fm.get("slug", "")
    expected_slug = path.stem
    if slug and slug != expected_slug:
        errors.append(f"{path}: slug '{slug}' != filename stem '{expected_slug}'")

    src = fm.get("source", "")
    if src:
        m = re.search(r"\[\[([^\]]+)\]\]", src)
        if m:
            target_name = m.group(1)
            vault_root = Path(__file__).resolve().parents[4]
            hits = list(vault_root.rglob(f"{target_name}.md"))
            if not hits:
                # warning only: source captures may be legitimately deleted
                # after distillation; the provenance string still documents origin
                print(f"WARN {path}: source '{target_name}' does not resolve to any file")

    body = re.sub(r"^---\n.*?\n---\n", "", text, flags=re.DOTALL)
    if "## Related" not in body:
        errors.append(f"{path}: no '## Related' section (orphan check)")

    return errors


def main() -> int:
    paths = [Path(p) for p in sys.argv[1:]]
    if not paths:
        print("usage: check_distillation.py note1.md [note2.md ...]")
        return 1
    all_errors = []
    for p in paths:
        if not p.exists():
            all_errors.append(f"{p}: file not found")
            continue
        all_errors.extend(check(p))
    for e in all_errors:
        print(f"FAIL {e}")
    if not all_errors:
        print(f"OK: {len(paths)} note(s) pass")
        return 0
    return 1


if __name__ == "__main__":
    sys.exit(main())
