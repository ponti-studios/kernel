#!/usr/bin/env python3
"""Validate explicit foreground/background color pairs in a JSON file."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from contrast import contrast  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("file", type=Path)
    parser.add_argument("--minimum", type=float, default=4.5)
    parser.add_argument(
        "--allow-empty",
        action="store_true",
        help="Allow input without a contrastPairs array",
    )
    args = parser.parse_args()
    data = json.loads(args.file.read_text(encoding="utf-8"))
    pairs = data.get("contrastPairs", [])
    if not pairs:
        if args.allow_empty:
            print("No contrastPairs found; nothing to validate.")
            return 0
        print("No contrastPairs found; validation cannot run.", file=sys.stderr)
        return 1
    failures = []
    for pair in pairs:
        ratio = contrast(pair["foreground"], pair["background"])
        if ratio < args.minimum:
            failures.append((pair.get("name", "unnamed"), ratio))
        print(f"{pair.get('name', 'unnamed')}: {ratio:.2f}:1")
    if failures:
        print("Contrast validation failed:", file=sys.stderr)
        for name, ratio in failures:
            print(f"- {name}: {ratio:.2f}:1 < {args.minimum:.2f}:1", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
