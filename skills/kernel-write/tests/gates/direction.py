import re

ABSTRACT_METAPHORS = (
    "paradigm", "framework", "journey", "ecosystem", "landscape", "narrative",
    "blueprint", "roadmap", "matrix", "lens",
)


def _field(text, label):
    m = re.search(rf"\*\*{label}:\*\*\s*(.+)", text)
    return m.group(1).strip() if m else None


def check(text, baseline=None):
    results = []
    results.append(("# Direction", "# Direction" in text, "header missing" if "# Direction" not in text else "present"))

    claims = re.findall(r"\*\*Claim:\*\*", text)
    results.append(("exactly one Claim", len(claims) == 1, f"{len(claims)} found"))

    metaphors = re.findall(r"\*\*Metaphor:\*\*", text)
    results.append(("exactly one Metaphor", len(metaphors) == 1, f"{len(metaphors)} found"))

    metaphor = _field(text, "Metaphor")
    if metaphor is None:
        results.append(("metaphor concrete", False, "missing"))
    else:
        low = metaphor.lower()
        abstract = [a for a in ABSTRACT_METAPHORS if a in low]
        results.append(("metaphor concrete", not abstract, metaphor[:60]))

    audience = _field(text, "Audience & intent")
    results.append(("audience & intent set", bool(audience), audience[:60] if audience else "missing"))

    return results
