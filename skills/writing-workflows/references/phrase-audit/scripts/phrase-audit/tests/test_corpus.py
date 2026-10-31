"""Corpus collection and loading behavior."""

from pathlib import Path

from phrase_audit.corpus import collect_files, load_corpus


def _write(root: Path, name: str, text: str) -> Path:
    path = root / name
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return path


def test_collects_markdown_recursively(tmp_path):
    _write(tmp_path, "a.md", "hello world")
    _write(tmp_path, "sub/b.md", "hello world")
    _write(tmp_path, "sub/c.txt", "hello world")
    found = collect_files([tmp_path])
    assert sorted(p.name for p in found) == ["a.md", "b.md"]


def test_skips_analysis_and_share_index(tmp_path):
    _write(tmp_path, "politics-analysis.md", "hello world")
    _write(tmp_path, "chatgpt-share-index.md", "hello world")
    _write(tmp_path, "real.md", "hello world")
    assert [p.name for p in collect_files([tmp_path])] == ["real.md"]


def test_missing_root_ignored(tmp_path):
    _write(tmp_path, "real.md", "hello world")
    assert len(collect_files([tmp_path / "nope", tmp_path])) == 1


def test_load_skips_empty_files(tmp_path):
    _write(tmp_path, "empty.md", "---\ntitle: x\n---\n")
    _write(tmp_path, "real.md", "most people agree")
    corpus = load_corpus([tmp_path])
    assert corpus.files == [str(tmp_path / "real.md")]
    assert corpus.words == 3
    assert corpus.per_file[str(tmp_path / "real.md")] == ["most", "people", "agree"]
