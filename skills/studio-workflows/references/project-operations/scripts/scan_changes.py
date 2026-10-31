#!/usr/bin/env python3
"""
Scans ponti-studios/projects/*/changes/ for in-progress change folders and
reports their task completion, or archives a single finished change.

Usage:
  scan_changes.py [--project NAME] [--vault-root PATH]
      Report status of every in-progress change across all projects
      (or one project with --project). Flags drift: changes that are
      100% complete but not yet archived, and tasks.md files that look
      like they're missing [P]/depends-on analysis.

  scan_changes.py --archive PROJECT CHANGE_SLUG [--vault-root PATH]
      Verify every task in that change's tasks.md is checked off, then
      move the whole change folder to changes/archive/. Aborts with a
      list of unchecked tasks if any remain — never archives a change
      that isn't actually done.
"""

import argparse
import re
import shutil
import sys
from pathlib import Path

TASK_LINE = re.compile(r"^- \[( |x|X)\]\s*(T\d+)\b(.*)$")
PARALLEL_MARK = "[P]"
DEPENDS_MARK = "(depends on"


def find_vault_root(start: Path) -> Path:
    """Walk upward looking for ponti-studios/ as a landmark."""
    current = start.resolve()
    for candidate in [current, *current.parents]:
        if (candidate / "ponti-studios").is_dir():
            return candidate
    return start.resolve()


def parse_tasks(tasks_md: Path):
    tasks = []
    if not tasks_md.exists():
        return tasks
    for line in tasks_md.read_text().splitlines():
        m = TASK_LINE.match(line.strip())
        if m:
            checked = m.group(1).lower() == "x"
            task_id = m.group(2)
            rest = m.group(3)
            tasks.append(
                {
                    "id": task_id,
                    "checked": checked,
                    "parallel": PARALLEL_MARK in rest,
                    "depends": DEPENDS_MARK in rest,
                    "text": rest.strip(),
                }
            )
    return tasks


def scan_project_changes(project_dir: Path):
    changes_dir = project_dir / "changes"
    if not changes_dir.is_dir():
        return []

    results = []
    for child in sorted(changes_dir.iterdir()):
        if not child.is_dir() or child.name == "archive":
            continue
        tasks = parse_tasks(child / "tasks.md")
        total = len(tasks)
        done = sum(1 for t in tasks if t["checked"])
        multi_task_no_notation = total > 1 and not any(
            t["parallel"] or t["depends"] for t in tasks
        )
        results.append(
            {
                "path": child,
                "total": total,
                "done": done,
                "complete": total > 0 and done == total,
                "missing_notation": multi_task_no_notation,
            }
        )
    return results


def report(vault_root: Path, project_filter: str | None):
    projects_dir = vault_root / "ponti-studios" / "projects"
    if not projects_dir.is_dir():
        print(f"No projects directory found at {projects_dir}", file=sys.stderr)
        return 1

    any_output = False
    for project_dir in sorted(projects_dir.iterdir()):
        if not project_dir.is_dir():
            continue
        if project_filter and project_dir.name != project_filter:
            continue
        changes = scan_project_changes(project_dir)
        if not changes:
            continue
        any_output = True
        print(f"\n## {project_dir.name}")
        for c in changes:
            pct = f"{c['done']}/{c['total']}" if c["total"] else "no tasks found"
            flags = []
            if c["complete"]:
                flags.append("READY TO ARCHIVE — all tasks checked, folder still in changes/")
            if c["missing_notation"]:
                flags.append(
                    "missing [P]/depends-on notation — multiple tasks with no "
                    "parallel/dependency markers, verify this is really a flat "
                    "unordered list and not an oversight"
                )
            flag_str = f"  ⚠ {' | '.join(flags)}" if flags else ""
            print(f"  - {c['path'].name}: {pct}{flag_str}")

    if not any_output:
        scope = f" for project '{project_filter}'" if project_filter else ""
        print(f"No in-progress changes found{scope}.")
    return 0


def archive(vault_root: Path, project: str, slug: str):
    project_dir = vault_root / "ponti-studios" / "projects" / project
    change_dir = project_dir / "changes" / slug
    if not change_dir.is_dir():
        print(f"No such change folder: {change_dir}", file=sys.stderr)
        return 1

    tasks = parse_tasks(change_dir / "tasks.md")
    unchecked = [t for t in tasks if not t["checked"]]
    if unchecked:
        print(f"Cannot archive '{slug}' — {len(unchecked)} task(s) still unchecked:")
        for t in unchecked:
            print(f"  - {t['id']}: {t['text']}")
        return 1

    archive_dir = project_dir / "changes" / "archive"
    archive_dir.mkdir(parents=True, exist_ok=True)
    destination = archive_dir / slug
    if destination.exists():
        print(f"Archive destination already exists: {destination}", file=sys.stderr)
        return 1

    shutil.move(str(change_dir), str(destination))
    print(f"Archived: {change_dir} -> {destination}")
    return 0


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project", help="Limit report to one project")
    parser.add_argument(
        "--vault-root", help="Vault root path (auto-detected if omitted)"
    )
    parser.add_argument(
        "--archive",
        nargs=2,
        metavar=("PROJECT", "CHANGE_SLUG"),
        help="Archive a single completed change after verifying all tasks are checked",
    )
    args = parser.parse_args()

    vault_root = (
        Path(args.vault_root) if args.vault_root else find_vault_root(Path.cwd())
    )

    if args.archive:
        return archive(vault_root, args.archive[0], args.archive[1])
    return report(vault_root, args.project)


if __name__ == "__main__":
    sys.exit(main())
