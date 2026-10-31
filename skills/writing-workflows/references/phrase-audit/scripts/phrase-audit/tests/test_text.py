"""Cleaning and tokenization behavior."""

from phrase_audit.text import clean, sentences, tokenize


def test_frontmatter_removed():
    raw = "---\ntitle: hello\ntags: [a]\n---\nMost people agree."
    assert tokenize(raw) == ["most", "people", "agree"]


def test_code_fence_excluded():
    raw = "Most people agree.\n```\nmost people code most people\n```\nDone."
    assert tokenize(raw).count("most") == 1


def test_link_keeps_anchor_text_once():
    assert tokenize("[most people](https://x.example)") == ["most", "people"]


def test_lowercase_and_punctuation_split():
    assert tokenize("Hello, WORLD!") == ["hello", "world"]


def test_contraction_stays_one_token():
    assert tokenize("here's the thing") == ["here's", "the", "thing"]


def test_heading_markup_stripped_text_kept():
    assert tokenize("# Most People") == ["most", "people"]


def test_blockquote_lines_dropped_as_others_voice():
    # Quoted material is someone else's words, not the author's phrasing.
    assert tokenize("> quoted words\nmy own words") == ["my", "own", "words"]


def test_sentences_split_on_terminators_and_lines():
    sents = sentences("It is late. This is why.\nNew line here.")
    assert sents[0][:2] == ["it", "is"]
    assert [w[:2] for w in sents] == [["it", "is"], ["this", "is"], ["new", "line"]]
