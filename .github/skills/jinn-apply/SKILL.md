---
name: jinn-apply
description: Use when executing implementation work from Linear issues and sub-issues.
license: MIT
compatibility: Requires jinn CLI and a configured Linear MCP server.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, apply, linear, execute]
---

Implement work from Linear using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to select the relevant Linear project or Linear issue.
3. Use Linear MCP to read the next unblocked sub-issue.
4. Implement the change and verify it.
5. Use Linear MCP to update the Linear issue progress and state.
6. Continue until the selected Linear scope is complete or blocked.

Guardrails:
- Always use Linear MCP tools to read and write Linear data.
- Use Linear sub-issues as the execution queue.
- Pause on ambiguity or blockers instead of guessing.
