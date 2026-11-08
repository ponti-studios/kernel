#!/usr/bin/env python3
"""Generate an image via OpenRouter's images API, always logging the call.

Usage:
    or_image_gen.py <output_path> "<prompt>" [model] [aspect_ratio] [resolution]
    or_image_gen.py <output_path> @prompt_file.txt [model] [aspect_ratio] [resolution]

Logs every attempt (including filtered/failed ones) to ~/.hominem/ai_usage/<ts>.json.
"""
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

USAGE_DIR = os.path.expanduser("~/.hominem/ai_usage")
DEFAULT_MODEL = "bytedance-seed/seedream-5-0-flash"


def api_key() -> str:
    if os.environ.get("OPENROUTER_API_KEY"):
        return os.environ["OPENROUTER_API_KEY"]
    txt = open(os.path.expanduser("~/.localrc")).read()
    m = re.search(r'OPENROUTER_API_KEY=["\']?([^"\'\s]+)', txt)
    if not m:
        sys.exit("OPENROUTER_API_KEY not found in env or ~/.localrc")
    return m.group(1)


def log(entry: dict) -> None:
    os.makedirs(USAGE_DIR, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    path = os.path.join(USAGE_DIR, f"{ts}-{os.getpid()}.json")
    with open(path, "w") as fh:
        json.dump(entry, fh, indent=1)


def gen(prompt, out_path, model=DEFAULT_MODEL, aspect_ratio=None, resolution=None, timeout=600):
    """Returns {"ok": bool, ...}. Always logs the attempt."""
    body = {"model": model, "prompt": prompt, "n": 1}
    if aspect_ratio:
        body["aspect_ratio"] = aspect_ratio
    if resolution:
        body["resolution"] = resolution
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/images/generations",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"},
    )
    started = time.time()
    status, err = None, None
    try:
        out = json.load(urllib.request.urlopen(req, timeout=timeout))
    except urllib.error.HTTPError as e:
        status, err = e.code, e.read().decode()[:2000]
        out = None
    except Exception as e:  # noqa: BLE001 - log and report any transport failure
        status, err = "error", str(e)[:2000]
        out = None

    result = {"ok": False, "model": model, "prompt_chars": len(prompt), "elapsed": round(time.time() - started, 1),
              "status": status, "error": err, "output": out_path,
              "aspect_ratio": aspect_ratio, "resolution": resolution}
    if out:
        items = out.get("data") or []
        usage = out.get("usage") or {}
        result["usage"] = usage
        result["cost_usd"] = usage.get("cost")
        if items:
            item = items[0]
            b64 = item.get("b64_json") or item.get("image_base64")
            url = item.get("url")
            if isinstance(item.get("image_url"), dict):
                url = item["image_url"].get("url") or url
            try:
                os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
                if b64:
                    if b64.startswith("data:"):
                        b64 = b64.split(",", 1)[1]
                    open(out_path, "wb").write(base64.b64decode(b64))
                elif url and url.startswith("data:"):
                    open(out_path, "wb").write(base64.b64decode(url.split(",", 1)[1]))
                elif url:
                    urllib.request.urlretrieve(url, out_path)
                else:
                    result["error"] = "no image field in response: " + json.dumps(item)[:400]
                    log(result)
                    return result
                result.update(ok=True, bytes=os.path.getsize(out_path))
            except Exception as e:  # noqa: BLE001
                result["error"] = f"save failed: {e}"
        else:
            result["error"] = "empty data array: " + json.dumps(out)[:400]
    log(result)
    return result


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    out_path, prompt_arg = sys.argv[1], sys.argv[2]
    prompt = open(prompt_arg[1:]).read() if prompt_arg.startswith("@") else prompt_arg
    model = sys.argv[3] if len(sys.argv) > 3 else DEFAULT_MODEL
    ar = sys.argv[4] if len(sys.argv) > 4 else None
    res = sys.argv[5] if len(sys.argv) > 5 else None
    print(json.dumps(gen(prompt, out_path, model, ar, res), indent=1))
