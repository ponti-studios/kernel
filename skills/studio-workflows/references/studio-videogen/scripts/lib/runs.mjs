#!/usr/bin/env node
// The video run ledger: one JSON line per generated clip, plus ratings.
//
//   runs.mjs list                       recent runs
//   runs.mjs rate <runId> --score 1-5 [--notes "..."] [--fail R14,R36] [--pass R23]
//   runs.mjs report [--by model|rule]   what is working and what is not
//
// A run is written by clips.mjs when a clip is generated. A rating is a separate line
// that refers to the run, so the log stays append-only and nothing is rewritten.
// Ratings come from a person looking at the frames. Nothing here asks a model to judge.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { parseArgs } from "node:util";

export const LEDGER =
  process.env.STUDIO_VIDEO_RUNS ?? join(homedir(), "Documents", "studio", "runtime", "video-runs.jsonl");

export function appendLine(record) {
  mkdirSync(dirname(LEDGER), { recursive: true });
  appendFileSync(LEDGER, JSON.stringify(record) + "\n");
}

export function readLedger() {
  if (!existsSync(LEDGER)) return [];
  return readFileSync(LEDGER, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// Runs and ratings, joined. A run can be rated more than once; the latest rating wins.
export function joinedRuns(lines = readLedger()) {
  const runs = new Map();
  for (const line of lines) {
    if (line.kind === "run") runs.set(line.run_id, { ...line, score: null, rules_pass: [], rules_fail: [], notes: null });
  }
  for (const line of lines) {
    if (line.kind !== "rating" || !runs.has(line.run_id)) continue;
    const run = runs.get(line.run_id);
    run.score = line.score;
    run.rules_pass = line.rules_pass ?? [];
    run.rules_fail = line.rules_fail ?? [];
    run.notes = line.notes ?? null;
    run.rated_at = line.at;
  }
  return [...runs.values()];
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const fmt = (n) => (n === null ? "  -  " : n.toFixed(2));

function report(by) {
  const runs = joinedRuns();
  const rated = runs.filter((r) => r.score !== null);
  console.log(`runs: ${runs.length}   rated: ${rated.length}`);
  if (rated.length === 0) {
    console.log("No ratings yet. Rate a run: runs.sh rate <runId> --score 1-5");
    return;
  }
  if (by === "model") {
    const groups = new Map();
    for (const r of rated) {
      const key = `${r.model} ${r.aspect} ${r.duration_seconds}s`;
      groups.set(key, [...(groups.get(key) ?? []), r.score]);
    }
    console.log("\nby model, aspect and length (mean score, n):");
    for (const [k, scores] of [...groups].sort((a, b) => mean(b[1]) - mean(a[1]))) {
      console.log(`  ${fmt(mean(scores))}  n=${scores.length}  ${k}`);
    }
    return;
  }
  // by rule: does a flagged rule actually predict a worse score? That is the test
  // that says whether a rule earns its place in the linter.
  const flagged = new Map();
  for (const r of rated) {
    for (const f of r.lint ?? []) {
      const list = flagged.get(f.rule) ?? { with: [], without: [] };
      list.with.push(r.score);
      flagged.set(f.rule, list);
    }
  }
  const rules = new Map();
  for (const r of rated) for (const id of new Set((r.lint ?? []).map((f) => f.rule))) {
    rules.set(id, true);
  }
  console.log("\nlinter rules (mean score when flagged vs. runs without the flag):");
  for (const id of [...new Set(rated.flatMap((r) => (r.lint ?? []).map((f) => f.rule)))].sort()) {
    const withFlag = rated.filter((r) => (r.lint ?? []).some((f) => f.rule === id)).map((r) => r.score);
    const without = rated.filter((r) => !(r.lint ?? []).some((f) => f.rule === id)).map((r) => r.score);
    console.log(
      `  ${id.padEnd(6)} flagged ${fmt(mean(withFlag))} (n=${withFlag.length})   unflagged ${fmt(mean(without))} (n=${without.length})`,
    );
  }
  const passFail = new Map();
  for (const r of rated) {
    for (const id of r.rules_pass) passFail.set(id, { ...(passFail.get(id) ?? { pass: 0, fail: 0 }), pass: (passFail.get(id)?.pass ?? 0) + 1 });
    for (const id of r.rules_fail) passFail.set(id, { ...(passFail.get(id) ?? { pass: 0, fail: 0 }), fail: (passFail.get(id)?.fail ?? 0) + 1 });
  }
  if (passFail.size) {
    console.log("\nhuman checks (pass / fail counts):");
    for (const [id, c] of [...passFail].sort()) console.log(`  ${id.padEnd(6)} pass ${c.pass}  fail ${c.fail}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, ...rest] = process.argv.slice(2);
  if (cmd === "list") {
    const runs = joinedRuns().slice(-20);
    for (const r of runs) {
      console.log(`${r.run_id}  ${r.at.slice(0, 16)}  ${(r.model ?? "").padEnd(24)} ${r.scene_id.padEnd(10)} score ${r.score ?? "-"}  ${r.output}`);
    }
  } else if (cmd === "rate") {
    const { values, positionals } = parseArgs({
      args: rest,
      allowPositionals: true,
      options: {
        score: { type: "string" },
        notes: { type: "string" },
        fail: { type: "string" },
        pass: { type: "string" },
      },
    });
    const runId = positionals[0];
    const score = Number(values.score);
    if (!runId || !(score >= 1 && score <= 5)) {
      console.error('usage: runs.mjs rate <runId> --score 1-5 [--notes "..."] [--fail R14,R36] [--pass R23]');
      process.exit(2);
    }
    if (!joinedRuns().some((r) => r.run_id === runId)) {
      console.error(`error: no run ${runId} in ${LEDGER}`);
      process.exit(2);
    }
    const split = (s) => (s ? s.split(",").map((x) => x.trim()).filter(Boolean) : []);
    appendLine({
      kind: "rating",
      run_id: runId,
      at: new Date().toISOString(),
      score,
      notes: values.notes ?? null,
      rules_fail: split(values.fail),
      rules_pass: split(values.pass),
    });
    console.log(`rated ${runId}: ${score}/5`);
  } else if (cmd === "report") {
    const { values } = parseArgs({ args: rest, options: { by: { type: "string", default: "model" } } });
    report(values.by);
  } else {
    console.error("usage: runs.mjs list | rate <runId> --score 1-5 | report [--by model|rule]");
    process.exit(2);
  }
}
