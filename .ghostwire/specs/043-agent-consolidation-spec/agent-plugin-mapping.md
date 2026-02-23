# Plugin Agent Deduplication Map

This document records how legacy plugin agent markdown files map to the unified
markdown agents in `src/orchestration/agents/`.

## Review
- plugin: `review/kieran-rails-reviewer.md` -> builtin: `reviewer-rails.md`
- plugin: `review/kieran-python-reviewer.md` -> builtin: `reviewer-python.md`
- plugin: `review/kieran-typescript-reviewer.md` -> builtin: `reviewer-typescript.md`
- plugin: `review/dhh-rails-reviewer.md` -> builtin: `reviewer-rails-dh.md`
- plugin: `review/code-simplicity-reviewer.md` -> builtin: `reviewer-simplicity.md`
- plugin: `review/security-sentinel.md` -> builtin: `reviewer-security.md`
- plugin: `review/performance-oracle.md` -> builtin: `oracle-performance.md`
- plugin: `review/deployment-verification-agent.md` -> builtin: `validator-deployment.md`
- plugin: `review/pattern-recognition-specialist.md` -> builtin: `analyzer-patterns.md`
- plugin: `review/data-integrity-guardian.md` -> builtin: `guardian-data.md`
- plugin: `review/data-migration-expert.md` -> builtin: `expert-migrations.md`
- plugin: `review/architecture-strategist.md` -> builtin: `advisor-architecture.md`
- plugin: `review/agent-native-reviewer.md` -> builtin: `advisor-architecture.md`
- plugin: `review/julik-frontend-races-reviewer.md` -> builtin: `reviewer-races.md`

## Research
- plugin: `research/framework-docs-researcher.md` -> builtin: `researcher-docs.md`
- plugin: `research/learnings-researcher.md` -> builtin: `researcher-learnings.md`
- plugin: `research/best-practices-researcher.md` -> builtin: `researcher-practices.md`
- plugin: `research/git-history-analyzer.md` -> builtin: `researcher-git.md`
- plugin: `research/repo-research-analyst.md` -> builtin: `researcher-repo.md`

## Design
- plugin: `design/figma-design-sync.md` -> builtin: `designer-sync.md`
- plugin: `design/design-implementation-reviewer.md` -> builtin: `analyzer-design.md`
- plugin: `design/design-iterator.md` -> builtin: `designer-iterator.md`

## Workflow
- plugin: `workflow/spec-flow-analyzer.md` -> builtin: `designer-flow.md`
- plugin: `workflow/bug-reproduction-validator.md` -> builtin: `validator-bugs.md`
- plugin: `workflow/pr-comment-resolver.md` -> builtin: `resolver-pr.md`
- plugin: `workflow/every-style-editor.md` -> builtin: `editor-style.md`
- plugin: `workflow/lint.md` -> builtin: `reviewer-rails.md`
- plugin: `workflow/ralph-loop.md` -> builtin: `designer-iterator.md`

## Docs
- plugin: `docs/ankane-readme-writer.md` -> builtin: `writer-readme.md`
