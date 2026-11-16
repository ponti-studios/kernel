#!/usr/bin/env node
// Assemble the final video: concat the clips, lay the voiceover over them.
//
//   assemble.mjs --clips <dir> --voiceover <file.mp3> --out <file.mp4>
//                [--scenes <scenes.json>] [--delay-ms 800] [--contact-sheet <out.png>]
//
// Clip order is the concat order. With --scenes, clips are ordered by scene
// order; otherwise files are sorted by name.
//
// WARNING the app also relies on: assembly is -shortest, so if the narration
// runs longer than the footage the END OF THE NARRATION IS CUT. The result
// reports `truncated` when that happens.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { setting } from "./resolve.mjs";
import { outputDir } from "../../../studio-core/scripts/lib/config.mjs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { load, readScenes } from "./resolve.mjs";
import { concatLine } from "../../../studio-core/scripts/lib/media.mjs";
import { selectClips } from "./select-clips.mjs";

const USAGE_DIR = setting("STUDIO_USAGE_DIR", "usage_dir", () =>
  join(homedir(), ".hominem", "ai_usage"),
);

const { values } = parseArgs({
  options: {
    clips: { type: "string" },
    voiceover: { type: "string" },
    out: { type: "string" },
    scenes: { type: "string" },
    "delay-ms": { type: "string" },
    "contact-sheet": { type: "boolean", default: false },
    "dry-run": { type: "boolean", default: false },
    "allow-test-clips": { type: "boolean", default: false },
  },
});

if (!values.clips || !values.voiceover || (!values.out && !process.env.STUDIO_OUTPUT_DIR)) {
  console.error("usage: assemble.mjs --clips <dir> --voiceover <file.mp3> [--out <file.mp4>]\n(--out is required unless STUDIO_OUTPUT_DIR is set)");
  process.exit(2);
}
if (values["delay-ms"] !== undefined && (!Number.isSafeInteger(Number(values["delay-ms"])) || Number(values["delay-ms"]) < 0)) {
  console.error("error: --delay-ms must be a non-negative integer");
  process.exit(2);
}
values.out ??= outputDir("video", basename(values.clips).replace(/\/+$/, "") + ".mp4");
values.clips = resolve(values.clips);
values.voiceover = resolve(values.voiceover);
values.out = resolve(values.out);
if (!existsSync(values.clips)) {
  console.error(`error: clips directory not found: ${values.clips}`);
  process.exit(2);
}
if (!existsSync(values.voiceover)) {
  console.error(`error: voiceover not found: ${values.voiceover}`);
  process.exit(2);
}

// A narration directory needs scene order to align individual lines.
let voiceoverPath = values.voiceover;
if (statSync(values.voiceover).isDirectory() && !values.scenes) {
  console.error("error: --scenes is required when --voiceover is a directory");
  process.exit(2);
}

const { assembleVideo, contactSheet, probeDuration } = await load("providers");

const scenes = values.scenes ? await readScenes(values.scenes) : null;
let clips;
try {
  clips = selectClips(values.clips, scenes, { allowTestClips: values["allow-test-clips"] });
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(2);
}
if (scenes) console.log(`ordering by scenes: ${clips.length} selected clip(s)`);

// The concat demuxer stream-copies the pictures. Reject mismatched streams before
// encoding rather than producing a broken join or a file with corrupt timestamps.
let clipFormat;
for (const clip of clips) {
  const probe = spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=codec_name,profile,level,width,height,pix_fmt,time_base,r_frame_rate", "-of", "json", clip], { encoding: "utf8" });
  if (probe.status !== 0) throw new Error(`cannot probe video stream: ${clip}`);
  const format = JSON.parse(probe.stdout).streams?.[0];
  if (!format?.codec_name || !format.width || !format.height) throw new Error(`missing video stream: ${clip}`);
  if (clipFormat && JSON.stringify(format) !== JSON.stringify(clipFormat)) {
    throw new Error(`incompatible clip format: ${clip}; normalize all clips before assembly`);
  }
  clipFormat = format;
}

