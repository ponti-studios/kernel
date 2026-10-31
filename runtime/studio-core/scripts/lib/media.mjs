// ffmpeg/ffprobe helpers for the video stage: review contact sheets and final
// assembly (concat clips + lay the voiceover). The runner is injectable so tests
// assert commands without needing ffmpeg installed.
//
// Ported from studio packages/providers/src/media.ts.
import { execFile as execFileCb } from 'node:child_process';
import { unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFileCb);

/** `(cmd, args) => { stdout }` — the only thing the helpers need from a shell. */
export const defaultRun = async (cmd, args) => {
  const { stdout } = await execFileAsync(cmd, args);
  return { stdout: String(stdout) };
};

export async function probeDuration(path, run = defaultRun) {
  const { stdout } = await run('ffprobe', [
    '-v',
    'error',
    '-show_entries',
    'format=duration',
    '-of',
    'csv=p=0',
    path,
  ]);
  const seconds = Number.parseFloat(String(stdout).trim());
  if (!Number.isFinite(seconds)) {
    throw new Error(`ffprobe returned a non-numeric duration for ${path}`);
  }
  return seconds;
}

export async function contactSheet(clipPath, outPath, run = defaultRun) {
  await run('ffmpeg', [
    '-y',
    '-loglevel',
    'error',
    '-i',
    clipPath,
    '-vf',
    "select='eq(n\\,10)+eq(n\\,90)+eq(n\\,170)',scale=320:-1,tile=3x1",
    '-frames:v',
    '1',
    outPath,
  ]);
}

export async function assembleVideo(input, run = defaultRun) {
  if (input.clips.length === 0) throw new Error('no clips to assemble');
  const voiceoverSeconds = await probeDuration(input.voiceover, run);
  let videoSeconds = 0;
  for (const clip of input.clips) {
    videoSeconds += await probeDuration(clip, run);
  }
  const listPath = join(input.listDir ?? tmpdir(), `assemble-${Date.now()}.txt`);
  const write = input.writeList ?? writeFileSync;
  const remove = input.removeList ?? unlinkSync;
  write(listPath, input.clips.map((c) => `file '${c}'`).join('\n') + '\n');
  try {
    const delay = input.voDelayMs ?? 800;
    await run('ffmpeg', [
      '-y',
      '-loglevel',
      'error',
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-i',
      input.voiceover,
      '-filter_complex',
      `[1:a]adelay=${delay}|${delay},apad[a]`,
      '-map',
      '0:v',
      '-map',
      '[a]',
      '-c:v',
      'copy',
      '-c:a',
      'aac',
      '-shortest',
      input.out,
    ]);
  } finally {
    try {
      remove(listPath);
    } catch {
      // Best effort: a stale list file in tmpdir is harmless.
    }
  }
  // True when the narration outruns the footage and gets cut.
  return { videoSeconds, voiceoverSeconds, truncated: voiceoverSeconds > videoSeconds };
}
