import re
from pathlib import Path

from . import draft
from . import _helpers as H


def slug_for(text):
    """Derive '<slug>-v<version>' from a versioned title line, e.g.
    '# v1.0 — The Taxidermy Instinct' -> 'the-taxidermy-instinct-v1.0'."""
    first = text.strip().splitlines()[0] if text.strip() else ""
    m = re.match(r"^# v?(\d+\.\d+)\s*[—\-:]*\s*(.+)$", first)
    if not m:
        return None
    version, title = m.group(1), m.group(2)
    slug = re.sub(r"[^a-z0-9]+", "-", title.strip().lower()).strip("-")
    return f"{slug}-v{version}"


def check(text, baseline=None, output_dir=None):
    results = []
    stripped = text.strip()
    first = stripped.splitlines()[0] if stripped else ""
    version = re.match(r"^# v?(\d+\.\d+)(.*)$", first)
    results.append(("version line", bool(version), first[:40]))

    _, body = H.split_title(text)
    results.extend(draft.check(text))

    if baseline is not None:
        _, baseline_body = H.split_title(baseline)
        frozen = body.strip() == baseline_body.strip()
        results.append(("essay frozen", frozen, "changed after approval" if not frozen else "frozen"))

    if output_dir is not None:
        slug = slug_for(text)
        if slug is None:
            results.append(("essay written to output dir", False, "no version line to derive filename from"))
        else:
            path = Path(output_dir).expanduser() / f"{slug}.md"
            results.append(("essay written to output dir", path.exists(), str(path)))

    return results
