#!/usr/bin/env python3
"""seedream.py — a fast, parallel image-generation CLI for OpenRouter.

A single-file, general-purpose batch image generator. It was written for
Seedream 5.0 Flash and Qwen Image 2.1 Turbo on OpenRouter's images API, but
any model on that endpoint works via --model.

Why it is fast:
1. PARALLEL BATCH — jobs run in a thread pool (default 4 at once) and each
   result is reported the moment it lands, so a set of N images costs about
   ceil(N / concurrency) x one generation, not the sum of all of them.
2. STAGED-REFERENCE CACHE — reference images are downscaled once (max
   1024px, JPEG) into a cache directory and the base64 data URL is built
   once per process, then shared by every job that uses the same reference.
   Requires Pillow; without it, references are sent as-is.
3. NO BOOKKEEPING IN THE HOT PATH — the run writes only the image, a small
   sidecar JSON, and (unless --no-log) one line per success to a JSONL log
   you can post-process however you like. No extra API calls are made to
   fetch cost: the provider reports cost and token counts in the image
   response's own `usage` block, and that is what gets recorded.

Setup:
    export OPENROUTER_API_KEY=sk-or-...        # https://openrouter.ai/keys
    pip install Pillow                         # optional, for ref staging

Usage:
    seedream.py --name look1 --prompt "..." [--ref img.jpg ...] [--aspect 4:5]
    seedream.py --jobs jobs.json [--concurrency 6] [--preview] [--out DIR]
    seedream.py --jobs jobs.json --mock --mock-delay 2   (offline self-test)

jobs.json format:
    [{"name": "look1", "prompt": "...", "refs": ["path.jpg"], "aspect": "4:5"}]
    ("refs" and "aspect" are optional per job.)

Prompt files: --prompt (and each job's "prompt") may point at a text
file instead of literal text — if the value is an existing file or ends
in .md / .txt, the file's contents become the prompt:
    seedream.py --name meow --prompt ./meow.md --ref cat.jpg

Options:
    --model <id>       any OpenRouter image model (default: Seedream Flash)
    --preview          generate at 1K instead of the default 2K (fast iteration)
    --concurrency N    parallel jobs (default 4)
    --endpoint <url>   override the API endpoint (e.g. a local test server)
    --stage-dir <dir>  reference staging cache
                       (default: $SEEDREAM_STAGE_DIR or ~/.cache/seedream/refs)
    --no-log           do not append to the JSONL generations log
    --mock             offline mode: fake transport, no network, no spend

Retry policy: one retry on HTTP 429 / 5xx / network errors only.
Exit code: 0 if every job succeeded, 1 otherwise.
"""
import argparse, base64, io, json, mimetypes, os, sys, time
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

DEFAULT_ENDPOINT = "https://openrouter.ai/api/v1/images"
MODELS = {"seedream": "bytedance-seed/seedream-5-0-flash",
          "qwen": "qwen/qwen-image-2.1-turbo"}
# Fallback prices, used only when the response reports no cost.
LIST_PRICE = {"bytedance-seed/seedream-5-0-flash": 0.018,
              "qwen/qwen-image-2.1-turbo": 0.0184}
try:
    from PIL import Image
except ImportError:  # staging is an optimisation, not a requirement
    Image = None

# ---------- reference staging (cached) ----------
_stage_cache = {}

def stage_ref(path, stage_dir):
    """Return a data URL for a reference image, downscaling it once into
    stage_dir (plain filename, <=1024px, JPEG) and reusing the cached copy
    and the in-process data URL for every later job with the same source."""
    src = Path(path).resolve()
    key = (str(src), src.stat().st_mtime_ns, src.stat().st_size)
    if key in _stage_cache:
        return _stage_cache[key]
    if Image is None:
        mime = mimetypes.guess_type(src.name)[0] or "image/jpeg"
        data = f"data:{mime};base64," + base64.b64encode(src.read_bytes()).decode()
        _stage_cache[key] = data
        return data
    plain = "".join(c if (c.islower() or c.isdigit() or c == "_") else "_"
                    for c in src.stem.lower()).strip("_") or "ref"
    staged = Path(stage_dir) / f"{plain}.jpg"
    if not (staged.exists() and staged.stat().st_mtime_ns >= src.stat().st_mtime_ns):
        img = Image.open(src).convert("RGB")
        if max(img.size) > 1024: img.thumbnail((1024, 1024))
        Path(stage_dir).mkdir(parents=True, exist_ok=True)
        img.save(staged, "JPEG", quality=88)
    data = "data:image/jpeg;base64," + base64.b64encode(staged.read_bytes()).decode()
    _stage_cache[key] = data
    return data

