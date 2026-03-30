---
name: kernel-deploy
description: "Validates production readiness, prompts for confirmation, then deploys with the right strategy for the change. Use when deploying services, releasing a feature, coordinating database migrations, managing mobile builds, or diagnosing a deployment failure."
---

Deploy to any environment safely. Validates production readiness first, then executes the deployment with the right strategy for the change.

## Phase 1 — Gate

### 1. Identify scope

- Determine what is being deployed: a PR, branch, feature, or full release.
- Ask for the associated Linear issue or project if not provided — the verdict will be written back to it.

### 2. Run the readiness checklist

**Code Quality**

- [ ] No `console.log` or debug statements left in production paths
- [ ] No hardcoded secrets, tokens, or environment-specific values in source
- [ ] Error handling is present at all external boundaries (API calls, user input, file I/O)
- [ ] TypeScript types are correct and there are no `any` casts masking real errors

**Testing**

- [ ] Unit tests pass (`bun test` or equivalent)
- [ ] Integration tests pass
- [ ] Manual testing completed for the changed user flows
- [ ] Edge cases and error paths are covered

**Security**

- [ ] All user input is validated and sanitized
- [ ] Authentication and authorization are enforced on all protected routes
- [ ] No OWASP Top 10 issues introduced (injection, XSS, SSRF, broken auth, etc.)
- [ ] Secrets are not in source code or committed files

**Performance**

- [ ] No memory leaks or unbounded resource allocations
- [ ] No N+1 queries or unindexed lookups on hot paths
- [ ] Load tested if the change affects throughput-sensitive paths

**Documentation**

- [ ] README updated if setup or usage changed
- [ ] API docs or changelogs updated for externally visible changes

**Deployment**

- [ ] All required environment variables are configured in the target environment
- [ ] Database migrations are backward-compatible and ready to run
- [ ] Dependent services are compatible with this release (no breaking API changes)
- [ ] CI is green on the branch being deployed
- [ ] On-call contact is aware if deploying during off-hours

**Scope completeness**

- [ ] Feature is complete per the issue description and acceptance criteria
- [ ] No known regressions introduced

### 3. Deliver verdict and prompt

- **FAIL** — one or more blocking items. List each with a short description. Write to the Linear issue or project comment thread. Stop — do not proceed to deployment.
- **PASS** — all items satisfied. Write verdict to the Linear issue or project comment thread, then ask:

> Everything looks good. **Deploy now?** (yes / no)

If the user says **no**: stop. The work is validated and ready whenever they choose to deploy.
If the user says **yes**: proceed to Phase 2.

## Phase 2 — Strategy

Choose the deployment strategy automatically based on the nature of the change. Do not ask the user to choose — assess and state the strategy with a one-line rationale before proceeding.

| Signal                                             | Strategy                                                               |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| Change touches auth, payments, or a data migration | **Canary** — route 5–10% first, monitor for 10 min before full rollout |
| New feature with a corresponding feature flag      | **Feature flag** — deploy dark, enable incrementally                   |
| Routine release, no schema changes, low risk       | **Blue-Green** — zero-downtime swap                                    |
| Capacity constraints prevent blue-green            | **Rolling** — last resort only                                         |

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

### Service deployment (Railway)

```bash
# Deploy to staging
git push origin main          # triggers CI/CD pipeline
# or: railway deploy --environment staging

# Deploy to production
railway up --environment production
# or: trigger from CI on tag push: git tag v1.2.3 && git push --tags
```

```bash
# View deployment status and logs
railway status
railway logs --environment production
```

### Database migration coordination

```bash
# Run migrations before deploying the application
railway run --environment production -- bun run db:migrate

# Verify migration status
railway run --environment production -- bun run db:status

# If migration fails: do NOT deploy application code
# Fix the migration and re-run before proceeding
```

### Mobile builds (TestFlight / EAS)

```bash
# Build for TestFlight (iOS)
eas build --platform ios --profile preview

# Submit to TestFlight
eas submit --platform ios --latest

# Production build + submit
eas build --platform ios --profile production && eas submit --platform ios --latest
```

| Profile      | Channel    | Purpose                                 |
| ------------ | ---------- | --------------------------------------- |
| `preview`    | preview    | Internal QA — TestFlight internal group |
| `production` | production | App Store / external TestFlight group   |

Always verify the build artifact on a device before submitting to an external group.

## Phase 4 — Verify

Immediately after deploying:

```bash
curl -f https://your-api/health || echo "HEALTH CHECK FAILED"
```

1. **Health checks** — confirm all services respond to their health endpoints.
2. **Error rates** — compare against pre-deploy baseline; target < 0.1%.
3. **Latency** — p95 should be within 20% of baseline.
4. **Key user flows** — manually verify: login, core action, critical path.
5. **Logs** — scan for unexpected errors or warnings not present before.

## Phase 5 — Rollback

If error rates spike, health checks fail, or user reports arrive — roll back immediately. Do not attempt a hot-fix on a broken production deployment.

```bash
# Service rollback (Railway)
railway rollback --environment production

# Database rollback (if migration caused the issue)
bun run db:rollback

# Order: application first, then migration (reverse of deploy order)
```

1. Roll back immediately.
2. Preserve evidence — capture logs, traces, and metrics before anything changes.
3. Diagnose offline — understand the root cause before re-deploying.
4. Re-deploy with the fix verified — run Phase 1 again.

Decide within 10 minutes whether to roll forward or roll back. Prolonged ambiguity increases risk.

## Environment Variables

- Secrets are never committed to the repository.
- Manage environment variables in the deployment platform (Railway, Vercel, etc.).
- Add new environment variables to the platform before deploying code that requires them.
- Document every required variable in `.env.example` with a description.

## Environment Parity

Production bugs that don't reproduce in staging usually mean the environments diverged:

- Are the environment variables identical (modulo secrets)?
- Are the dependency versions identical (check lockfiles)?
- Are the infrastructure configurations the same (replica count, memory limits)?
- Is the seed data representative of production volume and shape?

Treat environment divergence as a bug. Fix parity before the next release.

## Guardrails

- Every checklist item must be explicitly confirmed or noted as not-applicable — no silent skips.
- A PASS verdict with unresolved security or testing items is never acceptable.
- Never deploy without a PASS verdict from Phase 1.
- Never deploy directly from a local machine to production — use the CI/CD pipeline.
- Never deploy application code before its migrations have applied.
- Never bypass migrations by modifying production data with raw SQL.
- Never merge to the deploy branch during an active incident.
- Never deploy a breaking API change without coordinating dependent clients first.
- Rollback first, fix second — always.
- Monitor error rates after every production deployment — do not walk away immediately.
