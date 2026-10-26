"""Markdown cleaning and tokenization for the audit corpus."""

from __future__ import annotations

import re

FRONTMATTER = re.compile(r"\A---\n.*?\n---\n", re.S)
CODEFENCE = re.compile(r"```.*?```", re.S)
MD_LINK = re.compile(r"!\[([^\]]*)\]\([^)]*\)|\[([^\]]*)\]\([^)]*\)")
MD_CHARS = re.compile(r"[#*`_~]{1,}")
BLOCKQUOTE = re.compile(r"(?m)^[ \t]*>[^\n]*\n?")
HTML_TAG = re.compile(r"<[^>]+>")
WORD = re.compile(r"[a-z0-9]+(?:[-'][a-z0-9]+)*")
SMART_APOSTROPHE = re.compile(r"[\u2018\u2019]")
# Dotted abbreviations whose periods never end a sentence.
# clean() lowercases first, so these are matched lowercase.
ABBR_DOT = re.compile(
    r"\b(mr|mrs|ms|dr|prof|sr|jr|st|vs|etc|e\.g|i\.e|u\.s|a\.m|p\.m)\."
)

STOP = frozenset(
    """a an the and or but if then else when while of at by for with about into
    through during before after above below to from up down in out on off over
    under again further once here there all any both each few more most other
    some such no nor not only own same so than too very can will just don
    should now is are was were be been being have has had having do does did
    doing would could ought i me my myself we our ours ourselves you your yours
    yourself yourselves he him his himself she her hers herself it its itself
    they them their theirs themselves what which who whom this that these those
    am as because until of to s t d ll m re ve y ain aren couldn didn doesn
    hadn hasn haven isn wasn weren won wouldn""".split()
)


def clean(text: str) -> str:
    """Strip Markdown structure, keep prose. Lowercases the result."""
    text = SMART_APOSTROPHE.sub("'", text)
    text = FRONTMATTER.sub("", text)
    text = CODEFENCE.sub(" ", text)
    text = BLOCKQUOTE.sub("", text)
    text = MD_LINK.sub(lambda m: m.group(1) or m.group(2) or "", text)
    text = HTML_TAG.sub(" ", text)
    text = MD_CHARS.sub(" ", text)
    return text.lower()


def tokenize(text: str) -> list[str]:
    """Word tokens from cleaned text."""
    return WORD.findall(clean(text))


def sentences(text: str) -> list[list[str]]:
    """Split cleaned text into sentences, tokenize each one."""
    protected = ABBR_DOT.sub(
        lambda m: m.group(0).replace(".", "\x00"), clean(text)
    )
    out = []
    for sent in re.split(r"[.!?…\n]+", protected):
        words = WORD.findall(sent)
        if len(words) >= 2:
            out.append(words)
    return out
