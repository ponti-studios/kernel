#!/usr/bin/env python3
"""Validate the installable-skill contract and catalog parity.

Format ownership belongs to `muse skills validate`: this script checks only
what that tool cannot — that every skill has a parseable frontmatter block
with a usable name and description, that the name matches its directory,
that local links resolve, and that the skills.sh.json catalog lists exactly
the skills on disk.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS_DIR = ROOT / "skills"
MANIFEST = ROOT / "skills.sh.json"
SKILL_NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LOCAL_LINK = re.compile(r"\[[^]]+\]\(([^)#]+)(?:#[^)]+)?\)")
CODE_SPAN = re.compile(r"`[^`]*`")
VENDORED_DATA_SEGMENT = "/data/"


def frontmatter(path: Path) -> tuple[dict[str, str], list[str]]:
    """Return the top-level frontmatter values and any parse errors."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return {}, ["missing frontmatter opener"]
    try:
        end = lines.index("---", 1)
    except ValueError:
        return {}, ["missing frontmatter closer"]

    values: dict[str, str] = {}
    for line in lines[1:end]:
        if line.startswith((" ", "\t")) or not line.strip():
            continue
        match = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$", line)
        if match:
            key, value = match.groups()
            values[key] = (value or "").strip().strip("\"'")
    return values, []


def frontmatter_contract(values: dict[str, str]) -> list[str]:
    """Return errors for the structural minimum every skill needs."""
    errors: list[str] = []

    name = values.get("name", "")
    if not name:
        errors.append("missing frontmatter key 'name'")
    elif len(name) > 64 or not SKILL_NAME.fullmatch(name):
        errors.append("'name' must be 1-64 lowercase letters, numbers, or hyphens")

    if not values.get("description", ""):
        errors.append("'description' must be a non-empty string")
    elif len(values['description']) > 1024:
        errors.append("'description' must be at most 1024 characters")

    return errors


def local_link_errors(path: Path) -> list[str]:
    errors: list[str] = []
    # Vendored datasets (OWASP ASVS/MASVS/MASTG exports) reference upstream
    # repository pages that are intentionally not shipped; skip link checking.
    if VENDORED_DATA_SEGMENT in path.relative_to(ROOT).as_posix():
        return errors
    text = path.read_text(encoding="utf-8")
    # Strip fenced code blocks and inline code spans: their contents are code,
    # not navigation links.
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = CODE_SPAN.sub("", text)
    for target in LOCAL_LINK.findall(text):
        if target.startswith(("http://", "https://", "mailto:")):
            continue
        # Reference documents intentionally contain example placeholders and
        # code-like syntax that Markdown parsers also interpret as links.
        if target in {"link", "url", "path/to/doc.md"} or "short-kebab" in target or "<" in target or "::" in target:
            continue
        resolved = (path.parent / target).resolve()
        try:
            package = SKILLS_DIR / path.relative_to(SKILLS_DIR).parts[0]
            resolved.relative_to(package.resolve())
        except ValueError:
            errors.append(f"{path.relative_to(ROOT)} links outside its installed package: {target}")
            continue
        if not resolved.exists():
            errors.append(f"{path.relative_to(ROOT)} links to missing {target}")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.parse_args(argv)

    errors: list[str] = []
    installable = sorted(path.parent.name for path in SKILLS_DIR.glob("*/SKILL.md"))
    seen_names: set[str] = set()

    for skill_dir in sorted(path for path in SKILLS_DIR.iterdir() if path.is_dir()):
        entrypoint = skill_dir / "SKILL.md"
        if not entrypoint.exists():
            if not any(path.is_file() for path in skill_dir.rglob("*")):
                continue
            errors.append(f"{skill_dir.relative_to(ROOT)} has no SKILL.md")
            continue
        values, parse_errors = frontmatter(entrypoint)
        nested = [p for p in skill_dir.rglob('SKILL.md') if p != entrypoint]
        errors.extend(f"{p.relative_to(ROOT)}: nested discoverable skill; use WORKFLOW.md" for p in nested)
        errors.extend(f"{p.relative_to(ROOT)}: symlink is not a portable package resource" for p in skill_dir.rglob('*') if p.is_symlink())
        errors.extend(f"{entrypoint.relative_to(ROOT)}: {error}" for error in parse_errors)
        errors.extend(
            f"{entrypoint.relative_to(ROOT)}: {error}" for error in frontmatter_contract(values)
        )
        declared = values.get("name", "")
        if declared != skill_dir.name:
            errors.append(f"{entrypoint.relative_to(ROOT)}: name '{declared}' does not match directory '{skill_dir.name}'")
        if declared in seen_names:
            errors.append(f"duplicate skill name: {declared}")
        seen_names.add(declared)
        errors.extend(local_link_errors(entrypoint))
        for markdown in skill_dir.rglob("*.md"):
            if markdown != entrypoint:
                errors.extend(local_link_errors(markdown))

    try:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
        catalog = [skill for group in manifest["groupings"] for skill in group["skills"]]
    except (OSError, KeyError, TypeError, json.JSONDecodeError) as error:
        errors.append(f"invalid skills.sh.json: {error}")
        catalog = []

    duplicates = sorted({skill for skill in catalog if catalog.count(skill) > 1})
    errors.extend(f"duplicate catalog entry: {skill}" for skill in duplicates)
    errors.extend(f"missing from skills.sh.json: {skill}" for skill in sorted(set(installable) - set(catalog)))
    errors.extend(f"catalog entry has no SKILL.md: {skill}" for skill in sorted(set(catalog) - set(installable)))

    migration_path = ROOT / 'docs/refactor-map.json'
    try:
        migration = json.loads(migration_path.read_text(encoding='utf-8'))
        for old, target in migration.items():
            base = ROOT if target.startswith('runtime/') else SKILLS_DIR
            destination = (base / target).resolve()
            try:
                destination.relative_to(base.resolve())
            except ValueError:
                errors.append(f'migration {old} escapes its source root')
                continue
            if not destination.is_file():
                errors.append(f'migration {old} points to missing {target}')
    except (OSError, TypeError, ValueError) as error:
        errors.append(f'invalid migration map: {error}')

    if errors:
        print("Skill library validation failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    print(
        f"Skill library valid: {len(installable)} skills, catalog parity confirmed."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
