#!/usr/bin/env node
/**
 * Audit the installed skill set against its provenance and its source.
 *
 * Three failures cost a whole afternoon to find by hand, and each of them is mechanical:
 *
 *   1. a skill installed with no lock entry — `skills update` skips it forever, silently
 *   2. a skill edited in place — the change is discarded on the next update, because the
 *      installed copy is not the source
 *   3. two skills with the same name in different tiers — neither loads
 *
 * `skills list` shows none of this: it prints "Source: local" for an unrecorded install and
 * reports an edited copy as healthy. So the check lives here, runs weekly, and exits non-zero
 * when anything is wrong.
 *
 * Usage: node scripts/skills_audit.mjs [--json] [--quiet]
 */

import { readFileSync, readdirSync, lstatSync, statSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { join, relative, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HOME = homedir();
const AGENTS = join(HOME, ".agents");
const INSTALLED = join(AGENTS, "skills");
const LOCK = join(AGENTS, ".skill-lock.json");
const HERMES_SKILLS = join(HOME, ".hermes", "skills");
const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const REPO_SKILLS = join(REPO, "skills");
const KERNEL_SOURCE = "ponti-studios/kernel";

// Installed copies legitimately carry these: the toolchain writes them, and diffing them is noise.
const JUNK = new Set([".DS_Store", ".venv", "__pycache__", ".pytest_cache", "node_modules", ".git"]);

const args = new Set(process.argv.slice(2));
const asJson = args.has("--json");
const quiet = args.has("--quiet");

function walk(root, prefix = "", seen = new Set()) {
  const files = new Map();
  if (!existsSync(root)) return files;
  const real = statSync(root).isDirectory() ? root : root;
  if (seen.has(real)) return files;
  seen.add(real);
  for (const entry of readdirSync(root).sort()) {
    if (JUNK.has(entry)) continue;
    const full = join(root, entry);
    const rel = prefix ? `${prefix}/${entry}` : entry;
    let stat;
    try {
      stat = lstatSync(full);
    } catch {
      continue;
    }
    if (stat.isSymbolicLink()) {
      let target;
      try {
        target = statSync(full); // follows: a vendored `references -> ../../data` is a directory
      } catch {
        files.set(rel, "broken-symlink");
        continue;
      }
      if (target.isDirectory()) {
        const inner = walk(full, rel, seen);
        for (const [key, value] of inner) files.set(key, value);
      } else {
        files.set(rel, hash(full));
      }
      continue;
    }
    if (stat.isDirectory()) {
      const inner = walk(full, rel, seen);
      for (const [key, value] of inner) files.set(key, value);
      continue;
    }
    files.set(rel, hash(full));
  }
  return files;
}

function hash(path) {
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 16);
  } catch {
    return "unreadable";
  }
}

function readLock() {
  try {
    const parsed = JSON.parse(readFileSync(LOCK, "utf8"));
    return parsed.skills && typeof parsed.skills === "object" ? parsed.skills : {};
  } catch {
    return null;
  }
}

function installedNames() {
  if (!existsSync(INSTALLED)) return [];
  return readdirSync(INSTALLED).filter((name) => {
    if (name.startsWith(".")) return false;
    try {
      return statSync(join(INSTALLED, name)).isDirectory();
    } catch {
      return false;
    }
  });
}

/** Real skill directories and installer links under the Hermes profile. */
function profileSkills() {
  const real = new Set();
  const links = new Map();
  const visit = (dir) => {
    let entries = [];
    try {
      entries = readdirSync(dir).sort();
    } catch {
      return;
    }
    for (const entry of entries) {
      if (entry.startsWith(".")) continue;
      const full = join(dir, entry);
      let stat;
      try {
        stat = lstatSync(full);
      } catch {
        continue;
      }
      if (stat.isSymbolicLink()) {
        links.set(entry, full);
        continue;
      }
      if (!stat.isDirectory()) continue;
      if (existsSync(join(full, "SKILL.md"))) {
        real.add(entry);
        continue;
      }
      visit(full);
    }
  };
  visit(HERMES_SKILLS);
  return { real, links };
}

function drift(lock) {
  const findings = [];
  for (const [name, entry] of Object.entries(lock)) {
    if (entry?.source !== KERNEL_SOURCE) continue;
    const repoDir = join(REPO_SKILLS, name);
    const installedDir = join(INSTALLED, name);
    if (!existsSync(repoDir)) {
      findings.push({ skill: name, problem: "installed from the repo but absent from this checkout" });
      continue;
    }
    if (!existsSync(installedDir)) continue;
    const a = walk(repoDir);
    const b = walk(installedDir);
    const changed = [];
    for (const [path, digest] of a) {
      if (!b.has(path)) changed.push(`missing: ${path}`);
      else if (b.get(path) !== digest) changed.push(`differs: ${path}`);
    }
    for (const path of b.keys()) if (!a.has(path)) changed.push(`extra: ${path}`);
    if (changed.length) findings.push({ skill: name, problem: "installed copy differs from the repo", paths: changed.slice(0, 8), total: changed.length });
  }
  return findings;
}

const lock = readLock();
const installed = installedNames();
const { real, links } = profileSkills();

const unprovenanced = lock ? installed.filter((name) => !(name in lock)) : [];
const staleLock = lock ? Object.keys(lock).filter((name) => !installed.includes(name)) : [];
const collisions = [...real].filter((name) => links.has(name)).sort();
const locked = lock ? Object.keys(lock).filter((name) => installed.includes(name)) : [];
const drifted = lock ? drift(lock) : [];

const findings = unprovenanced.length + staleLock.length + collisions.length + drifted.length + (lock ? 0 : 1);
const report = {
  checked_at: new Date().toISOString(),
  installed: installed.length,
  locked: locked.length,
  unprovenanced,
  stale_lock_entries: staleLock,
  collisions,
  drift: drifted,
  lock_file: lock ? "ok" : "unreadable",
};

if (asJson) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else if (!quiet || findings) {
  const line = (label, list, fmt = String) =>
    console.log(`  ${list.length ? "✗" : "✓"} ${label}: ${list.length}${list.length ? `\n${list.map((x) => `      ${fmt(x)}`).join("\n")}` : ""}`);
  console.log(`skills audit — ${report.installed} installed, ${report.locked} with provenance`);
  line("unprovenanced (invisible to `skills update`)", unprovenanced);
  line("stale lock entries", staleLock);
  line("name collisions (neither copy loads)", collisions);
  line("drift against the repo", drifted, (d) =>
    `${d.skill} — ${d.problem}${d.paths ? `\n        ${d.paths.join("\n        ")}${d.total > d.paths.length ? `\n        … ${d.total - d.paths.length} more` : ""}` : ""}`,
  );
  if (!lock) console.log("  ✗ lock file unreadable: ~/.agents/.skill-lock.json");
  console.log(findings ? `\n${findings} finding(s)` : "\nnothing to fix");
}

process.exit(findings ? 1 : 0);
