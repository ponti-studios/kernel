# Studio Upscale — Real-ESRGAN image upscaling

The studio's upscaler, owned by the kernel. Vendored network architectures —
**no basicsr dependency** — tiled CPU inference. This is the single home for
upscaling: projects call this script with this environment; no project grows
its own upscale venv. (Moved here Nov 8, 2026 from
`tshirt-designs/finishing/`, where it lived as a project-local tool with a
1.1 GB project venv.)

## Commands

Paths are relative to this procedure's folder; run from here. The Python
environment lives OUTSIDE the package (the validator rejects env symlinks
inside a package): `$STUDIO_UPSCALE_PY`, default
`~/workspace/.venvs/studio-upscale/bin/python`.

```bash
${STUDIO_UPSCALE_PY:-~/workspace/.venvs/studio-upscale/bin/python} \
  scripts/upscale.py IN.jpg OUT.png \
  --outscale 2 --arch srvgg --weights weights/realesr-general-x4v3.pth
```

- `--outscale` — the net is 4×; the output is resized to the requested scale
  (2 is the production setting).
- `--arch srvgg` + `realesr-general-x4v3.pth` — the production path: SRVGG
  compact net, ~3.5 min per 2048² view on this CPU.
- `--arch rrdb` + `RealESRGAN_x4plus.pth` — the reference arch (official
  xinntao v0.1.0 weights). Correct but ~60 min per 2048² view on this CPU —
  unusable in production; kept for parity checks.

## Bootstrap (once per machine)

```bash
python3 -m venv ~/workspace/.venvs/studio-upscale
~/workspace/.venvs/studio-upscale/bin/pip install -r requirements.txt
```

(Run from this folder so `requirements.txt` resolves.)

Versions are pinned in
`requirements.txt` to the set the finishing pipeline was validated against
(torch 2.15.0+cpu, numpy 2.5.4, pillow 13.0.0; torch from the PyTorch CPU
wheel index). The weights in `weights/` are machine-local resources (also
gitignored): `RealESRGAN_x4plus.pth` is the official xinntao release v0.1.0
and `realesr-general-x4v3.pth` the official Real-ESRGAN general-x4v3 release;
re-download from the Real-ESRGAN project releases on a new machine.

## GOTCHA — the srvgg weights are a residual model

The `realesr-general-x4v3` export is a RESIDUAL model: its raw output is
zero-mean (white in → ~0.009 out). The deployed graph is
`PixelShuffle(body(x)) + bilinear 4×(x)`. `upscale.py` adds the base itself
for `--arch srvgg`. Validated: DC gain ~1.009; bright-area fraction matches
source. Do not "fix" washed-out output downstream — if srvgg output looks
zero-mean, the base add is missing, and the bug is in the script call, not
the image.

## Known callers

- ShirtBoy print finishing (`~/workspace/tshirt-designs/finishing/`):
  upscale 2× (this skill) → `finish.py` luminance keying → Printify upload.
