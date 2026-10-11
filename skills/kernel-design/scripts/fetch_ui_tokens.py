#!/usr/bin/env python3
"""Fetch and validate the canonical @ponti-studios/ui token source."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import quote
from urllib.request import Request, urlopen

OWNER = "ponti-studios"
REPOSITORY = "ui"
TOKEN_PATH = "src/styles/tokens/source"
API_ROOT = "https://api.github.com/repos"


def request_json(url: str) -> object:
    request = Request(
        url,
        headers={
            "Accept": "application/vnd.github+json",
            "User-Agent": "kernel-ui-token-validator",
        },
    )
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def fetch_tokens(destination: Path, ref: str) -> list[Path]:
    api_url = (
        f"{API_ROOT}/{OWNER}/{REPOSITORY}/contents/{TOKEN_PATH}"
        f"?ref={quote(ref, safe='')}"
    )
    entries = request_json(api_url)
    if not isinstance(entries, list):
        raise RuntimeError("GitHub returned a file instead of a token directory")

    files: list[Path] = []
    for entry in entries:
        if not isinstance(entry, dict) or entry.get("type") != "file":
            continue
        name = entry.get("name", "")
        download_url = entry.get("download_url")
        if not name.endswith(".tokens.json") or not isinstance(download_url, str):
            continue
        target = destination / name
        target.write_bytes(download(download_url))
        files.append(target)

    if not files:
        raise RuntimeError(
            f"No *.tokens.json files found at {OWNER}/{REPOSITORY}:{ref}/{TOKEN_PATH}"
        )
    return files


def download(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "kernel-ui-token-validator"})
    with urlopen(request, timeout=30) as response:
        return response.read()


def validate(directory: Path) -> int:
    validator = Path(__file__).with_name("validate_tokens.py")
    result = subprocess.run(
        [sys.executable, str(validator), str(directory)],
        check=False,
    )
    return result.returncode


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ref", default="main", help="Branch, tag, or commit to fetch")
    parser.add_argument(
        "--output",
        type=Path,
        help="Directory to retain downloaded tokens; otherwise use a temporary directory",
    )
    parser.add_argument(
        "--keep", action="store_true", help="Retain a temporary download"
    )
    args = parser.parse_args()

    temporary: Path | None = None
    destination = args.output
    try:
        if destination is None:
            temporary = Path(tempfile.mkdtemp(prefix="ponti-ui-tokens-"))
            destination = temporary
        destination.mkdir(parents=True, exist_ok=True)
        files = fetch_tokens(destination, args.ref)
        print(f"Fetched {len(files)} token files from {OWNER}/{REPOSITORY}@{args.ref}")
        return validate(destination)
    except (HTTPError, URLError, OSError, RuntimeError, ValueError) as error:
        print(f"Unable to fetch canonical UI tokens: {error}", file=sys.stderr)
        return 1
    finally:
        if temporary is not None and not args.keep:
            shutil.rmtree(temporary, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
