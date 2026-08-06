from . import draft


def check(text, baseline=None):
    body, rejected = text, None
    if "## Rejected Findings" in text:
        body, _, rejected = text.partition("## Rejected Findings")

    results = draft.check(body)

    if rejected is not None:
        items = [ln for ln in rejected.splitlines() if ln.strip().startswith("- ")]
        results.append(("rejected findings documented", len(items) >= 1, f"{len(items)} rejected"))

    if baseline is not None:
        changed = text.strip() != baseline.strip()
        results.append(("edited from draft", changed, "unchanged" if not changed else "differs from baseline"))

    return results
