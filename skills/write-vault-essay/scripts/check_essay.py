#!/usr/bin/env python3
"""Validate longform essays against .agents/skills/longform-essay/references/contract.md

Replaces ad-hoc `python3 -c` one-liners with a reusable gate checker.
Bash handles simple counts (`wc -w`, `grep`); this script handles
frontmatter, paragraph rhythm, and combined reporting.

Usage:
  python3 .agents/skills/longform-essay/scripts/check_essay.py notes/culture.the-target-shirt.md
  python3 .agents/skills/longform-essay/scripts/check_essay.py notes/*.md
  python3 .agents/skills/longform-essay/scripts/check_essay.py --json notes/culture.the-target-shirt.md

Exit 0 if all gates pass, 1 otherwise. With --json, emits machine-readable report.
"""

import argparse
import json
import re
import sys
from pathlib import Path

FM_RE = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)
HEDGE_WORDS = ["arguably", "perhaps", "interestingly", "some might say"]
ACADEMIC_TRANSITIONS = [" thus", " therefore", " however", " furthermore"]
REQUIRED_FM = [
    "slug",
    "title",
    "category",
    "status",
    "visibility",
    "type",
    "pubDate",
    "updated",
    "tags",
    "description",
    "opinionated",
]


def parse_frontmatter(text: str) -> dict:
    m = FM_RE.match(text)
    if not m:
        return {}
    fm, cur, out = m.group(1), None, {}
    for line in fm.splitlines():
        if not line.strip() or line.strip().startswith("#"):
            continue
        if line[:1] not in (" ", "-", "\t"):
            k, _, v = line.partition(":")
            cur = k.strip()
            out[cur] = v.strip()
        elif cur and line.lstrip().startswith("-"):
            item = line.lstrip()[1:].strip().strip("\"'")
            out[cur] = out.get(cur, [])
            if isinstance(out[cur], str):
                out[cur] = [out[cur]] if out[cur] else []
            out[cur].append(item)
    return out


def count_body_words(body: str) -> int:
    return len(re.findall(r"\b\w+\b", body))


def sentence_count(para: str) -> int:
    # Use punctuation + hard line breaks; drop trailing quotes/closing chars
    # so a paragraph ending in ." or .) doesn't count a phantom sentence,
    # and drop empty/punctuation-only fragments.
    parts = [s for s in re.split(r"[.!?]+", para) if re.search(r"\w", s)]
    return len(parts) if parts else 1


