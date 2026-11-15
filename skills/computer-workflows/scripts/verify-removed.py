#!/usr/bin/env python3
"""Report likely remaining app artifacts; does not delete or edit anything."""

import os
import subprocess
import sys
from pathlib import Path


def run(args: list[str], timeout: int = 15) -> subprocess.CompletedProcess[str] | None:
    try:
        return subprocess.run(args, capture_output=True, text=True, check=False, timeout=timeout)
    except subprocess.TimeoutExpired:
        return None


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: computer-workflows verify-removed <app-or-binary-name>", file=sys.stderr)
        return 2

    term = sys.argv[1].casefold()
    home = Path.home()
    roots = [
        Path("/Applications"),
        home / "Applications",
        home / ".local" / "bin",
        home / ".local" / "share",
        home / ".config",
        home / ".cache",
        home / "Library" / "Application Support",
        home / "Library" / "Application Scripts",
        home / "Library" / "Caches",
        home / "Library" / "Containers",
        home / "Library" / "Group Containers",
        home / "Library" / "HTTPStorages",
        home / "Library" / "LaunchAgents",
        home / "Library" / "Logs",
        home / "Library" / "Preferences",
        home / "Library" / "Saved Application State",
        home / "Library" / "WebKit",
        Path("/Library/Application Support"),
        Path("/Library/LaunchAgents"),
        Path("/Library/LaunchDaemons"),
        Path("/Library/PrivilegedHelperTools"),
    ]
    skip_dirs = {".git", "node_modules", "venv", ".venv"}
    artifacts: list[Path] = []
    for root in roots:
        if not root.is_dir():
            continue
        for current, dirs, files in os.walk(root, followlinks=False):
            current_path = Path(current)
            depth = len(current_path.relative_to(root).parts)
            dirs[:] = [name for name in dirs if name not in skip_dirs and depth < 5]
            for name in dirs + files:
                if term in name.casefold():
                    artifacts.append(current_path / name)

    print("Named paths in common install/support locations (filename matches only; max depth 5):")
    if artifacts:
        for path in sorted(set(artifacts), key=lambda item: str(item).casefold()):
            print(f"  {path}")
    else:
        print("  none found")

    if sys.argv[1].strip() and all(char.isalnum() or char in "._+-" for char in sys.argv[1]):
        found = run(["/usr/bin/which", "-a", sys.argv[1]])
        print("\nPATH lookup:")
        print(found.stdout.rstrip() if found and found.stdout.strip() else "  no matching command found")

    processes = run(["/bin/ps", "-axo", "pid=,comm="])
    process_matches = []
    if processes:
        for line in processes.stdout.splitlines():
            fields = line.strip().split(None, 1)
            if len(fields) == 2 and term in fields[1].casefold():
                process_matches.append(line.strip())
    print("\nProcesses (matched against executable path, not grep command lines):")
    print("\n".join(f"  {line}" for line in process_matches) if process_matches else "  none found")

    launchd = run(["/bin/launchctl", "list"])
    service_matches = [line for line in launchd.stdout.splitlines() if term in line.casefold()] if launchd else []
    print("\nLoaded launchd entries:")
    print("\n".join(f"  {line}" for line in service_matches) if service_matches else "  none found")

    btm = run(["/usr/bin/sfltool", "dumpbtm"], timeout=15)
    print("\nBackground Task Management records:")
    if btm is None:
        print("  query timed out; inspect with `computer-workflows btm <name>`")
    else:
        records = [line for line in btm.stdout.splitlines() if term in line.casefold()]
        print("\n".join(f"  {line}" for line in records) if records else "  no matching lines found")

    print("\nFull Disk Access is separate; inspect with `computer-workflows fda-remove-preview <exact-entry-name>`.")
    print("This is a bounded report, not proof that every reference on the disk is gone.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
