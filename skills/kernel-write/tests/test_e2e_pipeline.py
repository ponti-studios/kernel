"""Drive the real kernel-write skill end to end via `claude -p` and check that
what it actually produces passes its own stage gates.

Opt-in: costs real tokens and takes minutes. Run with:

    RUN_E2E=1 pytest skills/kernel-write/tests/test_e2e_pipeline.py -m e2e -s

Every test here redirects the skill's Desktop-write behavior to a pytest
`tmp_path` via KERNEL_WRITE_OUTPUT_DIR, so a live run never touches the real
~/Desktop.
"""

import os
import re
import subprocess

import pytest

from conftest import SKILL_DIR, load_fixture
from gates import check as gate_check

CLAUDE_TIMEOUT_SECONDS = 600


def _run_claude(prompt, output_dir):
    env = {**os.environ, "KERNEL_WRITE_OUTPUT_DIR": str(output_dir)}
    result = subprocess.run(
        ["claude", "-p", prompt, "--allowedTools", "Read", "Write"],
        cwd=SKILL_DIR.parent.parent,
        capture_output=True,
        text=True,
        timeout=CLAUDE_TIMEOUT_SECONDS,
        env=env,
    )
    assert result.returncode == 0, f"claude -p exited {result.returncode}: {result.stderr[-2000:]}"
    return result.stdout


def _extract(stdout, tag):
    m = re.search(rf"<<<{tag}>>>\s*(.*?)\s*<<<END>>>", stdout, flags=re.S)
    assert m, f"missing <<<{tag}>>>...<<<END>>> block in output:\n{stdout[-3000:]}"
    return m.group(1).strip()


def _assert_gate(stage, text, output_dir=None):
    failures = [(name, detail) for name, ok, detail in gate_check(stage, text, output_dir=output_dir) if not ok]
    assert not failures, f"{stage} gate failed: {failures}"


@pytest.mark.e2e
def test_content_pipeline_notes_to_frozen_essay(tmp_path):
    notes = load_fixture("notes-idea.md")
    prompt = (
        "Use the kernel-write skill to run the full content pipeline "
        "(intake, direction, draft, critique, edit, approve) on this raw "
        "source material:\n\n---\n" + notes + "\n---\n\n"
        "Follow the approve stage's write step as normal (it writes to "
        "$KERNEL_WRITE_OUTPUT_DIR, already set in your environment). Do not "
        "write any other files. When the essay is frozen at the approve "
        "stage, print it verbatim wrapped exactly as:\n"
        "<<<APPROVE>>>\n<the frozen essay, including its version line>\n<<<END>>>\n"
        "Print nothing else after that block."
    )
    stdout = _run_claude(prompt, tmp_path)
    essay = _extract(stdout, "APPROVE")
    _assert_gate("approve", essay, output_dir=tmp_path)


@pytest.mark.e2e
def test_content_pipeline_derives_x_post(tmp_path):
    notes = load_fixture("notes-idea.md")
    prompt = (
        "Use the kernel-write skill to run the full content pipeline "
        "(intake, direction, draft, critique, edit, approve, transform) on "
        "this raw source material, deriving an X post from the frozen "
        "essay:\n\n---\n" + notes + "\n---\n\n"
        "Follow the approve and transform stages' write steps as normal "
        "(they write to $KERNEL_WRITE_OUTPUT_DIR, already set in your "
        "environment). Do not write any other files. Print only the X post "
        "transform output wrapped exactly as:\n"
        "<<<TRANSFORM>>>\n<the X post artifact, including its '## X Post' "
        "header>\n<<<END>>>\n"
        "Print nothing else after that block."
    )
    stdout = _run_claude(prompt, tmp_path)
    xpost = _extract(stdout, "TRANSFORM")
    _assert_gate("transform", xpost, output_dir=tmp_path)


@pytest.mark.e2e
def test_approve_stage_writes_essay_to_output_dir(tmp_path):
    """The one behavior in this whole feature that gate-checking text alone
    can't verify: that the skill actually writes the frozen essay to disk,
    at the path approve.md specifies, when it runs for real."""
    notes = load_fixture("notes-idea.md")
    prompt = (
        "Use the kernel-write skill to run the full content pipeline "
        "(intake, direction, draft, critique, edit, approve) on this raw "
        "source material:\n\n---\n" + notes + "\n---\n\n"
        "Follow the approve stage's write step exactly as specified — write "
        "the frozen essay to $KERNEL_WRITE_OUTPUT_DIR (already set in your "
        "environment) using the '<slug>-v<version>.md' naming rule. Do not "
        "write any other files. After writing it, print only the path you "
        "wrote to, wrapped exactly as:\n"
        "<<<PATH>>>\n<the absolute path you wrote the essay to>\n<<<END>>>\n"
        "Print nothing else after that block."
    )
    stdout = _run_claude(prompt, tmp_path)
    written_path = _extract(stdout, "PATH")

    assert os.path.isfile(written_path), f"skill reported writing to {written_path}, but no such file exists"
    assert os.path.dirname(os.path.abspath(written_path)) == str(tmp_path), (
        f"expected the essay in {tmp_path}, got {written_path}"
    )

    written_files = list(tmp_path.glob("*.md"))
    assert written_files, f"no .md files found in {tmp_path} after the run"