# ---------- prompt resolution ----------
def load_prompt(value, base_dir=None):
    """A prompt may be literal text or a path to a prompt file. If the value
    is an existing file, or ends in .md / .txt, it is read as a file (its
    contents, trailing whitespace trimmed, become the prompt); a missing
    file is an error, never a literal prompt. Otherwise the value is used
    verbatim. In jobs files, paths are tried relative to the current
    directory first, then relative to the jobs file's own directory."""
    p = Path(value)
    if p.is_file():
        return p.read_text(encoding="utf-8").strip()
    if base_dir:
        alt = Path(base_dir) / value
        if alt.is_file():
            return alt.read_text(encoding="utf-8").strip()
    if value.endswith((".md", ".txt")):
        raise SystemExit(f"prompt file not found: {value}")
    return value

def resolve_job_prompts(jobs, base_dir=None):
    for j in jobs:
        j["prompt"] = load_prompt(j["prompt"], base_dir)
    return jobs

# ---------- transport ----------
def call_api(endpoint, api_key, payload):
    r = urllib.request.Request(endpoint, data=json.dumps(payload).encode(),
                               method="POST")
    r.add_header("Content-Type", "application/json")
    r.add_header("Authorization", f"Bearer {api_key}")
    with urllib.request.urlopen(r, timeout=600) as resp:
        return json.loads(resp.read().decode("utf-8"))

def call_mock(payload, delay):
    time.sleep(delay)
    if Image is None:
        raise RuntimeError("--mock needs Pillow to fabricate a test image")
    buf = io.BytesIO(); Image.new("RGB", (683, 1024), (32, 32, 32)).save(buf, "JPEG")
    return {"id": "mock-gen-id",
            "data": [{"b64_json": base64.b64encode(buf.getvalue()).decode()}],
            "usage": {"prompt_tokens": 84, "completion_tokens": 10928, "cost": 0.018}}

# ---------- one job ----------
def run_job(job, model, resolution, out_dir, stage_dir, log_path,
            endpoint, api_key, mock_delay=None):
    name = job["name"]; t0 = time.time()
    payload = {"model": model, "prompt": job["prompt"],
               "aspect_ratio": job.get("aspect", "4:5"),
               "resolution": resolution, "output_format": "jpeg"}
    refs = job.get("refs") or []
    if refs:
        payload["input_references"] = [
            {"type": "image_url",
             "image_url": {"url": stage_ref(p, stage_dir)}} for p in refs]
    data, last_err = None, None
    for attempt in (1, 2):
        try:
            data = (call_mock(payload, mock_delay) if mock_delay is not None
                    else call_api(endpoint, api_key, payload))
            break
        except urllib.error.HTTPError as e:
            body = e.read(1500).decode("utf-8", "replace")
            last_err = f"HTTP {e.code}: {body[:300]}"
            if e.code == 429 or e.code >= 500: continue
            return {"name": name, "status": "blocked",
                    "duration_s": round(time.time() - t0, 1),
                    "error": last_err, "attempts": attempt}
        except Exception as e:
            last_err = repr(e)
    if data is None:
        return {"name": name, "status": "error",
                "duration_s": round(time.time() - t0, 1),
                "error": last_err, "attempts": 2}
    dur = round(time.time() - t0, 1)
    imgs = data.get("data") or []
    if not imgs or not imgs[0].get("b64_json"):
        return {"name": name, "status": "no_image", "duration_s": dur,
                "generation_id": data.get("id")}
    out = Path(out_dir) / f"{name}.jpg"
    out.write_bytes(base64.b64decode(imgs[0]["b64_json"]))
    usage = data.get("usage") or {}
    dims = None
    if Image is not None:
        with Image.open(out) as im: dims = f"{im.size[0]}x{im.size[1]}"
    side = {"name": name, "status": "success", "model": model,
            "generation_id": data.get("id"), "prompt": job["prompt"],
            "refs": refs,
            "requested": f"{payload['aspect_ratio']} / {resolution} / jpeg",
            "duration_s": dur, "dimensions": dims,
            "output_file": out.name, "output_bytes": out.stat().st_size,
            "total_cost": usage.get("cost") or LIST_PRICE.get(model),
            "input_tokens": usage.get("prompt_tokens"),
            "output_tokens": usage.get("completion_tokens")}
    (Path(out_dir) / f"{name}.json").write_text(json.dumps(side, indent=1))
    if log_path:
        with open(log_path, "a") as f:
            f.write(json.dumps({**side, "output_path": str(out)}) + "\n")
    return side

