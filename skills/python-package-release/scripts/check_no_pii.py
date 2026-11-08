#!/usr/bin/env python3
"""Fail if personally identifying data lands in a repo that is about to go public.

Run before the first push and again in CI. Regex cannot recognise a human name, so it
covers the mechanical shapes (phone numbers, email addresses, uuids, absolute home
paths) and takes an optional denylist for names.

    python3 scripts/check_no_pii.py
    python3 scripts/check_no_pii.py --denylist ~/.config/<tool>/names.txt

Keep the denylist file OUTSIDE the repo, or it becomes the leak it exists to prevent.
Edit ALLOWED_EMAILS for the maintainer's own address; every other address must be a
reserved example domain.
"""

from __future__ import annotations

import argparse
import re
import subprocess
import sys

#: Only the reserved 555-01xx fictional range is acceptable in fixtures and docs.
PHONE = re.compile(r"\+\d{8,15}")

EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[A-Za-z]{2,}")
ALLOWED_EMAILS: set[str] = set()
ALLOWED_EMAIL_SUFFIXES = ("@example.com", "@example.org", "@users.noreply.github.com")

UUID = re.compile(
    r"\b[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}"
    r"-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\b"
)
HOME_PATH = re.compile(r"/Users/[A-Za-z0-9_.-]+")

SKIP_SUFFIXES = (".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip")


def tracked_files() -> list[str]:
    out = subprocess.run(["git", "ls-files"], capture_output=True, text=True, check=False)
    if out.returncode == 0 and out.stdout.strip():
        return out.stdout.split()
    return []


def scan(paths: list[str], denylist: list[str]) -> list[str]:
    problems: list[str] = []
    for path in paths:
        if path.endswith(SKIP_SUFFIXES) or path.startswith(".git/"):
            continue
        try:
            with open(path, encoding="utf-8") as handle:
                text = handle.read()
        except (UnicodeDecodeError, OSError):
            continue
        for number in PHONE.findall(text):
            if not re.fullmatch(r"\+1555\d{7}", number):
                problems.append(f"{path}: non-fictional phone number {number[:3]}****")
        for address in EMAIL.findall(text):
            if address in ALLOWED_EMAILS or address.endswith(ALLOWED_EMAIL_SUFFIXES):
                continue
            problems.append(f"{path}: unexpected email address {address}")
        for match in UUID.findall(text):
            problems.append(f"{path}: record uuid {match[:8]}...")
        for match in HOME_PATH.findall(text):
            problems.append(f"{path}: absolute home path {match}/...")
        lowered = text.lower()
        for term in denylist:
            if term and term.lower() in lowered:
                problems.append(f"{path}: denylisted term '{term}'")
    return problems


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--denylist", help="file of terms to block, one per line")
    parser.add_argument("files", nargs="*", help="files to scan (default: git-tracked)")
    args = parser.parse_args()

    denylist: list[str] = []
    if args.denylist:
        with open(args.denylist, encoding="utf-8") as handle:
            denylist = [
                line.strip()
                for line in handle
                if line.strip() and not line.startswith("#")
            ]

    paths = args.files or tracked_files()
    if not paths:
        print("no files to scan (run inside a git repository)", file=sys.stderr)
        return 2

    problems = scan(paths, denylist)
    if problems:
        print("PII found:", file=sys.stderr)
        for problem in problems:
            print(f"  {problem}", file=sys.stderr)
        return 1

    print(f"clean: {len(paths)} files scanned, no personal data found")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
