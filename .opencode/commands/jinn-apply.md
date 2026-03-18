---
description: Implement work from Linear issues and sub-issues
---

Implement work from Linear using Linear MCP.

## Prerequisites

- Linear MCP must be configured in your environment
- Verify Linear MCP is available by checking for linear_* tools

## Steps

1. Use Linear MCP to select the Linear project or Linear issue to execute.
2. Use Linear MCP to read the active top-level Linear issues and pending sub-issues.
3. Choose the next unblocked sub-issue.
4. Implement the change, run verification, and summarize progress.
5. Use Linear MCP to update the Linear issue state, assignee, or notes.
6. Continue until the selected Linear scope is complete or blocked.

## Guardrails

- Treat Linear sub-issues as the execution queue.
- Pause when the next Linear issue is ambiguous or blocked.
- Keep code changes scoped to the selected Linear work item.
- Always use Linear MCP tools to read and write Linear state.