# ---------- main ----------
def main():
    ap = argparse.ArgumentParser(
        description="Fast parallel image generation via the OpenRouter images API.")
    ap.add_argument("--jobs", help="JSON file: [{name, prompt, refs?, aspect?}]")
    ap.add_argument("--name"); ap.add_argument("--prompt")
    ap.add_argument("--ref", action="append", default=[])
    ap.add_argument("--aspect", default="4:5")
    ap.add_argument("--model", default=MODELS["seedream"],
                    help="model id, or shortcut: seedream | qwen "
                         "(default: seedream)")
    ap.add_argument("--preview", action="store_true",
                    help="generate at 1K instead of 2K")
    ap.add_argument("--concurrency", type=int, default=4)
    ap.add_argument("--out", default="out")
    ap.add_argument("--endpoint", default=os.environ.get(
        "OPENROUTER_IMAGE_ENDPOINT", DEFAULT_ENDPOINT))
    ap.add_argument("--stage-dir", default=os.environ.get(
        "SEEDREAM_STAGE_DIR", str(Path.home() / ".cache" / "seedream" / "refs")))
    ap.add_argument("--no-log", action="store_true")
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--mock-delay", type=float, default=2.0)
    a = ap.parse_args()

    api_key = os.environ.get("OPENROUTER_API_KEY")
    if not a.mock and not api_key:
        ap.error("OPENROUTER_API_KEY is not set "
                 "(get a key at https://openrouter.ai/keys)")
    if a.jobs:
        jobs = resolve_job_prompts(json.loads(Path(a.jobs).read_text()),
                                     Path(a.jobs).resolve().parent)
    elif a.name and a.prompt:
        jobs = [{"name": a.name, "prompt": load_prompt(a.prompt),
                 "refs": a.ref, "aspect": a.aspect}]
    else:
        ap.error("give --jobs FILE or --name + --prompt")

    out_dir = Path(a.out); out_dir.mkdir(parents=True, exist_ok=True)
    model = MODELS.get(a.model, a.model)
    resolution = "1K" if a.preview else "2K"
    log_path = None if a.no_log else out_dir.parent / "generations.jsonl"
    mock_delay = a.mock_delay if a.mock else None

    wall0 = time.time(); results = []
    with ThreadPoolExecutor(max_workers=a.concurrency) as ex:
        futs = {ex.submit(run_job, j, model, resolution, out_dir, a.stage_dir,
                          log_path, a.endpoint, api_key, mock_delay): j["name"]
                for j in jobs}
        for fut in as_completed(futs):
            s = fut.result(); results.append(s)
            if s["status"] == "success":
                print(f"OK {s['name']} {s['duration_s']}s dims={s['dimensions']} "
                      f"cost={s['total_cost']} -> {s['output_file']}", flush=True)
            else:
                print(f"{s['status'].upper()} {s['name']} {s.get('duration_s')}s "
                      f"{s.get('error', '')[:200]}", flush=True)
    wall = round(time.time() - wall0, 1)
    ok = [r for r in results if r["status"] == "success"]
    summary = {"jobs": len(results), "success": len(ok), "wall_s": wall,
               "concurrency": a.concurrency, "resolution": resolution,
               "model": model,
               "total_cost": round(sum(r.get("total_cost") or 0 for r in ok), 4),
               "results": sorted(results, key=lambda r: r["name"])}
    (out_dir / "results.json").write_text(json.dumps(summary, indent=1))
    print(f"DONE {len(ok)}/{len(results)} in {wall}s wall "
          f"(concurrency {a.concurrency}, {resolution}) "
          f"cost ${summary['total_cost']}", flush=True)
    sys.exit(0 if len(ok) == len(results) else 1)

if __name__ == "__main__":
    main()
