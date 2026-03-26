Close completed Linear work using Linear MCP.

## Steps

### 1. Verify and orient
- Confirm Linear MCP is available (check for `linear_*` tools).
- Use `mcp_linear_list_issues` with the project or parent issue ID to list all issues.
- Count: how many are Done? How many remain Todo, In Progress, or Blocked?

### 2. Resolve or defer remaining issues
For each issue that is not Done:
- **In Progress** — determine if it can be finished now or must be deferred. If deferring, reconcile its status first.
- **Blocked** — diagnose the blocker. If it cannot be resolved, defer to a follow-up issue.
- **Todo** — classify using the scope test below, then act accordingly.

**Scope test — is this issue in-scope or out-of-scope?**
- **In-scope**: the issue directly serves the parent's stated goal, was planned from the start, and can be completed without expanding the original scope.
- **Out-of-scope**: the issue was discovered during execution, serves a different goal, or would require work beyond the parent's acceptance criteria.
- **Grey area**: if unsure, ask — does completing this issue change what the parent delivers? If yes, it's scope expansion and should be deferred.

For in-scope Todo items that are small, complete them now. For out-of-scope or large items, create a follow-up issue under a different parent or new project. Always record the follow-up issue ID in the completion summary.

### 3. Mark the project complete
- Confirm all sub-issues are either Done, cancelled, or deferred to a clearly identified follow-up.
- Use `mcp_linear_save_issue` to update the parent issue status to **Done**.
- If a Linear project owns this work, update the project to mark it complete.

### 4. Write a completion summary
- Use `mcp_linear_save_comment` on the parent issue to post a completion note:
  - What was delivered.
  - What was deferred (link to follow-up issues).
  - Lessons or risks to carry forward.

### 5. Report
- Confirm the parent issue (and project if applicable) is closed.
- List any follow-up issues created with their URLs.

## Guardrails
- Always use Linear MCP tools to transition state — never manage manually.
- Surface all incomplete items before closing — do not silently skip unresolved work.
- Deferred work must have a named home (a follow-up issue or project) — do not delete or cancel it.
- Every closed project must have a completion comment; closure without a summary is not complete.

