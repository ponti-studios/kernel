import re
from . import draft


def check(text, baseline=None):
    results = []
    stripped = text.strip()
    first = stripped.splitlines()[0] if stripped else ""
    version = re.match(r"^# v?(\d+\.\d+)(.*)$", first)
    results.append(("version line", bool(version), first[:40]))

    _, body = draft.split_title(text)
    results.extend(draft.check(text))

    if baseline is not None:
        _, baseline_body = draft.split_title(baseline)
        frozen = body.strip() == baseline_body.strip()
        results.append(("essay frozen", frozen, "changed after approval" if not frozen else "frozen"))

    return results
