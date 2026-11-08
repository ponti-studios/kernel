# Writing `docs/conformance.md` and landing the P0 overlay

## Status vocabulary

Use exactly these words, and make the distinction load-bearing:

- **Conforming** — the behaviour exists; name the file and the function that implements it.
- **Extension** — a different mechanism the spec explicitly permits (its own `required_labels`,
  `dispatchable`, provider-native-tool hooks) delivering the same guarantee. Say which spec clause
  permits it.
- **Deviation** — deliberately different, with the reason in the row. The spec's "implementations
  MUST document the selected behavior" clause makes this a deliverable, not an apology.
- **Partial** — one half exists; name the phase and the file that will change.
- **Gap** — missing; name the phase and the file that will change.

**A row may read Conforming only when a test exercises it.** Everything else names a file to change or
a reason to keep. That single rule is what stops the table from becoming marketing.

## Row shape

| # | Requirement (copy the checklist's own wording) | Status | Where / why |

- Reproduce the spec's checklist in its own order, one row per item, so a reviewer can walk the two
  documents side by side.
- Every row carries a path, plus the function name when the file is large enough that a reader would
  have to hunt.
- Keep **"parsed but not applied"** as its own honest state. In a settings table, give it a "Consumed
  today" column with `parsed` / `applied` / `n/a` so the contract cannot overclaim ahead of the
  scheduler.
- Follow the required-tier rows with the spec's optional/extensions tier and its operational-validation
  tier; do not silently drop tiers the implementation does not ship.
- End with a **trust posture** section: specs of this kind ask implementations to state where they are
  safe (single operator, loopback bind, credential custody, no multi-tenancy, trusted environment).
- End with **"keeping this current"**: which phase owns which rows, so the table is maintained by
  flipping statuses rather than by writing a second document later.

Filling the rows is itself an audit. The rows that hold up are the ones verified in code; the rows that
do not are new issues — budget for finding something and file it.

## P0: adopt the contract without changing behaviour

1. **Per-repo path, not process-wide.** A fleet dispatches for many repositories, so the contract file
   is read from each repo's checkout. When the spec wants an explicit runtime path or a cwd default,
   record that as a deviation with this reason.
2. **Loader split:** front matter is configuration, the body is the prompt template. When the host repo
   has no YAML dependency, hand-roll a strict subset and reject loudly — tabs, duplicate keys, flow
   mappings, anchors/aliases, tags, unterminated quotes or lists, inconsistent indentation.
3. **Typed settings with the spec's defaults.** Validate per field; an invalid value falls back to the
   documented default and appends a named error instead of failing the whole load. Resolve `$VAR`
   indirection only for whole values, and expand `~` for paths.
4. **Overlay, not replacement.** The rendered body becomes one section of the prompt; the host envelope
   (isolation rules, gate list, no-merge rule, reporting contract) is always appended, because a
   repository may change how work is done but not the rails that keep the fleet safe. Document it as a
   tightening of "the body is the whole prompt".
5. **Last-known-good reload** keyed on mtime: a broken edit keeps the previous definition and surfaces
   the error; a missing file is normal, not an error; an unreadable path is treated as missing.
6. **Settings stay unused until the phase that applies them.** The existing configuration remains
   authoritative, so a repo shipping no contract file behaves byte-identically — and prove that claim
   with `evidence-recipes.md` §8 rather than trusting the suite.
7. **Strict rendering.** An unknown variable fails the run instead of rendering an empty section: an
   empty prompt is a wasted agent run and a silently broken contract.
8. **Defer the strict failure posture deliberately.** If the spec blocks new dispatches while the
   contract is invalid, say in the table that this lands with the scheduler phase — a mistyped key must
   not stall a live fleet during P0.

## The loader needs an adversarial pass

A hand-rolled config parser passes its happy-path test and fails on the details people actually write.
Cover at minimum, one test each:

- a trailing comment stripped **before** type coercion (`retries: 2 # note` must be the number 2, not a
  string);
- folded (`>`) versus literal (`|`) block scalars, including empty and at end of file;
- quoted entries containing commas inside an inline list;
- a nested block whose first line is a comment (it belongs to the block below it and must not decide
  the block's shape);
- single-`!` tags, not just `!!`;
- BOM and CRLF; a bare-scalar document (distinct error code from a parse error);
- a rewrite that preserves mtime (served from cache — document it as the change signal);
- an unreadable path treated as absent.

Probes and the coverage loop: `evidence-recipes.md` §8–9.
