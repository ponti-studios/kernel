#!/usr/bin/env python3
"""Find common hardcoded UI values in source files."""

from __future__ import annotations

import argparse
import re
from pathlib import Path

COLOR = re.compile(r"#[0-9a-fA-F]{3,8}\b")
CSS_SIZE = re.compile(r"(?<![\w-])\d+(?:\.\d+)?(?:px|rem|em|vh|vw)\b")
EXTENSIONS = {
    ".css",
    ".scss",
    ".sass",
    ".less",
    ".tsx",
    ".jsx",
    ".ts",
    ".js",
    ".vue",
    ".html",
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("paths", nargs="+", type=Path)
    parser.add_argument("--allow", action="append", default=[])
    args = parser.parse_args()
    findings = []
    allowed = set(args.allow)
    for root in args.paths:
        files = (
            [root]
            if root.is_file()
            else [path for path in root.rglob("*") if path.suffix in EXTENSIONS]
        )
        for file in files:
            for line_number, line in enumerate(
                file.read_text(encoding="utf-8").splitlines(), 1
            ):
                for pattern in (COLOR, CSS_SIZE):
                    for match in pattern.finditer(line):
                        if match.group() not in allowed:
                            findings.append(f"{file}:{line_number}: {match.group()}")
    if findings:
        print("Hardcoded UI values found:")
        print("\n".join(f"- {finding}" for finding in findings))
        return 1
    print("No hardcoded UI values found.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