def check_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    fm = parse_frontmatter(text)
    body = re.sub(r"\A---\n.*?\n---\n", "", text, flags=re.DOTALL).strip()

    errors, warns = [], []
    info = {}

    # frontmatter
    if not fm:
        errors.append("frontmatter: missing or unparseable (need --- block)")
    else:
        for k in REQUIRED_FM:
            if k not in fm or fm[k] in ("", "[]"):
                errors.append(f"frontmatter: missing required field '{k}'")
        if fm.get("slug") and fm["slug"].strip().strip("\"'") != path.stem:
            errors.append(
                f"frontmatter: slug '{fm.get('slug')}' != filename stem '{path.stem}'"
            )

    # length — cap aligned to the approved exemplar (hollywoods-wedding-tax, 1443w)
    wc = count_body_words(body)
    info["words"] = wc
    if wc < 800 or wc > 1500:
        errors.append(f"length: {wc} words — fail (<800 or >1500)")
    elif wc < 850 or wc > 1450:
        warns.append(
            f"length: {wc} words — tolerable but outside 900-1200 ideal (850-1450)"
        )
    else:
        info["length"] = "pass"

    # headers (### only, not # title)
    headers = [l for l in body.splitlines() if l.startswith("### ")]
    info["headers"] = len(headers)
    if len(headers) < 2 or len(headers) > 4:
        # headers are allowed 2-4; outside is warn not hard fail unless 0
        if len(headers) == 0:
            warns.append(
                f"headers: {len(headers)} — expected 2-4 ### breaks for longform (0 is kernel-write style)"
            )
        elif len(headers) > 4:
            errors.append(f"headers: {len(headers)} — exceeds 4, will feel choppy")

    # paragraphs — rhythm and landings operate on BODY paragraphs only.
    # The title (# ...) and ### headers are structural breaks, not content:
    # counting them inflated the landing count (3 headers always >= 2) and
    # masked real adjacency failures where a single-sentence landing sat
    # next to a header. Body paragraphs are compared ACROSS section breaks.
    paras = [p.strip() for p in body.split("\n\n") if p.strip()]
    # blockquotes are quoted material (Option A/B, source quotes) — not the
    # author's prose rhythm; exclude them from adjacency/landing judgment.
    body_paras = [p for p in paras if not p.startswith("#") and not p.startswith(">")]
    lengths = [sentence_count(p) for p in body_paras]
    single = [i for i, c in enumerate(lengths) if c == 1]
    info["paras"] = len(paras)
    info["body_paras"] = len(body_paras)
    info["single_sentence_landings"] = len(single)
    if len(single) < 2:
        errors.append(
            f"paragraph rhythm: only {len(single)} single-sentence landing(s) — need ≥2"
        )
    # adjacency is a threshold, not any-pair: a lone 7,7 or 4,4 pair is the
    # approved exemplar's own pattern. Flag when it becomes systemic.
    adj = [i for i in range(len(lengths) - 1) if lengths[i] == lengths[i + 1]]
    triples = [
        i
        for i in range(len(lengths) - 2)
        if lengths[i] == lengths[i + 1] == lengths[i + 2]
    ]
    if triples or len(adj) >= 3:
        errors.append(
            f"paragraph rhythm: uniform — {len(adj)} adjacent same-length pair(s) (incl. triples at {triples}) — vary rhythm (e.g., 2,5,1,4 not 3,3)"
        )
    elif adj:
        warns.append(
            f"paragraph rhythm: {len(adj)} adjacent same-length pair(s) at {adj} — acceptable if deliberate, watch uniformity"
        )

    # forbidden strings — context-aware: the exemplar (economics.hollywoods-wedding-tax.md)
    # deliberately uses "perhaps $50 billion" (estimation, not hedging) and "therefore, we
    # should become Netflix" (parody of corporate logic, mid-sentence). Only flag the
    # AI-slop patterns: hedges that hedge a claim (not a number) and transitions that
    # open a sentence (academic pivot), not a clause inside a sentence.
    low = text.lower()
    # sentences split on . ! ? — inspect each for transition at clause/start position
    sents = re.split(r"(?<=[.!?])\s+", body)
    for w in HEDGE_WORDS:
        # skip if the hedge introduces a numeral (estimation: "perhaps $50 billion")
        for m in re.finditer(re.escape(w), low):
            tail = low[m.end() : m.end() + 12].lstrip()
            if tail[:1].isdigit() or tail.startswith(("$", "€", "£", "%")):
                continue  # estimation, not hedging
            errors.append(f"hedge word: '{w}' found — remove")
            break
    for w in ACADEMIC_TRANSITIONS:
        target = w.strip()
        for s in sents:
            # flag only when the transition opens the sentence (academic pivot),
            # or appears as the clause-opening "therefore,"
            s_low = s.lower()
            if s_low.startswith((target + ",", target + " ")):
                errors.append(
                    f"academic transition: '{target}' found opening a sentence — remove"
                )
                break
    if "!" in body:
        errors.append("style: '!' found — no exclamation points")
    if "in conclusion" in low or "key takeaways" in low:
        errors.append(
            "style: 'In conclusion' / 'key takeaways' found — use strike ending"
        )
    if body.strip().endswith("?"):
        errors.append("ending: last line is a question — must be a strike")
    # check starts cold: first non-title paragraph should not be generic context
    first_para = next((p for p in paras if not p.startswith("#")), "")
    if re.match(
        r"(?i)^in recent years|^in today.s world|^throughout history",
        first_para.strip(),
    ):
        errors.append("opening: starts with generic context — open cold on strike")

    # italics: count *...* but exclude ** and code
    italics = re.findall(r"(?<!\*)\*[^*\n]+\*(?!\*)", body)
    # allow ~1 per 250 words (aligned to exemplar, which italicizes titles
    # and the metaphor shibboleth) with +4 slack for film/book titles
    allowed = max(1, wc // 250)
    if len(italics) > allowed + 4:
        warns.append(
            f"italics: {len(italics)} *...* spans — allowed ~{allowed} (1 per 250w); keep sparingly"
        )

    # quick check for bare # headers inside body (should be ### only)
    bare_h1 = [l for l in body.splitlines() if re.match(r"^# ", l)]
    # First line is title "# <Title>" — allow exactly one
    if len(bare_h1) > 1:
        errors.append(
            f"headers: found {len(bare_h1)} '# ' lines — only title should be H1, use ### inside"
        )

    passed = len(errors) == 0
    return {
        "path": str(path),
        "passed": passed,
        "errors": errors,
        "warns": warns,
        "info": info,
        "frontmatter": fm,
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Check longform essay contract gates")
    ap.add_argument("files", nargs="+", help="Essay markdown files to check")
    ap.add_argument("--json", action="store_true", help="Emit JSON report")
    ap.add_argument(
        "--tolerate", action="store_true", help="Exit 0 if only warns, no errors"
    )
    args = ap.parse_args()

    results = []
    for f in args.files:
        p = Path(f)
        if not p.exists():
            results.append({
                "path": f,
                "passed": False,
                "errors": [f"file not found: {f}"],
                "warns": [],
                "info": {},
            })
            continue
        results.append(check_file(p))

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        for r in results:
            status = "PASS" if r["passed"] else "FAIL"
            print(
                f"{status} {r['path']}  ({r['info'].get('words', '?')}w, {r['info'].get('headers', '?')} headers, {r['info'].get('single_sentence_landings', '?')} landings)"
            )
            for e in r["errors"]:
                print(f"  ✗ {e}")
            for w in r["warns"]:
                print(f"  ~ {w}")
            if r["passed"] and not r["warns"]:
                print("  — all gates pass")
        # summary
        n_pass = sum(1 for r in results if r["passed"])
        print(
            f"\n{n_pass}/{len(results)} pass"
            + (" (warns tolerated)" if args.tolerate else "")
        )

    has_fail = any(not r["passed"] for r in results)
    if args.tolerate and has_fail:
        # if only warns, still pass
        has_error = any(r["errors"] for r in results)
        return 1 if has_error else 0
    return 1 if has_fail else 0


if __name__ == "__main__":
    sys.exit(main())
