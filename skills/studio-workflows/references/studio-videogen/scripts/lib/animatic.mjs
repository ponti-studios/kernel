#!/usr/bin/env node
// The animatic: keyframes cut to the real narration, before any motion is bought.
//
//   animatic.mjs --scenes <scenes.timed.json> --keyframes <dir> --voiceover <dir> --out <file.mp4>
//
// This is the gate the pipeline hangs on. Everything here is free — the stills are
// already paid for, the audio is already paid for, and ffmpeg costs nothing. Watch it
// end to end; fix framing and pacing here rather than in generated footage.

import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join } from "node:path";
import { parseArgs } from "node:util";
import { outputDir } from "../../../studio-core/scripts/lib/config.mjs";
import { readScenes } from "./resolve.mjs";
import { concatLine } from "../../../studio-core/scripts/lib/media.mjs";

const { values } = parseArgs({
  options: {
    scenes: { type: "string" },
    keyframes: { type: "string" },
    voiceover: { type: "string" },
    out: { type: "string" },
    fps: { type: "string", default: "24" },
    aspect: { type: "string", default: "16:9" },
  },
});

if (!values.scenes || !values.keyframes || (!values.out && !process.env.STUDIO_OUTPUT_DIR)) {
  console.error(
    "usage: animatic.mjs --scenes <scenes.timed.json> --keyframes <dir> [--voiceover <dir>] [--out <file.mp4>]\n(--out is required unless STUDIO_OUTPUT_DIR is set)",
  );
  process.exit(2);
}
if (!["16:9", "9:16"].includes(values.aspect)) {
  console.error("error: --aspect must be 16:9 or 9:16");
  process.exit(2);
}
values.out ??= outputDir("video", basename(values.scenes).replace(/\.[^.]+$/, "") + "-animatic.mp4");

// A still held for six seconds reads as frozen, which hides whether a shot carries.
// Apply the intended camera move as real motion over the still, so the animatic tests
// timing and movement together. Expressions are normalised over the shot's frame count
// (`on` = output frame), so the same move works at any duration.
const MOVE_ALIASES = [
  [/push|in\b/i, "push in"],
  [/pull|out\b/i, "pull out"],
  [/orbit|pan|track|follow/i, "orbit"],
  [/tilt up|rise/i, "tilt up"],
  [/tilt down|descend/i, "tilt down"],
  [/static|locked|still/i, "static"],
];

export function motionFor(camera) {
  if (!camera) return "static";
  for (const [pattern, move] of MOVE_ALIASES) if (pattern.test(camera)) return move;
  return "static";
}

