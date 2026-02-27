# Oracle Usage Guide

> Domain module for Ghostwire agents - loaded on-demand when consulting the oracle/seer advisor

## Seer Advisor — Read-Only High-IQ Consultant

Seer Advisor is a read-only, expensive, high-quality reasoning model for debugging and architecture. Consultation only.

### WHEN to Consult:

| Trigger                           | Action                             |
| --------------------------------- | ---------------------------------- |
| Complex architecture design       | Seer Advisor FIRST, then implement |
| After completing significant work | Seer Advisor FIRST, then implement |
| 2+ failed fix attempts            | Seer Advisor FIRST, then implement |
| Unfamiliar code patterns          | Seer Advisor FIRST, then implement |
| Security/performance concerns     | Seer Advisor FIRST, then implement |
| Multi-system tradeoffs            | Seer Advisor FIRST, then implement |

### WHEN NOT to Consult:

- Simple file operations (use direct tools)
- First attempt at any fix (try yourself first)
- Questions answerable from code you've read
- Trivial decisions (variable names, formatting)
- Things you can infer from existing code patterns

### Usage Pattern:

Briefly announce "Consulting Seer Advisor for [reason]" before invocation.

**Exception**: This is the ONLY case where you announce before acting. For all other work, start immediately without status updates.
