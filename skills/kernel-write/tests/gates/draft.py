import re
from . import _helpers as H

FORBIDDEN_OPENERS = (
    "in recent years", "today", "in today's", "let's", "there has been",
    "as we", "welcome", "the field of", "have you ever", "in this essay",
    "in this article",
)
ACADEMIC_TRANSITIONS = (
    "thus,", "therefore,", "however,", "furthermore,", "moreover,", "in addition,",
)
HEDGES = ("arguably", "interestingly", "notably", "perhaps", "some might say", "it could be argued")
FALSE_CONSENSUS = ("we often", "we tend to", "as a society", "we all know")
SUMMARY_OPENERS = ("in conclusion", "to sum up", "so what", "in summary", "finally,")


def check(text, baseline=None):
    title, body = H.split_title(text)
    low = body.lower()
    results = []

    wc = H.word_count(body)
    results.append(("length 300-800", 300 <= wc <= 800, f"{wc} words"))

    results.append(("title line", bool(title) and bool(re.match(r"^# .+", title)), title or "missing"))

    header_lines = [ln for ln in body.splitlines()
                    if re.match(r"^#{1,6}\s", ln) or re.match(r"^\*\*", ln)]
    results.append(("no section headers", not header_lines, f"{len(header_lines)} header lines"))

    fences = [ln for ln in body.splitlines() if ln.strip().startswith("```")]
    results.append(("no code fences", not fences, f"{len(fences)} fence lines"))

    paras = H.paragraphs(body)
    single = [p for p in paras if H.is_single_sentence_paragraph(p)]
    counts = [H.count_sentences(p) for p in paras]
    adjacent_equal = any(counts[i] == counts[i + 1] for i in range(len(counts) - 1))
    results.append(("two+ single-sentence paragraphs", len(single) >= 2, f"{len(single)} single-sentence"))
    results.append(("no adjacent equal-length paragraphs", not adjacent_equal, f"lengths {counts}"))

    first_sentence = H.sentences(body)[0].lower() if H.sentences(body) else ""
    results.append(("opens cold", not first_sentence.startswith(FORBIDDEN_OPENERS), first_sentence[:60]))

    transitions = [t for t in ACADEMIC_TRANSITIONS if t in low]
    results.append(("no academic transitions", not transitions, ",".join(transitions) or "clean"))

    consensus = [c for c in FALSE_CONSENSUS if c in low]
    results.append(("no false consensus", not consensus, ",".join(consensus) or "clean"))

    hedges = [h for h in HEDGES if h in low]
    results.append(("no hedge words", not hedges, ",".join(hedges) or "clean"))

    emphasis = re.findall(r"\*\*[^*]+?\*\*", body) + re.findall(r"\b\*[^*\s]+\*\b", body)
    results.append(("no bold/italic emphasis", not emphasis, ",".join(emphasis) or "clean"))

    exclaim = body.count("!")
    results.append(("no exclamation points", exclaim == 0, f"{exclaim} found"))

    emoji = H.EMOJI_RE.findall(body)
    results.append(("no emoji", not emoji, ",".join(emoji) or "clean"))

    has_takeaways = "key takeaways" in low
    results.append(("no key takeaways section", not has_takeaways, "found" if has_takeaways else "clean"))

    last = body.rstrip()
    ends_bad = last.endswith(("?", "!"))
    last_sentence = H.sentences(last)[-1].lower() if H.sentences(last) else ""
    summary = any(last_sentence.startswith(x) for x in SUMMARY_OPENERS)
    results.append(("ends on a strike", not ends_bad and not summary, last[-60:]))

    return results
