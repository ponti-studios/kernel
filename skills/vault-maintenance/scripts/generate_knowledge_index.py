#!/usr/bin/env python3
"""Validate and generate the Vault Skill System v2 discovery graph."""

from __future__ import annotations

import hashlib
import json
import re
import sys
from datetime import date
from pathlib import Path


KNOWLEDGE_REQUIRED = {"id", "title", "knowledge_type", "domain", "scope", "status", "updated"}
SKILL_REQUIRED = {"name", "description"}
MANIFEST_REQUIRED = {"id", "invocation", "canon"}
TYPES = {"contract", "process", "standard", "reference", "template", "playbook"}
STATUSES = {"active", "draft", "deprecated"}
INVOCATIONS = {"implicit", "explicit"}
FM_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)


def parse_frontmatter(text: str) -> dict[str, object]:
    match = FM_RE.match(text)
    if not match:
        return {}
    out: dict[str, object] = {}
    current: str | None = None
    for line in match.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line[:1] not in (" ", "-", "\t"):
            key, _, value = line.partition(":")
            current = key.strip()
            out[current] = value.strip().strip('"\'')
        elif current and line.lstrip().startswith("-"):
            item = line.lstrip()[1:].strip().strip('"\'')
            existing = out.get(current)
            if isinstance(existing, list):
                existing.append(item)
            elif existing in ("", None):
                out[current] = [item]
            else:
                out[current] = [str(existing), item]
    return out


def values(fm: dict[str, object], field: str) -> list[str]:
    value = fm.get(field, [])
    if isinstance(value, list):
        return [str(item) for item in value]
    if not value or value == "[]":
        return []
    return [str(value)]


def parse_manifest(path: Path) -> dict[str, object]:
    out: dict[str, object] = {}
    for line in path.read_text().splitlines():
        key, _, value = line.partition(":")
        if not _:
            continue
        value = value.strip()
        if value.startswith("[") and value.endswith("]"):
            out[key.strip()] = [item.strip() for item in value[1:-1].split(",") if item.strip()]
        else:
            out[key.strip()] = value
    return out


def body_hash(text: str) -> str:
    body = FM_RE.sub("", text, count=1)
    normalized = re.sub(r"\s+", " ", body).strip().lower()
    return hashlib.sha256(normalized.encode()).hexdigest()


def path_is_live(root: Path, glob: str) -> bool:
    literal = glob[2:] if glob.startswith("./") else glob
    literal = literal.split("/")[0]
    return bool(literal) and (root / literal).exists()


def knowledge_entry(path: Path, root: Path, owner: str | None, kind: str) -> tuple[dict[str, object], list[str], str]:
    text = path.read_text()
    fm = parse_frontmatter(text)
    errors: list[str] = []
    required = KNOWLEDGE_REQUIRED if kind == "canon" else KNOWLEDGE_REQUIRED - {"id"}
    missing = sorted(field for field in required if not values(fm, field))
    if missing:
        errors.append(f"{path.relative_to(root)}: missing {', '.join(missing)}")
    if fm.get("knowledge_type") not in TYPES:
        errors.append(f"{path.relative_to(root)}: invalid knowledge_type {fm.get('knowledge_type')!r}")
    if fm.get("status") not in STATUSES:
        errors.append(f"{path.relative_to(root)}: invalid status {fm.get('status')!r}")
    applies_to = values(fm, "applies_to")
    for glob in applies_to:
        if not path_is_live(root, glob):
            errors.append(f"{path.relative_to(root)}: stale applies_to root {glob!r}")
    entry = {
        "id": fm.get("id"),
        "title": fm.get("title"),
        "kind": kind,
        "owner": owner,
        "path": str(path.relative_to(root)),
        "knowledge_type": fm.get("knowledge_type"),
        "domain": fm.get("domain"),
        "scope": fm.get("scope"),
        "status": fm.get("status"),
        "updated": fm.get("updated"),
        "applies_to": applies_to,
        "description": fm.get("description", ""),
    }
    return entry, errors, body_hash(text)


def openai_invocation(skill_dir: Path) -> bool | None:
    config = skill_dir / "agents" / "openai.yaml"
    if not config.exists():
        return None
    match = re.search(r"allow_implicit_invocation:\s*(true|false)", config.read_text())
    return None if not match else match.group(1) == "true"


