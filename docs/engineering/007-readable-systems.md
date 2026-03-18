# Readable Systems

**The simplest system is the one you can verify without tooling.**

---

## The Manifest Problem

We had a manifest.

The manifest was generated. It contained the canonical list of skills, commands, and agents — everything the system could do. Users could read it to understand the system. Tools could read it to generate documentation.

The manifest was always wrong.

Not wrong in a dramatic way. Wrong in the way that manifests are wrong when they're generated: the generation process diverged from the actual behavior, and nobody noticed until a user reported the discrepancy.

The manifest said a skill was available. The skill wasn't in the loading path. The manifest was stale.

We could have fixed the generation process. We could have added validation. We could have made the manifest trustworthy.

We deleted the manifest instead.

---

## What We Learned

A manifest is a summary. Summaries are only as good as their sources. When the summary diverges from the source, you have two choices: make the summary accurate, or make the summary unnecessary.

We chose the second.

Instead of a manifest, we have a folder. Users can read `.agents/skills/` and see every skill. They can count them. They can verify them. They can edit them in place.

The folder never diverges from itself. There's no generation step to fail. The source is the artifact.

---

## The Test

Ask: can I verify this system without running code?

For a manifest, the answer is no. You have to generate it, then compare it to something, then trust the generation process.

For a folder, the answer is yes. `ls .agents/skills/` tells you what's there. You can read the files. You can grep them. You can verify them with a text editor.

Readable systems are auditable systems. Auditable systems don't hide failures.

---

## Generated vs. Source

Generated artifacts have a cost: the generation process must be correct, and the generation process must stay correct as the source evolves.

This cost is invisible when the generation is working. It becomes visible — painfully — when something breaks.

Source files don't need generation. They're the input to the process, not the output. When you read a source file, you're reading what the system actually uses.

The question isn't "should I generate artifacts?" It's "am I willing to maintain the generation process forever?"

If the answer is no, don't generate. Use the source.

---

## The Skill File

A skill is a `SKILL.md` file.

You can read it in any text editor. You can understand it without a parser. You can verify its content with `grep`.

Compare this to a skill defined in a TypeScript object, merged from multiple sources, with defaults applied from a config file. To understand what that skill actually contains, you need to run the system.

The TypeScript definition isn't wrong. It's just opaque. You can't verify it without tooling.

The `SKILL.md` is transparent. You read it, you understand it.

---

## What "Readable" Means

Readable doesn't mean "good prose." It means "verifiable without running code."

A readable system:

- Has inputs you can inspect
- Has outputs you can verify by hand
- Uses formats you can parse with a text editor
- Has dependencies you can trace with `grep`

An unreadable system:

- Has inputs that are generated
- Has outputs that require running the system to check
- Uses formats that require parsers to understand
- Has dependencies that require tooling to trace

Readable systems are honest. They don't hide their complexity behind generation steps.

---

## The Command Prompt

Commands are defined as templates.

The template is a string. You can read it. You can understand what it tells the model. You can verify that it produces the behavior you expect.

Compare this to a command that is assembled from multiple fragments — a base template, a profile injection, a context addition — where the final prompt is only visible at runtime.

The assembled command might work. It might also hide edge cases, overflow conditions, or injection vulnerabilities. You won't know until you run it.

The template is transparent. You read it, you see the whole thing.

---

## The Discipline

Readable systems require discipline.

The discipline is: when you're tempted to generate something, ask whether the source is sufficient.

Most of the time, the source is sufficient. The `.agents/skills/` folder is the manifest. The `SKILL.md` file is the agent definition. The template string is the command.

When the source isn't sufficient — when you need cross-reference validation, aggregated views, or computed outputs — then generate. But generate knowing what you're trading away: the directness of the source, the audibility of the format.

---

## The Test, Revisited

Before generating an artifact, ask:

**What does this artifact let me do that reading the source doesn't?**

If the answer is "nothing," don't generate. Use the source.

If the answer is "cross-reference validation" or "computed aggregation" or "generated documentation," then generate — and maintain the generation process knowing that it can diverge.

The best system is the one you can understand by reading it.

The second-best system is the one you can verify by running it.

The worst system is the one you can only understand by generating it.
