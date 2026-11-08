#!/usr/bin/env node
// Resolve every relative markdown link in a docs tree; exit 1 on any dangling target.
//
//   node scripts/check-doc-links.mjs [root=. ]
//
// Prints one line per broken link and, when a file with that basename exists
// elsewhere in the tree, the relative path that would fix it — the usual cause is
// a rewrite applied from the wrong directory depth (`../adr/x.md` vs `../../adr/x.md`).
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const SKIP = new Set(["node_modules", ".git", "dist", "build", ".turbo", "coverage"]);

/** @param {string} dir @returns {string[]} */
function markdownFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...markdownFiles(full));
    else if (entry.name.endsWith(".md")) out.push(full);
  }
  return out;
}

const files = markdownFiles(root);
/** @type {Map<string, string[]>} */
const byBasename = new Map();
for (const file of files) {
  const list = byBasename.get(basename(file)) ?? [];
  list.push(file);
  byBasename.set(basename(file), list);
}

const LINK = /\]\(([^)\s]+?\.md)(#[^)]*)?\)/g;
let broken = 0;

for (const file of files) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(LINK)) {
    const target = match[1];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith("#")) continue; // absolute URL or anchor
    if (existsSync(resolve(dirname(file), target))) continue;

    broken += 1;
    const candidates = byBasename.get(basename(target)) ?? [];
    const hint = candidates.length
      ? `  → did you mean ${relative(dirname(file), candidates[0])}?`
      : "  (no file with that name in the tree)";
    process.stdout.write(`${relative(root, file)}: ${target}${hint}\n`);
  }
}

if (broken) {
  process.stdout.write(`\n${broken} dangling link(s)\n`);
  process.exit(1);
}
process.stdout.write(`all relative markdown links resolve (${files.length} files)\n`);
