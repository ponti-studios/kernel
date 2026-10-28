---
name: project-quality-gates
description: "Use when adding quality gates to a project: lint, format, types, coverage, dead code, duplication, browser and accessibility tests, secrets, dependency and supply-chain scanning, and the CI and hooks that keep them running."
license: MIT
compatibility: Any JavaScript or TypeScript repository with a package.json. The shell, Python and security tiers apply to any repo.
metadata:
  author: ponti-studios
  version: "1.0.0"
  category: Engineering
  tags:
    - quality
    - lint
    - testing
    - security
    - ci
    - coverage
---
> Invoke with: the repository root (optional).

## When to use

- a repo has tests but no coverage number, or tests nobody trusts
- review keeps catching formatting, dead code, duplication or conventions
- there is no CI, or CI only runs the build
- before handing a codebase to other agents, or before opening it up to contributors

Not for: fixing one lint error, or a project with no build or test step at all — scaffold those first
(`kernel-dev-build`, `kernel-dev-testing`).

## The one rule

**A gate that is not honest gets fixed or deleted, never muted.**

A warning nobody acts on is worse than no gate: it teaches everyone to scroll past. On the first run,
every gate below must be either green or tuned with a reason written down at the point of the tunable.
If a gate needs three suppressions to pass, the code is wrong or the gate is wrong — pick one.

## Procedure

### 0. Detect the stack

```bash
cd <repo> && ls package.json pyproject.toml setup.py 2>/dev/null
node -p "require('./package.json').scripts" 2>/dev/null
find . -name '*.sh' -not -path './node_modules/*' | head; find . -name '*.py' -not -path './node_modules/*' | head
ls .github/workflows 2>/dev/null; ls .oxlintrc.json .eslintrc* lefthook.yml .husky 2>/dev/null
grep -E '"strict"|"noImplicitAny"' tsconfig*.json 2>/dev/null
```

Write down four things before installing anything: the test runner, whether the tests import source or
build output, whether a formatter already exists, and which files are **entry points that nothing
imports** (launchd jobs, scripts, route files). That last one decides how `knip` must be configured.

### 1. Tier 1 — the foundation

| Gate | Tool | Catches |
| --- | --- | --- |
| types | `tsc --noEmit` (strict, including `noImplicitAny`) | anything flow-shaped that was typed `any` to make it pass |
| lint | `oxlint` | dead imports, unused bindings, suspicious branches |
| format | `oxfmt` | drift; the diff nobody wants to review |
| runner | `vitest` | — it also provides coverage |
| coverage | `vitest run --coverage`, with a floor | the modules with zero tests |
| dead code | `knip` | unused files, exports and **dependencies** |
| shell | `shellcheck` | quoting, unset variables, `cd` idioms — invisible to every other tool |
| python | `ruff check` + `ruff format` | the scripts and installer tests you forgot were code |
| hooks | `lefthook` | the drift that happens between CI runs |

Configs: [`templates/oxlintrc.json`](templates/oxlintrc.json), [`templates/oxfmtrc.json`](templates/oxfmtrc.json),
[`templates/knip.jsonc`](templates/knip.jsonc), [`templates/vitest.config.ts`](templates/vitest.config.ts),
[`templates/lefthook.yml`](templates/lefthook.yml).

Detail and the exact scripts: [`references/tier-1-foundation.md`](references/tier-1-foundation.md).

### 2. Tier 2 — the checks that find defects

| Gate | Tool | Catches |
| --- | --- | --- |
| properties | `fast-check` | the input nobody thought of; hand-rolled parsers and text utilities are where it pays |
| duplication | `jscpd` | the same helper written twice with a divergence |
| browser | `@playwright/test` | routes that 500, console errors, layout overflow |
| accessibility | `@axe-core/playwright` | unlabelled controls, broken roles, and a measured contrast number |
| links | `lychee` | docs that point at deleted files and repositories |
| mutation | `Stryker` | assertions that pass with the feature deleted |

Configs: [`templates/playwright.config.ts`](templates/playwright.config.ts),
[`templates/jscpd.json`](templates/jscpd.json), [`templates/lychee.toml`](templates/lychee.toml).

Detail: [`references/tier-2-deep-checks.md`](references/tier-2-deep-checks.md).

### 3. Tier 3 — security and supply chain

| Gate | Tool | Catches |
| --- | --- | --- |
| secrets | `gitleaks detect` over the **history** | a token committed once and deleted later |
| dependencies | `osv-scanner` | known CVEs in the lockfile |
| sast | `semgrep --config p/ci` | injection, unpinned actions, unsafe deserialisation |
| signatures | `npm audit signatures` | a registry response that was tampered with |
| updates | `.github/dependabot.yml` with grouping and a cooldown | silent drift; and adopting a compromised release on day zero |

Configs: [`templates/gitleaks.toml`](templates/gitleaks.toml),
[`templates/dependabot.yml`](templates/dependabot.yml),
[`templates/security-workflow.yml`](templates/security-workflow.yml).

Detail: [`references/tier-3-security.md`](references/tier-3-security.md).

### 4. Prove every gate can fail

A gate that has never failed is a gate nobody has verified. After wiring each one, plant a violation,
watch it fail, then remove it:

```bash
printf 'const x = 1\n' >> src/probe.ts      # lint and format
echo 'const token = "ghp_<36 random chars>"' > probe.js && gitleaks dir .
npm pkg set dependencies.left-pad=1.0.0 && osv-scanner scan source -r .   # then revert
```

### 5. CI, in this order

Lint → format check → dead code → shell → python → type-check/build → tests with coverage → installer or
browser suite → security. Cheapest and fastest first, so a formatting mistake fails in ten seconds rather
than after a five-minute build. Template: [`templates/tests-workflow.yml`](templates/tests-workflow.yml).

### 6. Report the numbers

Finish with the measured state, not adjectives: coverage percentages, lint error count, duplication
percentage, number of unused dependencies found, secrets findings and what they were, dependency
vulnerabilities, and the browser-suite count. If a gate is deliberately advisory, say so and say why.

## Pitfalls that cost real time

The full list, with the measurement that exposed each one, is
[`references/pitfalls.md`](references/pitfalls.md). The six that bite first:

1. **Coverage of source measures zero** when tests import the build output. Point `coverage.include` at the
   compiled files, or enable source maps and map back.
2. **`oxlint --fix` can break the build.** `unicorn/prefer-set-has` rewrites a constant array into
   `new Set([...])` without touching the type annotation or the `.includes()` call. Always run the compiler
   after an autofix.
3. **`knip` calls everything unused** until you list the entry points nothing imports — launchd jobs,
   scripts, route files.
4. **Secret scanners flag their own tests.** A scanner's fixtures have to look like credentials; allowlist
   those paths, then plant a real token and confirm it is still caught.
5. **Link checkers 404 on private repositories** without a token, which looks like nine broken links.
6. **Contrast is a design decision, not a defect.** Gate on structural accessibility; record contrast as an
   annotation so the number stays visible.

## Definition of done

- every tier runs green locally, with the commands committed as `package.json` scripts
- `lefthook` (or equivalent) blocks the drift on commit and the tests on push
- CI runs the same commands in the same order
- each gate has been proven to fail once
- the report contains numbers, and every tunable has its reason written where it is configured
