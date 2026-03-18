import type { SkillTemplate } from '../../core/templates/types.js';

export function getJinnProposeSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-propose',
    description: 'Use when turning a change request into a Linear project with seeded issues and sub-issues.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'propose', 'linear', 'planning'],
    },
    instructions: `Create a Linear-backed change proposal using Linear MCP.

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
`,
  };
}

export function getJinnExploreSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-explore',
    description: 'Use when exploring tradeoffs, risks, or missing context inside an existing Linear project or issue.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'explore', 'linear', 'investigation'],
    },
    instructions: `Explore with Linear context using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to identify the relevant Linear project or Linear issue.
3. Use Linear MCP to read the current Linear descriptions, dependencies, and status.
4. Explore options, risks, and missing context.
5. Use Linear MCP to write clarified decisions back into the relevant Linear project or Linear issue.

Guardrails:
- Always use Linear MCP tools to read and write Linear data.
- Explore before implementation.
- Keep recommendations grounded in both the codebase and Linear state.
`,
  };
}

export function getJinnApplySkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-apply',
    description: 'Use when executing implementation work from Linear issues and sub-issues.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'apply', 'linear', 'execute'],
    },
    instructions: `Implement work from Linear using Linear MCP.

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
`,
  };
}

export function getJinnArchiveSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-archive',
    description: 'Use when closing or cleaning up completed Linear projects, issues, and follow-up work.',
    license: 'MIT',
    compatibility: 'Requires jinn CLI and a configured Linear MCP server.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Workflow',
      tags: ['workflow', 'archive', 'linear', 'done'],
    },
    instructions: `Close completed Linear work using Linear MCP.

1. Verify Linear MCP is available (check for linear_* tools).
2. Use Linear MCP to select the Linear project to close.
3. Use Linear MCP to review remaining open Linear issues and sub-issues.
4. Confirm what should be deferred versus completed.
5. Use Linear MCP to mark the Linear project complete and finish the relevant Linear issues.
6. Report any remaining follow-up work.

Guardrails:
- Always use Linear MCP tools to transition Linear state — never manage manually.
- Surface incomplete items before closing the Linear project.
`,
  };
}

export function getReadyForProdSkillTemplate(): SkillTemplate {
  return {
    name: 'jinn-ready-for-prod',
    description: 'Use when validating production readiness before a release, deployment, or launch decision.',
    license: 'MIT',
    compatibility: 'Works with any project.',
    metadata: {
      author: 'jinn',
      version: '1.0',
      category: 'Quality',
      tags: ['quality', 'production', 'deployment', 'readiness'],
    },
    instructions: `Check production readiness before deployment.

## Production Readiness Checklist

### 1. Code Quality
- [ ] No console.log or debug statements
- [ ] No hardcoded secrets or keys
- [ ] Error handling in place
- [ ] TypeScript types correct

### 2. Testing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed
- [ ] Edge cases covered

### 3. Security
- [ ] Input validation
- [ ] Authentication/authorization verified
- [ ] No security vulnerabilities
- [ ] Secrets not in code

### 4. Performance
- [ ] No memory leaks
- [ ] Load testing done if applicable
- [ ] Performance benchmarks met

### 5. Documentation
- [ ] README updated
- [ ] API docs updated
- [ ] Changelog updated

### 6. Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Rollback plan in place
- [ ] Monitoring and alerts configured

### 7. Business
- [ ] Feature complete per requirements
- [ ] Stakeholder sign-off
`,
  };
}
