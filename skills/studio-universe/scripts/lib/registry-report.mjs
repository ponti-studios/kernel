#!/usr/bin/env node
// What the registry knows: every character, its height, outfits, tail blocks
// and whether it carries a mandatory mask block. Answers "is this character
// generation-ready?" without reading 1,300 lines of bibles.
//
//   registry-report.mjs [--root <universe>] [--json]
import { parseArgs } from 'node:util';

import { loadRegistry, universeRoot, universeRootSource } from './resolve.mjs';

const { values } = parseArgs({
  options: { root: { type: 'string' }, json: { type: 'boolean', default: false } },
  allowPositionals: true,
});

const root = values.root ?? universeRoot();
// Which canon is being reported matters: skill data/ and a checkout are both
// legal roots, and a stale env var falls back to the skill's data by design.
const reg = loadRegistry(root);

if (values.json) {
  console.log(JSON.stringify(reg, null, 2));
} else {
  console.log(`registry v${reg.version} — ${root} (${universeRootSource(root)})`);
  console.log(`shared blocks: ${Object.keys(reg.shared_blocks).join(', ')}\n`);
  const rows = Object.entries(reg.characters).map(([key, c]) => [
    key,
    c.display_name,
    c.height_cm ? `${c.height_cm}cm` : '—',
    Object.keys(c.outfits ?? {}).length ? String(Object.keys(c.outfits).length) : '—',
    Object.keys(c.tails ?? {}).length ? String(Object.keys(c.tails).length) : '—',
    c.mask_negative_block ? 'yes' : '—',
  ]);
  const headers = ['character', 'display', 'height', 'outfits', 'tails', 'mask'];
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i]).length)) + 2,
  );
  console.log(headers.map((h, i) => h.padEnd(widths[i])).join(''));
  for (const row of rows) {
    console.log(row.map((v, i) => String(v).padEnd(widths[i])).join(''));
  }
  const noOutfit = Object.entries(reg.characters)
    .filter(([, c]) => !Object.keys(c.outfits ?? {}).length)
    .map(([k]) => k);
  console.log(`\ncharacters without outfits: ${noOutfit.join(', ') || 'none'}`);
  console.log('(no outfits is correct for creatures/costumes — cast entries pass outfit_id: null)');
}
