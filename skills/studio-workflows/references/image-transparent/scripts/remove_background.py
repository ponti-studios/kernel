#!/usr/bin/env python3
"""Remove an image's background locally with rembg -> transparent PNG.

The foreground pixels are the source's own pixels; only an alpha channel is
computed. No network call, no provider, no spend (rembg downloads its model
weights once, on first use).

Usage:
    remove_background.py INPUT [--out OUT] [--model NAME] [--trim]
                           [--no-alpha-matting] [--check PATH]

Default output: <input-stem>-transparent.png beside the input. The input is
never overwritten. Prints one verification line: output size, the four corner
alpha values, the centre alpha, and the transparent / opaque fractions --
client previews render transparency unreliably, so these numbers are the
evidence a cutout is real.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

DEFAULT_MODEL = "isnet-general-use"
ALPHA_MATTING_KWARGS = dict(
    alpha_matting=True,
    alpha_matting_foreground_threshold=240,
    alpha_matting_background_threshold=10,
    alpha_matting_erode_size=10,
)


def default_out_path(src: Path) -> Path:
    return src.with_name(f"{src.stem}-transparent.png")


def verify_alpha(img: Image.Image) -> dict:
    """Alpha facts about an RGBA image, as plain numbers."""
    if img.mode != "RGBA":
        raise ValueError(f"expected RGBA, got {img.mode}")
    a = img.getchannel("A")
    w, h = img.size
    hist = a.histogram()
    total = w * h
    return {
        "size": (w, h),
        "corners": (a.getpixel((0, 0)), a.getpixel((w - 1, 0)),
                    a.getpixel((0, h - 1)), a.getpixel((w - 1, h - 1))),
        "centre": a.getpixel((w // 2, h // 2)),
        "transparent_frac": round(sum(hist[:10]) / total, 3),
        "opaque_frac": round(sum(hist[246:]) / total, 3),
    }


def format_verification(v: dict) -> str:
    w, h = v["size"]
    c = v["corners"]
    return (f"{w}x{h} corners={c[0]},{c[1]},{c[2]},{c[3]} "
            f"centre={v['centre']} transparent={v['transparent_frac']} "
            f"opaque={v['opaque_frac']}")


def trim_to_subject(img: Image.Image, pad: int = 16) -> Image.Image:
    bbox = img.getchannel("A").point(lambda v: 255 if v > 40 else 0).getbbox()
    if bbox is None:
        return img
    w, h = img.size
    x0, y0, x1, y1 = bbox
    return img.crop((max(0, x0 - pad), max(0, y0 - pad),
                     min(w, x1 + pad), min(h, y1 + pad)))


def remove_background(src_img: Image.Image, model: str = DEFAULT_MODEL,
                      alpha_matting: bool = True, remover=None) -> Image.Image:
    """Run rembg on an RGB image and return the RGBA cutout.

    `remover` is injectable for tests: a callable with rembg.remove's
    signature. The real rembg import is lazy so tests and --help never pay
    for (or require) the model stack.
    """
    if remover is None:
        from rembg import new_session, remove as rembg_remove
        session = new_session(model)

        def remover(image, **kwargs):
            return rembg_remove(image, session=session, **kwargs)

    kwargs = ALPHA_MATTING_KWARGS if alpha_matting else {}
    return remover(src_img, **kwargs).convert("RGBA")


def main(argv=None) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("input", type=Path)
    p.add_argument("--out", type=Path, default=None)
    p.add_argument("--model", default=DEFAULT_MODEL,
                   help="rembg model (default: %(default)s; also u2net, "
                        "u2net_cloth_seg)")
    p.add_argument("--no-alpha-matting", action="store_true",
                   help="disable alpha matting (hard-edged subjects)")
    p.add_argument("--trim", action="store_true",
                   help="trim to the subject's bounding box + 16px pad")
    p.add_argument("--check", type=Path, default=None,
                   help="also write the cutout composited on magenta here")
    args = p.parse_args(argv)

    src = args.input
    if not src.is_file():
        print(f"input not found: {src}", file=sys.stderr)
        return 2
    out = args.out or default_out_path(src)
    if out.resolve() == src.resolve():
        print("refusing to overwrite the input", file=sys.stderr)
        return 2

    cutout = remove_background(Image.open(src).convert("RGB"),
                               model=args.model,
                               alpha_matting=not args.no_alpha_matting)
    if args.trim:
        cutout = trim_to_subject(cutout)
    out.parent.mkdir(parents=True, exist_ok=True)
    cutout.save(out, "PNG")

    if args.check:
        bg = Image.new("RGB", cutout.size, (255, 0, 180))
        bg.paste(cutout, (0, 0), cutout)
        args.check.parent.mkdir(parents=True, exist_ok=True)
        bg.save(args.check)

    print(f"OK {out} {format_verification(verify_alpha(cutout))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
