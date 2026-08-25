---
name: kernel-audit-security
description: Security review for code — quick OWASP-grounded reviews (API, web, mobile, IaC, secrets, dependencies) and deep offensive audits that hunt exploitable vulnerabilities with proof. Use when asked to find security bugs, do a security review, audit for vulnerabilities, or pen-test the code.
license: MIT
metadata:
  author: project
  version: "1.0"
  category: Audit
  tags:
    - security
    - owasp
    - audit
    - penetration-testing
    - code-review
    - secrets
    - dependencies
when:
  - user asks to find security bugs, do a security review, or audit code for vulnerabilities
  - user asks for a pen-test or an exploit-evidence security audit of a codebase
  - user is reviewing API, web, mobile, or infrastructure-as-code surfaces for security risk
  - user wants secrets, dependency, or supply-chain security checked before merge or deploy
  - user wants OWASP Top 10, ASVS, or MASVS coverage applied to a feature or repo
termination:
  - Every finding cites file and line evidence plus a concrete attack scenario
  - Findings carry severity justified by likelihood and impact, not checklist deviation
  - Review mode names the play followed; audit mode produces REPORT.md and findings.json
outputs:
  - Prioritized findings report with evidence, attack scenario, impact, confidence, remediation
  - Mode-appropriate artifact: review findings or full audit package (REPORT.md, FINDINGS-DETAIL.md, findings.json)
---

Security work in two modes. Pick by request intent; if ambiguous, ask one question.

## Evidence bar (both modes)

Every finding must include file and line evidence, a concrete attack scenario ("send this request, get this result" — not "an attacker could theoretically"), impact, confidence, and remediation. Defense-in-depth gaps are hardening notes, not findings. Severity requires demonstrated likelihood and impact. Do not pad reports with LOW findings; say what the codebase does well.

## Mode 1: Review (scoped, checklist-grounded)

Use the vendored specialist skills under `reviews/` with their procedures under `plays/`:

- `reviews/api-security-review/SKILL.md` — REST/GraphQL/gRPC, auth mechanisms, gateways (Hominem: `services/api`)
- `reviews/code-review-security/SKILL.md` — shared packages and web code
- `reviews/web-security-review/SKILL.md` — classic OWASP Top 10 web review
- `reviews/mobile-code-review/SKILL.md` — native Android/iOS source (MASVS)
- `reviews/iac-security-review/SKILL.md` — Terraform, Kubernetes, CloudFormation
- `reviews/sca-audit/SKILL.md` — CVEs, unmaintained packages, lockfiles (pnpm workspace)
- `reviews/secrets-scan/SKILL.md` — source and Git history credential exposure
- `reviews/security-guidance/SKILL.md` — ASVS-grounded guidance while writing new code
- `reviews/prd-securability-enhancement/SKILL.md` — embed ASVS/FIASSE coverage in PRDs and specs
- `reviews/securability-engineering/SKILL.md` — generate hardened, securable code
- `reviews/securability-engineering-review/SKILL.md` — SSEM scorecard for existing code

Route adjacent domains elsewhere: AI/agentic code (prompt handling, tool use, agents) to `owasp-ai-security`; third-party frontend assets and external integrations to `kernel-audit-integration-security`.

## Mode 2: Offensive audit (exploit-evidence bar)

For "find exploitable bugs", pen-test requests, or full-codebase audits, run the six-phase methodology in [audit-methodology/SKILL.md](audit-methodology/SKILL.md):

1. Recon — map architecture, trust boundaries, input surfaces ([audit-methodology/RECONNAISSANCE.md](audit-methodology/RECONNAISSANCE.md))
2. Hunt — parallel hunting with validation rules ([audit-methodology/HUNTING.md](audit-methodology/HUNTING.md)), scopes from [audit-methodology/ATTACK-CLASSES.md](audit-methodology/ATTACK-CLASSES.md)
3. Validate — adversarially disprove every finding
4. Report — REPORT.md + FINDINGS-DETAIL.md ([audit-methodology/VALIDATION-AND-REPORTING.md](audit-methodology/VALIDATION-AND-REPORTING.md))
5. Structured output — findings.json validated against the schema
6. Independent verification — reconcile all outputs

Domain companions: memory safety/binary targets, AI/LLM targets, HTTP protocol/auth, client-side. Templates live in `templates/`; reviewer role prompts in `agents/`; ASVS/MASVS/MASTG/FIASSE datasets in `data/`.

See [LICENSE-NOTES.md](LICENSE-NOTES.md) for provenance and licensing.
