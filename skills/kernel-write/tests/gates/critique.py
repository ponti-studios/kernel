import re

RULES = {
    "opens cold", "one metaphor", "direct address", "paragraph length", "strike",
    "fragments", "academic transitions", "false consensus", "explains the metaphor",
    "emphasis", "ends with a question", "statistics", "hedge words", "exclamation",
    "key takeaways", "uniform paragraphs",
}


def check(text, baseline=None):
    results = []
    results.append(("## Findings section", "## Findings" in text, "present" if "## Findings" in text else "missing"))

    finding_lines = [ln.strip() for ln in text.splitlines()
                     if ln.strip().startswith("- ") and not re.match(r"^- \[[a-z ]+\]", ln.strip())]
    results.append(("no uncited findings", not finding_lines, f"{len(finding_lines)} without [rule]"))

    cited = [ln for ln in text.splitlines() if ln.strip().startswith("- [")]
    valid = [ln for ln in cited if (m := re.match(r"^- \[([a-z ]+)\]", ln.strip())) and m.group(1) in RULES]
    results.append(("findings cite known rules", len(valid) == len(cited), f"{len(valid)}/{len(cited)} valid"))

    return results
