# Tier 2 — the checks that find defects

Tier 1 catches what is wrong syntactically. Tier 2 catches what is wrong behaviourally: the input nobody
considered, the helper written twice, the route that renders an empty page, the assertion that would pass
with the feature deleted.

## 1. Property tests (fast-check)

```bash
npm i -D fast-check
```

Properties earn their keep on **hand-written parsers and text utilities** — anything with a loop, a regex,
or a diff. Three shapes that pay immediately:

```js
// Round-trip: a patch that cannot be applied to its own input is the bug this exists to catch.
fc.assert(
  fc.property(fc.string(), fc.string(), (before, after) => {
    assert.equal(applyPatch(before, unifiedDiff(before, after)), after);
  }),
);

// Reflexivity and symmetry: similarity and overlap must agree with themselves.
fc.assert(
  fc.property(fc.string(), fc.string(), (a, b) => {
    assert.equal(similarity(a, a), 1);
    assert.equal(similarity(a, b), similarity(b, a));
  }),
);

// Range: a ratio is always inside its interval, even for inputs that divide by zero.
fc.assert(fc.property(fc.string(), fc.string(), (a, b) => between(similarity(a, b), 0, 1)));
```

Rules that keep properties honest:

- **Do not weaken a property to make it pass.** When reflexivity failed for `""`, the question was whether
  the function or the property was wrong. It was the function's contract that was ambiguous, so the
  contract got written down (`""` is 0) and the property asserts that. Weakening the generator to avoid the
  input hides the ambiguity instead of deciding it.
- A failure is a counterexample, not noise. Treat the shrunk input as a bug report.
- Keep the corpus small (a few hundred runs) and deterministic in CI — a flaky property is a gate people
  disable.

## 2. Duplication (jscpd)

```bash
npm i -D jscpd && npx jscpd src --min-tokens 60
```

`min-tokens: 60` ignores idiom-sized repetition and reports the copy that has already diverged. Set the
threshold at or just above today's number (a real repo: 0.44% measured, threshold 2%) so the gate stops
growth without demanding a refactor nobody budgeted.

## 3. Browser suite (Playwright + axe)

```bash
npm i -D @playwright/test @axe-core/playwright && npx playwright install chromium
```

Four assertions per route, which is where nearly all real dashboard bugs live:

```ts
await expect(page.getByRole("heading", { level: 1 })).toContainText("Work in motion"); // it rendered
expect(consoleErrors).toEqual([]);                                                    // it is not erroring
expect(overflow).toBe(0);                                                            // it fits
```

…plus accessibility:

```ts
const { violations } = await new AxeBuilder({ page }).analyze();
const blocking = violations.filter(
  (v) => (v.impact === "serious" || v.impact === "critical") && v.id !== "color-contrast",
);
expect(blocking.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
test.info().annotations.push({ type: "colour contrast", description: `${contrast?.nodes.length ?? 0} node(s)` });
```

Contrast is a palette decision. Gate on structure (labels, roles, names) and **record** contrast, so the
number is visible in every run without an agent vetoing a design choice. A real run: 82 nodes on the
overview, 24 on the team page, 0 on two others — a number worth knowing, not a build failure.

Point the `webServer` at a port the live app does not use, so a running instance never blocks the suite.

## 4. Links (lychee)

```bash
brew install lychee
lychee --github-token "$(gh auth token)" README.md "docs/**/*.md"
```

Without a token, every private-repo link 404s and the report looks like nine dead links. Authenticate in
the script (`"${GITHUB_TOKEN:-$(gh auth token 2>/dev/null)}"`), exclude loopback URLs, and treat the rest
as real.

## 5. Mutation testing (Stryker)

Kills the assertion that passes with the feature deleted — the only tool that measures the *tests* rather
than the code. Configure a curated subset (`mutate`: the pure modules) and set `break: 0` until you have a
baseline; a mutation gate that fails on day one is a mutation gate that gets removed.

**Known blocker:** Stryker's sandbox preprocessor calls `ts.parseConfigFileTextToJson` unconditionally, and
TypeScript 7 (the native release) does not expose the compiler API — `createProgram` is undefined too. No
config switch avoids it. Until either side moves, keep the config committed and have the npm script print
that explanation instead of a stack trace, or keep a TypeScript 5 install for tools that consume the API.
