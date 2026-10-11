#!/usr/bin/env python3
"""Validate JSON design tokens and resolve curly-brace aliases."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

ALIAS = re.compile(r"^\{([^}]+)\}$")
META = {"$schema", "$description", "$type", "$value", "description", "type"}


def collect(node: object, path: tuple[str, ...] = ()) -> dict[str, object]:
    tokens = {}
    if not isinstance(node, dict):
        return tokens
    if "$value" in node:
        tokens[".".join(path)] = node["$value"]
        return tokens
    for key, value in node.items():
        if key not in META:
            tokens.update(collect(value, path + (key,)))
    return tokens


def resolve(
    name: str, tokens: dict[str, object], stack: tuple[str, ...] = ()
) -> object:
    if name in stack:
        cycle = " -> ".join((*stack, name))
        raise ValueError(f"cyclic token alias: {cycle}")
    value = tokens[name]
    match = ALIAS.fullmatch(value) if isinstance(value, str) else None
    if match is None:
        return value
    target = match.group(1)
    if target not in tokens:
        raise ValueError(f"unresolved token alias: {name} -> {target}")
    return resolve(target, tokens, (*stack, name))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("directory", type=Path)
    args = parser.parse_args()
    files = (
        sorted(args.directory.rglob("*.json"))
        if args.directory.is_dir()
        else [args.directory]
    )
    tokens = {}
    for file in files:
        try:
            tokens.update(collect(json.loads(file.read_text(encoding="utf-8"))))
        except (OSError, json.JSONDecodeError) as error:
            print(f"{file}: {error}", file=sys.stderr)
            return 1
    failures = []
    for name in tokens:
        try:
            resolve(name, tokens)
        except ValueError as error:
            failures.append(str(error))
    if failures:
        print("Unresolved token aliases:", file=sys.stderr)
        print("\n".join(f"- {failure}" for failure in failures), file=sys.stderr)
        return 1
    print(f"Validated {len(tokens)} tokens in {len(files)} file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
