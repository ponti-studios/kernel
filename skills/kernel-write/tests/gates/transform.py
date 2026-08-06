import re
from pathlib import Path

CLICHES = (
    "in today's video", "let's dive into", "have you ever noticed",
    "at the end of the day", "smash that like", "we believe that",
    "what do you think", "i've been thinking about",
)
TIKTOK_KEYS = ("hook", "timestamp", "visual", "caption")


def _check_output_dir(results, output_dir, suffix):
    if output_dir is None:
        return
    matches = sorted(Path(output_dir).expanduser().glob(f"*-{suffix}.md"))
    results.append((f"written to output dir (*-{suffix}.md)", bool(matches), str(matches[0]) if matches else "no match"))


def _check_xpost(text, output_dir=None):
    from . import _helpers as H
    results = []
    wc = H.word_count(text)
    results.append(("x post 500-1000 words", 500 <= wc <= 1000, f"{wc} words"))
    thread = [ln for ln in text.splitlines() if re.match(r"^\d+[/.]", ln.strip())]
    results.append(("no thread markers", not thread, f"{len(thread)} found"))
    results.append(("## X Post", "## X Post" in text, "present" if "## X Post" in text else "missing"))
    _check_output_dir(results, output_dir, "x-post")
    return results


def _check_tiktok(text, output_dir=None):
    results = []
    results.append(("## TikTok Clips", "## TikTok Clips" in text, "present" if "## TikTok Clips" in text else "missing"))
    clips = re.findall(r"^### Clip \d+", text, flags=re.M)
    results.append(("at least one clip", len(clips) >= 1, f"{len(clips)} clips"))
    for key in TIKTOK_KEYS:
        hits = re.findall(rf"^-\s+\*\*{key.title()}:\*\*", text, flags=re.M | re.I)
        results.append((f"clip fields: {key}", len(hits) >= 1, f"{len(hits)} found"))
    _check_output_dir(results, output_dir, "tiktok-clips")
    return results


def _check_video(text, output_dir=None):
    results = []
    results.append(("## Script", "## Script" in text, "present" if "## Script" in text else "missing"))
    visual = len(re.findall(r"\[VISUAL:", text))
    results.append(("visual cue every 10-15s", visual >= 3, f"{visual} [VISUAL:] cues"))

    hook_m = re.search(r"## Hook[^\n]*\n+(.+)", text, flags=re.S)
    if hook_m:
        from . import _helpers as H
        hook_text = hook_m.group(1).split("\n\n")[0]
        hook_words = H.word_count(hook_text)
        results.append(("hook under ~12 words", hook_words <= 12, f"{hook_words} words"))
    else:
        results.append(("hook under ~12 words", False, "no ## Hook block"))

    low = text.lower()
    cliches = [c for c in CLICHES if c in low]
    results.append(("no creator cliches", not cliches, ",".join(cliches) or "clean"))

    for key in ("## Visual Cues", "## Caption Beats", "## Alternate Hooks", "## Long-Form Potential"):
        results.append((f"format: {key}", key in text, "present" if key in text else "missing"))

    _check_output_dir(results, output_dir, "video-script")
    return results


def check(text, baseline=None, output_dir=None):
    if "[VISUAL:" in text:
        return _check_video(text, output_dir=output_dir)
    if "## TikTok Clips" in text or "### Clip" in text:
        return _check_tiktok(text, output_dir=output_dir)
    if "## X Post" in text:
        return _check_xpost(text, output_dir=output_dir)
    return [("recognized artifact type", False, "could not detect x post / tiktok / video script")]
