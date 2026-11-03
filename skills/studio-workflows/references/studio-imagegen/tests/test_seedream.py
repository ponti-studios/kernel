"""Tests for scripts/seedream.py — no network, no OpenRouter, no spend.

The API transport is faked at two levels:
- `FakeAPI` replaces seedream.call_api and records every call's
  (endpoint, api_key, payload) so tests can assert the script called the
  API with exactly the right arguments.
- One test goes a level deeper and fakes urllib.request.urlopen to check
  the real call_api builds the right request (URL, Bearer header, JSON).

Run with uv (from the studio-imagegen folder):
    uv run --with pytest --with pillow python -m pytest tests/ -q
"""
import base64, importlib.util, io, json, sys, time
import urllib.error
from pathlib import Path

import pytest
from PIL import Image

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "seedream.py"
spec = importlib.util.spec_from_file_location("seedream", SCRIPT)
seedream = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seedream)

KEY = "test-key-123"


def tiny_jpeg(w=24, h=36):
    buf = io.BytesIO()
    Image.new("RGB", (w, h), (120, 30, 30)).save(buf, "JPEG")
    return base64.b64encode(buf.getvalue()).decode()


def canned(usage=None, data=True):
    return {"id": "gen-test-1",
            "data": [{"b64_json": tiny_jpeg()}] if data else [],
            "usage": usage if usage is not None else
                     {"prompt_tokens": 11, "completion_tokens": 22, "cost": 0.018}}


class FakeAPI:
    """Stands in for seedream.call_api; records calls, returns canned data."""
    def __init__(self, response=None, delay=0.0, side_effect=None):
        self.calls = []
        self.response = response if response is not None else canned()
        self.delay = delay
        self.side_effect = side_effect

    def __call__(self, endpoint, api_key, payload):
        self.calls.append({"endpoint": endpoint, "api_key": api_key,
                           "payload": payload})
        if self.side_effect is not None:
            return self.side_effect(len(self.calls), endpoint, api_key, payload)
        if self.delay:
            time.sleep(self.delay)
        return self.response

    @property
    def payloads(self):
        return [c["payload"] for c in self.calls]


@pytest.fixture
def fake(monkeypatch):
    f = FakeAPI()
    monkeypatch.setattr(seedream, "call_api", f)
    return f


@pytest.fixture
def run_cli(monkeypatch, tmp_path):
    """Invoke seedream.main() in tmp_path with a test key and stage dir.
    Returns the SystemExit code."""
    def _run(argv):
        monkeypatch.chdir(tmp_path)
        monkeypatch.setenv("OPENROUTER_API_KEY", KEY)
        monkeypatch.setenv("SEEDREAM_STAGE_DIR", str(tmp_path / "stage"))
        monkeypatch.setattr(sys, "argv", ["seedream.py"] + argv)
        with pytest.raises(SystemExit) as ei:
            seedream.main()
        return ei.value.code
    return _run


def http_error(code):
    return urllib.error.HTTPError("https://openrouter.ai/api/v1/images",
                                  code, "err", hdrs=None,
                                  fp=io.BytesIO(b"boom"))


# ---------- the transport itself ----------

def test_call_api_builds_correct_request(monkeypatch):
    seen = {}

    class Resp:
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def read(self): return json.dumps(canned()).encode()

    def fake_urlopen(req, timeout=None):
        seen["url"] = req.full_url
        seen["auth"] = req.headers.get("Authorization")
        seen["ctype"] = req.headers.get("Content-type")
        seen["body"] = json.loads(req.data.decode())
        seen["timeout"] = timeout
        return Resp()

    monkeypatch.setattr(seedream.urllib.request, "urlopen", fake_urlopen)
    payload = {"model": "m", "prompt": "p"}
    out = seedream.call_api("https://example.test/api", "k3y", payload)
    assert seen["url"] == "https://example.test/api"
    assert seen["auth"] == "Bearer k3y"
    assert seen["ctype"] == "application/json"
    assert seen["body"] == payload
    assert out["id"] == "gen-test-1"


# ---------- correct arguments from the CLI ----------

def test_single_job_defaults(fake, run_cli, tmp_path):
    code = run_cli(["--name", "A", "--prompt", "hello world"])
    assert code == 0
    assert len(fake.calls) == 1
    call = fake.calls[0]
    assert call["endpoint"] == seedream.DEFAULT_ENDPOINT
    assert call["api_key"] == KEY
    p = call["payload"]
    assert p["model"] == "bytedance-seed/seedream-5-0-flash"
    assert p["prompt"] == "hello world"
    assert p["aspect_ratio"] == "4:5"          # documented default
    assert p["resolution"] == "2K"             # final quality by default
    assert p["output_format"] == "jpeg"
    assert "input_references" not in p         # no refs given, none sent
    assert (tmp_path / "out" / "A.jpg").exists()
    assert (tmp_path / "out" / "A.json").exists()


