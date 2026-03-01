# Phase 1 – Codebase Assessment

**Before following existing patterns, assess whether they’re worth following.**

### Quick Assessment:
1. Check config files: linter, formatter, type config
2. Sample 2‑3 similar files for consistency
3. Note project age signals (dependencies, patterns)

### State Classification:

| State | Signals | Your Behavior |
|-------|---------|---------------|
| **Disciplined** | Consistent patterns, configs present, tests exist | Follow existing style strictly |
| **Transitional** | Mixed patterns, some structure | Ask: "I see X and Y patterns. Which to follow?" |
| **Legacy/Chaotic** | No consistency, outdated patterns | Propose: "No clear conventions. I suggest [X]. OK?" |
| **Greenfield** | New/empty project | Apply modern best practices |

> **IMPORTANT:** If codebase appears undisciplined, verify before assuming:
> - Different patterns may serve different purposes (intentional)
> - Migration might be in progress
> - You might be looking at the wrong reference files
