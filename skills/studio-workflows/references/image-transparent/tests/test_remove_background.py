"""Tests for scripts/remove_background.py — no model download, no rembg.

The rembg call is faked by injecting a remover that pastes a known alpha
mask onto the source, so the tests cover the parts this procedure owns:
output naming, overwrite refusal, the alpha-verification math, trimming,
and that the source's own RGB pixels survive untouched.

Run (from the image-transparent folder):
    python3 -m pytest tests/ -q        # needs only pillow
"""
import importlib.util
import sys
from pathlib import Path

import pytest
from PIL import Image

SCRIPT = Path(__file__).resolve().parent.parent / "scripts" / "remove_background.py"
spec = importlib.util.spec_from_file_location("remove_background", SCRIPT)
rb = importlib.util.module_from_spec(spec)
spec.loader.exec_module(rb)


def sample_rgba(w=10, h=8):
    """Left half opaque subject, right half transparent background."""
    img = Image.new("RGBA", (w, h), (200, 30, 30, 0))
    for x in range(w // 2):
        for y in range(h):
            img.putpixel((x, y), (200, 30, 30, 255))
    return img


def fake_remover(image, **kwargs):
    out = sample_rgba(*image.size)
    # carry the source's RGB so a test can prove pixels are not redrawn
    out.paste(image.convert("RGB"), (0, 0))
    out.putalpha(sample_rgba(*image.size).getchannel("A"))
    return out


def test_default_out_path():
    assert rb.default_out_path(Path("/x/photo.jpg")) == Path("/x/photo-transparent.png")
    assert rb.default_out_path(Path("a.b.png")) == Path("a.b-transparent.png")


def test_verify_alpha_numbers():
    v = rb.verify_alpha(sample_rgba())
    assert v["size"] == (10, 8)
    assert v["corners"] == (255, 0, 255, 0)  # subject touches the left edge
    assert v["centre"] == 0                  # centre is right-half background
    assert v["transparent_frac"] == 0.5
    assert v["opaque_frac"] == 0.5


def test_verify_alpha_rejects_non_rgba():
    with pytest.raises(ValueError):
        rb.verify_alpha(Image.new("RGB", (4, 4)))


def test_remove_background_keeps_source_pixels():
    src = Image.new("RGB", (10, 8), (12, 120, 200))
    out = rb.remove_background(src, remover=fake_remover)
    assert out.mode == "RGBA"
    assert out.getpixel((0, 0)) == (12, 120, 200, 255)
    assert out.getpixel((9, 0))[3] == 0


def test_trim_to_subject():
    trimmed = rb.trim_to_subject(sample_rgba(), pad=0)
    assert trimmed.size == (5, 8)


def test_main_refuses_overwrite(tmp_path, capsys):
    src = tmp_path / "photo.png"
    Image.new("RGB", (6, 6)).save(src)
    assert rb.main([str(src), "--out", str(src)]) == 2
    assert "refusing" in capsys.readouterr().err


def test_main_missing_input(tmp_path, capsys):
    assert rb.main([str(tmp_path / "nope.jpg")]) == 2
    assert "not found" in capsys.readouterr().err


if __name__ == "__main__":
    sys.exit(pytest.main([__file__, "-q"]))