def test_preview_uses_1k(fake, run_cli):
    assert run_cli(["--name", "A", "--prompt", "x", "--preview"]) == 0
    assert fake.payloads[0]["resolution"] == "1K"


@pytest.mark.parametrize("given,expected", [
    ("seedream", "bytedance-seed/seedream-5-0-flash"),
    ("qwen", "qwen/qwen-image-2.1-turbo"),
    ("some/other-model", "some/other-model"),   # arbitrary ids pass through
])
def test_model_selection(fake, run_cli, given, expected):
    assert run_cli(["--name", "A", "--prompt", "x", "--model", given]) == 0
    assert fake.payloads[0]["model"] == expected


def test_custom_endpoint(fake, run_cli):
    assert run_cli(["--name", "A", "--prompt", "x",
                    "--endpoint", "http://127.0.0.1:9/x"]) == 0
    assert fake.calls[0]["endpoint"] == "http://127.0.0.1:9/x"


def test_aspect_passed_through(fake, run_cli):
    assert run_cli(["--name", "A", "--prompt", "x", "--aspect", "16:9"]) == 0
    assert fake.payloads[0]["aspect_ratio"] == "16:9"


# ---------- references ----------

def test_refs_attached_and_staged(fake, run_cli, tmp_path):
    ref = tmp_path / "big-ref.jpg"
    Image.new("RGB", (2000, 1500), (10, 200, 10)).save(ref, "JPEG")
    code = run_cli(["--name", "A", "--prompt", "x", "--ref", str(ref)])
    assert code == 0
    refs = fake.payloads[0]["input_references"]
    assert len(refs) == 1
    assert refs[0]["type"] == "image_url"
    url = refs[0]["image_url"]["url"]
    assert url.startswith("data:image/jpeg;base64,")
    staged = list((tmp_path / "stage").glob("*.jpg"))
    assert len(staged) == 1
    with Image.open(staged[0]) as im:
        assert max(im.size) <= 1024            # downscaled before encoding


def test_stage_ref_cache_reused(tmp_path):
    ref = tmp_path / "ref-a.jpg"
    Image.new("RGB", (800, 600), (1, 2, 3)).save(ref, "JPEG")
    stage = tmp_path / "stage"
    first = seedream.stage_ref(ref, stage)
    mtime = next(stage.glob("*.jpg")).stat().st_mtime_ns
    second = seedream.stage_ref(ref, stage)
    assert first == second                                  # same data URL
    assert next(stage.glob("*.jpg")).stat().st_mtime_ns == mtime  # not rewritten


# ---------- prompt files ----------

def test_prompt_file_via_cli(fake, run_cli, tmp_path):
    (tmp_path / "meow.md").write_text("# Meow\nA cat in a raincoat.\n")
    assert run_cli(["--name", "Meow", "--prompt", "./meow.md"]) == 0
    assert fake.payloads[0]["prompt"] == "# Meow\nA cat in a raincoat."


def test_prompt_file_in_jobs_resolves_beside_jobs_file(fake, run_cli, tmp_path):
    sub = tmp_path / "sub"; sub.mkdir()
    (sub / "beside.md").write_text("prompt beside the jobs file")
    (sub / "jobs.json").write_text(json.dumps(
        [{"name": "J", "prompt": "beside.md"}]))
    assert run_cli(["--jobs", "sub/jobs.json"]) == 0
    assert fake.payloads[0]["prompt"] == "prompt beside the jobs file"


def test_missing_prompt_file_errors_before_any_call(fake, run_cli):
    code = run_cli(["--name", "X", "--prompt", "./nope.md"])
    assert code != 0
    assert fake.calls == []                    # API never touched


def test_literal_prompt_not_treated_as_file(fake, run_cli):
    prompt = "the readme.md launch, photographed at dawn"
    assert run_cli(["--name", "A", "--prompt", prompt]) == 0
    assert fake.payloads[0]["prompt"] == prompt


# ---------- batching / parallelism ----------

def test_parallel_batch(monkeypatch, run_cli, tmp_path):
    slow = FakeAPI(delay=0.5)
    monkeypatch.setattr(seedream, "call_api", slow)
    jobs = [{"name": f"j{i}", "prompt": "x"} for i in range(4)]
    (tmp_path / "jobs.json").write_text(json.dumps(jobs))
    t0 = time.time()
    code = run_cli(["--jobs", "jobs.json", "--concurrency", "4"])
    wall = time.time() - t0
    assert code == 0
    assert len(slow.calls) == 4
    assert wall < 1.6                          # sequential would be ~2.0s
    summary = json.loads((tmp_path / "out" / "results.json").read_text())
    assert summary["success"] == 4 and summary["jobs"] == 4


