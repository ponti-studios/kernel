#!/usr/bin/env python3
"""Verify the v2 routing contract encoded in .agents/index.json."""

from __future__ import annotations

import json
import sys
from pathlib import Path


CASES = {
    "organize a root note": ("vault-maintenance", {"vault.maintenance-contract", "vault.knowledge-index-contract"}, "vault structure"),
    "edit a project change folder": ("project-operations", {"vault.maintenance-contract", "ponti.current-system", "ponti.principles"}, "Ponti Studios projects"),
    "process an inbox bullet": ("inbox-triage", {"vault.maintenance-contract"}, "raw inbox"),
    "distill a transcript": ("note-distillation", {"vault.maintenance-contract", "interaction.collaboration"}, "Distill"),
    "analyze an AI conversation": ("conversation-analysis", {"interaction.collaboration"}, "Analyze"),
    "turn a meeting transcript into a research brief": ("transcript-to-brief", {"vault.maintenance-contract", "ponti.brand.editing"}, "structured"),
    "rewrite notes into a 1000 word essay": ("longform-essay", {"vault.maintenance-contract", "ponti.voice.foundation", "ponti.style-contract"}, "900–1200"),
    "produce posts from an approved essay": ("content-pipeline", {"ponti.voice.foundation", "ponti.style-contract", "ponti.brand.copy"}, "approved"),
    "turn a three sentence thought into a camera script": ("direct-video", {"ponti.voice.foundation"}, "raw thought"),
    "create a PRD": ("document-authoring", {"ponti.brand.copy", "ponti.brand.editing", "ponti.principles"}, "document"),
    "design a workshop": ("workshop-design", {"ponti.principles", "ponti.brand.copy"}, "workshop"),
    "assemble a dossier": ("dossier-builder", {"ponti.brand.copy", "ponti.principles"}, "dossier"),
    "plan a film shoot": ("film-production", {"ponti.principles", "ponti.design"}, "film"),
    "break a plan into task files": ("plan-to-tasks", {"vault.maintenance-contract"}, "task files"),
}


def main(root: Path) -> int:
    data = json.loads((root / ".agents" / "index.json").read_text())
    skills = {entry["id"]: entry for entry in data["skills"]}
    errors = []
    for request, (skill_id, canon, phrase) in CASES.items():
        skill = skills.get(skill_id)
        if skill is None:
            errors.append(f"{request}: missing {skill_id}")
            continue
        if set(skill["canon"]) != canon:
            errors.append(f"{request}: {skill_id} canon {skill['canon']} != {sorted(canon)}")
        if phrase.lower() not in skill["description"].lower():
            errors.append(f"{request}: {skill_id} description lacks routing phrase {phrase!r}")
    if errors:
        print("ROUTING VALIDATION FAILED:")
        for error in errors:
            print(f"  - {error}")
        return 1
    print(f"OK: {len(CASES)} routing cases map to one primary skill with the expected canon")
    return 0


if __name__ == "__main__":
    root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path.cwd()
    raise SystemExit(main(root))
