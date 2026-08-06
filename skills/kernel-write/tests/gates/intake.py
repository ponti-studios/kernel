import re

CLASSIFICATIONS = ("content pipeline", "standalone artifact")


def check(text, baseline=None):
    results = []
    results.append(("# Brief", "# Brief" in text, "present" if "# Brief" in text else "missing"))

    source = re.search(r"\*\*Source:\*\*\s*(.+)", text)
    results.append(("source set", bool(source) and source.group(1).strip(), (source.group(1).strip() if source and source.group(1).strip() else "missing")))

    classification = re.search(r"\*\*Classification:\*\*\s*(.+)", text)
    if classification and classification.group(1).strip().lower() in CLASSIFICATIONS:
        results.append(("classification valid", True, classification.group(1).strip()))
    else:
        results.append(("classification valid", False, (classification.group(1).strip() if classification else "missing")))

    canon = re.search(r"\*\*Canon:\*\*\s*(.+)", text)
    results.append(("canon set", bool(canon) and canon.group(1).strip(), (canon.group(1).strip() if canon and canon.group(1).strip() else "missing")))

    return results
