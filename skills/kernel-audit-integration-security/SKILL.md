---
name: kernel-audit-integration-security
description: Enforces security review rules for third-party frontend assets and external integrations. Use when adding scripts, fonts, analytics, embeds, CDN resources, public API keys, or any browser-loaded dependency that could expand the attack surface.
license: MIT
compatibility: Any web frontend project.
metadata:
  author: project
  version: "1.0"
  category: Security
  tags:
    - security
    - csp
    - cors
    - cdn
    - third-party
    - integrity
    - sri
    - assets
    - integrations
when:
  - user is adding a third-party script, font, or stylesheet from a CDN
  - user is integrating an analytics, tracking, or marketing tool
  - user is embedding an iframe or external widget
  - user is configuring a Content Security Policy
  - user is adding an API key or integration credential to the frontend
  - user is loading any external resource not self-hosted
applicability:
  - Use before adding any external dependency to a frontend bundle or HTML page
  - Use when reviewing CSP headers or CORS configuration related to frontend integrations
  - Use when evaluating whether a third-party tool is safe to integrate
termination:
  - External resource includes SRI hash or is self-hosted
  - CSP expectations are configured and tested
  - No secret API keys are embedded in the frontend bundle
outputs:
  - Integration security decision
  - CSP or SRI requirements for the integration
  - Security checklist result for the integration
---

Treat every external frontend resource as untrusted until proven otherwise. This skill exists to stop the LLM from casually adding third-party scripts, embeds, fonts, or public credentials without a security review.

## Non-Negotiables

- Prefer self-hosting over browser-loading a third-party asset when practical.
- If a CDN asset is loaded directly, it must be version-pinned and integrity-protected when the source supports it.
- Secret keys never belong in the frontend bundle.
- Frontend integrations must respect the project's CSP and embed policy.
- External widgets and scripts are allowed only with explicit scope and review.

Forbidden behavior:

- Do not add `@latest` or floating CDN references.
- Do not embed server-side secrets or unrestricted credentials in browser code.
- Do not use wildcard CSP or CORS settings as a shortcut for integration pain.
- Do not add iframe or script permissions more broadly than the integration needs.
- Do not normalize risky third-party code just because it is common or convenient.

## Threat Model

The main risks are:

- supply-chain compromise of a remote asset
- credential exposure in the frontend bundle
- XSS or data exfiltration through embeds and scripts
- over-broad browser permissions through CSP, CORS, or iframe allowances

## Required Review

Before approving the integration, answer:

- Is the integration necessary?
- Can it be self-hosted or proxied instead?
- Is the exact version pinned?
- Is SRI available or otherwise replaced with a stronger trust boundary?
- What CSP, iframe, or origin allowances are required?
- Does the integration need a public key, and if so, is that key restricted correctly?
- What user data can the integration read or transmit?

## Enforcement Rules

- CDN scripts and styles should use `integrity` and `crossorigin` when supported.
- CSP should start narrow and expand only to the exact required origins and capabilities.
- Public frontend keys must be restricted by origin or equivalent provider controls.
- CORS decisions belong on the server boundary; never pretend the browser can secure an unsafe backend allowlist.
- Embeds must use the minimum viable sandbox and permissions.

## Pre-Ship Checklist

- [ ] version pinning is explicit
- [ ] SRI or self-hosting decision is documented
- [ ] CSP changes are specific and tested
- [ ] no secret keys are present in the frontend bundle
- [ ] public keys are restricted appropriately
- [ ] iframe or widget permissions are minimal
- [ ] data access and transmission risks are understood

## Guardrails

- Never approve a third-party frontend integration without a security rationale.
- Never let a marketing, analytics, or convenience tool bypass the same review as executable code.
- Never trade away key restriction, CSP narrowness, or embed isolation just to make an integration work faster.
