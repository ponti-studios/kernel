# Two, Not Forty-Two

**Stable taxonomies beat volatile granularity.**

---

## The Moment We Noticed

We had 42 agents. Someone asked a new user to configure their preferred model for code reviews.

The config block had 42 entries. To configure the right model for code reviews, you had to know that code reviews used `reviewer-typescript`, not `reviewer-python`, not `oracle-performance`, not `guardian-code-review`. You had to know the difference between `researcher-codebase` and `researcher-repo` and `researcher-docs`. You had to maintain a mental map of 42 concepts.

The new user stared at the config block for a long time. Then they closed it and configured nothing.

This was the moment we realized we had built a system that required expertise to use — expertise that users shouldn't need.

---

## How We Got There

It started simply. We needed a code reviewer. So we built `reviewer-typescript`.

Then we needed a Python reviewer. So we built `reviewer-python`.

Then we needed a Rails specialist. So we built `reviewer-rails`.

Then we needed a security reviewer. So we built `reviewer-security`.

Then we needed someone to review architecture decisions. So we built `advisor-architecture`.

Then we needed someone to review performance. So we built `oracle-performance`.

The pattern was reasonable. A specialist knows more than a generalist. In theory.

In practice, the specialists had to be maintained. When TypeScript changed, `reviewer-typescript` might need updating. When Rails conventions evolved, `reviewer-rails` might drift. When a language fell out of use, its specialist agent became technical debt.

The 42 agents weren't wrong about what they did. They were wrong about how they were organized. The behaviors inside them — Rails conventions, Python patterns, architecture review principles — were valuable. The agents themselves were fragile.

---

## The Real Distinction

When we finally looked at what the 42 agents actually did, the pattern emerged.

They weren't 42 different kinds of work. They were two directions of work:

**Do**: Build, plan, implement, refactor, review. If the work produces something, it goes to `do`.

**Research**: Investigate, explore, understand, analyze. If the work consumes something to produce understanding, it goes to `research`.

This isn't a new insight. It's the maker/scheduler split. It's compilers and interpreters. It's the fundamental duality of productive work: you either create or you study. Everything else is a detail.

The detail — the Python reviewer vs. the Rails reviewer vs. the TypeScript reviewer — is granularity. The direction — do vs. research — is taxonomy.

Granularity is volatile. It changes as languages, frameworks, and domains evolve.

Taxonomy is stable. Building and researching have been with us since the first human sharpened a stone.

---

## What the Specialist Knows

The behaviors that made `reviewer-rails` valuable — Rails conventions, common patterns, antipatterns — didn't disappear when we eliminated the agent. They became prompts.

A profile is a text file that tells `do` how to review Rails code. It's maintained by someone who knows Rails. It's applied to the `do` agent at runtime.

The agent doesn't need to know Rails. The profile knows Rails. The agent just follows instructions.

This is specialization as content, not as code. The knowledge lives in text, not in types. It's easier to update, easier to read, and easier to fork.

---

## The Hard Cut

We chose a hard cut. The 42 agent IDs stopped working. Any config, any delegation, any reference to the old IDs produced a clear error: valid agents are `do` and `research`.

We rejected gradual migration. We rejected backward compatibility. We rejected an "agent router" that would translate old names to new ones.

The reason: gradual migration preserves complexity indefinitely. Every compatibility layer is a maintenance burden that future engineers carry. Users who "should migrate" never feel urgency when the old way still works.

The hard cut said: this is done. The complexity is paid. Move forward.

---

## The Configuration Block

Before:
```json
{
  "agents": {
    "executor": { "model": "claude-sonnet-4" },
    "advisor-plan": { "model": "gpt-5" },
    "reviewer-typescript": { "model": "claude-code" },
    "reviewer-python": { "model": "claude-sonnet-4" },
    "researcher-codebase": { "model": "gpt-5-mini" },
    "researcher-repo": { "model": "gpt-4o" }
    // ... 35 more entries
  }
}
```

After:
```json
{
  "agents": {
    "do": { "model": "claude-sonnet-4" },
    "research": { "model": "gpt-5-mini" }
  }
}
```

Two models. Two decisions. The mental overhead collapsed.

---

## What We Gave Up

We gave up the feeling of specialization. "I have a Python reviewer" sounds more capable than "I have a `do` agent with a Python review profile."

The feeling was misleading. Both approaches produce similar results. The second approach requires less expertise to configure, less maintenance to update, and less cognitive overhead to understand.

We also gave up the router. The "agent orchestrator" that would have routed tasks to the right specialist. It would have been clever. It would have been another abstraction to maintain, another place for bugs to hide, another concept for users to learn.

We kept what mattered — the specialized behaviors — and let go of what didn't — the infrastructure to support 42 distinct identities.

---

## The Lesson

When you find yourself building a taxonomy of specialists, ask: what do they actually do?

If the answer is "they do the same thing in different domains," you have a granularity problem, not a specialization problem. Merge them, and express the domain differences as content.

If the answer is "they do fundamentally different things," keep them separate.

The difference is in the answer, not in the number.
