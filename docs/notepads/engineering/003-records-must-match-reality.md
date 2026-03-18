# Records Must Match Reality: Data Integrity in a Living System

**Date**: February 2026  
**Audience**: Engineers responsible for project hygiene and documentation consistency

---

## Why This Document Exists

Records are promises. When a plan says "complete," it promises that all tasks were finished. When a status says "done," it promises that the work was verified. When documentation says "current," it promises that the described behavior matches the actual code.

This document explains a session dedicated to restoring data integrity across the Ghostwire project—fixing 21 plans whose completion status didn't match their actual state, modernizing a build system that had accumulated technical debt, and establishing conventions that prevent future drift.

---

## The Problem: Records Out of Sync

### The Discovery

During a routine review, an audit revealed a troubling pattern: 12 of 21 completed plans had unchecked task boxes despite being marked complete. The checkbox state didn't match the completion state.

This created a dangerous situation. Future maintainers consulting these plans for historical context would see:

1. A plan marked "complete"
2. Unchecked boxes suggesting work remained
3. Uncertainty about what the discrepancy meant

The specific causes varied:

**Forgotten checkboxes**: Tasks completed, boxes not updated. Human error in the normal course of work.

**Partial completions**: Some items genuinely done, others assumed rather than verified. The checkbox state reflected the uncertainty.

**Historical ambiguity**: Old plans from before conventions were established. The meaning of "complete" was unclear.

### Why This Matters

Documentation that can't be trusted is worse than no documentation. No documentation at least signals uncertainty clearly. Inconsistent documentation creates false confidence.

Consider a maintainer three years from now:

```
Plan: Branch Consolidation
Status: ✅ COMPLETE
Tasks:
- [x] Delete master branch
- [ ] Delete dev branch
```

Did they finish? Is the second item truly incomplete, or is it a stale checkbox? The record doesn't tell us.

### The Three-Tier Verification Method

Restoring integrity required more than checking boxes. We needed to verify that the work described in each plan was actually reflected in the codebase. The method:

**Tier 1: Git History**
- For each completed task, find the commit that should have implemented it
- Verify the commit exists and contains relevant changes
- Check commit messages for clear attribution

**Tier 2: Codebase Inspection**
- Locate the files that should have been changed
- Verify the changes match the task description
- Check for related changes that might have superseded the task

**Tier 3: Functional Verification**
- Run relevant commands or tests
- Verify expected behavior
- Check that no regressions were introduced

This three-tier approach catches the difference between "the task was done" and "the task was done correctly."

---

## The Decision: Verify Everything

### What We Did

For 12 plans, we:
1. Located all unchecked boxes
2. Applied three-tier verification to each
3. Either confirmed the work was done and checked the box, or identified genuine incompletions

The results:
- 41 checkboxes verified and checked
- 0 genuine incompletions found
- All plans confirmed complete

### What Was Rejected

**"Trust the status"**: Simply checking boxes without verification. This would have restored visual consistency without addressing the underlying problem—records still wouldn't match reality, just with more checked boxes.

**"Leave it ambiguous"**: Documenting the discrepancy rather than resolving it. "Some boxes may be stale" is not an acceptable permanent state for documentation.

**"Delete uncertain plans"**: Removing plans where completion was unclear. The work in these plans was often valuable; the issue was just record-keeping, not the work itself.

### Frontmatter Standardization

Beyond the checkbox audit, we standardized the frontmatter format across all historical plans:

```markdown
**Status**: ✅ COMPLETED (Historical plan from Feb YYYY)
**Created**: YYYY-MM-DD
```

This format makes several things explicit:
- The plan is historical, not active
- The original completion date is recorded
- The status format is consistent across all plans

---

## The Secondary Problem: Build System Debt

### The Old System

The build system was a 227-line Makefile. It worked, but it had accumulated characteristics typical of mature shell-based build systems:

**Implicit dependencies**: Make's dependency inference worked but wasn't always clear. Understanding what triggered a rebuild required reading the Makefile closely.

**Inconsistent error handling**: Different targets had different error-reporting behaviors. Some continued on errors; others stopped immediately.

**Platform assumptions**: The Makefile had accumulated platform-specific logic that wasn't always tested.

**Maintenance burden**: Each new task required Makefile syntax, which is less expressive than general-purpose languages and harder to test.

### The New System

The Makefile was replaced with a 280-line TypeScript task runner (`task.ts`):

```typescript
// Simplified example
export async function build() {
  const spinner = ora('Building...').start();
  try {
    await exec('bun', ['run', 'src/cli/build.ts']);
    spinner.succeed('Build complete');
  } catch {
    spinner.fail('Build failed');
    process.exit(1);
  }
}
```

Benefits:
- **Type safety**: TypeScript catches errors at write-time
- **Consistent error handling**: All tasks use the same spinner pattern
- **Bun-native**: No subprocess overhead, consistent behavior
- **Testable**: Standard JavaScript testing tools apply

### What Was Not Changed

**Build outputs**: The actual compilation and bundling logic remains unchanged. Only the orchestration layer was replaced.

**Task coverage**: All 13 original tasks (build, dev, test, schema, agents, binaries, docs, topology, clean, typecheck, sync, dev-setup, help) remain available.

**User interface**: Users still run `bun run task.ts <command>`. The interface is identical.

---

## What Was Not Changed

**Active work**: No changes to any plans in active development. Only historical plans were audited and standardized.

**Code functionality**: The build system replacement changed only the orchestration layer. Build outputs remain identical.

**Repository state**: All work was verified complete before marking complete. No work was invalidated or reverted.

---

## Transferable Insights

### 1. Records Are Infrastructure

Data integrity is not optional or nice-to-have. Documentation that doesn't match reality is actively harmful—it creates false confidence and wastes future maintainers' time.

Invest in the infrastructure to maintain accurate records. Checkboxes that don't match completion state are a smell; audit for them regularly.

### 2. Conventions Enable Enforcement

Standardized formats enable tooling. When all plans use the same frontmatter format, scripts can validate them. When all checkboxes follow the same conventions, auditors know what to check.

Establish conventions early. Retrofitting them is possible (as this session demonstrated) but costs more than establishing them from the start.

### 3. Build Systems Deserve Love Too

Build systems are infrastructure, not features. They rarely get attention because they're "just" orchestration. But accumulated technical debt in build systems creates friction that affects every developer, every day.

When refactoring, include the build system. When adding features, improve the build system. A good build system compounds its benefits.

### 4. Three-Tier Verification Catches Lies

Records can lie in three ways:
- Committed but not implemented (Tier 1 catches)
- Implemented but incorrectly (Tier 2 catches)
- Working but regressing (Tier 3 catches)

Any single tier misses some lies. Combine them.

### 5. TypeScript Everywhere

The movement toward TypeScript for everything—including build scripts, task runners, and other "script" tasks—reflects a broader principle: the benefits of static typing (catches errors early, enables tooling, improves maintainability) apply wherever code runs.

If you're writing code, write it in TypeScript.

---

## The Convention Going Forward

All plans must follow these conventions:

1. **Frontmatter at creation**: Add status header immediately when creating a plan
2. **Checkboxes updated immediately**: Mark tasks complete when verified, not when assumed
3. **Naming format**: Use `YYYY-MM-DD-plan-name.md` for all plan files
4. **Historical notation**: Mark completed historical plans with original date

These conventions are enforced through documentation, not tooling. The investment is in establishing the habit.
