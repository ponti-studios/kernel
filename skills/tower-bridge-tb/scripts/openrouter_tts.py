#!/usr/bin/env python3
"""tb audio provider: OpenRouter gpt-audio-mini TTS + Parakeet word timestamps."""
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

MODEL_PATH = os.environ.get("PARAKEET_MODEL", "models/ggml-parakeet-tdt-0.6b-v3-f16.bin")


def get_key():
    key = os.environ.get("OPENROUTER_API_KEY", "")
    if not key:
        for line in open(os.path.expanduser("~/.localrc")):
            if "OPENROUTER_API_KEY" in line:
                m = re.search(r"OPENROUTER_API_KEY\s*=\s*(.+)", line)
                if m:
                    key = m.group(1).strip().strip('"').strip("'")
    return key


def tts_turn(text, out_pcm, key):
    import urllib.request
    payload = {
        "model": "openai/gpt-audio-mini",
        "messages": [{"role": "user", "content": f"Read this aloud naturally, nothing else: {text}"}],
        "modalities": ["text", "audio"],
        "audio": {"voice": "alloy", "format": "pcm16"},
        "stream": True,
    }
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
    )
    audio_b64 = ""
    with urllib.request.urlopen(req) as resp:
        for raw in resp:
            line = raw.decode("utf-8", "replace").strip()
            if not line.startswith("data:"):
                continue
            data = line[5:].strip()
            if data == "[DONE]":
                break
            try:
                obj = json.loads(data)
            except json.JSONDecodeError:
                continue
            delta = obj.get("choices", [{}])[0].get("delta", {})
            aud = delta.get("audio", {})
            if isinstance(aud, dict) and aud.get("data"):
                audio_b64 += aud["data"]
    if not audio_b64:
        raise RuntimeError("no audio data returned")
    Path(out_pcm).write_bytes(base64.b64decode(audio_b64))


def transcribe_words(audio_path):
    result = subprocess.run(
        ["parakeet-cli", "-m", MODEL_PATH, "-f", str(audio_path), "-ps", "-np"],
        capture_output=True, text=True, timeout=300,
    )
    output = result.stdout + result.stderr
    tokens = []
    for m in re.finditer(
        r'\[\s*\d+\]\s+id=\s*\d+\s+frame=\s*\d+\s+dur_idx=\s*\d+\s+dur_val=\s*\d+\s+p=\S+\s+plog=\S+\s+t0=\s*(\d+)\s+t1=\s*(\d+)\s+word_start=(true|false)\s+"([^"]*)"',
        output,
    ):
        t0, t1, ws, word = m.groups()
        tokens.append({"t0": int(t0), "t1": int(t1), "word_start": ws == "true", "word": word})
    words = []
    current = None
    for tok in tokens:
        if tok["word_start"] and current is not None:
            words.append(current)
            current = None
        if current is None:
            current = {"text": "", "startMs": tok["t0"] * 10, "endMs": tok["t1"] * 10}
        current["text"] += tok["word"].replace("▁", "")
        current["endMs"] = tok["t1"] * 10
    if current is not None:
        words.append(current)
    cleaned = []
    for w in words:
        text = w["text"].replace("▁", " ").strip()
        if not text or text in (",", ".", "!", "?", ";", ":"):
            continue
        cleaned.append({"text": text, "startMs": w["startMs"], "endMs": max(w["startMs"] + 1, w["endMs"])})
    return cleaned


def main():
    req = json.load(sys.stdin)
    turns = req.get("turns", [])
    out_audio = Path(req["outAudio"])
    out_words = Path(req["outWords"])
    out_audio.parent.mkdir(parents=True, exist_ok=True)
    out_words.parent.mkdir(parents=True, exist_ok=True)
    key = get_key()

    all_pcm = b""
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        for i, turn in enumerate(turns):
            pcm_path = td / f"turn_{i}.pcm"
            tts_turn(turn["text"], pcm_path, key)
            all_pcm += pcm_path.read_bytes()

        wav_path = td / "combined.wav"
        import struct
        sr = 24000
        with open(wav_path, "wb") as f:
            f.write(b"RIFF")
            f.write(struct.pack("<I", 36 + len(all_pcm)))
            f.write(b"WAVE")
            f.write(b"fmt ")
            f.write(struct.pack("<IHHIIHH", 16, 1, 1, sr, sr * 2, 2, 16))
            f.write(b"data")
            f.write(struct.pack("<I", len(all_pcm)))
            f.write(all_pcm)

        subprocess.run(
            ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", str(wav_path), "-q:a", "4", str(out_audio)],
            check=True,
        )

        words = transcribe_words(out_audio)
        out_words.write_text(json.dumps({"words": words}, indent=2))

        probe = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", str(out_audio)],
            capture_output=True, text=True,
        )
        dur_ms = int(float(probe.stdout.strip()) * 1000)
        print(json.dumps({"durationMs": dur_ms, "words": len(words)}))


if __name__ == "__main__":
    main()
