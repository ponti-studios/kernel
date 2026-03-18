# Language Is the Interface

**The best name explains itself.**

---

## The Problem With Clever

We had a hook called `ralph-loop`.

It was named after Anthropic's Ralph Wiggum plugin — a playful reference, a meme for people who knew the reference. For everyone else, it was meaningless.

What did Ralph do? You had to read the documentation. Why was it called Ralph? You had to know the reference. What was a Ralph Loop? You had to ask.

The documentation explained it. The documentation was long.

---

## Names Appear Everywhere

A name isn't just a label. It's a concept that appears in:

- **Documentation**: "To use Ralph Loop, configure the ralph_loop key..."
- **Error messages**: "Ralph Loop is not enabled. Set ralph_loop.enabled to true."
- **Config keys**: `ralph_loop: { enabled: true, max_iterations: 100 }`
- **Mental models**: "Ralph handles the self-referential hook. Boulder handles state."
- **Git history**: `createRalphLoopHook()`, `RALPH_LOOP_TEMPLATE`, "Ralph Loop Stopped"

Every appearance is an encounter with the concept. If the name doesn't explain itself, each encounter is a small confusion tax.

It compounds.

---

## What We Did

We renamed Ralph and Boulder — both, together, to "Ultrawork."

The rename wasn't just a find-and-replace. It was an audit. 366 references across 56 files. Source code, tests, documentation, config schemas, system directives, skill metadata.

The scope of the rename revealed the scope of the problem. When a name appears 366 times, it's not just a label. It's a significant portion of the system's identity.

The new name had to appear everywhere, so it had to be worth appearing everywhere.

"Ultrawork" meant: beyond ordinary work automation. It was meaningful. It was distinctive. It was professional.

It wasn't as fun as "Ralph." It was better.

---

## The Interface Problem

Names are interfaces. Not between systems — between concepts and people.

When a user reads "ralph-loop," they learn nothing. When they read "continuous-automation-loop," they learn something. When they read "ultrawork-loop," they learn something.

The interface isn't the CLI. The interface is every word in every document, every key in every config, every label in every error message.

If the words don't teach, the user has to learn elsewhere.

---

## Planner vs. Oracle-Strategy

We had an agent called `oracle-strategy`.

"Oracle" suggests mysticism, prophecy, answers from the void. It sounds impressive. It tells you nothing about what the agent does.

We renamed it to `planner`.

"Planner" tells you exactly what it does. It plans. If you know what planning is, you know what this agent does.

The rename cost us a clever word. It gained us clarity.

---

## Reviewer vs. Guardian-Audit

We had an agent called `guardian-data`.

"Guardian" suggests protection, vigilance, defense. "Data" narrows it to data. But "guardian-data" as a concept is vague. Does it protect data? Validate data? Migrate data?

We renamed it to `reviewer-data`.

"Reviewer" tells you the role. "Data" tells you the domain. The concept is immediately clear.

---

## What We Learned

**Memorable isn't the same as meaningful.**

Ralph was memorable. It referenced a cultural touchstone. It made people smile who knew the reference.

It was meaningless to everyone else.

Meaningful names explain themselves. You don't need to know the lore. You don't need to ask. The name teaches.

---

**Playful names date badly.**

Ralph Wiggum is a character from 1999. In 2026, fewer users know the reference. In 2033, fewer still.

"Ultrawork" will mean the same thing in 2033 as it does today.

---

**Names compound.**

A name appears in documentation. The documentation appears in search results. The search results appear in error messages. The error messages appear in config files.

Every appearance is a micro-decision for the user: do I know what this means?

If the name is clear, the decision is fast. If the name is opaque, the decision is slow.

Over hundreds of encounters, opaque names cost hours.

---

## The Test

Before naming something, read the name in context:

- "Configure ralph_loop in your config file."
- "The planner agent handles goal decomposition."
- "Set the reviewer_preferences in your profile."

If someone who has never seen your system reads this sentence, do they learn something or do they have to look it up?

The best names need no footnote.