// Per-scene alignment. One continuous track starting 800ms in makes the narration
// drift away from the shots it describes. When the scenes file is known, pad or trim
// each line to its scene's duration and lay a silent segment where a shot has none,
// so every line lands on its own picture and the track ends exactly with the footage.
let aligned = false;
if (
  values.scenes &&
  statSync(values.voiceover).isDirectory()
) {
  const dir = values.voiceover;
  const scenes = await readScenes(values.scenes);
  const files = readdirSync(dir).filter((f) =>
    [".mp3", ".wav", ".m4a"].includes(extname(f).toLowerCase()),
  );
  const byId = new Map(files.map((f) => [f.replace(/\.[^.]+$/, ""), join(dir, f)]));
  const segments = [];
  const work = values["dry-run"] ? null : mkdtempSync(join(tmpdir(), "videogen-audio-"));
  if (work) process.on("exit", () => rmSync(work, { recursive: true, force: true }));
  for (const [index, scene] of scenes.entries()) {
    const seconds = await probeDuration(clips[index]);
    const source = scene.voiceover?.trim() ? byId.get(scene.id) : undefined;
    if (scene.voiceover && !source) {
      console.error(`error: missing narration for ${scene.id}`);
      process.exit(2);
    }
    if (source && (await probeDuration(source)) > seconds + 0.03) {
      console.error(`error: narration for ${scene.id} exceeds its ${seconds.toFixed(2)}s clip; no audio was cut`);
      process.exit(2);
    }
    if (values["dry-run"]) {
      console.log(`  ${scene.id}: ${seconds.toFixed(2)}s clip; narration ${source ? "present" : "silent"}`);
      continue;
    }
    const segment = join(work, `scene-${scene.id}.wav`);
    const args = source
      ? [
          "-y",
          "-loglevel",
          "error",
          "-i",
          source,
          "-af",
          `apad=whole_dur=${seconds}`,
          "-t",
          String(seconds),
          "-ar",
          "44100",
          "-c:a",
          "pcm_s16le",
          "-ac",
          "1",
          segment,
        ]
      : [
          "-y",
          "-loglevel",
          "error",
          "-f",
          "lavfi",
          "-i",
          "anullsrc=r=44100:cl=mono",
          "-t",
          String(seconds),
          "-c:a",
          "pcm_s16le",
          "-ac",
          "1",
          segment,
        ];
    const res = spawnSync("ffmpeg", args, { encoding: "utf8" });
    if (res.status !== 0) {
      console.error(
        `error: could not build narration for ${scene.id}: ${(res.stderr ?? "").trim().split("\n").slice(-1)[0]}`,
      );
      process.exit(1);
    }
    segments.push(segment);
  }
  if (values["dry-run"]) {
    console.log("Dry run — scene alignment validated; nothing written.");
    process.exit(0);
  }
  const list = join(work, "aligned.txt");
  writeFileSync(list, segments.map(concatLine).join("\n") + "\n");
  mkdirSync(dirname(values.out), { recursive: true });
  const track = values.out.replace(/\.[^/.]+$/, "") + ".mix.wav";
  const res = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", track],
    { encoding: "utf8" },
  );
  if (res.status !== 0) {
    console.error(
      `error: could not join aligned narration: ${(res.stderr ?? "").trim().split("\n").slice(-1)[0]}`,
    );
    process.exit(1);
  }
  voiceoverPath = track;
  aligned = true;
  console.log(`narration: aligned to ${segments.length} scene(s) -> ${track}`);
}

const delayMs = aligned ? 0 : values["delay-ms"] ? Number(values["delay-ms"]) : 800;

console.log(`clips:     ${clips.length}`);
for (const c of clips) {
  const d = await probeDuration(c);
  console.log(`  ${d.toFixed(2).padStart(6)}s  ${c}`);
}
const voSeconds = await probeDuration(voiceoverPath);
const totalClipSeconds = (await Promise.all(clips.map((c) => probeDuration(c)))).reduce(
  (a, b) => a + b,
  0,
);
console.log(`voiceover: ${voSeconds.toFixed(2)}s`);
console.log(`footage:   ${totalClipSeconds.toFixed(2)}s`);
console.log(`delay:     ${delayMs}ms before narration starts`);
if (voSeconds + delayMs / 1000 > totalClipSeconds + 0.03) {
  console.log(
    `WARNING: narration runs ${(voSeconds - totalClipSeconds).toFixed(2)}s longer than the footage — ` +
      `the ending would be cut. Trim the voiceover or add clips.`,
  );
  process.exit(2);
}

if (values["dry-run"]) {
  console.log("\nDry run — nothing encoded.");
  process.exit(0);
}

mkdirSync(dirname(values.out), { recursive: true });
const result = await assembleVideo({
  clips,
  voiceover: voiceoverPath,
  out: values.out,
  voDelayMs: delayMs,
});

if (values["contact-sheet"]) {
  const sheet = values.out.replace(/\.[^.]+$/, "-contact-sheet.png");
  await contactSheet(clips[0], sheet);
  console.log(`contact sheet: ${sheet}`);
}

mkdirSync(USAGE_DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const logPath = join(USAGE_DIR, `${stamp}-mediagen-assemble.json`);
writeFileSync(
  logPath,
  JSON.stringify(
    {
      kind: "mediagen-assemble",
      clips,
      voiceover: voiceoverPath,
      out: values.out,
      vo_delay_ms: delayMs,
      video_seconds: result.videoSeconds,
      voiceover_seconds: result.voiceoverSeconds,
      truncated: result.truncated,
    },
    null,
    2,
  ),
);

console.log(`\nout:        ${values.out}`);
console.log(
  `video:      ${result.videoSeconds.toFixed(2)}s / narration ${result.voiceoverSeconds.toFixed(2)}s`,
);
console.log(`truncated:  ${result.truncated ? "YES — narration was cut" : "no"}`);
console.log(`log:        ${logPath}`);
process.exit(result.truncated ? 1 : 0);
