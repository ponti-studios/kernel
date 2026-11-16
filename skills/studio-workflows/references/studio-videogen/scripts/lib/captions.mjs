#!/usr/bin/env node
// Burn captions onto a finished cut. Each scene's voiceover line is shown for the
// scene's own window, so it sits on the shot it narrates.
//
//   captions.mjs --video <in.mp4> --scenes <scenes.json> --clips <clips-dir> --out <out.mp4>
//                [--font <ttf>] [--position top|middle|bottom] [--dry-run]
//
// Timing follows the measured lengths of the selected clips used for assembly.
//
// Text is rendered with ImageMagick and overlaid with ffmpeg. This ffmpeg has no
// drawtext or subtitles filter, so a PNG per line is the portable route.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { readScenes } from "./resolve.mjs";
import { selectClips } from "./select-clips.mjs";
import { probeDuration } from "../../../studio-core/scripts/lib/media.mjs";

const { values } = parseArgs({
  options: {
    video: { type: "string" },
    scenes: { type: "string" },
    clips: { type: "string" },
    "allow-test-clips": { type: "boolean", default: false },
    out: { type: "string" },
    font: { type: "string" },
    position: { type: "string", default: "bottom" },
    "dry-run": { type: "boolean", default: false },
  },
});

if (!values.video || !values.scenes || !values.clips || !values.out) {
  console.error(
    "usage: captions.mjs --video <in.mp4> --scenes <scenes.json> --clips <clips-dir> --out <out.mp4> [--font <ttf>] [--position top|middle|bottom]",
  );
  process.exit(2);
}
const POSITIONS = { top: 0.12, middle: 0.45, bottom: 0.72 };
if (!POSITIONS[values.position]) {
  console.error(`error: --position must be top, middle or bottom (got ${values.position})`);
  process.exit(2);
}
if (!existsSync(values.video)) {
  console.error(`error: video not found: ${values.video}`);
  process.exit(2);
}

const scenes = await readScenes(values.scenes);
let clips;
try {
  clips = selectClips(values.clips, scenes, { allowTestClips: values["allow-test-clips"] });
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(2);
}
let t = 0;
const cues = [];
for (const [index, scene] of scenes.entries()) {
  const seconds = await probeDuration(clips[index]);
  if (scene.voiceover) cues.push({ id: scene.id, text: scene.voiceover.trim(), start: t, end: t + seconds });
  t += seconds;
}

const videoSeconds = await probeDuration(values.video);
if (Math.abs(videoSeconds - t) > 0.1) {
  console.error(`error: selected clips total ${t.toFixed(2)}s but video is ${videoSeconds.toFixed(2)}s; use the clips that produced this cut`);
  process.exit(2);
}
console.log(`video:    ${values.video}`);
console.log(`captions: ${cues.length} of ${scenes.length} scene(s) have a voiceover line`);
for (const c of cues) {
  console.log(`  ${c.id.padEnd(12)} ${c.start.toFixed(1).padStart(5)}s–${c.end.toFixed(1)}s  ${c.text.slice(0, 60)}`);
}
if (cues.length === 0) {
  console.error("error: no scene has a voiceover, so there is nothing to caption");
  process.exit(2);
}
if (values["dry-run"]) {
  console.log("\nDry run — nothing written.");
  process.exit(0);
}

const font =
  values.font ?? process.env.STUDIO_CAPTION_FONT ?? "/System/Library/Fonts/Supplemental/Arial Bold.ttf";
if (!existsSync(font)) {
  console.error(`error: caption font not found: ${font} (pass --font or STUDIO_CAPTION_FONT)`);
  process.exit(2);
}


const dims = spawnSync(
  "ffprobe",
  ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", values.video],
  { encoding: "utf8" },
);
const [width, height] = (dims.stdout ?? "").trim().split("x").map(Number);
if (!width || !height) {
  console.error(`error: could not read the video size from ${values.video}`);
  process.exit(1);
}

const work = mkdtempSync(join(tmpdir(), "captions-"));
try {
  const pngs = cues.map((c, i) => {
    const path = join(work, `cap-${i}.png`);
    // Text goes through a file: ImageMagick reads %, @ and \ in inline text.
    const textPath = join(work, `cap-${i}.txt`);
    writeFileSync(textPath, c.text);
    const res = spawnSync(
      "magick",
      [
        "-size", `${Math.round(width * 0.86)}x`,
        "-background", "none",
        "-font", font,
        "-pointsize", String(Math.round(width / 16)),
        "-fill", "white",
        "-stroke", "black",
        "-strokewidth", String(Math.max(3, Math.round(width / 270))),
        "-gravity", "center",
        `caption:@${textPath}`,
        `PNG32:${path}`,
      ],
      { encoding: "utf8" },
    );
    if (res.status !== 0) throw new Error(`magick failed for ${c.id}: ${(res.stderr ?? "").trim()}`);
    return path;
  });

  // One overlay per caption, each gated to its own window.
  const inputs = ["-i", values.video, ...pngs.flatMap((p) => ["-i", p])];
  let graph = "";
  let last = "[0:v]";
  cues.forEach((c, i) => {
    const out = i === cues.length - 1 ? "[v]" : `[v${i}]`;
    graph += `${last}[${i + 1}:v]overlay=x=(W-w)/2:y=H*${POSITIONS[values.position]}:enable='between(t,${c.start},${c.end})'${out};`;
    last = out;
  });
  graph = graph.replace(/;$/, "");

  mkdirSync(join(values.out, ".."), { recursive: true });
  const res = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", ...inputs, "-filter_complex", graph, "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", values.out],
    { encoding: "utf8" },
  );
  if (res.status !== 0) {
    console.error(`error: ffmpeg failed: ${(res.stderr ?? "").trim().split("\n").slice(-1)[0]}`);
    process.exit(1);
  }
  console.log(`wrote:    ${values.out}`);
} finally {
  rmSync(work, { recursive: true, force: true });
}
