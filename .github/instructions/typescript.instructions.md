---
applyTo: "**/*.ts,**/*.tsx"
---

# TypeScript Engineering Rules
- Enforce strict typing and avoid silent fallback behavior.
- Keep API and function contracts explicit and testable.
- Validate all behavior changes with typecheck and targeted tests.

## Agent Catalog (Top)
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
