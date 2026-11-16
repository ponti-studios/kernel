// Job progress for image and video generation.
//
// Each generation writes a small JSON file to the jobs folder. The floating window
// (../progress-hud, SwiftUI) reads that folder and shows a glass row per running job.
// The window starts itself on the first job and quits after a quiet minute. Build it once
// with progress-hud/build.sh; without a build, jobs still run and nothing is shown.
//
// Video progress is an estimate: the provider reports status, not percent, so the bar
// fills against the expected length and stops at 95% until the clip is back.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

export const JOBS_DIR =
  process.env.STUDIO_JOBS_DIR ?? join(homedir(), "Documents", "studio", "runtime", "jobs");
const HERE = dirname(fileURLToPath(import.meta.url));
const WINDOW_BIN = join(HERE, "..", "progress-hud", ".build", "release", "progress-hud");
const WINDOW_PID = join(JOBS_DIR, ".window.pid");

// Typical wait per kind, in seconds. Used only to fill the estimate bar.
const EXPECT = { image: 40, video: 240 };

function writeAtomic(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, path);
}

function alive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function ensureWindow() {
  try {
    if (existsSync(WINDOW_PID) && alive(Number(readFileSync(WINDOW_PID, "utf8")))) return;
    if (!existsSync(WINDOW_BIN)) return;
    const child = spawn(WINDOW_BIN, [JOBS_DIR], { detached: true, stdio: "ignore" });
    child.unref();
  } catch {
    // The bar is a nicety. A failed launch must never stop a generation.
  }
}

// Start a job. Returns an id to update or finish it with.
export function startJob({ kind, label, model }) {
  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  writeAtomic(join(JOBS_DIR, `${id}.json`), {
    id,
    kind,
    label,
    model,
    status: "running",
    detail: "queued",
    started_at: now,
    updated_at: now,
    pid: process.pid,
    expect_seconds: EXPECT[kind] ?? 60,
  });
  ensureWindow();
  return id;
}

export function updateJob(id, patch) {
  const path = join(JOBS_DIR, `${id}.json`);
  if (!existsSync(path)) return;
  const job = JSON.parse(readFileSync(path, "utf8"));
  writeAtomic(path, { ...job, ...patch, updated_at: new Date().toISOString() });
}

export function finishJob(id, { ok, detail }) {
  updateJob(id, { status: ok ? "done" : "failed", detail: detail ?? (ok ? "done" : "failed"), progress: ok ? 1 : undefined });
}

// Run fn as a job: the job is finished done or failed, and the error still propagates.
export async function withJob(opts, fn) {
  const id = startJob(opts);
  try {
    const result = await fn(id);
    finishJob(id, { ok: true });
    return result;
  } catch (err) {
    finishJob(id, { ok: false, detail: err?.message ?? "failed" });
    throw err;
  }
}
