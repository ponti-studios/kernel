> **Licensing.** The router and mode structure are MIT. `reviews/`, `plays/`, `agents/` and
> `templates/` are vendored from the OWASP secure-agent-playbook (CC-BY-4.0, Chris Maenner);
> `audit-methodology/` from cloudflare/security-audit-skill (MIT); `data/asvs`, `data/masvs` and
> `data/mastg` are OWASP datasets (CC-BY-SA). Sources and pinned commits: `LICENSE-NOTES.md`.

## Definition of done

- Every finding cites file and line evidence plus a concrete attack scenario
- Findings carry severity justified by likelihood and impact, not checklist deviation
- Review mode names the play followed; audit mode produces REPORT.md and findings.json

Security work in two modes. Pick by request intent; if ambiguous, ask one question.

## Evidence bar (both modes)

Every finding must include file and line evidence, a concrete attack scenario ("send this request, get this result" — not "an attacker could theoretically"), impact, confidence, and remediation. Defense-in-depth gaps are hardening notes, not findings. Severity requires demonstrated likelihood and impact. Do not pad reports with LOW findings; say what the codebase does well.

## Mode 1: Review (scoped, checklist-grounded)

Use the vendored specialist skills under `reviews/` with their procedures under `plays/`:

- [WORKFLOW.md](reviews/api-security-review/WORKFLOW.md) — REST/GraphQL/gRPC, auth mechanisms, gateways (Hominem: `services/api`)
- [WORKFLOW.md](reviews/code-review-security/WORKFLOW.md) — shared packages and web code
- [WORKFLOW.md](reviews/web-security-review/WORKFLOW.md) — classic OWASP Top 10 web review
- [WORKFLOW.md](reviews/mobile-code-review/WORKFLOW.md) — native Android/iOS source (MASVS)
- [WORKFLOW.md](reviews/iac-security-review/WORKFLOW.md) — Terraform, Kubernetes, CloudFormation
- [WORKFLOW.md](reviews/sca-audit/WORKFLOW.md) — CVEs, unmaintained packages, lockfiles (pnpm workspace)
- [WORKFLOW.md](reviews/secrets-scan/WORKFLOW.md) — source and Git history credential exposure
- [WORKFLOW.md](reviews/security-guidance/WORKFLOW.md) — ASVS-grounded guidance while writing new code
- [WORKFLOW.md](reviews/prd-securability-enhancement/WORKFLOW.md) — embed ASVS/FIASSE coverage in PRDs and specs
- [WORKFLOW.md](reviews/securability-engineering/WORKFLOW.md) — generate hardened, securable code
- [WORKFLOW.md](reviews/securability-engineering-review/WORKFLOW.md) — SSEM scorecard for existing code

Route adjacent domains elsewhere: third-party frontend assets and external integrations to [kernel-audit-integration-security](../kernel-audit-integration-security/WORKFLOW.md).

## Mode 2: Offensive audit (exploit-evidence bar)

For "find exploitable bugs", pen-test requests, or full-codebase audits, run the six-phase methodology in [audit-methodology/WORKFLOW.md](audit-methodology/WORKFLOW.md):

1. Recon — map architecture, trust boundaries, input surfaces ([audit-methodology/RECONNAISSANCE.md](audit-methodology/RECONNAISSANCE.md))
2. Hunt — parallel hunting with validation rules ([audit-methodology/HUNTING.md](audit-methodology/HUNTING.md)), scopes from [audit-methodology/ATTACK-CLASSES.md](audit-methodology/ATTACK-CLASSES.md)
3. Validate — adversarially disprove every finding
4. Report — REPORT.md + FINDINGS-DETAIL.md ([audit-methodology/VALIDATION-AND-REPORTING.md](audit-methodology/VALIDATION-AND-REPORTING.md))
5. Structured output — findings.json validated against the schema
6. Independent verification — reconcile all outputs

Domain companions: memory safety/binary targets, AI/LLM targets, HTTP protocol/auth, client-side. Templates live in `templates/`; reviewer role prompts in `agents/`; ASVS/MASVS/MASTG/FIASSE datasets in `data/`.

See [LICENSE-NOTES.md](LICENSE-NOTES.md) for provenance and licensing.
