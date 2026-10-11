#!/usr/bin/env python3
"""Validate the installable-skill contract and catalog parity."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKILLS_DIR = ROOT / "skills"
MANIFEST = ROOT / "skills.sh.json"
REQUIRED_STANDARD_FRONTMATTER = {"name", "description"}
OPTIONAL_STANDARD_FRONTMATTER = {
    "license",
    "compatibility",
    "metadata",
    "allowed-tools",
}
STANDARD_FRONTMATTER = REQUIRED_STANDARD_FRONTMATTER | OPTIONAL_STANDARD_FRONTMATTER
LEGACY_KERNEL_FRONTMATTER = {
    "when",
    "outputs",
    "termination",
    "applicability",
    "argumentHint",
    "disableModelInvocation",
    "allowedTools",
    "dependencies",
}
SKILL_NAME = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
LOCAL_LINK = re.compile(r"\[[^]]+\]\(([^)#]+)(?:#[^)]+)?\)")
CODE_SPAN = re.compile(r"`[^`]*`")
VENDORED_DATA_SEGMENT = "/data/"


def frontmatter(path: Path) -> tuple[set[str], dict[str, str], list[str]]:
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return set(), {}, ["missing frontmatter opener"]
    try:
        end = lines.index("---", 1)
    except ValueError:
        return set(), {}, ["missing frontmatter closer"]

    keys: set[str] = set()
    values: dict[str, str] = {}
    for line in lines[1:end]:
        match = re.match(r"^([A-Za-z][A-Za-z0-9_-]*):(?:\s*(.*))?$", line)
        if match:
            key, value = match.groups()
            keys.add(key)
            values[key] = (value or "").strip().strip('"')
    return keys, values, []


def frontmatter_contract(
    keys: set[str], values: dict[str, str], strict: bool = False
) -> tuple[list[str], list[str]]:
    """Return frontmatter errors and migration warnings for one skill."""
    errors: list[str] = []
    warnings: list[str] = []

    missing = REQUIRED_STANDARD_FRONTMATTER - keys
    errors.extend(f"missing frontmatter key '{key}'" for key in sorted(missing))

    unsupported = keys - STANDARD_FRONTMATTER - LEGACY_KERNEL_FRONTMATTER
    errors.extend(
        f"unsupported top-level frontmatter key '{key}'"
        for key in sorted(unsupported)
    )

    legacy = keys & LEGACY_KERNEL_FRONTMATTER
    if legacy:
        names = ", ".join(sorted(legacy))
        message = f"non-standard kernel frontmatter fields: {names}"
        if strict:
            errors.append(message)
        else:
            warnings.append(message)

    name = values.get("name", "")
    if name and (len(name) > 64 or not SKILL_NAME.fullmatch(name)):
        errors.append("'name' must be 1-64 lowercase letters, numbers, or hyphens")

    description = values.get("description", "")
    if not description:
        errors.append("'description' must be a non-empty string")
    elif len(description) > 1024:
        errors.append("'description' must be at most 1024 characters")

    compatibility = values.get("compatibility")
    if "compatibility" in keys:
        if not compatibility:
            errors.append("'compatibility' must be a non-empty string when provided")
        elif len(compatibility) > 500:
            errors.append("'compatibility' must be at most 500 characters")

    allowed_tools = values.get("allowed-tools")
    if "allowed-tools" in keys and not allowed_tools:
        errors.append("'allowed-tools' must be a non-empty space-separated string")

    return errors, warnings


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
        if not (path.parent / target).exists():
            errors.append(f"{path.relative_to(ROOT)} links to missing {target}")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--strict-frontmatter",
        action="store_true",
        help="fail when skills still use legacy kernel-only frontmatter fields",
    )
    args = parser.parse_args(argv)

    errors: list[str] = []
    warnings: list[str] = []
    installable = sorted(path.parent.name for path in SKILLS_DIR.glob("*/SKILL.md"))
    seen_names: set[str] = set()

    for skill_dir in sorted(path for path in SKILLS_DIR.iterdir() if path.is_dir()):
        entrypoint = skill_dir / "SKILL.md"
        if not entrypoint.exists():
            if not any(path.is_file() for path in skill_dir.rglob("*")):
                continue
            errors.append(f"{skill_dir.relative_to(ROOT)} has no SKILL.md")
            continue
        keys, values, parse_errors = frontmatter(entrypoint)
        errors.extend(f"{entrypoint.relative_to(ROOT)}: {error}" for error in parse_errors)
        contract_errors, contract_warnings = frontmatter_contract(
            keys, values, strict=args.strict_frontmatter
        )
        errors.extend(
            f"{entrypoint.relative_to(ROOT)}: {error}" for error in contract_errors
        )
        warnings.extend(
            f"{entrypoint.relative_to(ROOT)}: {warning}"
            for warning in contract_warnings
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

    if errors:
        print("Skill library validation failed:")
        print("\n".join(f"- {error}" for error in errors))
        return 1
    if warnings:
        print("Legacy frontmatter migration warnings:")
        print("\n".join(f"- {warning}" for warning in warnings))
    print(
        f"Skill library valid: {len(installable)} skills, catalog parity confirmed."
    )
    if warnings:
        print(
            f"{len(warnings)} skill(s) still use legacy frontmatter; "
            "use --strict-frontmatter after migrating them."
        )
    return 0


if __name__ == "__main__":
    sys.exit(main())