def main(root: Path) -> int:
    agents = root / ".agents"
    canon_dir = agents / "canon"
    skills_dir = agents / "skills"
    errors: list[str] = []
    canon: list[dict[str, object]] = []
    references: list[dict[str, object]] = []
    skills: list[dict[str, object]] = []
    ids: dict[str, str] = {}
    canon_hashes: dict[str, str] = {}

    for path in sorted(canon_dir.rglob("*.md")):
        entry, entry_errors, digest = knowledge_entry(path, root, None, "canon")
        errors.extend(entry_errors)
        item_id = str(entry["id"])
        if item_id in ids:
            errors.append(f"duplicate id {item_id!r}: {ids[item_id]} and {entry['path']}")
        else:
            ids[item_id] = str(entry["path"])
        canon_hashes[digest] = str(entry["path"])
        canon.append(entry)

    active_authority: dict[tuple[object, object], str] = {}
    for entry in canon:
        if entry["status"] != "active":
            continue
        key = (entry["domain"], entry["scope"])
        if key in active_authority:
            errors.append(f"overlapping active canon authority for {key}: {active_authority[key]} and {entry['path']}")
        else:
            active_authority[key] = str(entry["path"])

    canon_ids = {str(entry["id"]) for entry in canon if entry["status"] == "active"}
    for skill_dir in sorted(path for path in skills_dir.iterdir() if path.is_dir()):
        skill_file = skill_dir / "SKILL.md"
        if not skill_file.exists():
            continue
        fm = parse_frontmatter(skill_file.read_text())
        missing = sorted(field for field in SKILL_REQUIRED if not values(fm, field))
        if missing:
            errors.append(f"{skill_file.relative_to(root)}: missing {', '.join(missing)}")
            continue
        manifest_file = skill_dir / "agents" / "skill-manifest.yaml"
        if not manifest_file.exists():
            errors.append(f"{skill_file.relative_to(root)}: missing agents/skill-manifest.yaml")
            continue
        manifest = parse_manifest(manifest_file)
        manifest_missing = sorted(field for field in MANIFEST_REQUIRED if not values(manifest, field))
        if manifest_missing:
            errors.append(f"{manifest_file.relative_to(root)}: missing {', '.join(manifest_missing)}")
            continue
        skill_id = str(manifest["id"])
        if skill_id != skill_dir.name or str(fm["name"]) != skill_id:
            errors.append(f"{skill_file.relative_to(root)}: name, id, and directory must match")
        if manifest.get("invocation") not in INVOCATIONS:
            errors.append(f"{manifest_file.relative_to(root)}: invalid invocation {manifest.get('invocation')!r}")
        dependencies = values(manifest, "canon")
        for dependency in dependencies:
            if dependency not in canon_ids:
                errors.append(f"{skill_file.relative_to(root)}: unresolved active canon dependency {dependency!r}")
        configured = openai_invocation(skill_dir)
        expected = manifest.get("invocation") == "implicit"
        if configured is None:
            errors.append(f"{skill_file.relative_to(root)}: missing agents/openai.yaml invocation policy")
        elif configured != expected:
            errors.append(f"{skill_file.relative_to(root)}: invocation disagrees with agents/openai.yaml")
        local_refs: list[str] = []
        ref_dir = skill_dir / "references"
        if ref_dir.exists():
            for path in sorted(ref_dir.rglob("*.md")):
                entry, entry_errors, digest = knowledge_entry(path, root, skill_id, "reference")
                errors.extend(entry_errors)
                if digest in canon_hashes:
                    errors.append(f"{entry['path']}: duplicates canon body {canon_hashes[digest]}")
                references.append(entry)
                local_refs.append(str(entry["path"]))
        skills.append({
            "id": skill_id,
            "path": str(skill_dir.relative_to(root)),
            "invocation": manifest["invocation"],
            "description": fm["description"],
            "canon": dependencies,
            "references": local_refs,
        })

    if errors:
        print("VALIDATION FAILED:")
        for error in errors:
            print(f"  - {error}")
        return 1

    output = {
        "version": 2,
        "generated": str(date.today()),
        "contract": ".agents/canon/vault/knowledge-index-contract.md",
        "canon": canon,
        "skills": skills,
        "references": references,
    }
    (agents / "index.json").write_text(json.dumps(output, indent=2) + "\n")

    lines = [
        "# Agent Discovery Index",
        "",
        f"Generated {date.today()} by `generate_knowledge_index.py` — do not edit by hand.",
        "",
        "## Skills",
        "",
        "| Skill | Invocation | Canon |",
        "|---|---|---|",
    ]
    for skill in skills:
        lines.append(f"| `{skill['id']}` | {skill['invocation']} | {', '.join('`' + item + '`' for item in skill['canon'])} |")
    lines.extend(["", "## Canon", "", "| ID | Type | Domain | Scope |", "|---|---|---|---|"])
    for entry in canon:
        lines.append(f"| `{entry['id']}` | {entry['knowledge_type']} | `{entry['domain']}` | {entry['scope']} |")
    (agents / "INDEX.md").write_text("\n".join(lines) + "\n")
    print(f"OK: indexed {len(canon)} canon packs, {len(skills)} skills, and {len(references)} local references")
    return 0


if __name__ == "__main__":
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    raise SystemExit(main(root))
