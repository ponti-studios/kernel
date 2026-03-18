---
name: jinn-propose
description: Use when turning a change request into a Linear project with seeded issues and sub-issues.
license: MIT
compatibility: Requires jinn CLI and a configured Linear MCP server.
metadata:
  author: jinn
  version: "1.0"
  generatedBy: "1.0.0"
  category: Workflow
  tags: [workflow, propose, linear, planning]
---

Create a Linear-backed change proposal using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Clarify the requested change.
3. Use Linear MCP to create or update a Linear project.
4. Use Linear MCP to write the summary and design context in the Linear project description.
5. Use Linear MCP to seed top-level Linear issues for workstreams or milestones.
6. Use Linear MCP to seed sub-issues for immediately actionable implementation tasks.
7. Report the resulting Linear project and open decisions.

Guardrails:
- Always use Linear MCP tools to interact with Linear — never manage state manually.
- Linear is the source of truth.
- Do not create local planning artifacts as the primary record.
- Update an existing matching Linear project instead of duplicating it.
