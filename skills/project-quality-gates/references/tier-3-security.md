# Tier 3 — security and supply chain

Tier 3 answers a different question from Tier 1 and 2: not "is this code correct" but "what has been
leaked, and what are we trusting". Run every command below for real; none of them is slow enough to
justify assuming.

## 1. Secrets — the history, not the working tree

```bash
brew install gitleaks
gitleaks detect --no-banner --redact --report-format json --report-path /tmp/gl.json
```

`--redact` keeps the report safe to read. Expect the first run to be noisy, and classify every finding:

- **A scanner's own fixtures.** A test that proves the scanner catches credentials *has* to contain
  credential-shaped strings. Allowlist **by path** in `.gitleaks.toml`; allowlisting by rule blinds the
  scanner everywhere.
- **A real key.** Deleting the commit is not remediation — assume it is public. Rotate the credential
  first, then scrub the history if the repo is public (`git-history-purge` skill).

Then prove the allowlist did not blind the scanner:

```bash
printf 'const token = "ghp_%s";\n' "$(python3 -c 'import secrets,string;print("".join(secrets.choice(string.ascii_letters+string.digits) for _ in range(36)))')" > probe.js
gitleaks dir . ; rm probe.js     # must report 1 leak
```

A real first run: 10 findings, all fixtures in one scanner test; the planted `ghp_` token was still caught
afterwards, which is the only evidence that matters.

## 2. Dependencies

```bash
brew install osv-scanner
osv-scanner scan source -r .          # lockfiles, containers, vendored code
npm audit signatures                  # registry signature verification
```

`osv-scanner` is the OSV database across ecosystems — it is the one to trust for a lockfile, and it runs
offline-friendly in CI. A real run over 387 packages: no issues, which is a result worth recording rather
than a reason to skip the gate next time.

## 3. Static analysis (semgrep)

```bash
brew install semgrep
semgrep scan --config p/ci            # read the findings
semgrep scan --config p/ci --error    # then gate on them
```

The `p/ci` ruleset found exactly one class of problem on a real repo and it was a good one: **every GitHub
Action referenced by a mutable tag** (`@v4`). Fix by pinning to a commit SHA:

```bash
gh api repos/actions/checkout/commits/v4 --jq .sha
```

It also flags a dependabot config with no `cooldown`. Both are supply-chain issues: a tag can be moved, and
a fresh release can be compromised and yanked within days. After pinning and adding cooldown, the same
scan reported 0 findings.

## 4. Updates (dependabot)

Grouped, cooled down, rate-limited: see [`../templates/dependabot.yml`](../templates/dependabot.yml). The
grouping is what makes it reviewable (`minor-and-patch` in one PR), and `open-pull-requests-limit` is what
stops it from becoming noise nobody reads.

## 5. CI

Three jobs: `secrets` (needs `fetch-depth: 0` — the history is the point), `dependencies` (lockfile scan +
signature check), `sast`. On a schedule as well as on push: a dependency published as malicious on Friday
should be found on Monday, not on the next commit. See
[`../templates/security-workflow.yml`](../templates/security-workflow.yml).

Pin the actions in these workflows too — a security workflow that trusts a mutable tag is the joke that
writes itself.
