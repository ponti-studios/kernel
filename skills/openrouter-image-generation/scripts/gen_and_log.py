import json, os, base64, urllib.request, time, sys, datetime

def main():
    if len(sys.argv) < 3:
        print("usage: gen_and_log.py <output_path> <prompt> [model]")
        sys.exit(1)
    out_path = sys.argv[1]
    prompt = sys.argv[2]
    model = sys.argv[3] if len(sys.argv) > 3 else "bytedance-seed/seedream-5-0-flash"
    api_key = os.environ["OPENROUTER_API_KEY"]

    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "modalities": ["image"],
    }
    t0 = time.perf_counter()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=300) as resp:
        data = json.loads(resp.read())
    elapsed = time.perf_counter() - t0

    msg = data["choices"][0]["message"]
    img_url = msg["images"][0]["image_url"]["url"]
    b64 = img_url.split(",", 1)[1]
    raw = base64.b64decode(b64)
    with open(out_path, "wb") as f:
        f.write(raw)

    usage = data.get("usage", {})
    ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H-%M-%S.%f")[:-3] + "Z"
    log = {
        "timestamp": ts,
        "model": data.get("model", model),
        "provider": data.get("provider", ""),
        "id": data.get("id"),
        "created": data.get("created"),
        "prompt": prompt,
        "output_file": out_path,
        "image_bytes": len(raw),
        "duration_seconds": round(elapsed, 3),
        "usage": {
            "prompt_tokens": usage.get("prompt_tokens"),
            "completion_tokens": usage.get("completion_tokens"),
            "total_tokens": usage.get("total_tokens"),
            "cost": usage.get("cost"),
        },
    }
    log_path = os.path.join(os.path.expanduser("~/.hominem/ai_usage"), ts + ".json")
    with open(log_path, "w") as f:
        json.dump(log, f, indent=2)
    print(json.dumps({"output": out_path, "duration_seconds": round(elapsed, 3), "cost": usage.get("cost"), "total_tokens": usage.get("total_tokens"), "log": log_path}, indent=2))

if __name__ == "__main__":
    main()
