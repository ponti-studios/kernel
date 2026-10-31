> Invoke with: branch, PR, feature, or task to ship.
> Explicit invocation only — do not auto-activate on related context; wait for a direct request.
> Related skills: [kernel-audit-review](../kernel-audit-review/WORKFLOW.md).

## Definition of done

- Deployment preflight verdict delivered
- For readiness-only requests, report the verdict and any blockers.
- For authorized deployment requests, execute the documented strategy and verify the result.

Ship approved work safely. This skill owns deploy preflight, execution, post-deploy verification, and rollback coordination.

It does not replace [kernel-audit-review](../kernel-audit-review/WORKFLOW.md). Assume the work itself has already been reviewed for correctness and approval. This skill answers a different question: _can we release this safely right now, and if we do, what happens next?_

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

### 3. Deliver readiness verdict

- **FAIL** — state the blocking items and stop the dependent release steps.
- **PASS** — proceed when deployment to the identified target is already authorized.
  If the user asked only for readiness, report the verdict. Ask for deployment
  authorization only when it is missing; do not ask again for an authorized action.

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

Follow the documented expand/contract sequence. Some releases apply additive migrations first; destructive or contract migrations may require compatible application code to be deployed first.

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

If release health degrades, use the documented incident and recovery plan.
Capture readily available evidence without delaying urgent mitigation. Roll back
when the prior artifact and database state are compatible; otherwise use the
planned roll-forward, feature-disable or traffic-isolation action. Do not reverse
a destructive data migration blindly. Diagnose and validate the fix before retrying.

---

## Guardrails

- Every checklist item must be explicitly confirmed or noted as not-applicable — no silent skips.
- A PASS verdict with unresolved deployment blockers is never acceptable.
- Never deploy without a PASS verdict from Phase 1.
- Never treat ship readiness as a substitute for code review or product sign-off.
- Never deploy directly from a local machine to production unless the documented release process explicitly requires it and the user approves it.
- Follow the documented expand/contract sequence. Some releases apply additive migrations first; destructive or contract migrations may require compatible application code to be deployed first.
- Choose recovery based on compatibility and the documented incident plan.
- Monitor error rates after every production deployment — do not walk away immediately.
