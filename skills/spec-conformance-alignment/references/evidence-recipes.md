# Evidence recipes for alignment claims

Every row of a conformance table should be checkable by someone who was not in the session. These are
the probes that held up; each is cheap and each catches a class of self-deception.

## 1. Prove a gate claim on a clean copy

"It type-checks here" is not evidence: a generated file, an untracked artifact, or a stale build can
mask a break that every fresh clone hits.

```sh
rm -rf /tmp/check && mkdir -p /tmp/check
git archive HEAD | tar -x -C /tmp/check
ln -s "$PWD/node_modules" /tmp/check/node_modules
(cd /tmp/check && npx tsc -b)          # or the repo's own build/typecheck entry
```

Reversible variant when you suspect one file is load-bearing: `mv` it aside, run the gate, `mv` it
back, and re-run to confirm the restore. Move, never delete.

## 2. Sweep the running service's logs

Static reading cannot see a crash loop. Count repeated failure lines and check whether each one ends
in a process exit:

```sh
grep -c "Could not acquire\|ECONNREFUSED\|FATAL\|level=ERROR" logs/*.err.log
tail -40 logs/<service>.err.log        # read the stack, not just the count
```

A lock timeout that kills a daemon on every occurrence is a finding with a severity, and it never
shows up in a diff review.

## 3. Count consumers before calling an export dead

Grep outside the defining module and separate application call sites from test call sites:

```sh
for symbol in helperA helperB; do
  app=$(rg -l "\b$symbol\b" src | rg -v "lib/$symbol\.ts" | wc -l)
  tests=$(rg -l "\b$symbol\b" tests | wc -l)
  echo "$symbol: app=$app tests=$tests"
 done
```

`app=0, tests>0` means the product path is gone and the tests keep it alive: delete the helper and
its cases, then check the helpers that remain still have coverage.

## 4. Check that the covering test actually runs

A test outside the gate protects nothing. Read the CI workflow and the package test script, and
confirm the file you are relying on is matched by them. A test that exists but is never executed is
itself a finding, and the fix is one line in the workflow.

## 5. Before/after numbers, not adjectives

For any performance or payload claim, measure the same way twice and quote both numbers:

```sh
curl -sN -m 10 http://127.0.0.1:PORT/stream | wc -c
for i in 1 2 3; do curl -sS -o /dev/null -w '%{time_total}s\n' http://127.0.0.1:PORT/api/state; done
```

State the window and the fleet state (busy/idle) with the number, or the comparison is meaningless.

## 6. Prove a hot-reload claim by changing observable output

When the claim is "a rebuild is picked up without a restart", change something rendered, rebuild, read
it back, and prove the listener is the same process:

```sh
before=$(lsof -nP -iTCP:PORT -sTCP:LISTEN -t)
# edit a visible string, build, curl, then revert and rebuild
curl -sS http://127.0.0.1:PORT/ | grep -o '<title>[^<]*'
after=$(lsof -nP -iTCP:PORT -sTCP:LISTEN -t)
test "$before" = "$after" && echo 'same process served the new output'
```

## 7. Vary one precondition at a time

When testing a guarded endpoint, the same refusal comes back whether the origin, a header, or the body
was wrong — so a single 403 proves nothing. Hold everything constant and change one field per probe,
and record the reason string each time.

## 8. Prove "no behaviour change" by diffing against the parent build

When a phase promises "this adds a contract without changing behaviour", a green suite is not proof:
the prompt, payload or generated file can drift by whitespace and every test still passes. Build the
parent commit in a scratch worktree and diff the generated output byte for byte.

```sh
git worktree add -f /tmp/prev HEAD~1
ln -sfn "$PWD/node_modules" /tmp/prev/node_modules
(cd /tmp/prev && npx tsc -p tsconfig.backend.json)   # the repo's own build entry
```

Then import both builds in one script and compare, over several inputs — minimal, fully populated, and
explicitly-empty optional arguments:

```js
const before = await import("/tmp/prev/dist-backend/lib/prompts.js");
const after = await import("$PWD/dist-backend/lib/prompts.js");
assert.equal(await after.render(input), await before.render(input)); // byte equality, not /match/
```

This is the recipe that catches an inserted template line leaving an extra blank line. Tear the
worktree down with `git worktree remove --force /tmp/prev` so `git worktree list` stays clean. Keep the
harness out of the suite when it needs a second build; report it as a manual check and leave a durable
structural assertion (section order, "an empty optional input changes nothing") in the tests.

## 9. Drive coverage until every branch has a case

For a module written this session, coverage is the map of what you have not tried:

```sh
node --test --experimental-test-coverage path/to/your.test.mjs
```

Read the uncovered line ranges, open those lines in the built output, and write the case that reaches
each one. Typical misses are comment-skipping inside a nested block, a dedent back to a parent, and the
`errors`-array path for a wrong-typed field. Iterate until lines and functions reach 100%; then say
which remaining branches are unreachable fallbacks (`options.env ?? process.env`) instead of implying
complete coverage.

Add two deterministic fuzz sweeps with a fixed-seed LCG over an alphabet of the format's
metacharacters (a separate alphabet for template syntax). The assertion is not that parsing succeeds —
it is that **every failure is a domain error with a contract error code**: no crash, no hang, no bare
`Error` escaping. That is what proves the parser is strict rather than brittle.

Report the numbers (lines / branches / functions) plus a live check (`<entrypoint> --dry-run`, log sweep
for the new warning event) — a coverage table alone does not show the code running.
