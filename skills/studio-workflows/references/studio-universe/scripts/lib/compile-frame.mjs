#!/usr/bin/env node
// Compile one frame spec into its generation prompt.
//
//   compile-frame.mjs <spec.json> [--root <universe>] [--out <file>] [--quiet]
//
// Prints the prompt to stdout (or writes --out). Exits 1 with the named
// CompileError code on contract violations, 2 on usage/lookup failures.
//
// Deterministic: same spec + same registry => byte-identical output.
import { parseArgs } from 'node:util';
import { writeFileSync } from 'node:fs';

import { loadCompiler, loadLocalCompiler, loadRegistry, universeRoot, universeRootSource } from './resolve.mjs';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    root: { type: 'string' },
    out: { type: 'string' },
    quiet: { type: 'boolean', default: false },
    table: { type: 'boolean', default: false },
    // 'positive' (default) states what IS; 'legacy' reproduces the app's output
    // byte-for-byte. '--compiler dist' uses the monorepo build (legacy only).
    voice: { type: 'string', default: 'positive' },
    compiler: { type: 'string', default: 'local' },
    'report-negations': { type: 'boolean', default: false },
  },
});

const specPath = positionals[0];
if (!specPath) {
  console.error('usage: compile-frame.mjs <spec.json> [--root <universe>] [--out <file>]');
  process.exit(2);
}

const root = values.root ?? universeRoot();
if (!values.quiet) console.error(`# root: ${root} (${universeRootSource(root)})`);

if (!['positive', 'legacy'].includes(values.voice)) {
  console.error(`error: --voice must be 'positive' or 'legacy' (got ${values.voice})`);
  process.exit(2);
}
if (!['local', 'dist'].includes(values.compiler)) {
  console.error(`error: --compiler must be 'local' or 'dist' (got ${values.compiler})`);
  process.exit(2);
}
if (values.compiler === 'dist' && values.voice === 'positive') {
  console.error('error: the dist compiler only speaks the legacy voice; use --compiler local');
  process.exit(2);
}

let compiler;
try {
  compiler = values.compiler === 'dist' ? await loadCompiler() : await loadLocalCompiler();
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(2);
}

let spec;
try {
  spec = compiler.loadSpec(specPath);
} catch (err) {
  console.error(`error: cannot read spec ${specPath}: ${err.message}`);
  process.exit(2);
}

let registry;
try {
  registry = loadRegistry(root);
} catch (err) {
  console.error(`error: cannot load registry from ${root}: ${err.message}`);
  process.exit(2);
}

let prompt;
let report;
try {
  prompt = compiler.compileSpec(spec, registry, root, {
    voice: values.voice,
    onReport: (r) => {
      report = r;
    },
  });
} catch (err) {
  // CompileError carries a stable machine code; all other errors are bugs.
  if (err?.code && err?.name === 'CompileError') {
    console.error(`COMPILE REFUSED — ${err.code}`);
    console.error(err.message);
    console.error(`\nspec: ${specPath}`);
  } else {
    console.error(`unexpected failure: ${err?.stack ?? err}`);
  }
  process.exit(1);
}

if (values['report-negations'] && report) {
  console.error(`# voice: ${report.voice}`);
  for (const f of report.negationInVerbatimBlocks) {
    console.error(`#   canon negation still shipped: ${f.block} (${f.negations})`);
  }
}

if (values.table) {
  const lines = prompt.split('\n');
  console.error(`${lines.length} lines, ${prompt.length} chars`);
  for (const line of lines) {
    const head = line.split(' — ')[0] ?? line;
    console.log(head.slice(0, 110));
  }
} else if (values.out) {
  writeFileSync(values.out, prompt);
  if (!values.quiet) console.error(`wrote ${values.out} (${prompt.length} chars)`);
} else {
  process.stdout.write(prompt);
}
