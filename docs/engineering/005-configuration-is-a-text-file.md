# Configuration Is a Text File

**The best config system is the one you already have.**

---

## What We Built

We had a model configuration problem.

Models were hardcoded in `model-requirements.ts`. Also in `delegate-task/constants.ts`. Also referenced in `docs/agents.yml` — except that file wasn't used at runtime, it was just documentation.

To change the model for code reviews, you had to find the right constant file, understand the naming convention, and update the value. If you wanted to see what models were configured, you had to grep across three files.

The drift was inevitable. Three files means three places to update, three opportunities for inconsistency, three things that can diverge.

---

## The Instinct to Schema

The instinct response to configuration chaos is to create a schema.

- Define the config structure formally
- Add validation with Zod or JSON Schema
- Generate documentation from the schema
- Create a migration system for config versions

This is reasonable. Schemas provide safety nets. They catch typos. They document the shape of configuration. They enable tooling.

They're also overhead.

Every schema you create is a system someone has to maintain, understand, and migrate through when it changes. The validation code grows. The migration code grows. The documentation grows. The tool that generates the documentation grows.

The config file stays simple. The system around it doesn't.

---

## What We Chose

We extended the existing config file.

```json
{
  "agents": {
    "do": { "model": "claude-sonnet-4" },
    "research": { "model": "gpt-5-mini" }
  }
}
```

The `agents` key already existed. The schema already knew about it. We added two new properties: `model` and `variant`.

The change was minimal. The understanding was immediate. Users who knew JSON could configure models without learning a new system.

---

## The Extend vs. Create Decision

Before creating a new config schema, ask:

**Is there already a config file?**

If yes, can you extend it? Can you add a key, a section, a property that expresses what you need?

If no, can you create a simple file format — YAML, TOML, JSON — before reaching for a schema system?

---

## What We Gave Up

We gave up the idea of formal schema validation for model configuration.

Not entirely — we still validate that model values are strings, that variants are strings, that required keys are present. But we trusted users to configure correctly rather than building guardrails for every misconfiguration.

This is a tradeoff. Some users will make typos. They'll configure models that don't exist. They'll set variants that aren't supported.

The alternative — a formal schema with exhaustive validation — would have caught those errors. It also would have required maintaining the schema, documenting the schema, and migrating configs when the schema changed.

We chose the simpler path. Typo errors are caught at runtime. Schema complexity is avoided.

---

## The CLI

We added one command: `sync-models`.

It reads the config file, validates the model values against the supported list, and reports discrepancies.

It doesn't enforce. It doesn't block. It informs.

The user who sets `"model": "claude-sonnet-5"` (a model that doesn't exist) gets a warning when they run `sync-models`. They can ignore it. They can fix it. Their choice.

We trusted users. The config is a text file. The tool is helpful, not controlling.

---

## What We Learned

**The simplest config is a key-value store.**

If your config needs to express "the model for the do agent is claude-sonnet-4," the simplest way to express that is `{ "do": { "model": "claude-sonnet-4" } }`.

You don't need a schema file. You don't need validation layers. You don't need code generation.

You need a text file and a convention.

---

**Schema complexity grows faster than config complexity.**

Our old model configuration had three files with partial information. Each file had validation. The validation didn't overlap perfectly, so inconsistencies emerged.

A single file with no formal schema would have been clearer. Less validation. Less documentation. More trust.

---

**Trust users to read error messages.**

The user who sets `"model": "claude-sonnet-5"` will discover their mistake when the system tells them the model doesn't exist. The error message will explain the valid options.

This is better than blocking configuration entirely. It respects that users know what they want. It provides guidance when they need it.

---

## The Pattern

When you need configuration:

1. Use the existing config file if one exists
2. Add a new section, not a new file
3. Keep the format simple (JSON, YAML, TOML)
4. Validate at runtime, not at write time
5. Provide helpful errors, not blocking schemas

The config file is a text file. Treat it simply.
