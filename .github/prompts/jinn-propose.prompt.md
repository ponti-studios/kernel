---
description: Create or update a Linear project and seed execution issues
---

Propose

Create a new Linear-backed change. Use Linear MCP to create and manage issues.

## Prerequisites

- Linear MCP must be configured in your environment
- Verify Linear MCP is available by checking for linear_* tools

## Steps

1. Clarify the goal, success criteria, and scope.
2. Use Linear MCP to create or update a Linear project for the change.
3. Write the proposal summary and design context into the Linear project description.
4. Use Linear MCP to seed top-level Linear issues for major workstreams.
5. Use Linear MCP to seed sub-issues for immediately known implementation work.
6. Report the created Linear project, issue links, and open decisions.

## Guardrails

- Do not create local artifact files as the primary workflow record.
- Prefer one Linear project per change.
- Keep top-level Linear issues outcome-oriented and sub-issues execution-oriented.
- If a matching Linear project already exists, update it instead of duplicating it.
- Always use Linear MCP tools (linear_project_create, linear_issue_create, etc.) to interact with Linear.
