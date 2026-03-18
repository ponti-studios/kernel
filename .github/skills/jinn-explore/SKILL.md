---
name: jinn-explore
description: Use when exploring tradeoffs, risks, or missing context inside an existing Linear project or issue.
license: MIT
compatibility: Requires jinn CLI and a configured Linear MCP server.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, explore, linear, investigation]
---

Explore with Linear context using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to identify the relevant Linear project or Linear issue.
3. Use Linear MCP to read the current Linear descriptions, dependencies, and status.
4. Explore options, risks, and missing context.
5. Use Linear MCP to write clarified decisions back into the relevant Linear project or Linear issue.

Guardrails:
- Always use Linear MCP tools to read and write Linear data.
- Explore before implementation.
- Keep recommendations grounded in both the codebase and Linear state.
