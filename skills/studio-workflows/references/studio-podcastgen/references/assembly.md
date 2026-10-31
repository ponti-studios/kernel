# Episode assembly

## The splice

Segments are synthesized one call each (`OpenRouterSpeechModel.synthesize`, mp3)
into the work directory as `<segmentId>.mp3`. A single silent gap file is
generated once:

```bash
ffmpeg -y -f lavfi -i anullsrc=r=44100:cl=mono -t <gap_ms/1000> -c:a libmp3lame gap.mp3
```

Then one ffmpeg pass builds the episode:

- inputs: segment, gap, segment, gap, … (2n−1 inputs)
- per input `[i:a]aresample=44100,pan=mono|c0=c0[ai]` — normalising every input
  means the concat never mixes sample rates or channel layouts
- `[a0][a1]…concat=n=N:v=0:a=1[out]`
- `-c:a libmp3lame -b:a 128k`
- ID3: `title`, `artist` (author), optional `album`, `genre=Podcast`

Re-encoding is deliberate. A `-c copy` concat with the demuxer is faster but
produces broken output when segment files differ in sample rate or channels,
and it fails silently rather than erroring.

## Verification recipe

Duration is the integrity check: the output must equal
`sum(segment durations) + gap × (segments − 1)`.

```bash
# per-segment and gap durations
for f in <work-dir>/*.mp3; do
  printf '%s ' "$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$f")"
  echo "$f"
done

# the episode
ffprobe -v error -show_entries format=duration,size -of default=nw=1:nk=1 episode.mp3
ffprobe -v error -show_entries stream=codec_type,codec_name,channels,sample_rate -of json episode.mp3
ffprobe -v error -show_entries format_tags=title,artist,genre -of default=nw=1 episode.mp3
```

Measured on a 4-segment test episode: segments 3.02 + 4.60 + 6.32 + 5.20 =
19.13s, three 0.70s gaps, expected 21.23s, actual 21.23s — one `mp3` stream,
1 channel, 44100Hz, tags `genre=Podcast`, `title`, `artist` all present, zero
failures in the manifest.

## Manifest

`<out>.manifest.json`:

```json
{
  "kind": "podcastgen",
  "episode": { "title", "author", "album", "source", "out",
               "duration_seconds", "bytes", "gap_ms", "model" },
  "segments": [{ "id", "label", "voice", "voice_source", "chars", "bytes" }],
  "failed": [],
  "estimated_cost_usd": 0.0263,
  "work_dir": null
}
```

`voice_source` records which rule picked the voice (`segment voice`, `--voice`,
`--voices[0]`, `DEFAULT_VOICE_ID`) — with a long script and alternating hosts,
that is how you find the segment that came back in the wrong voice.

## Cost measurement

Speech does not expose a per-call cost record either; `/api/v1/generation`
applies to generations, not speech. Read the key instead
(`GET /api/v1/key` → `usage` / `usage_daily`) and bracket the run: the counter
lagged noticeably — an episode that had just finished showed a delta of
`$0.0000` seconds later, while the same counter moved within minutes when
checked again. The listed price is `$0.00008` per prompt token for
`elevenlabs/eleven-multilingual-v2`; the script's estimate multiplies character
count by that rate, which overstates the token count and is therefore an upper
bound.
