---
description: Apply consistent formatting and style standards
---

# Code Format

Apply consistent formatting and style standards across codebase.

## When to Use

- Before committing changes
- During code cleanup sessions
- When onboarding new team members
- After modifying linting rules

## Process

1. **Determine Formatter**
   
   Check which formatter your project uses:
   - JavaScript/TypeScript: prettier, eslint
   - Ruby: standardrb, rubocop
   - Python: black, autopep8
   - Rust: rustfmt
   - Go: gofmt

2. **Run the Formatter**
   
   Execute the appropriate formatter for your changes.

3. **Review Changes**
   
   Check the formatted output for correctness.

4. **Commit Separately**
   
   If part of a larger change, commit formatting separately.

## Rules

- Separate formatting from functional changes
- Get team consensus on formatting rules
- Run in CI to ensure checks pass
- Document exceptions