export function motionFilter(camera, seconds, fps = 30, aspect = "16:9") {
  const frames = Math.max(2, Math.round(seconds * fps));
  // 1080p working frame: enough headroom to move inside, a third of the pixels to
  // push around. The animatic is a timing gate, not a delivery master.
  const portrait = aspect === "9:16";
  const [width, height] = portrait ? [1080, 1920] : [1920, 1080];
  const size = portrait ? "720x1280" : "1280x720";
  const base = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height}`;
  const zoompan = (z, x, y) =>
    `${base},zoompan=z='${z}':x='${x}':y='${y}':d=${frames}:s=${size}:fps=${fps},setsar=1`;
  const centreX = "iw/2-(iw/zoom/2)";
  const centreY = "ih/2-(ih/zoom/2)";
  const move = motionFor(camera);
  switch (move) {
    case "push in":
      return zoompan(`1+0.09*on/${frames}`, centreX, centreY);
    case "pull out":
      return zoompan(`1.09-0.09*on/${frames}`, centreX, centreY);
    case "orbit":
      return zoompan("1.07", `(iw-iw/zoom)*on/${frames}`, centreY);
    case "tilt up":
      return zoompan("1.07", centreX, `(ih-ih/zoom)*(1-on/${frames})`);
    case "tilt down":
      return zoompan("1.07", centreX, `(ih-ih/zoom)*on/${frames}`);
    case "static":
      return `${base},zoompan=z='1.02':x='${centreX}':y='${centreY}':d=${frames}:s=${size}:fps=${fps},setsar=1`;
    default:
      return zoompan(`1.04+0.01*sin(on/9)`, `${centreX}+10*sin(on/11)`, `${centreY}+6*cos(on/13)`);
  }
}

const scenes = await readScenes(values.scenes);
if (values.voiceover) {
  for (const scene of scenes) {
    const path = join(values.voiceover, `${scene.id}.mp3`);
    if (!scene.voiceover?.trim()) continue;
    if (!existsSync(path)) {
      if (scene.voiceover) throw new Error(`missing narration for ${scene.id}: ${path}`);
      continue;
    }
    const seconds = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], {encoding:"utf8"}).trim());
    if (!Number.isFinite(seconds) || seconds > (Number(scene.duration_seconds) || 3) + 0.03) {
      throw new Error(`narration for ${scene.id} exceeds scene duration or cannot be measured`);
    }
  }
}
const work = mkdtempSync(join(tmpdir(), "animatic-"));
process.on("exit", () => rmSync(work, { recursive: true, force: true }));
const ff = (args) => {
  const res = spawnSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { encoding: "utf8" });
  if (res.status !== 0) {
    console.error(`ffmpeg failed: ${(res.stderr ?? "").trim().split("\n").slice(-1)[0]}`);
    process.exit(1);
  }
};

// One still, held for its scene's duration. Pan/zoom would be a motion decision, so
// the animatic deliberately holds a locked frame: this is a timing check, not a cut.
const segments = [];
scenes.forEach((scene, index) => {
  const still = [".png", ".jpg", ".jpeg", ".webp"]
    .map((ext) => join(values.keyframes, `${scene.id}${ext}`))
    .find((p) => existsSync(p));
  if (!still) {
    console.error(`error: no keyframe for scene '${scene.id}' in ${values.keyframes}`);
    process.exit(1);
  }
  const seconds = Number(scene.duration_seconds) || 3;
  const segment = join(work, `${String(index).padStart(3, "0")}.mp4`);
  // A single input frame, not a looped one: zoompan's `d` GENERATES that many output
  // frames per input frame, so looping the still multiplied the render by its own
  // length (a 6s shot became ~160 input frames x 156 output frames each).
  const fps = Number(values.fps);
  ff([
    "-i",
    still,
    "-vf",
    `${motionFilter(scene.camera, seconds, fps, values.aspect)}`,
    "-frames:v",
    String(Math.round(seconds * fps)),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-r",
    String(fps),
    segment,
  ]);
  segments.push(segment);
});

const list = join(work, "segments.txt");
writeFileSync(list, segments.map(concatLine).join("\n") + "\n");
const silent = join(work, "silent.mp4");
ff(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);

let narration = null;
if (values.voiceover) {
  const stems = scenes.map((scene) => {
    const audio = join(values.voiceover, `${scene.id}.mp3`);
    return scene.voiceover?.trim() && existsSync(audio) ? audio : null;
  });
  const padded = join(work, "narration");
  spawnSync("mkdir", ["-p", padded]);
  const parts = [];
  stems.forEach((audio, index) => {
    const seconds = Number(scenes[index].duration_seconds) || 3;
    const part = join(padded, `${String(index).padStart(3, "0")}.wav`);
    if (audio) {
      ff([
        "-i",
        audio,
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
        part,
      ]);
    } else {
      ff([
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
        part,
      ]);
    }
    parts.push(part);
  });
  const alist = join(work, "audio.txt");
  writeFileSync(alist, parts.map(concatLine).join("\n") + "\n");
  narration = join(work, "narration.wav");
  ff(["-f", "concat", "-safe", "0", "-i", alist, "-c", "copy", narration]);
}

if (narration) {
  ff([
    "-i",
    silent,
    "-i",
    narration,
    "-map",
    "0:v",
    "-map",
    "1:a",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    values.out,
  ]);
} else {
  ff(["-i", silent, "-c", "copy", values.out]);
}

console.log(`animatic: ${values.out}`);
console.log(
  `scenes:   ${scenes.length} stills, ${scenes.reduce((a, s) => a + (Number(s.duration_seconds) || 0), 0)}s`,
);
console.log(`narration: ${narration ? "aligned per shot" : "silent"}`);
console.log(`motion:    ${scenes.map((s) => `${s.id}=${motionFor(s.camera)}`).join(", ")}`);
console.log("Watch it end to end. Nothing below this line is free.");
