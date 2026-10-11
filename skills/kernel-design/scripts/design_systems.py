#!/usr/bin/env python3
"""Search the curated design-system categories."""

from __future__ import annotations

import argparse

SYSTEMS = {
    "editorial": "Content hierarchy, measured columns, strong type scale, restrained chrome.",
    "utility": "Repeated operational work, dense rows, stable controls, compact feedback.",
    "archive": "Records and traceability, metadata, provenance, deliberate indexing.",
    "instrument": "Live status and monitoring, persistent state, thresholds, progressive disclosure.",
    "gallery": "Visual comparison, large media, controlled captions, predictable browsing.",
}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=["search"])
    parser.add_argument("term")
    args = parser.parse_args()
    term = args.term.lower()
    matches = [
        (name, description)
        for name, description in SYSTEMS.items()
        if term in name or term in description.lower()
    ]
    for name, description in matches:
        print(f"{name}: {description}")
    if not matches:
        print("No curated system matched; choose from: " + ", ".join(SYSTEMS))
