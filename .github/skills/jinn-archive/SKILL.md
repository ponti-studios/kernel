---
name: jinn-archive
description: Use when closing or cleaning up completed Linear projects, issues, and follow-up work.
license: MIT
compatibility: Requires jinn CLI and a configured Linear MCP server.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, archive, linear, done]
---

Close completed Linear work using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to select the Linear project to close.
3. Use Linear MCP to review remaining open Linear issues and sub-issues.
4. Confirm what should be deferred versus completed.
5. Use Linear MCP to mark the Linear project complete and finish the relevant Linear issues.
6. Report any remaining follow-up work.

Guardrails:
- Always use Linear MCP tools to transition Linear state — never manage manually.
- Surface incomplete items before closing the Linear project.
