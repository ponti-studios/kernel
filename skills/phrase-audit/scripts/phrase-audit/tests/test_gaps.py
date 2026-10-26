"""Known recall gaps, encoded as failing tests.

Each test below describes capture behavior the audit SHOULD have but does
not. They fail against the current implementation on purpose: this file is
the roadmap. When a gap is fixed, its test goes green — do not weaken the
expectation to get there.
"""

from phrase_audit.corpus import load_corpus
from phrase_audit.stats import top_ngrams, watch_counts
from phrase_audit.text import sentences, tokenize


def _counts(text):
    toks = tokenize(text)
    return {p: c for p, c, _ in watch_counts({"doc": toks})}


def test_split_either_or_frame_captured():
    # "either X or Y" with words in between is the real construction;
    # the audit only matches adjacent "either or" and reports nothing.
    text = "We can either swallows it whole or spit it out."
    assert _counts(text).get("either or", 0) >= 1


def test_hyphenated_compound_kept_whole():
    # "state-of-the-art" is one lexical item; the tokenizer shreds it.
    assert "state-of-the-art" in tokenize("a state-of-the-art design")


def test_numbers_kept_as_tokens():
    # Phrases with numbers ("top 10", "9 to 5") vanish entirely today.
    assert "10" in tokenize("a top 10 list")


def test_smart_apostrophe_normalized():
    # Drafts with curly quotes tokenize "here’s" as "here" + "s",
    # so the "here's the thing" watch entry never fires on them.
    assert tokenize("here\u2019s the thing") == ["here's", "the", "thing"]


def test_blockquote_attribution_excluded(tmp_path):
    # Quoted words are someone else's voice and must not count as the
    # author's stock phrases. Today blockquote text is fully counted.
    doc = tmp_path / "q.md"
    doc.write_text('> As she put it: "most people agree."\n', encoding="utf-8")
    corpus = load_corpus([tmp_path])
    assert watch_counts(corpus.per_file) == []


def test_no_phantom_bigram_across_file_boundary():
    # Each span (sentence) is counted independently, so the last word of
    # one file and the first word of the next never form a phrase.
    docs = [["the", "very"], ["end", "of", "story"]]
    grams = top_ngrams(docs, 2, minimum=1, limit=100)
    assert all(g != "very end" for g, _ in grams)


def test_watchlist_rows_do_not_double_count():
    # One "it turns out" scores under both "turns out" and "it turns out",
    # so rows cannot be summed. Narrower hits must roll up, not duplicate.
    rows = _counts("it turns out the room was empty")
    assert rows.get("turns out", 0) + rows.get("it turns out", 0) == 1


def test_rare_phrase_survives_rank_cutoff():
    # top_ngrams only inspects the 400 most frequent n-grams, so a real
    # phrase with >= minimum hits is dropped when 400 others outrank it.
    tokens = []
    for i in range(400):
        tokens += [f"distractor{i}", "filler"] * 6
    tokens += ["most", "people"] * 5
    grams = [g for g, _ in top_ngrams([tokens], 2, minimum=5, limit=1000)]
    assert "most people" in grams


def test_abbreviations_do_not_split_sentences():
    # "Mr.", "e.g.", "U.S." fracture sentences and mint phantom openers.
    assert len(sentences("She met Mr. Smith today.")) == 1
