import http.server, json, os, base64, urllib.request, time, datetime, socketserver

PORT = 8811
API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
MODEL = "bytedance-seed/seedream-5-0-flash"

HTML = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Click-to-Edit Image (OpenRouter)</title>
<style>
  :root { --bg:#0b0d12; --fg:#e6e8ef; --muted:#8a90a3; --accent:#ff4d6d; --card:#151822; --border:#262a36; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:system-ui,-apple-system,sans-serif; background:var(--bg); color:var(--fg); }
  .wrap { max-width:1100px; margin:0 auto; padding:20px; display:grid; grid-template-columns:1fr 320px; gap:16px; }
  h1 { grid-column:1/-1; margin:0 0 4px; font-size:20px; }
  .sub { grid-column:1/-1; color:var(--muted); font-size:13px; margin-bottom:8px; }
  .canvas-box { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:10px; position:relative; }
  canvas { max-width:100%; cursor:crosshair; display:block; border-radius:8px; }
  .panel { background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:10px; }
  .panel h3 { margin:0 0 4px; font-size:14px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; }
  button { background:var(--accent); color:white; border:none; padding:9px 14px; border-radius:8px; font-weight:600; cursor:pointer; }
  button.secondary { background:#2a2f3d; }
  button:disabled { opacity:.5; cursor:not-allowed; }
  input[type=file] { width:100%; }
  .pins { display:flex; flex-direction:column; gap:8px; max-height:260px; overflow:auto; }
  .pin { background:#1b1f2b; border:1px solid var(--border); border-radius:8px; padding:8px; font-size:13px; }
  .pin .head { display:flex; justify-content:space-between; color:var(--muted); margin-bottom:4px; }
  .pin input { width:100%; background:#0f121a; border:1px solid var(--border); color:var(--fg); padding:6px; border-radius:6px; }
  .result { grid-column:1/-1; background:var(--card); border:1px solid var(--border); border-radius:12px; padding:14px; }
  .result img { max-width:100%; border-radius:8px; }
  .status { color:var(--muted); font-size:13px; min-height:18px; }
  .row { display:flex; gap:8px; }
  textarea { width:100%; background:#0f121a; border:1px solid var(--border); color:var(--fg); padding:8px; border-radius:8px; min-height:60px; font-family:inherit; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Click-to-Edit Image</h1>
  <p class="sub">Upload an image, click to drop pins, add comments per pin, then generate. Each pin becomes a localized edit prompt with its x,y position.</p>
  <div class="canvas-box">
    <canvas id="c" width="800" height="500"></canvas>
    <div class="status" id="status">Load an image to begin.</div>
  </div>
  <div class="panel">
    <h3>Image</h3>
    <input type="file" id="file" accept="image/*">
    <button class="secondary" id="clearPins">Clear pins</button>
    <h3>Pins</h3>
    <div class="pins" id="pins"></div>
    <h3>Global instruction (optional)</h3>
    <textarea id="global" placeholder="e.g. keep lighting consistent, photorealistic"></textarea>
    <button id="gen">Generate edit</button>
    <div class="status" id="genStatus"></div>
  </div>
  <div class="result" id="resultBox" style="display:none">
    <h3 style="margin:0 0 8px;color:var(--muted);font-size:14px;text-transform:uppercase;letter-spacing:.08em">Result</h3>
    <img id="resultImg" alt="result">
    <div class="status" id="resultMeta"></div>
  </div>
</div>
<script>
let img = null;
let pins = []; // {x,y,comment}
const c = document.getElementById('c');
const ctx = c.getContext('2d');

function draw() {
  if (!img) return;
  // fit image into canvas preserving aspect
  const scale = Math.min(c.width/img.width, c.height/img.height);
  const dw = img.width*scale, dh = img.height*scale;
  const ox = (c.width-dw)/2, oy = (c.height-dh)/2;
  ctx.clearRect(0,0,c.width,c.height);
  ctx.fillStyle = '#0f121a';
  ctx.fillRect(0,0,c.width,c.height);
  ctx.drawImage(img, ox, oy, dw, dh);
  // draw pins
  pins.forEach((p,i) => {
    const px = ox + p.x*scale, py = oy + p.y*scale;
    ctx.beginPath();
    ctx.arc(px,py,12,0,Math.PI*2);
    ctx.fillStyle = '#ff4d6d';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i+1, px, py);
  });
  // store transform for coordinate conversion
  c._transform = {scale, ox, oy, dw, dh};
}

document.getElementById('file').addEventListener('change', e => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = ev => {
    const i = new Image();
    i.onload = () => { img = i; pins = []; renderPins(); draw(); document.getElementById('status').textContent = `Loaded ${i.width}×${i.height}. Click to add pins.`; };
    i.src = ev.target.result;
  };
  r.readAsDataURL(f);
});

c.addEventListener('click', e => {
  if (!img) return;
  const rect = c.getBoundingClientRect();
  const cx = (e.clientX - rect.left) * (c.width/rect.width);
  const cy = (e.clientY - rect.top) * (c.height/rect.height);
  const t = c._transform;
  if (!t) return;
  // convert to image coords
  const ix = (cx - t.ox)/t.scale;
  const iy = (cy - t.oy)/t.scale;
  if (ix < 0 || iy < 0 || ix > img.width || iy > img.height) return;
  const comment = prompt(`Pin ${pins.length+1} at (${Math.round(ix)}, ${Math.round(iy)}): what should change here?`);
  if (comment === null) return;
  pins.push({x: Math.round(ix), y: Math.round(iy), comment: comment || '(no comment)'});
  renderPins();
  draw();
});

function renderPins() {
  const box = document.getElementById('pins');
  box.innerHTML = '';
  pins.forEach((p,i) => {
    const div = document.createElement('div');
    div.className = 'pin';
    div.innerHTML = `<div class="head"><span>#${i+1} (${p.x}, ${p.y})</span><button class="secondary" style="padding:2px 6px;font-size:11px" data-i="${i}">remove</button></div><input value="${p.comment.replace(/"/g,'&quot;')}" data-i="${i}">`;
    box.appendChild(div);
  });
  box.querySelectorAll('button').forEach(b => b.addEventListener('click', e => {
    const i = +e.target.dataset.i;
    pins.splice(i,1);
    renderPins(); draw();
  }));
  box.querySelectorAll('input').forEach(inp => inp.addEventListener('input', e => {
    const i = +e.target.dataset.i;
    pins[i].comment = e.target.value;
  }));
}

document.getElementById('clearPins').addEventListener('click', () => { pins = []; renderPins(); draw(); });

document.getElementById('gen').addEventListener('click', async () => {
  if (!img) { alert('Load an image first'); return; }
  const genStatus = document.getElementById('genStatus');
  genStatus.textContent = 'Annotating and sending...';
  // build annotated image
  const ac = document.createElement('canvas');
  ac.width = img.width; ac.height = img.height;
  const actx = ac.getContext('2d');
  actx.drawImage(img,0,0);
  pins.forEach((p,i) => {
    actx.beginPath();
    actx.arc(p.x,p.y,18,0,Math.PI*2);
    actx.fillStyle = 'rgba(255,77,109,0.85)';
    actx.fill();
    actx.strokeStyle = '#fff';
    actx.lineWidth = 3;
    actx.stroke();
    actx.fillStyle = '#fff';
    actx.font = 'bold 16px system-ui';
    actx.textAlign = 'center';
    actx.textBaseline = 'middle';
    actx.fillText(i+1, p.x, p.y);
  });
  const annotated = ac.toDataURL('image/jpeg', 0.92);
  const globalInstr = document.getElementById('global').value.trim();
  const payload = { image: annotated, pins: pins, global: globalInstr };
  try {
    const res = await fetch('/api/generate', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
    const data = await res.json();
    if (data.error) { genStatus.textContent = 'Error: ' + data.error; return; }
    const box = document.getElementById('resultBox');
    box.style.display = 'block';
    document.getElementById('resultImg').src = 'data:image/jpeg;base64,' + data.image;
    document.getElementById('resultMeta').textContent = `duration ${data.duration}s · cost $${data.cost} · ${data.total_tokens} tokens · log ${data.log}`;
    genStatus.textContent = 'Done.';
  } catch (e) {
    genStatus.textContent = 'Request failed: ' + e;
  }
});
</script>
</body>
</html>
"""

class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/" or self.path == "/index.html":
            body = HTML.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path != "/api/generate":
            self.send_response(404); self.end_headers(); return
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            req = json.loads(raw)
        except Exception as e:
            self._json({"error": f"bad json: {e}"}, 400); return

        image_b64 = req.get("image", "")
        pins = req.get("pins", [])
        global_instr = req.get("global", "")
        if not image_b64:
            self._json({"error": "no image"}, 400); return

        # build prompt
        lines = []
        lines.append("Edit this image according to the localized instructions below.")
        lines.append("The red numbered circles on the image mark edit locations; each number corresponds to an instruction.")
        for i, p in enumerate(pins, 1):
            lines.append(f"{i}. At pixel position approximately (x={p['x']}, y={p['y']}): {p['comment']}")
        if global_instr:
            lines.append("Global: " + global_instr)
        lines.append("Keep all other parts of the image unchanged. Preserve lighting, composition, and style.")
        prompt = "\n".join(lines)

        payload = {
            "model": MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_b64}},
                    ],
                }
            ],
            "modalities": ["image"],
        }

        t0 = time.perf_counter()
        try:
            r = urllib.request.Request(
                "https://openrouter.ai/api/v1/chat/completions",
                data=json.dumps(payload).encode(),
                headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
            )
            with urllib.request.urlopen(r, timeout=300) as resp:
                data = json.loads(resp.read())
        except Exception as e:
            self._json({"error": str(e)}, 500); return
        elapsed = time.perf_counter() - t0

        try:
            msg = data["choices"][0]["message"]
            out_url = msg["images"][0]["image_url"]["url"]
            out_b64 = out_url.split(",", 1)[1]
        except Exception as e:
            self._json({"error": f"no image in response: {e}"}, 500); return

        usage = data.get("usage", {})
        ts = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H-%M-%S.%f")[:-3] + "Z"
        log = {
            "timestamp": ts,
            "model": data.get("model", MODEL),
            "provider": data.get("provider", ""),
            "id": data.get("id"),
            "created": data.get("created"),
            "prompt": prompt,
            "pins": pins,
            "global": global_instr,
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

        self._json({
            "image": out_b64,
            "duration": round(elapsed, 3),
            "cost": usage.get("cost"),
            "total_tokens": usage.get("total_tokens"),
            "log": log_path,
        })

    def _json(self, obj, status=200):
        body = json.dumps(obj).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass

if __name__ == "__main__":
    os.makedirs(os.path.expanduser("~/.hominem/ai_usage"), exist_ok=True)
    with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
        print(f"Serving on http://127.0.0.1:{PORT}")
        httpd.serve_forever()
