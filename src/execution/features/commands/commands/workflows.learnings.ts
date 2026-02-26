import type { CommandDefinition } from "../../claude-code-command-loader";

export const NAME = "ghostwire:workflows:learnings";
export const DESCRIPTION = "Document a recently solved problem to build team learnings";
export const TEMPLATE = `<command-instruction>
# /learnings

Coordinate multiple subagents working in parallel to document a recently solved problem.

## Purpose

Captures problem solutions while context is fresh, creating structured documentation in \`docs/learnings/\` with YAML frontmatter for searchability and future reference. Uses parallel subagents for maximum efficiency.

**Why "learnings"?** Each documented solution builds your team's knowledge. The first time you solve a problem takes research. Document it, and the next occurrence takes minutes. Knowledge accumulates.

## Usage

\`\`\`bash
/workflows:learnings                    # Document the most recent fix
/workflows:learnings [brief context]    # Provide additional context hint
\`\`\`

## Execution Strategy: Parallel Subagents

This command launches multiple specialized subagents IN PARALLEL to maximize efficiency:

### 1. **Context Analyzer** (Parallel)

- Extracts conversation history
- Identifies problem type, component, symptoms
- Validates against solution schema
- Returns: YAML frontmatter skeleton

### 2. **Solution Extractor** (Parallel)

- Analyzes all investigation steps
- Identifies root cause
- Extracts working solution with code examples
- Returns: Solution content block

### 3. **Related Docs Finder** (Parallel)

- Searches \`docs/learnings/\` for related documentation
- Identifies cross-references and links
- Finds related GitHub issues
- Returns: Links and relationships

### 4. **Prevention Strategist** (Parallel)

- Develops prevention strategies
- Creates best practices guidance
- Generates test cases if applicable
- Returns: Prevention/testing content

### 5. **Category Classifier** (Parallel)

- Determines optimal \`docs/learnings/\` category
- Validates category against schema
- Suggests filename based on slug
- Returns: Final path and filename

### 6. **Documentation Writer** (Parallel)

- Assembles complete markdown file
- Validates YAML frontmatter
- Formats content for readability
- Creates the file in correct location

### 7. **Optional: Specialized Agent Invocation** (Post-Documentation)

Based on problem type detected, automatically invoke applicable agents:

- **performance_issue** → \`profile.oracle_performance\`
- **security_issue** → \`profile.reviewer_security\`
- **database_issue** → \`profile.guardian_data\`
- **test_failure** → Use skill "cora-test-reviewer" (not an agent)
- Any code-heavy issue → \`profile.reviewer_rails\` + \`profile.reviewer_simplicity\`

## What It Captures

- **Problem symptom**: Exact error messages, observable behavior
- **Investigation steps tried**: What didn't work and why
- **Root cause analysis**: Technical explanation
- **Working solution**: Step-by-step fix with code examples
- **Prevention strategies**: How to avoid in future
- **Cross-references**: Links to related issues and docs

## Preconditions

<preconditions enforcement="advisory">
  <check condition="problem_solved">
    Problem has been solved (not in-progress)
  </check>
  <check condition="solution_verified">
    Solution has been verified working
  </check>
  <check condition="non_trivial">
    Non-trivial problem (not simple typo or obvious error)
  </check>
</preconditions>

## What It Creates

**Organized documentation:**

- File: \`docs/learnings/[category]/[filename].md\`

**Categories auto-detected from problem:**

- build-errors/
- test-failures/
- runtime-errors/
- performance-issues/
- database-issues/
- security-issues/
- ui-bugs/
- integration-issues/
- logic-errors/

## Success Output

\`\`\`
✓ Parallel documentation generation complete

Primary Subagent Results:
  ✓ Context Analyzer: Identified performance_issue in brief_system
  ✓ Solution Extractor: Extracted 3 code fixes
  ✓ Related Docs Finder: Found 2 related issues
  ✓ Prevention Strategist: Generated test cases
  ✓ Category Classifier: docs/learnings/performance-issues/
  ✓ Documentation Writer: Created complete markdown

Specialized Agent Reviews (Auto-Triggered):
  ✓ profile.oracle_performance: Validated query optimization approach
  ✓ profile.reviewer_rails: Code examples meet Rails standards
  ✓ profile.reviewer_simplicity: Solution is appropriately minimal
  ✓ every-style-editor: Documentation style verified

File created:
- docs/learnings/performance-issues/n-plus-one-brief-generation.md

This documentation will be searchable for future reference when similar
issues occur in the Email Processing or Brief System modules.

What's next?
1. Continue workflow (recommended)
2. Link related documentation
3. Update other references
4. View documentation
5. Other
\`\`\`

## The Compounding philosophy

This creates a learnings knowledge system:

1. First time you solve "N+1 query in brief generation" → Research (30 min)
2. Document the solution → docs/learnings/performance-issues/n-plus-one-briefs.md (5 min)
3. Next time similar issue occurs → Quick lookup (2 min)
4. Knowledge builds → Team gets smarter

The feedback loop:

\`\`\`
Build → Test → Find Issue → Research → Improve → Document → Validate → Deploy
    ↑                                                                      ↓
    └──────────────────────────────────────────────────────────────────────┘
\`\`\`

**Each unit of engineering work should make subsequent units of work easier—not harder.**

## Auto-Invoke

<auto_invoke> <trigger_phrases> - "that worked" - "it's fixed" - "working now" - "problem solved" </trigger_phrases>

<manual_override> Use /workflows:learnings [context] to document immediately without waiting for auto-detection. </manual_override> </auto_invoke>

## Routes To

\`learnings\` skill

## Applicable Specialized Agents

Based on problem type, these agents can enhance documentation:

### Code Quality & Review

- **profile.reviewer_rails**: Reviews code examples for Rails best practices
- **profile.reviewer_simplicity**: Ensures solution code is minimal and clear
- **profile.analyzer_patterns**: Identifies anti-patterns or repeating issues

### Specific Domain Experts

- **profile.oracle_performance**: Analyzes performance_issue category solutions
- **profile.reviewer_security**: Reviews security_issue solutions for vulnerabilities
- **cora-test-reviewer**: (skill, not agent) Creates test cases for prevention strategies
- **profile.guardian_data**: Reviews database_issue migrations and queries

### Enhancement & Documentation

- **profile.researcher_practices**: Enriches solution with industry best practices
- **every-style-editor**: Reviews documentation style and clarity
- **profile.researcher_docs**: Links to Rails/gem documentation references

### When to Invoke

- **Auto-triggered** (optional): Agents can run post-documentation for enhancement
- **Manual trigger**: User can invoke agents after /workflows:learnings completes for deeper review

## Related Commands

- \`/research [topic]\` - Deep investigation (searches docs/learnings/ for patterns)
- \`/workflows:plan\` - Planning workflow (references documented solutions)
</command-instruction>`;
export const ARGUMENT_HINT = "[context]";

export const COMMAND: CommandDefinition = {
  name: NAME,
  description: DESCRIPTION,
  template: TEMPLATE,
  argumentHint: ARGUMENT_HINT,
};
