# Ghostwire Codex Instructions

Generated: 2026-02-24

Use technical and scientific language and point of view.
Apply RED -> GREEN -> REFACTOR for non-trivial implementation.
Quantify uncertainty and state assumptions explicitly.
Prefer deterministic validation evidence over narrative claims.

## Full Agent Catalog
- `advisor-architecture`: Review code to ensure features are agent-native - that any action a user can take, an agent can also take, and anything a user can see, an agent can see. Enforces agent-user capability parity.
- `advisor-plan`: Read-only consultation agent. High-IQ reasoning specialist for debugging hard problems and high-difficulty architecture design.
- `advisor-strategy`: Pre-planning consultant that analyzes user intent, surfaces hidden requirements, and prepares directives for the planner agent to prevent AI failures.
- `analyzer-design`: Verify that UI implementation matches Figma design specifications. Visually compare live implementation against Figma design and provide detailed feedback on discrepancies for high-quality design execution.
- `analyzer-media`: Analyze media files (PDFs, images, diagrams) that require interpretation beyond raw text. Extracts specific information or summaries from documents and describes visual content.
- `analyzer-patterns`: Design pattern recognition and code organization specialist. Identifies architectural patterns, anti-patterns, and ensures consistency across the codebase.
- `designer-builder`: Create distinctive, production-grade frontend interfaces with high design quality. Generate creative, polished code that avoids generic AI aesthetics and delivers exceptional user experiences.
- `designer-flow`: Analyze specifications, plans, feature descriptions, or technical documents for user flow analysis and gap identification. Map all possible user journeys, edge cases, and interaction patterns to ensure comprehensive requirements coverage.
- `designer-iterator`: Systematic design refinement through iterative improvement cycles. Takes screenshots, analyzes design issues, implements improvements, and repeats N times to fix color harmony, layout balance, typography, and overall aesthetic quality.
- `designer-sync`: Synchronize web implementation with Figma design by automatically detecting and fixing visual differences. Use iteratively until implementation matches design pixel-perfectly.
- `editor-style`: Review and edit text content to conform to a style guide with systematic line-by-line review.
- `executor`: Focused task executor. Executes tasks directly with strict todo discipline and verification. Never delegates implementation to other agents.
- `expert-migrations`: Data migration and backfill expert. Validates ID mappings against production reality, checks for swapped values, verifies rollback safety, and ensures data integrity during schema changes and data transformations.
- `guardian-data`: Database migration and data integrity expert. Reviews database migrations, validates data constraints, ensures transaction boundaries are correct, and verifies referential integrity and privacy requirements are maintained.
- `operator`: Primary operator agent that parses intent, delegates tasks, and executes work directly when appropriate. Coordinates specialized agents and tools for implementation.
- `oracle-performance`: Performance analysis and optimization specialist. Analyzes code for performance issues, identifies bottlenecks, optimizes algorithms, and ensures scalability.
- `orchestrator`: Orchestrates work via delegate_task() to complete ALL tasks in a todo list until fully done. Coordinates agents, verifies, and enforces QA gates.
- `planner`: Strategic planning consultant that interviews users, gathers context, and produces comprehensive work plans in markdown. Never implements code directly.
- `researcher-codebase`: Contextual codebase search agent. Answers "Where is X?", "Which file has Y?", "Find the code that does Z" by running broad searches and returning actionable results.
- `researcher-data`: Specialized codebase understanding agent for multi-repository analysis, searching remote codebases, retrieving official documentation, and finding implementation examples using GitHub CLI, Context7, and web search.
- `researcher-docs`: Gather comprehensive documentation and best practices for frameworks, libraries, or dependencies. Fetches official documentation, explores source code, identifies version-specific constraints, and understands implementation patterns.
- `researcher-git`: Understand historical context and evolution of code changes, trace origins of specific code patterns, identify key contributors and their expertise areas, and analyze patterns in commit history for insights about code evolution.
- `researcher-learnings`: Search institutional learnings in docs/solutions/ for relevant past solutions before implementing features or fixing problems. Efficiently filters documented solutions to find applicable patterns, gotchas, and lessons learned.
- `researcher-practices`: Research and gather external best practices, documentation, and examples for any technology, framework, or development practice. Find official documentation, community standards, and well-regarded examples from open source projects.
- `researcher-repo`: Repository structure and convention researcher. Explores codebases to understand architecture, find files, identify patterns, and surface relevant context for tasks.
- `resolver-pr`: PR comment resolution specialist. Addresses code review feedback by understanding comments, implementing requested changes, and ensuring code meets reviewer standards.
- `reviewer-python`: Python code review with Kieran's strict conventions and taste preferences. Use after implementing features, modifying existing code, or creating new Python modules to ensure exceptional code quality.
- `reviewer-races`: JavaScript and Stimulus race condition reviewer. Specializes in identifying timing issues, state synchronization problems, and DOM manipulation race conditions in frontend code.
- `reviewer-rails`: Rails code review with Kieran's strict conventions and taste preferences. Use after implementing features, modifying existing code, or creating new Rails components to ensure exceptional code quality.
- `reviewer-rails-dh`: Brutally honest Rails code review from DHH's perspective. Identifies anti-patterns, JavaScript framework contamination, and violations of Rails conventions.
- `reviewer-security`: Security audits, vulnerability assessments, and security reviews of code. Checks for common security vulnerabilities, validates input handling, reviews authentication and authorization implementations, scans for hardcoded secrets, and ensures OWASP compliance.
- `reviewer-simplicity`: Final review pass to ensure code changes are as simple and minimal as possible. Identifies opportunities for simplification and enforces YAGNI principles.
- `reviewer-typescript`: TypeScript code review with Kieran's strict conventions and taste preferences. Use after implementing features, modifying existing code, or creating new TypeScript modules to ensure exceptional code quality.
- `validator-audit`: Expert reviewer for evaluating work plans against rigorous clarity, verifiability, and completeness standards. Ensures plans are executable and references are valid.
- `validator-bugs`: Bug reproduction and validation specialist. Systematically attempts to reproduce reported issues, validates whether the behavior is actually a bug, and provides clear reproduction steps for developers.
- `validator-deployment`: Create comprehensive pre/post-deploy checklists for changes that touch production data, migrations, or behavior that could silently discard or duplicate records. Essential for risky data changes requiring Go or No-Go decisions.
- `writer-gem`: Write Ruby gems following Andrew Kane's patterns with simple APIs, clear docs, and sensible defaults.
- `writer-readme`: Create or update README files following Ankane-style template for Ruby gems. Write concise documentation with imperative voice, short sentences, single-purpose code fences, and minimal prose.

## Companion Artifacts
- .github/copilot-instructions.md
- .github/instructions/
- .github/prompts/
- .github/skills/
- .github/hooks/
