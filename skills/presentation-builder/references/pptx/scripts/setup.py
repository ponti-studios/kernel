#!/usr/bin/env python3
"""Dependency setup for the pptx procedure.

The skill owns its dependency. Do not `pip install python-pptx` ad hoc:
that lands the package in whatever interpreter happens to be first on PATH
and drifts across environments. Install and check through this script.

Commands:
  setup.py --check           # python-pptx importable here? exit 0 = yes, 1 = no
  setup.py --install-deps     # install python-pptx into THIS interpreter

--check prints the interpreter it inspected, so a mismatch between the
checking and the running interpreter is visible before a battery run.
"""

from __future__ import annotations

import argparse
import importlib.util
import subprocess
import sys

REQUIRED = "python-pptx"
MODULE = "pptx"


def setup_path() -> str:
    import os
    return os.path.join(os.path.dirname(os.path.abspath(__file__)), "setup.py")


def check() -> int:
    spec = importlib.util.find_spec(MODULE)
    if spec is None:
        print(f"python-pptx is NOT importable from: {sys.executable}")
        print(f"Install via the skill:  python3 {setup_path()} --install-deps")
        return 1
    print(f"python-pptx importable from: {sys.executable}")
    return 0


def install_deps() -> int:
    print(f"Installing {REQUIRED} into: {sys.executable}")
    proc = subprocess.run(
        [sys.executable, "-m", "pip", "install", REQUIRED],
    )
    if proc.returncode != 0:
        return proc.returncode
    return check()


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    group = ap.add_mutually_exclusive_group(required=True)
    group.add_argument("--check", action="store_true")
    group.add_argument("--install-deps", action="store_true")
    args = ap.parse_args()
    if args.install_deps:
        return install_deps()
    return check()


if __name__ == "__main__":
    sys.exit(main())
