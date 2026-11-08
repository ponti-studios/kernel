# Porting a package into its consumers

The recipe for the case where the thing you are deleting is the library your consumers import —
so removal means the implementation must move into them first, and only then can the source go.

## 1. Census what each consumer uses

Grep the consumers' entry points for the loader call and the member accesses after it, then write
the table down. The table is the acceptance criteria for the port and the checklist for the
verification at the end.

```bash
# what each consumer asks a package for
 grep -rn "load('\|require('@scope/pkg" consumers/*/scripts | sed 's/:.*load/ load/'
# and the symbols it then touches
 grep -rhoE '\.(Model|Error|Schema|normalize[A-Za-z]*|build[A-Za-z]*)' consumers/*/scripts | sort -u
```

A consumer that only uses one symbol from a large module gets a thin adapter, not the whole module.

## 2. Choose the rehoming shape

- **Shared core consumer** when two or more consumers need the same module — config parsing, provider
  clients, cost accounting. One implementation, imported by the others.
- **Per-consumer code** only for what is genuinely specific: prompt strings, output schemas, CLI
  argument handling.
- Keep **one module per source file**. Merging them into one big file makes the byte-equality and
  behaviour checks impossible to run per unit.

Consumers locate each other **relatively** (`../../<core>/scripts/lib/x.mjs`) or through a single
resolver module. Never an absolute home path, and never a search path with fallbacks — a fallback is
a second source of truth that hides a broken install.

## 3. Replace the dependency, do not vendor it

| Source dependency         | Replacement that keeps call sites unchanged                                                                                                    |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `zod` (or any schema DSL) | hand-written combinators exposing the same `.parse` / `.safeParse` contract, returning `{ success, data }` / `{ success, error: { message } }` |
| vendor SDK                | plain `fetch` against the same endpoint, same headers and body shape, same error mapping                                                       |
| `dotenv`                  | delete it: one config file plus the environment, with env winning                                                                              |

Then assert the result is dependency-free before going further:

```bash
 grep -rhoE "from '[^']+'" consumers/*/scripts | grep -v "node:" | grep -v "'\." | sort -u
# must print nothing
```

Behaviour that must survive a port, because it lives in error paths rather than signatures: absent
provider metadata means _unpriced_, not zero; retries and idempotency keys; which response carries a
cost (a poll, not a submit); character or token accounting. Read the original for these and test each
one — they are the parts a rewrite silently loses.

## 4. Slice constants by export name, never retype them

Prompts, SQL, templates and other behaviour-bearing strings are the product. Split the source file on
`^export const` and select blocks by name, then verify equality per constant:

```python
parts = re.split(r'(?m)^(?=export (?:const|function) )', source)
blocks = {re.match(r"export (?:const|function) (\w+)", p).group(1): p.rstrip() for p in parts if p.strip()}
```

Compare every copied block against the source and report the count (`18 compared, 0 different`).
Reading the diff is not verification.

## 5. Rewire resolution, then diff the exports

Replace the old module lookup with the new one in one edit per consumer, then check that the file
still exports what it used to:

```bash
 grep -oE 'export (async )?(const|function|class) [A-Za-z_]+' resolver.mjs | sort > /tmp/after
# compare with the same command run against the pre-edit copy
node --check resolver.mjs
```

A regex bounded by two function bodies quietly deletes the exports between them; the only cheap
detector is the before/after difference plus a `node --check` per touched file.

## 6. Prove it with the source gone

1. Back up first: `git bundle create ~/Backups/<name>-$(date +%Y%m%d-%H%M%S).bundle --all`, and tag
   the last state that has the source.
2. Delete (or rename) the source tree — not an env var pointing at a nonexistent path, which a
   default can still satisfy.
3. Run, with the tree gone: every consumer's test suite, its own check/preflight command, and a
   `--dry-run` of its main action.
4. Grep the consumers for the old path and delete/invert the prose that still claims it:

```bash
 grep -rn '<old-path-fragment>' consumers/ | head
```

## 7. If a consumer is a monolith, split it by output

A consumer that runs N modes behind one `--mode` flag makes every agent load N sets of instructions
to use one. Split when the trigger text genuinely differs per mode.

- **Ask the user for the granularity before generating files** — one per mode, grouped by family, or
  merged pairs is an architecture decision, and the scaffolding cost differs by 2-3x.
- Shared plumbing (model call, config, usage log) stays in the core consumer; each new consumer keeps
  its prompt, its schema and a thin CLI.
- Scaffold every new consumer from one template so the CLIs stay identical, and give each a test that
  asserts its output shape and rejects invalid model output.
- Delete the monolith last, after the replacements pass, and check nothing still names it
  (`grep -rln '<old-name>' consumers/`).

## Pitfalls specific to ports

- **Eager credential lookup breaks every dry run.** Resolve the key on the first real call only;
  otherwise verification needs a secret it is meant to avoid.
- **Loader path layout is part of the contract.** Data moved to `data/thing.json` when the loader
  probes `data/thing/thing.json` diffs clean and still fails. Run the reader.
- **Copy, do not move, while the source is still the reference.** Keeping the original in place until
  the byte-equality and behaviour checks pass is what makes those checks possible.
- **Stale cross-references survive inside the consumers themselves** — other consumers' comments,
  SKILL.md prose and test fixtures keep naming the deleted thing. Grep the whole consumer set, not
  just the scripts.
