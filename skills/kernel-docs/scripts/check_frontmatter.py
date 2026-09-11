#!/usr/bin/env python3
"""Validate docs/* against the kernel-docs frontmatter contract.

Checks, per Markdown file under the target directory(ies):
  - frontmatter present and parses
  - only the schema keys, in schema order
  - type/status in the allowed enums
  - tags are lowercase kebab-case
  - updated is an ISO YYYY-MM-DD date
  - related paths resolve to existing files relative to the doc

Usage:
    python3 scripts/check_frontmatter.py [paths...]   (default: docs)

Exit code 0 when clean, 1 when any file fails.
"""

from __future__ import annotations

import datetime
import re
import sys
from pathlib import Path

# Canonical schema (mirrors the docs/FORMAT.md contract of record).
SCHEMA = ["title", "summary", "type", "status", "owner", "tags", "related", "updated"]
TYPES = {"architecture", "reference", "guide", "proposal"}
STATUSES = {"active", "draft", "proposed"}
TAG_RE = re.compile(r"^[a-z0-9]+(-[a-z0-9]+)*$")


def parse_frontmatter(path: Path) -> tuple[dict[str, str] | None, list[str]]:
    """Return (ordered key->value map, errors). None map when no frontmatter."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None, []
    try:
        end = lines.index("---", 1)
    except ValueError:
        return None, ["missing frontmatter closer"]
    fm: dict[str, str] = {}
    for line in lines[1:end]:
        m = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):\s?(.*)$", line)
        if m:
            fm[m.group(1)] = (m.group(2) or "").strip().strip("\"'")
        elif line.strip():
            # multi-line values are not supported by this parser; flag loudly
            return None, [f"unsupported multi-line frontmatter value: {line.strip()!r}"]
    return fm, []


def check_file(path: Path) -> list[str]:
    errors: list[str] = []
    rel = path.resolve().relative_to(Path.cwd()).as_posix()

    fm, parse_errors = parse_frontmatter(path)
    if parse_errors:
        return [f"{rel}: {e}" for e in parse_errors]
    if fm is None:
        return [f"{rel}: MISSING frontmatter"]

    keys = list(fm.keys())
    if set(keys) != set(SCHEMA):
        extra = set(keys) - set(SCHEMA)
        missing = set(SCHEMA) - set(keys)
        if extra:
            errors.append(f"{rel}: unexpected key(s) {sorted(extra)}")
        if missing:
            errors.append(f"{rel}: missing key(s) {sorted(missing)}")

    # order: schema keys must appear in schema order (no reordering)
    ordered = [k for k in keys if k in SCHEMA]
    if ordered != [k for k in SCHEMA if k in ordered]:
        errors.append(f"{rel}: keys out of schema order ({ordered})")

    if fm.get("type") not in TYPES:
        errors.append(f"{rel}: invalid type {fm.get('type')!r} (allowed: {sorted(TYPES)})")
    if fm.get("status") not in STATUSES:
        errors.append(f"{rel}: invalid status {fm.get('status')!r} (allowed: {sorted(STATUSES)})")

    for tag in _list_items(fm.get("tags", "")):
        if not TAG_RE.match(tag):
            errors.append(f"{rel}: invalid tag {tag!r} (want lowercase kebab-case)")

    updated = fm.get("updated", "")
    try:
        datetime.date.fromisoformat(updated)
    except ValueError:
        errors.append(f"{rel}: invalid updated {updated!r} (want YYYY-MM-DD)")

    for item in _list_items(fm.get("related", "")):
        target = (path.parent / item).resolve()
        if not target.exists():
            errors.append(f"{rel}: related {item!r} does not resolve to a file")

    return errors


def _list_items(value: str) -> list[str]:
    """Parse `[a, b]` or `a, b` into trimmed items."""
    value = value.strip()
    if value.startswith("[") and value.endswith("]"):
        value = value[1:-1]
    return [x.strip() for x in value.split(",") if x.strip() and x.strip() != "[]"]


def main(argv: list[str]) -> int:
    targets = [Path(p) for p in (argv or ["docs"])]
    files: list[Path] = []
    for target in targets:
        if target.is_dir():
            files.extend(sorted(target.rglob("*.md")))
        elif target.is_file():
            files.append(target)
        else:
            print(f"error: {target} does not exist")
            return 2

    all_errors: list[str] = []
    for path in files:
        all_errors.extend(check_file(path))

    if all_errors:
        print("Documentation format check failed:")
        print("\n".join(f"- {e}" for e in all_errors))
        return 1
    print(f"Documentation format valid: {len(files)} files checked.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))