# ---------- retries ----------

def test_retry_on_500_then_success(monkeypatch, tmp_path):
    def flaky(n, *a):
        if n == 1:
            raise http_error(500)
        return canned()
    f = FakeAPI(side_effect=flaky)
    monkeypatch.setattr(seedream, "call_api", f)
    side = seedream.run_job({"name": "R", "prompt": "x"},
                            seedream.MODELS["seedream"], "2K",
                            tmp_path, tmp_path / "stage", None,
                            seedream.DEFAULT_ENDPOINT, KEY)
    assert side["status"] == "success"
    assert len(f.calls) == 2


def test_no_retry_on_400(monkeypatch, tmp_path):
    f = FakeAPI(side_effect=lambda n, *a: (_ for _ in ()).throw(http_error(400)))
    monkeypatch.setattr(seedream, "call_api", f)
    side = seedream.run_job({"name": "R", "prompt": "x"},
                            seedream.MODELS["seedream"], "2K",
                            tmp_path, tmp_path / "stage", None,
                            seedream.DEFAULT_ENDPOINT, KEY)
    assert side["status"] == "blocked"
    assert len(f.calls) == 1


# ---------- cost accounting ----------

def test_cost_taken_from_usage(monkeypatch, tmp_path):
    f = FakeAPI(response=canned(usage={"prompt_tokens": 5,
                                       "completion_tokens": 7, "cost": 0.042}))
    monkeypatch.setattr(seedream, "call_api", f)
    side = seedream.run_job({"name": "C", "prompt": "x"}, "any/model", "2K",
                            tmp_path, tmp_path / "stage", None,
                            seedream.DEFAULT_ENDPOINT, KEY)
    assert side["total_cost"] == 0.042
    assert side["input_tokens"] == 5 and side["output_tokens"] == 7


def test_cost_falls_back_to_list_price(monkeypatch, tmp_path):
    f = FakeAPI(response=canned(usage={"prompt_tokens": 5,
                                       "completion_tokens": 7}))
    monkeypatch.setattr(seedream, "call_api", f)
    side = seedream.run_job({"name": "C", "prompt": "x"},
                            seedream.MODELS["seedream"], "2K",
                            tmp_path, tmp_path / "stage", None,
                            seedream.DEFAULT_ENDPOINT, KEY)
    assert side["total_cost"] == seedream.LIST_PRICE[seedream.MODELS["seedream"]]


def test_no_image_response_status(monkeypatch, tmp_path):
    f = FakeAPI(response=canned(data=False))
    monkeypatch.setattr(seedream, "call_api", f)
    side = seedream.run_job({"name": "N", "prompt": "x"},
                            seedream.MODELS["seedream"], "2K",
                            tmp_path, tmp_path / "stage", None,
                            seedream.DEFAULT_ENDPOINT, KEY)
    assert side["status"] == "no_image"


# ---------- logging, exit codes, key handling ----------

def test_generations_log_line(fake, run_cli, tmp_path):
    assert run_cli(["--name", "A", "--prompt", "x"]) == 0
    lines = (tmp_path / "generations.jsonl").read_text().strip().splitlines()
    assert len(lines) == 1
    rec = json.loads(lines[0])
    assert rec["name"] == "A" and rec["status"] == "success"


def test_no_log_flag(fake, run_cli, tmp_path):
    assert run_cli(["--name", "A", "--prompt", "x", "--no-log"]) == 0
    assert not (tmp_path / "generations.jsonl").exists()


def test_failed_job_gives_exit_1(monkeypatch, run_cli, tmp_path):
    monkeypatch.setattr(seedream, "call_api",
                        FakeAPI(response=canned(data=False)))
    code = run_cli(["--name", "A", "--prompt", "x"])
    assert code == 1


def test_missing_api_key_errors(monkeypatch, tmp_path, fake):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.setattr(sys, "argv",
                        ["seedream.py", "--name", "A", "--prompt", "x"])
    with pytest.raises(SystemExit) as ei:
        seedream.main()
    assert ei.value.code != 0
    assert fake.calls == []


def test_mock_mode_runs_without_key(monkeypatch, tmp_path):
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.setenv("SEEDREAM_STAGE_DIR", str(tmp_path / "stage"))
    monkeypatch.setattr(sys, "argv",
                        ["seedream.py", "--name", "M", "--prompt", "x",
                         "--mock", "--mock-delay", "0.05"])
    with pytest.raises(SystemExit) as ei:
        seedream.main()
    assert ei.value.code == 0
    assert (tmp_path / "out" / "M.jpg").exists()
