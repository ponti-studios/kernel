# Deleted Agent Command Coverage

Runtime supports only `do` and `research`. Specialist behavior is implemented through command profiles.

| Deleted Agent | Replacement Command | Profile | Runtime Route | Capability Domain | Status |
|---|---|---|---|---|---|
| advisor-architecture | ghostwire:workflows:review | advisor_architecture | do | architecture | active |
| advisor-plan | ghostwire:workflows:plan | advisor_plan | do | planning | active |
| advisor-strategy | ghostwire:workflows:plan | advisor_strategy | do | planning | active |
| analyzer-design | ghostwire:workflows:review | analyzer_design | research | design | active |
| analyzer-media | ghostwire:workflows:review | analyzer_media | research | media | active |
| analyzer-patterns | ghostwire:code:refactor | analyzer_patterns | do | patterns | active |
| designer-builder | ghostwire:docs:test-browser | designer_builder | do | design | active |
| designer-flow | ghostwire:project:map | designer_flow | do | ux-flow | active |
| designer-iterator | ghostwire:docs:test-browser | designer_iterator | do | design | active |
| designer-sync | ghostwire:docs:test-browser | designer_sync | do | design | active |
| editor-style | ghostwire:docs:release-docs | editor_style | do | writing | active |
| executor | ghostwire:workflows:execute | executor | do | execution | active |
| expert-migrations | ghostwire:workflows:review | expert_migrations | do | migrations | active |
| guardian-data | ghostwire:workflows:review | guardian_data | do | data | active |
| operator | ghostwire:workflows:execute | operator | do | orchestration | active |
| oracle-performance | ghostwire:code:optimize | oracle_performance | do | performance | active |
| orchestrator | ghostwire:workflows:execute | orchestrator | do | orchestration | active |
| planner | ghostwire:workflows:plan | planner | do | planning | active |
| researcher-codebase | ghostwire:project:map | researcher_codebase | research | research | active |
| researcher-data | ghostwire:workflows:plan | researcher_data | research | research | active |
| researcher-docs | ghostwire:workflows:plan | researcher_docs | research | research | active |
| researcher-git | ghostwire:workflows:review | researcher_git | research | research | active |
| researcher-learnings | ghostwire:workflows:learnings | researcher_learnings | research | research | active |
| researcher-practices | ghostwire:workflows:plan | researcher_practices | research | research | active |
| researcher-repo | ghostwire:project:map | researcher_repo | research | research | active |
| resolver-pr | ghostwire:workflows:review | resolver_pr | do | review | active |
| reviewer-python | ghostwire:code:review | reviewer_python | do | review | active |
| reviewer-races | ghostwire:code:review | reviewer_races | do | review | active |
| reviewer-rails | ghostwire:code:review | reviewer_rails | do | review | active |
| reviewer-rails-dh | ghostwire:code:review | reviewer_rails_dh | do | review | active |
| reviewer-security | ghostwire:code:review | reviewer_security | do | security | active |
| reviewer-simplicity | ghostwire:code:review | reviewer_simplicity | do | review | active |
| reviewer-typescript | ghostwire:code:review | reviewer_typescript | do | review | active |
| validator-audit | ghostwire:plan-review | validator_audit | do | validation | active |
| validator-bugs | ghostwire:reproduce-bug | validator_bugs | do | validation | active |
| validator-deployment | ghostwire:workflows:review | validator_deployment | do | validation | active |
| writer-gem | ghostwire:project:init | writer_gem | do | writing | active |
| writer-readme | ghostwire:docs:release-docs | writer_readme | do | writing | active |

## Prompt Source

Deleted-agent prompt content is now command-owned at:

- `src/execution/features/commands/profiles/prompts/<profile_id>.ts`
- `src/execution/features/commands/profiles/prompts/index.ts`

`profiles.ts` imports this prompt index and applies full markdown prompt text to `prompt_append`.

## Migration Examples

- Previous: `Task(reviewer-rails)`
- Current: `delegate_task(subagent_type="do", prompt="[profile: reviewer_rails] Review Rails conventions")`

- Previous: `call_grid_agent(...)`
- Current: `delegate_task(subagent_type="research", run_in_background=true, prompt="[profile: researcher_codebase] ...")`
