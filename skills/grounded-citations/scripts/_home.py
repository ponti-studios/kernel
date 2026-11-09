"""Resolve the Hominem home directory for standalone skill scripts.

Kernel powers Hominem now; Hermes is legacy. Skill scripts resolve their
state (tokens, client secrets, pending OAuth sessions) under
``$HOMINEM_HOME`` or ``~/.hominem``. There is intentionally no Hermes
fallback: migrated credentials live in exactly one place.
"""

from __future__ import annotations

import os
from pathlib import Path


def get_hominem_home() -> Path:
    """Return the Hominem home directory (default: ~/.hominem)."""
    val = os.environ.get("HOMINEM_HOME", "").strip()
    return Path(val) if val else Path.home() / ".hominem"


def display_hominem_home() -> str:
    """Return a user-friendly ``~/``-shortened display string."""
    home = get_hominem_home()
    try:
        return "~/" + home.relative_to(Path.home()).as_posix()
    except ValueError:
        return str(home)
