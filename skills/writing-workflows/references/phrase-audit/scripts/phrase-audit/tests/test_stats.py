"""Statistics behavior: rates, n-grams, openers, watchlist."""

from phrase_audit.stats import rate, sentence_openers, top_ngrams, watch_counts


def test_rate_per_10k():
    assert rate(148, 767796) == 1.93
    assert rate(0, 0) == 0


def test_top_ngrams_require_content_word_and_minimum():
    tokens = ("of the " * 50 + "most people " * 6).split()
    grams = top_ngrams([tokens], 2)
    assert ("most", "people") in [tuple(g.split()) for g, _ in grams]
    assert all(g != "of the" for g, _ in grams)


def test_top_ngrams_respects_limit():
    tokens = " ".join(f"word{i} filler" for i in range(60)).split()
    assert len(top_ngrams([tokens], 2, minimum=1, limit=10)) == 10


def test_top_ngrams_never_cross_spans():
    grams = [g for g, _ in top_ngrams([["the", "very"], ["end", "of"]], 2,
                                       minimum=1, limit=100)]
    assert "very end" not in grams


def test_top_ngrams_skip_pure_number_tokens():
    docs = [["section", "5", "notes"], ["top", "10", "list"]]
    grams = [g for g, _ in top_ngrams(docs, 2, minimum=1, limit=100)]
    assert not any(any(w.isdigit() for w in g.split()) for g in grams)


def test_sentence_openers_count_each_sentence(tmp_path):
    doc = tmp_path / "d.md"
    doc.write_text("It is late. It is early. Dogs bark.", encoding="utf-8")
    opens, total = sentence_openers([str(doc)])
    assert total == 3
    assert opens["it is"] == 2


def test_watch_counts_and_file_spread():
    per_file = {
        "a": "most people agree. most people nod.".split(),
        "b": "nothing relevant here".split(),
    }
    rows = watch_counts(per_file)
    row = next(r for r in rows if r[0] == "most people")
    assert row[1] == 2
    assert row[2] == 1


def test_watch_ignores_case_and_punctuation():
    per_file = {"a": "Most PEOPLE!".lower().split()}
    rows = dict((p, c) for p, c, _ in watch_counts(per_file))
    assert rows["most people"] == 1
