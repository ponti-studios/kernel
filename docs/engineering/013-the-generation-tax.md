# The Generation Tax

**Generating artifacts has a cost that isn't in the code.**

---

## The Template Problem

We had 30 commands. We wanted to support 24 harnesses.

The naive approach: write each command 24 times, once for each harness format.

The smarter approach: write each command once, generate the 24 formats automatically.

This is the template problem. Templates reduce duplication. They centralize logic. They make updates propagate automatically.

They also have a cost.

---

## What Generation Costs

**The generation logic must be correct.**

When a template changes, the generator must update all 24 outputs correctly. When a harness format changes, the generator must adapt. When a new harness is added, the generator must handle it.

The generator becomes its own codebase. Its own tests. Its own bugs.

**The generated artifacts must be validated.**

Generated output can diverge from intended output. The generator might work, but the output might be wrong. You need to validate the outputs — not just trust the generator.

**The debugging is indirect.**

When a generated artifact has a bug, the bug is in the template. But the error appears in the generated file. You have to trace back to understand what went wrong.

---

## The Hidden Cost

There's a cost that isn't in the code: **the conceptual load on readers.**

When a developer reads a generated file, they might not know it's generated. They might think it's hand-written. They might try to edit it directly.

This is the generation tax. Every generated artifact is a potential source of confusion.

Mitigation strategies exist — generated file headers, directory conventions that distinguish generated from source — but they add overhead. They're another thing to maintain.

---

## When Templates Are Worth It

Templates are worth it when:

**The duplication is real.** If you're writing the same command 24 times, templates reduce genuine duplication. The maintenance savings justify the generation cost.

**The formats are stable.** If harnesses change frequently, templates become maintenance burdens. Every change requires updating generators and validating outputs.

**The generation is deterministic.** If the same input always produces the same output, templates are predictable. If outputs vary based on context, templates become complex and error-prone.

---

## When Templates Aren't Worth It

Templates aren't worth it when:

**The formats differ significantly.** If each harness format requires fundamentally different logic, the "template" becomes a tangle of conditionals. The abstraction leaks.

**The content is simple.** If each generated file is mostly the same with minor variations, a single source file with includes might work better than a generator.

**The readers need to understand the code.** If the generated artifacts are read by developers who need to modify them, generating complexity hides the simplicity underneath.

---

## What We Gave Up

We gave up the idea of generating everything.

Some prompts are harness-specific in ways that don't template well. Some content is simple enough to write directly. Some complexity is better visible than generated.

We chose to template where duplication was real and formats were stable. We chose to write directly where content was simple or formats diverged.

The result was messier than a pure template approach. It was more honest.

---

## The Test

Before generating, ask:

**What does this generated artifact let me do that reading the source doesn't?**

If the answer is "nothing," write the artifact directly. The simplicity is worth more than the deduplication.

If the answer is "avoid writing this 24 times," generate. But maintain the generator knowing that it can diverge.

**What does this generated artifact cost readers?**

If readers need to understand the artifact — modify it, debug it, trust it — consider whether generation adds confusion. The clearest code is code you can read directly.

---

## What We Learned

Generation is a tool. Like all tools, it has a purpose and a cost.

The purpose is deduplication. When duplication is real, generation saves work.

The cost is indirection. The generated artifact is one step removed from the source. That step can hide bugs, confuse readers, and create maintenance burden.

The discipline is knowing when the purpose outweighs the cost.

Generate wisely.
