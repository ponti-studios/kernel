# kernel-write test suite

```
tests/
  fixtures/       sample stage outputs (good and known-bad)
  gates/          rule-based structural checks, one module per pipeline stage
  judge.py        LLM-as-judge model (OpenRouter if keyed, else local Ollama)
  test_quality.py qualitative voice-adherence scoring via DeepEval GEval
  test_e2e_pipeline.py  drives the real skill via `claude -p` and gate-checks the output
```

## Running

```bash
source ../../../.venv-test/bin/activate   # deepeval, pytest, ollama already installed here
cd skills/kernel-write/tests
pytest                                     # gate-driven, skips judge/e2e if unavailable
```

- `test_quality.py` (`-m judge`) needs a judge backend: either `OPENROUTER_API_KEY` in
  the environment, or a local Ollama server (`ollama serve`) with the model in
  `OLLAMA_MODEL` (default `gemma4:e4b-mlx`) pulled. Tests auto-skip if neither is
  reachable.
- `test_e2e_pipeline.py` (`-m e2e`) shells out to `claude -p` to actually run the
  kernel-write skill and checks the real output against the stage gates in
  `gates/`. It costs real tokens and takes minutes, so it's opt-in:

  ```bash
  RUN_E2E=1 pytest test_e2e_pipeline.py -m e2e -s
  ```

## Adding a fixture

Fixtures are named for what they are, not what stage they test:
`good-draft.md` should pass every rule in `gates/draft.py`; `weak-draft.md`
and `rough-draft.md` are known-bad and used as the low end of the quality
tests. Add new ones alongside a note in `test_quality.py`'s parametrize list.
