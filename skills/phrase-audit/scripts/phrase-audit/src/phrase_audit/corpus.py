"""Corpus collection: find Markdown files, load them as token streams."""

from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path

from phrase_audit.text import sentences, tokenize

SKIP_NAMES = frozenset({"chatgpt-share-index.md"})
SKIP_SUFFIX = "-analysis.md"


@dataclass
class Corpus:
    """Tokenized writing corpus."""

    files: list[str] = field(default_factory=list)
    tokens: list[str] = field(default_factory=list)
    per_file: dict[str, list[str]] = field(default_factory=dict)
    sents: dict[str, list[list[str]]] = field(default_factory=dict)

    @property
    def words(self) -> int:
        return len(self.tokens)


def collect_files(roots: list[Path]) -> list[Path]:
    """All in-scope Markdown files under the given roots, sorted."""
    found = []
    for root in roots:
        if not root.exists():
            continue
        for path in sorted(root.rglob("*.md")):
            if path.name in SKIP_NAMES or path.name.endswith(SKIP_SUFFIX):
                continue
            found.append(path)
    return found


def load_corpus(roots: list[Path]) -> Corpus:
    """Read, clean, and tokenize every collected file."""
    corpus = Corpus()
    for path in collect_files(roots):
        try:
            raw = path.read_text(encoding="utf-8", errors="replace")
        except OSError:
            continue
        tokens = tokenize(raw)
        if not tokens:
            continue
        key = str(path)
        corpus.files.append(key)
        corpus.tokens.extend(tokens)
        corpus.per_file[key] = tokens
        corpus.sents[key] = sentences(raw)
    return corpus
