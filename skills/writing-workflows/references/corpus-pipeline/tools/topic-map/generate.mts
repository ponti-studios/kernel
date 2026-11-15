#!/usr/bin/env node
/**
 * Topic-map generator. Owns the marked regions of TOPIC_MAP.md:
 *   <!-- census:start --> ... <!-- census:end -->
 *   <!-- canon:start -->  ... <!-- canon:end -->
 *   <!-- anchors:start -->... <!-- anchors:end -->
 * Everything outside the markers is hand-written and never touched.
 * Curated judgment (anchors, locks, open items) lives in overlay.json.
 * Run:  node tools/topic-map/generate.mts   (no dependencies)
 */
import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

interface Anchor { id: string; label: string; paths: string[] }
interface Overlay {
  canonSource: string;
  censusRoots: string[];
  anchors: Anchor[];
  thesisLocks: string[];
  openItems: string[];
}
interface CanonEssay { n: number; family: string; title: string; theses: unknown[] }

const ROOT = process.cwd();
const overlay: Overlay = JSON.parse(readFileSync(join(ROOT, "tools/topic-map/overlay.json"), "utf8"));

function mdCount(dir: string): number {
  if (!existsSync(dir)) return -1;
  return readdirSync(dir).filter((f) => f.endsWith(".md") && statSync(join(dir, f)).isFile()).length;
}

function subdirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => { try { return statSync(join(dir, f)).isDirectory(); } catch { return false; } })
    .sort();
}

// ---- census ----
const censusLines: string[] = ["| Location | .md files |", "|---|---|"];
let total = 0;
for (const root of overlay.censusRoots) {
  for (const sub of subdirs(root)) {
    const n = mdCount(join(root, sub));
    censusLines.push(`| \`${root}/${sub}/\` | ${n} |`);
    total += n;
  }
  const loose = readdirSync(root).filter((f) => f.endsWith(".md") && statSync(join(root, f)).isFile());
  for (const f of loose.sort()) {
    censusLines.push(`| \`${root}/${f}\` | 1 |`);
    total += 1;
  }
}
censusLines.push(`| **Total** | **${total}** |`);

// ---- canon index ----
const canon = JSON.parse(readFileSync(join(ROOT, overlay.canonSource), "utf8"));
const essays: CanonEssay[] = canon.essays;
const families = new Map<string, CanonEssay[]>();
for (const e of essays) {
  const list = families.get(e.family) ?? [];
  list.push(e);
  families.set(e.family, list);
}
const canonLines: string[] = [`${essays.length} essays in ${families.size} families (source: \`${overlay.canonSource}\`).`, ""];
for (const [fam, list] of families) {
  canonLines.push(`- **${fam} (${list.length})**: ` + list.map((e) => `${e.n}. ${e.title}`).join("; "));
}

// ---- anchor health ----
const anchorLines: string[] = [];
let broken = 0;
for (const a of overlay.anchors) {
  const missing = a.paths.filter((p) => !existsSync(join(ROOT, p)));
  if (missing.length === 0) {
    anchorLines.push(`- OK — **${a.label}** (\`${a.id}\`, ${a.paths.length} path${a.paths.length === 1 ? "" : "s"})`);
  } else {
    broken++;
    anchorLines.push(`- BROKEN — **${a.label}** (\`${a.id}\`): missing ${missing.map((m) => `\`${m}\``).join(", ")}`);
  }
}
anchorLines.push(`_Checked ${overlay.anchors.length} anchors against the working tree; ${broken} broken._`);
for (const lock of overlay.thesisLocks) anchorLines.push(`- LOCK: ${lock}`);
for (const item of overlay.openItems) anchorLines.push(`- OPEN: ${item}`);

// ---- splice into TOPIC_MAP.md ----
const mapPath = join(ROOT, "TOPIC_MAP.md");
let doc = readFileSync(mapPath, "utf8");
function splice(start: string, end: string, body: string[]): void {
  const i = doc.indexOf(start);
  const j = doc.indexOf(end);
  if (i === -1 || j === -1 || j < i) throw new Error(`markers missing: ${start} / ${end}`);
  doc = doc.slice(0, i + start.length) + "\n" + body.join("\n") + "\n" + doc.slice(j);
}
const stamp = `_Generated ${new Date().toISOString().slice(0, 10)} by \`node tools/topic-map/generate.mts\` — do not hand-edit this region._\n`;
splice("<!-- census:start -->", "<!-- census:end -->", [stamp, ...censusLines]);
splice("<!-- canon:start -->", "<!-- canon:end -->", [stamp, ...canonLines]);
splice("<!-- anchors:start -->", "<!-- anchors:end -->", [stamp, ...anchorLines]);
writeFileSync(mapPath, doc);
console.log(`census: ${total} files | canon: ${essays.length} essays | anchors: ${overlay.anchors.length - broken}/${overlay.anchors.length} OK`);
if (broken > 0) process.exitCode = 1;
