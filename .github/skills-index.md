---
generated: true
version: "1.0.0"
---

# Skills Index

This file is auto-generated. Agents can read it at session start
to discover available skills and route user goals without slash commands.

## kernel-git-master

**Description**: Guides advanced git workflows, branch management, history rewriting, and collaboration patterns. Use when branching, merging, rebasing, resolving merge conflicts, cleaning up commit history, or when users ask about git collaboration.
**When**: user asks about branching, merging, or rebasing; there are merge conflicts to resolve; user wants to clean up commit history before a PR; user needs help with git collaboration workflows
**Applicability**: Use when working with git history, branches, or remote repositories; Use for commit hygiene, rebase workflows, and conflict resolution
**Outputs**: Git commands and workflow guidance, Branch strategy or commit message recommendations
**Done when**: Git operation described and commands provided; Conflict resolved or branch strategy defined

## kernel-propose

**Description**: Turns a change request or product idea into a Linear project with seeded issues and sub-issues. Use when planning new work, when a user describes a feature or initiative that needs to be structured, or when users say 'plan this', 'create a project for', or 'break this down'.
**When**: user wants to plan new work or a new feature; user describes a change request or product idea; a new project or initiative needs to be structured
**Applicability**: Use when turning a vague change request into structured Linear work; Use when a project or initiative needs a proposal with seeded issues
**Outputs**: Linear project, Linear issues and sub-issues
**Done when**: Linear project created with a description and design context; Top-level Linear issues seeded for each workstream; Sub-issues created for immediately actionable tasks
**Depends on**: kernel-explore

## kernel-explore

**Description**: Investigates tradeoffs, risks, and missing context inside an existing Linear project or issue. Use when planning work that needs deeper investigation, technical decisions are unclear, or users ask to explore options before committing to an approach.
**When**: user wants to investigate tradeoffs or risks before implementing; there is missing context or open decisions in a Linear issue or project; user needs to explore options without committing to implementation
**Applicability**: Use when exploring tradeoffs, risks, or dependencies in existing Linear work; Use before implementation when context or direction is unclear
**Outputs**: Updated Linear issue or project description with decisions, Risk and tradeoff analysis
**Done when**: Options, risks, and open decisions documented in Linear; Recommendation or decision written back to the Linear issue or project

## kernel-apply

**Description**: Executes implementation work from Linear issues and sub-issues, following the plan and updating issue status as work progresses. Use when tasks are ready to implement, sub-issues need execution, or users say 'start on this', 'do this', or 'implement'.
**When**: user wants to implement work from a Linear issue or sub-issue; there is an unblocked Linear task ready for implementation; user says "work on", "implement", "build", or "start" a Linear issue
**Applicability**: Use when executing implementation tasks tracked in Linear; Use when the plan is clear and the next unblocked issue is ready
**Outputs**: Implemented code changes, Updated Linear issue statuses
**Done when**: All sub-issues in scope are implemented and verified; Linear issue status updated to reflect completion or blockers
**Depends on**: kernel-explore, kernel-propose

## kernel-check

**Description**: Reports current execution state mid-task: what is done, what is in progress, what is blocked, and what comes next. Use mid-execution when task status is unclear, a blocker has appeared, or users ask 'where are we?', 'what's next?', or 'what's blocking?'
**When**: the user asks for a status update mid-execution; a milestone has been reached and work should be assessed before continuing; something feels off and the health of current work needs to be assessed
**Applicability**: Use during active task execution to surface the current state; Use to identify blockers before they stall progress
**Outputs**: Status report (on track | at risk | blocked)
**Done when**: Status report delivered with clear recommendation; All blockers are named with a recommended resolution; Next action is unambiguous

## kernel-review

**Description**: Assesses completed deliverables for correctness, completeness, quality, security, performance, and standards compliance. Also covers refactoring, formatting, linting, and performance optimization. Use after implementation to evaluate whether work meets acceptance criteria, before handoff, merge, or deployment, or when asked to refactor, clean up, or improve code quality.
**When**: a deliverable is complete and ready for sign-off; a milestone has been reached and work should be reviewed before continuing; before handing off, deploying, or merging; after an implementation workflow completes a set of sub-issues; user asks to review, refactor, format, or optimize code; there are lint violations, style inconsistencies, or performance issues
**Applicability**: Use to formally assess whether completed work meets its acceptance criteria; Use to surface must-fix issues before the work moves downstream; Use for any code quality task: review, refactor, lint, format, or performance work
**Outputs**: Review report with recommendation, Prioritised findings list, Updated Linear issue status (Done or back to In Progress) via mcp_linear_save_issue, Refactored code with unchanged behaviour, Lint-clean, formatted code
**Done when**: All evaluation dimensions covered; Findings prioritised as must-fix, should-fix, or consider; Clear recommendation delivered: approve | approve with changes | needs rework; Refactoring complete with tests still passing; Lint and format checks pass

## kernel-sync

**Description**: Reconciles Linear state with what actually happened — updates stale In Progress issues, marks completed work done, and fills in missing board entries. Use when Linear has drifted from reality, work was completed without updates, or users ask to sync or clean up the board.
**When**: Linear issues are stuck in "In Progress" with no recent activity; work was completed without updating Linear; the board state does not match the codebase; before starting a new implementation session
**Applicability**: Use when Linear state has drifted from the actual state of the codebase; Use to audit and reconcile stale, missing, or mis-classified issues
**Outputs**: Updated Linear issue statuses, Back-filled issues for undocumented work, Sync summary report
**Done when**: All In Progress issues classified and transitioned correctly; Undocumented work back-filled in Linear; Sync report delivered
