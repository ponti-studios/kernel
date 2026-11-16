# Keyframe hosting and shot alignment

Depth for stages 3-6 of the order: getting a still in front of the video model, and making the
narration sit on the right pictures.

## Hosting a keyframe without a public bucket

`frame_images` and `input_references` take URLs the provider downloads. A presigned GET solves it:
the object stays private and the URL expires.

```js
// upload, then hand back a time-limited URL
await putObject({ key, body, contentType: "image/png" }); // S3 PutObject, SigV4
const url = await presignGet({ key, expiresSeconds: 3600 }); // GET with X-Amz-Signature

// and into the clip request
submit({ model, prompt, duration, frame_images: [{ type: "first_frame", url }] });
```

SigV4 is ~80 lines of `node:crypto` HMAC plus a canonical request; it does not need an SDK, and a
skill that requires `npm install` before it can render is not a skill. Fields that must be exactly
right: canonical URI encoded per RFC 3986 (encode `!'()*` too, and encode each path segment without
encoding the `/` separators), query parameters sorted, signed headers lowercased and `host` first,
and the credential scope `<date>/<region>/s3/aws4_request`.

### Prove the signer before trusting it

A signature mismatch is indistinguishable from a bad key, so verify the algorithm independently:
sign the _same_ request with the AWS CLI and compare. The CLI has no clock override, so take its
timestamp out of the presigned URL and re-sign with it.

```bash
AWS_ACCESS_KEY_ID=AKIDEXAMPLE AWS_SECRET_ACCESS_KEY=<known-secret> AWS_DEFAULT_REGION=auto \
  aws s3 presign s3://bucket/key.png --endpoint-url https://acct.r2.cloudflarestorage.com --expires-in 3600
# parse X-Amz-Date and X-Amz-Signature, then call your presignGet with now=new Date(that date)
```

Matching signatures prove the canonical request, key derivation and encoding. If they differ, the
usual culprits are double-encoding the path, unsorted query parameters, or a region that differs
between signer and URL. Keep the matched value as a test vector — it pins the implementation and
catches a regression without network access.

### Credential shapes that don't work for S3

| Value                                 | Usable for S3?               |
| ------------------------------------- | ---------------------------- |
| Access Key ID, 32 chars               | yes, as the access key       |
| Secret Access Key, 64 chars           | yes                          |
| API token ID, ~34 chars starting `ID` | no — it identifies the token |
| Cloudflare REST API token, 53 chars   | no — different API entirely  |

R2 reports a length mismatch (`Credential access key has length 34, should be 32`) on the _first_
request, so check the shape of the credentials before debugging the endpoint, the bucket or the
clock. The bucket name is a separate, often-forgotten input.

## Shot timing from the audio

Narration generated per shot means each line's true length is measurable:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 scene-1.mp3
```

Set the shot to `ceil((measured + tail) * 2) / 2` with `tail = 0.5` — half-second resolution because
that is the granularity a viewer perceives, plus the air after the line. Scenes with no line keep
the duration the model asked for; a silent beat is a choice. Write the timed shot list to a new file
and use it downstream rather than mutating the authored one.

Two batch runs of the same six-shot list are enough to see why: the model asked 48s of footage for
17.9s of narration (30s of silence), and a hand-trimmed version cut 5.4s of speech off the end.

## Aligning narration to shots

One track starting at a fixed offset drifts. Build it scene by scene instead:

```bash
# each line padded (or trimmed) to its own shot
ffmpeg -i scene-1.mp3 -af "apad=whole_dur=6.5" -t 6.5 -ar 44100 -c:a libmp3lame -q:a 4 seg-1.mp3
# a shot with no line still gets its duration, as silence
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 3.5 -c:a libmp3lame -q:a 4 seg-2.mp3
# concat the segments, then mux with delay 0
ffmpeg -f concat -safe 0 -i list.txt -c copy aligned.mp3
ffmpeg -i video.mp4 -i aligned.mp3 -map 0:v -map 1:a -c:v copy -c:a aac -shortest out.mp4
```

Because the segments already carry the timing, the mux delay is zero; any non-zero delay re-creates
the drift. Verify with `silencedetect`: each line's start must fall inside its own shot window
(`0-6.5s`, `6.5-10s`, …), not merely somewhere in the file.

## The animatic, for free — with the motion in it

Stills at their shot durations plus the aligned narration is a complete timing check with no model
spend. Apply the shot's intended camera move, because a locked frame cannot answer the question the
gate exists for: does this shot carry for its length?

```bash
# one input frame, NOT a loop: zoompan's d generates the output sequence
ffmpeg -i shot-1.png \
  -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,\
       zoompan=z='1+0.09*on/156':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=156:s=1280x720:fps=24,setsar=1" \
  -frames:v 156 -c:v libx264 -pix_fmt yuv420p -r 24 seg-1.mp4
```

Move vocabulary (mapped from the shot list's `camera` field): push in `z=1+0.09*on/N`, pull out
`z=1.09-0.09*on/N`, orbit `x=(iw-iw/zoom)*on/N` at `z=1.07`, tilt up `y=(ih-ih/zoom)*(1-on/N)`, static
`z=1.02` centred. `on` is the output frame and `N` the shot's frame count, so one expression works at
any duration.

**The loop trap:** `-loop 1 -t <seconds> -i still` combined with `zoompan d=<frames>` renders
`frames × input frames` — a 39s animatic never finished. One input frame, cap with `-frames:v`, and
the same render takes ~35s. 720p/24fps is the right target for a gate; the animatic is not a master.

Verified shape of the result: a push-in shot differs 10.6% RMSE between its first and last frame; a
static shot drifts 0.1%. If every shot measures like the second one, the animatic is a slideshow and
the "static" choice needs revisiting — not the renderer.

## Prove the clip is anchored

Image-to-video can accept a `first_frame` and still wander. Check before judging the take:

```bash
ffmpeg -y -i clip.mp4 -frames:v 1 f0.png                       # first frame
ffmpeg -y -sseof -0.2 -i clip.mp4 -frames:v 1 flast.png        # last frame
ffmpeg -y -i keyframe.png -vf scale=1280:720 key-small.png
compare -metric RMSE key-small.png f0.png null:                # low: anchored
compare -metric RMSE key-small.png flast.png null:             # high: it moved
```

A real result: 2.5% at frame 0 against 21% at the last frame — the shot starts on the approved still
and moves away from it. A frame 0 close to the _last_ frame means the clip barely moves; a frame 0 far
from the keyframe means the conditioning was ignored or the wrong still was published.

## Shot-list fields the pipeline needs

`id`, `prompt`, `duration_seconds` (provisional), `framing`, `camera`, `voiceover`, `voice`. The last
two drive narration and timing; `framing`/`camera` drive the animatic and give the video model
cinematography language instead of adjectives.

...and put every field in the prompt's **example JSON**, not only in its rule list: the model follows
the shape it is shown. Adding "camera is one of…" as a rule while the example still lists the old
keys produced a list without it — silently, on all six shots.

## Price the gate before you pass it

A keyframe is ~$0.018; a clip is ~$0.08 per second, billed in whole seconds with a floor. Three
iterations of a six-shot look costs about $0.32 in stills against ~$9 in video — so iterate the
stills until they are right, then animate once.
