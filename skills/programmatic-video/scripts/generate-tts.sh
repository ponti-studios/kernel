#!/bin/bash
# Generate TTS audio files for Remotion slides using OpenRouter Gemini Flash Lite TTS.
# Usage: ./generate-tts.sh <slides.json> <output-dir>
# 
# slides.json format:
# [
#   {"id": "title", "text": "Ponte. Push-to-talk dictation for macOS."},
#   {"id": "press", "text": "Press Option Command Space."}
# ]
#
# Requires: curl, ffmpeg, ffprobe, OPENROUTER_API_KEY (from ~/.localrc)

set -euo pipefail

SLIDES_FILE="${1:?Usage: $0 <slides.json> <output-dir>}"
OUTPUT_DIR="${2:?Usage: $0 <slides.json> <output-dir>}"

# Source OpenRouter key if not set
if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  if [ -f ~/.localrc ]; then
    source ~/.localrc
  fi
fi

if [ -z "${OPENROUTER_API_KEY:-}" ]; then
  echo "ERROR: OPENROUTER_API_KEY not set. Check ~/.localrc" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Read slides and generate TTS for each
python3 - "$SLIDES_FILE" "$OUTPUT_DIR" <<'PYEOF'
import json, sys, os, subprocess, urllib.request

slides_file = sys.argv[1]
output_dir = sys.argv[2]

with open(slides_file) as f:
    slides = json.load(f)

api_key = os.environ.get("OPENROUTER_API_KEY", "")
if not api_key:
    # Try reading from ~/.localrc
    with open(os.path.expanduser("~/.localrc")) as f:
        for line in f:
            if "OPENROUTER_API_KEY" in line:
                api_key = line.split("=", 1)[1].strip().strip('"').strip("'")

for slide in slides:
    sid = slide["id"]
    text = slide["text"]
    voice = slide.get("voice", "Kore")
    pcm_path = os.path.join(output_dir, f"{sid}.pcm")
    wav_path = os.path.join(output_dir, f"{sid}.wav")

    data = json.dumps({
        "model": "google/gemini-3.8-flash-lite-tts",
        "input": text,
        "voice": voice,
        "response_format": "pcm",
        "instructions": "Speak in a British English accent, warm and professional."
    }).encode()

    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/audio/speech",
        data=data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
    )

    with urllib.request.urlopen(req) as resp:
        with open(pcm_path, "wb") as f:
            f.write(resp.read())

    # Convert PCM → WAV (24kHz, 16-bit, mono)
    subprocess.run([
        "ffmpeg", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1",
        "-i", pcm_path, wav_path
    ], capture_output=True, check=True)

    # Get duration
    result = subprocess.run([
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", wav_path
    ], capture_output=True, text=True, check=True)
    duration = float(result.stdout.strip())

    # Clean up PCM
    os.remove(pcm_path)

    print(f"{sid}: {duration:.2f}s -> {wav_path}")
PYEOF

echo "Done. Audio files in $OUTPUT_DIR"