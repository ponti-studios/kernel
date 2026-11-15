#!/usr/bin/env python3
"""Inspect app bundle identity or a command-line executable without changing it."""

import plistlib
import shutil
import subprocess
import sys
from pathlib import Path


def bundle_info(path: Path) -> None:
    info_path = path / "Contents" / "Info.plist"
    print(f"Path: {path}")
    if not info_path.is_file():
        print("Info.plist: not found (not a standard .app bundle)")
    else:
        with info_path.open("rb") as info_file:
            info = plistlib.load(info_file)
        for key in ("CFBundleName", "CFBundleDisplayName", "CFBundleIdentifier", "CFBundleShortVersionString", "CFBundleVersion"):
            if info.get(key):
                print(f"{key}: {info[key]}")
    signature = subprocess.run(
        ["/usr/bin/codesign", "-dv", "--verbose=2", str(path)],
        capture_output=True,
        text=True,
        check=False,
    )
    signature_text = signature.stderr + signature.stdout
    for line in signature_text.splitlines():
        if line.startswith(("Identifier=", "TeamIdentifier=", "Authority=")):
            print(line)
    size = subprocess.run(["/usr/bin/du", "-sh", str(path)], capture_output=True, text=True, check=False)
    if size.returncode == 0:
        print(f"Size: {size.stdout.split()[0]}")


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: computer-workflows app-info <app-name-or-path>", file=sys.stderr)
        return 2
    query = sys.argv[1]
    path = Path(query).expanduser()
    if path.exists():
        if path.is_dir() and path.suffix.lower() == ".app":
            bundle_info(path.resolve())
        else:
            resolved = path.resolve()
            print(f"Path: {resolved}")
            print(subprocess.run(["/usr/bin/file", str(resolved)], capture_output=True, text=True, check=False).stdout.strip())
            print(subprocess.run(["/usr/bin/codesign", "-dv", "--verbose=2", str(resolved)], capture_output=True, text=True, check=False).stderr.strip())
        return 0

    spotlight = subprocess.run(
        ["/usr/bin/mdfind", "kMDItemContentType == 'com.apple.application-bundle'"],
        capture_output=True,
        text=True,
        check=False,
    )
    matches = [Path(line) for line in spotlight.stdout.splitlines() if line and query.casefold() in Path(line).name.casefold()]
    if matches:
        for index, match in enumerate(matches, start=1):
            if index > 1:
                print()
            bundle_info(match)
        if len(matches) > 1:
            print(f"\nFound {len(matches)} matching app bundles; use an exact path to inspect one.")
        return 0

    executable = shutil.which(query)
    if executable:
        resolved = Path(executable).resolve()
        print(f"Command: {query}")
        print(f"Path: {resolved}")
        print(subprocess.run(["/usr/bin/file", str(resolved)], capture_output=True, text=True, check=False).stdout.strip())
        signature = subprocess.run(["/usr/bin/codesign", "-dv", "--verbose=2", str(resolved)], capture_output=True, text=True, check=False)
        for line in (signature.stderr + signature.stdout).splitlines():
            if line.startswith(("Identifier=", "TeamIdentifier=", "Authority=")):
                print(line)
        return 0

    print(f"No app bundle or command found for {query!r}. Try an exact path.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
