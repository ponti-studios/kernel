---
name: kernel-ops-ship
description: Coordinates deployment preflight, release execution, post-deploy verification, and rollback when needed. Use when approved work is ready to deploy, when a release needs operational checks before execution, or when diagnosing or reversing a bad deployment.
license: MIT
metadata:
  author: project
  version: "2.0"
  category: Workflow
  tags:
    - workflow
    - ship
    - deploy
    - release
when:
  - user wants to deploy a service, release a feature, or ship a build
  - approved work is ready for a real deployment
  - a deployment needs operational preflight checks before proceeding
  - user says 'ship', 'deploy', 'release', or 'push to production'
termination:
  - Deployment preflight verdict delivered
  - Deployment executed with the chosen documented strategy
  - Post-deploy verification complete
outputs:
  - Deployment preflight verdict (PASS / FAIL) report
  - Deployed release in target environment
  - Post-deploy verification summary
dependencies:
  - kernel-audit-review
disableModelInvocation: true
argumentHint: branch, PR, feature, or task to ship
allowedTools:
  - bash
---

Ship approved work safely. This skill owns deploy preflight, execution, post-deploy verification, and rollback coordination.

It does not replace `kernel-audit-review`. Assume the work itself has already been reviewed for correctness and approval. This skill answers a different question: _can we release this safely right now, and if we do, what happens next?_

---

## Phase 1 — Gate

### 1. Identify scope

- Determine what is being deployed: a PR, branch, feature, or full release.
- Identify the target environment and the documented deployment path for that target.

### 2. Run the readiness checklist

**Approval and validation**

- [ ] Work has an explicit review outcome or approval signal
- [ ] Required CI / validation checks are green for the artifact being deployed
- [ ] Any required manual QA or release sign-off has been completed

**Deployment**

- [ ] All required environment variables are configured in the target environment
- [ ] Database migrations, if any, are understood and ready to run
- [ ] Dependent services are compatible with this release
- [ ] The deploy or release steps are documented and available
- [ ] Rollback or roll-forward strategy is known before starting

### 3. Deliver verdict and prompt

- **FAIL** — list each blocking item with a description. Stop — do not proceed to deployment.
- **PASS** — all items satisfied. Then ask:

> Everything looks good. **Ship now?** (yes / no)

If the user says **no**: stop. The work is validated and ready whenever they choose to deploy.
If the user says **yes**: proceed to Phase 2.

---

## Phase 2 — Strategy

Choose from the deployment strategies the project actually supports. State the selected strategy with a one-line rationale before proceeding.

| Signal                                             | Strategy                                                           |
| -------------------------------------------------- | ------------------------------------------------------------------ |
| Change is high risk and progressive rollout exists | **Canary** — release gradually and monitor before full rollout     |
| New feature with a feature flag                    | **Feature flag** — deploy dark, enable incrementally               |
| Routine release, no schema changes, low risk       | **Blue-Green** — zero-downtime swap                                |
| Capacity constraints prevent blue-green            | **Rolling** — update instances incrementally                       |

---

## Phase 3 — Execute

### Deployment order (when migrations are included)

```
1. Apply database migrations
2. Wait for migration to complete successfully
3. Deploy application code
4. Smoke-test in the target environment
5. Monitor error rates and latency for 5–10 minutes
```

Never deploy application code before its migrations have applied.

Use the repo's documented deployment commands and environment-specific runbooks. Do not invent deployment steps from memory when the project already defines them.

---

## Phase 4 — Verify

Immediately after deploying:

1. **Health checks** — confirm all services respond to their health endpoints
2. **Error rates** — compare against the repo's defined baseline or SLO
3. **Latency** — compare against the repo's defined baseline or SLO
4. **Key user flows** — manually verify: login, core action, critical path
5. **Logs** — scan for unexpected errors not present before

---

## Phase 5 — Rollback

If error rates spike, health checks fail, or user reports arrive — roll back immediately. Do not attempt a hot-fix on a broken production deployment.

1. Roll back immediately.
2. Preserve evidence — capture logs and metrics before anything changes.
3. Diagnose offline — understand the root cause before re-deploying.
4. Re-deploy with the fix verified — run Phase 1 again.

Use the documented rollback path for the environment. If none exists, stop and surface that as a release risk before proceeding with future deployments.

---

## Guardrails

- Every checklist item must be explicitly confirmed or noted as not-applicable — no silent skips.
- A PASS verdict with unresolved deployment blockers is never acceptable.
- Never deploy without a PASS verdict from Phase 1.
- Never treat ship readiness as a substitute for code review or product sign-off.
- Never deploy directly from a local machine to production unless the documented release process explicitly requires it and the user approves it.
- Never deploy application code before its migrations have applied.
- Roll back first, fix second — always.
- Monitor error rates after every production deployment — do not walk away immediately.
