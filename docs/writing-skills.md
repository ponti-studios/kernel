# Writing skills

This guide is the frontmatter reference for skills in this repository. It
separates the portable Agent Skills format from Kernel's local conventions and
from OpenAI Codex UI metadata. That distinction matters: unknown YAML keys are
usually harmless to a client, but they are not automatically understood by
every agent.

## Quick rule

Every installable skill is a directory containing `SKILL.md`. The file starts
with YAML frontmatter, followed by Markdown instructions:

```yaml
---
name: example-skill
description: Does one repeatable task. Use when the user asks for that task.
license: MIT
compatibility: Requires git and Python 3.12+.
metadata:
  author: example-org
  version: "1.0"
---

# Example Skill

Instructions go here.
```

The directory name must match `name`. Keep `name` and `description` useful for
routing: agents commonly inspect those fields before loading the full body.

## Support legend

| Label | Meaning |
| --- | --- |
| Standard | Defined by the open Agent Skills specification. Supported by clients that implement the standard, including Claude and OpenAI skill consumers. |
| Claude | A Claude/Anthropic convention or documented Claude behavior; other clients may ignore it. |
| Codex | An OpenAI Codex convention. It is not part of portable `SKILL.md` frontmatter. |
| Kernel | A repository convention enforced or consumed by this repository. Generic agents may treat it as descriptive text only. |
| Custom | Valid YAML, but no shared semantics. Put it under `metadata` when portability matters. |

“Supported” means the client recognizes the field or file. It does not mean
that every model will make the same routing or tool-use decision. Always test a
skill in the target client.

## Portable `SKILL.md` frontmatter

These are the fields defined by the current Agent Skills specification.

| Field | Required | Type / constraints | Purpose | Support |
| --- | --- | --- | --- | --- |
| `name` | Yes | String; 1–64 characters; lowercase letters, numbers, and single hyphens; must match the parent directory | Stable skill identifier and invocation name | Standard; Claude; Codex |
| `description` | Yes | Non-empty string; up to 1,024 characters in the standard. Claude.ai currently limits uploaded descriptions to 200 characters. | Says what the skill does and when it should be used. Include concrete task words and user-language triggers. | Standard; Claude; Codex |
| `license` | No | Short license name or bundled license-file reference | States the terms under which the skill is distributed | Standard; clients may display or ignore it |
| `compatibility` | No | String; up to 500 characters | States environment requirements: intended product, operating system, packages, network access, or runtime versions | Standard; Claude; Codex |
| `metadata` | No | Mapping of string keys to string values | Extension point for author, version, category, tags, or other client-neutral metadata. Prefer namespaced keys for public skills. | Standard container; inner keys are consumer-defined |
| `allowed-tools` | No | Space-separated string; experimental | Declares tools that may be pre-approved for the skill, such as `Bash(git:*) Read` | Standard experimental field; support varies by agent |

The standard does not define `when`, `outputs`, `termination`, `kind`, or
`applicability`. Those fields are useful Kernel additions, but they should not
be described as portable metadata.

### Portable-field guidance

- Use `description` for activation signals, not only a marketing sentence.
- Use `compatibility` for requirements, not routing logic.
- Use `metadata` for optional facts that a client can safely ignore.
- Use the standard spelling `allowed-tools` when publishing a cross-client
  skill. Kernel's existing `allowedTools` field is a local convention and is
  documented below.
- Do not put secrets, credentials, or access tokens in any frontmatter field.

## Kernel frontmatter contract

The repository validator requires these six top-level fields on every
installable `SKILL.md`:

| Field | Required here | Type used here | Meaning in Kernel | Agent support |
| --- | --- | --- | --- | --- |
| `name` | Yes | String | Must exactly equal `skills/<name>/` | Standard; Claude; Codex |
| `description` | Yes | String or YAML folded scalar | Routing description | Standard; Claude; Codex |
| `license` | Yes | String | Normally `MIT` for this repository | Standard; Claude; Codex |
| `when` | Yes | YAML list of strings | Explicit activation signals and task shapes | Kernel; generic agents can read it as instructions but do not have required semantics |
| `outputs` | Yes | YAML list of strings | Artifacts, decisions, or reports the skill produces | Kernel; descriptive elsewhere |
| `termination` | Yes | YAML list of strings | Observable definition of done and validation gates | Kernel; descriptive elsewhere |

`metadata.category` and `metadata.tags` are the preferred Kernel discovery
fields. They are optional in the YAML schema but strongly recommended for a
new skill.

### Additional Kernel fields

These fields appear in the current library and are useful to Kernel routing or
authoring. They are not required by the portable specification.

| Field | Purpose | Current use | Agent support |
| --- | --- | --- | --- |
| `applicability` | More precise scope statements after the broader `when` triggers | Specialist engineering and workflow skills | Kernel convention; other agents may read it as prose |
| `kind` | Distinguishes a normal `skill` from a reusable `reference` | Routing/reference entries such as `kernel-voice` | Kernel convention |
| `tags` | Top-level tag list for discovery | Older and consolidated Kernel skills | Custom; prefer `metadata.tags` for new portable skills |
| `dependencies` | Lists another skill or runtime dependency | Used by `kernel-ops-ship` for a skill dependency | Provider-specific/custom; do not assume automatic loading |
| `allowedTools` | YAML list of permitted tool names | Used by Kernel skills such as `kernel-write` and `kernel-ui` | Kernel/Codex project convention; not the same field as standard `allowed-tools` |
| `argumentHint` | Short hint for the argument expected at explicit invocation | Used by interactive Kernel skills | Codex-style UI/routing convention; other agents may ignore it |
| `disableModelInvocation` | Prevents automatic model-triggered invocation | Used for review, audit, shipping, and reference-only skills | Claude-style concept represented with Kernel camelCase; verify target client before relying on it |
| `userInvocable` | Controls whether a skill is exposed for direct user invocation | Used by `kernel-audit-review` | Claude-style concept represented with Kernel camelCase; verify target client before relying on it |

`allowedTools`, `argumentHint`, `disableModelInvocation`, and `userInvocable`
are intentionally camelCase in this repository. Do not silently rename them in
an existing skill: the body, tooling, or future migration may depend on the
current convention. For a new cross-client skill, use the standard field where
one exists and explain any provider-specific behavior in `metadata` or a
provider-specific file.

## `metadata` inventory in this repository

Kernel currently uses these nested keys:

| Key | Meaning | Recommendation |
| --- | --- | --- |
| `metadata.author` | Owning author or organization | Set to the project or organization name |
| `metadata.version` | Skill contract/content version | Quote it, for example `"1.0"` |
| `metadata.category` | Human-facing library category such as `Engineering`, `Workflow`, or `Security` | Use one stable category |
| `metadata.tags` | Search and routing terms | Use lowercase, concrete terms; avoid duplicating every word in `description` |

Nested metadata is arbitrary under the standard. These meanings are a Kernel
agreement, not a promise that Claude, Codex, or another agent will filter on
them.

## OpenAI Codex metadata: `agents/openai.yaml`

`agents/openai.yaml` is separate from `SKILL.md`. It is an OpenAI/Codex
product-specific file for the machine or harness, not instructions for the
model. A skill can be portable without this file. Kernel currently has this
file for only some skills.

```yaml
interface:
  display_name: "Example Skill"
  short_description: "Do one repeatable task well"
  default_prompt: "Use $example-skill to do this task."

dependencies:
  tools:
    - type: "mcp"
      value: "github"
      description: "GitHub MCP server"
      transport: "streamable_http"
      url: "https://example.com/mcp"

policy:
  allow_implicit_invocation: true
```

| Path | Required | Purpose | Support |
| --- | --- | --- | --- |
| `interface.display_name` | No | Human-facing title in skill lists and chips | Codex |
| `interface.short_description` | No | Short UI blurb; keep it scannable (Codex guidance: 25–64 characters) | Codex |
| `interface.icon_small` | No | Relative path to a small icon asset | Codex |
| `interface.icon_large` | No | Relative path to a larger logo asset | Codex |
| `interface.brand_color` | No | Hex color for UI accents | Codex |
| `interface.default_prompt` | No | Example prompt inserted or suggested when invoking the skill. It should explicitly mention `$skill-name`. | Codex |
| `dependencies.tools[]` | No | External tool dependency declaration | Codex; currently supports `type: "mcp"` |
| `dependencies.tools[].type` | No | Dependency category | Codex |
| `dependencies.tools[].value` | No | Tool/server identifier | Codex |
| `dependencies.tools[].description` | No | Human-readable explanation | Codex |
| `dependencies.tools[].transport` | No | MCP connection type | Codex |
| `dependencies.tools[].url` | No | MCP server URL | Codex |
| `policy.allow_implicit_invocation` | No | If `false`, do not inject the skill automatically; explicit `$skill-name` invocation remains available | Codex |

Quote strings in `openai.yaml`, keep keys unquoted, and keep asset paths
relative to the skill directory. Do not copy these keys into `SKILL.md`:
generic Agent Skills clients will not interpret them there.

## Agent compatibility matrix

| Agent/client | Reads `SKILL.md` | Portable fields | Provider-specific notes |
| --- | --- | --- | --- |
| Claude.ai | Yes, when the skill is installed/uploaded | `name`, `description`, and the standard optional fields as applicable | Uploaded descriptions currently have a 200-character limit. Claude documentation also describes `dependencies`; treat it as Claude-specific unless another client documents it. |
| Claude Code | Yes | Agent Skills standard | Claude Code can also have product-specific invocation controls. Do not expect those controls to transfer to Codex. |
| OpenAI Codex | Yes | Agent Skills standard | Reads `agents/openai.yaml` for Codex UI, policy, and dependency metadata. The standard frontmatter remains the portable contract. |
| ChatGPT Skills | Yes | Agent Skills standard | Skill availability and workspace permissions depend on the ChatGPT product/workspace configuration. |
| OpenAI API skill consumers | Yes, where enabled by the integration | Agent Skills standard | The host integration determines discovery, tool access, and execution permissions. |
| Other Agent Skills implementations | Usually | At minimum `name` and `description`; optional fields vary | Unknown top-level fields should be treated as advisory. Test before relying on them. |

The matrix describes format/client support, not model availability. A model can
still fail to select a skill if the description is vague, the skill is not
installed, or the host has disabled automatic invocation.

## Recommended templates

### Portable skill

Use this when the skill should travel between Claude, Codex, and other standard
implementations:

```yaml
---
name: short-kebab-name
description: Performs a specific repeatable task. Use when the user asks for X,
  Y, or Z.
license: MIT
compatibility: Requires the project runtime and access to the repository.
metadata:
  author: ponti-studios
  version: "1.0"
  category: Engineering
  tags: api, validation, typescript
allowed-tools: Read Bash(git:*)
---
```

For strict YAML portability, prefer a block list for `metadata.tags` and quote
values that could be parsed as booleans, numbers, or special YAML values.

### Kernel installable skill

Use this for a new skill in this repository:

```yaml
---
name: kernel-example
description: Performs a specific repeatable task. Use when the user asks for X.
license: MIT
compatibility: State real runtime or project requirements, if any.
metadata:
  author: project
  version: "1.0"
  category: Engineering
  tags:
    - example
    - workflow
when:
  - user asks for X
outputs:
  - Completed X artifact
termination:
  - X is complete and its validation checks pass
---
```

Add `agents/openai.yaml` only when the skill needs Codex-specific display,
invocation, or dependency metadata.

## Validation checklist

Before opening a PR:

1. The first line of `SKILL.md` is `---`, and a closing `---` appears before
   the Markdown body.
2. `name` is lowercase kebab-case and matches the skill directory.
3. `description` says both what the skill does and when to use it.
4. All six Kernel-required fields are present: `name`, `description`, `license`,
   `when`, `outputs`, and `termination`.
5. Standard `allowed-tools` is used for portable declarations; local
   `allowedTools` is used only when the Kernel convention is intentional.
6. References, scripts, and assets are linked with paths relative to the skill
   root and contain no secrets.
7. Run:

   ```bash
   python3 scripts/validate_skills.py
   ```

## Research synthesis: skills and harness engineering

The official writing on skills and agents converges on a stronger model than
“put instructions in a Markdown file”:

> A skill is a packaged capability. A harness is the environment that makes the
> capability observable, executable, recoverable, and verifiable.

### 1. Treat the skill as a progressive-disclosure package

Anthropic describes three levels of loading:

1. `name` and `description` are the discovery index.
2. `SKILL.md` is the activated operating procedure.
3. Linked references, scripts, and assets are just-in-time resources.

This is not merely a file-organization preference. It is a context-budget
strategy. Put routing-critical information in frontmatter, the shortest
reliable workflow in `SKILL.md`, and specialized detail in focused references.
Do not make every invocation pay for every edge case.

For Kernel, that means:

- Keep `description` specific enough to trigger correctly, but short enough to
  remain useful in the discovery index.
- Keep `when`, `outputs`, and `termination` close to the top of the entrypoint.
- Link one level deep to the reference needed for the current mode.
- Prefer a deterministic script for repeated transformations, checks, or data
  extraction instead of asking the model to reproduce the procedure from prose.
- Do not load a whole reference library “just in case.” Name the condition that
  requires each reference.

### 2. Write for the harness, not just the model

OpenAI’s harness-engineering work frames the engineer’s job as making missing
capabilities both legible and enforceable. In practice, an agent cannot use
knowledge that is absent from the repository or inaccessible through its tools.
This changes what belongs in a skill:

| Weak skill surface | Harness-ready skill surface |
| --- | --- |
| “Follow our conventions” | A linked convention document with examples and a validator |
| “Run the tests” | A named command, expected signal, and failure interpretation |
| “Make the UI work” | A bootable environment, inspectable UI state, and a visual or DOM check |
| “Continue where you left off” | A progress file, feature list, clean commit boundary, and next-step record |
| “Review carefully” | Explicit review dimensions, severity rules, evidence format, and a pass/fail gate |
| “Use the API” | A scoped tool or script with clear inputs, outputs, errors, and side-effect boundaries |

The useful question after a failure is not “how do we make the prompt stronger?”
It is: “What capability, context, tool, or verification surface was missing,
and how do we add it so the next agent can see and prove it?”

### 3. Prefer invariants over implementation micromanagement

OpenAI’s harness engineering article emphasizes strict boundaries and
enforceable invariants while leaving implementation choices open. A good skill
should specify:

- what must be true at the boundary;
- which dependencies or actions are forbidden;
- what artifact or state must exist at the end; and
- how the result is checked.

It should avoid prescribing a particular internal technique unless that choice
is itself part of the contract. This gives agents room to search the codebase,
choose a compatible implementation, and still remain inside the architecture.

In frontmatter, `termination` should therefore contain observable checks, not
aspirational adjectives. “High-quality API” is weak. “Validation rejects
malformed input, auth failures are covered, and the route delegates to the
service layer” is testable.

### 4. Design the workflow before designing the agent

Anthropic distinguishes workflows—predictable, predefined paths—from agents,
which dynamically choose steps and tools. Start with the simplest workflow that
solves the task. Add autonomy only where the task genuinely benefits from
dynamic decisions, recovery, or exploration.

For a skill author, this means:

1. Define the input, output, invariants, and acceptance checks.
2. Write the smallest deterministic sequence that works.
3. Identify the step where the agent must inspect evidence or choose among
   alternatives.
4. Give autonomy only at that point, with bounded tools and a clear stop rule.
5. Add complexity only after an eval demonstrates a real failure that the
   simpler design cannot address.

Avoid turning every skill into a multi-agent system. Anthropic’s later harness
experiments show that planner/generator/evaluator structures can help with
long-running or subjective work, but every harness component encodes an
assumption about model limitations and should be removed when it is no longer
load-bearing.

### 5. Make tool and script boundaries agent-ergonomic

Anthropic’s tool research treats a tool as a contract between deterministic
software and a non-deterministic agent. The same principle applies to scripts
bundled in a skill.

- Choose a few high-impact operations instead of mirroring every low-level API.
- Give related operations clear namespaces and non-overlapping purposes.
- Use descriptive parameter names such as `user_id`, not ambiguous names such
  as `user`.
- Return high-signal, bounded output with the surrounding context needed for a
  decision.
- Make errors actionable: say what failed, why it matters, and what can be
  tried next.
- Make side effects explicit and keep read-only inspection separate from
  mutation where possible.
- Test the tool with realistic agent tasks, not only schema validation.

For `allowed-tools`, `allowedTools`, and `agents/openai.yaml` dependencies,
remember that a declaration is not a capability grant by itself. The host
harness still decides which tools exist, what permissions they have, and
whether the skill can invoke them.

### 6. Build for long-running work with durable handoffs

Anthropic’s long-running-agent work identifies a recurring failure mode: an
agent attempts too much in one context window, leaves half-finished work, and
forces the next session to reconstruct state. Their initializer/coding pattern
and later multi-agent harness work suggest a durable handoff contract:

- an initializer establishes the environment and the way to run it;
- the active agent works on one tractable slice at a time;
- progress is recorded outside the context window;
- the next session starts by reading progress and checking the current state;
- completion is earned by verification, not by a model assertion;
- the environment is left clean enough for another agent to continue.

Kernel skills that can span sessions should name the handoff artifact in their
body or `outputs`, for example `plans/<task>.md`, `progress.md`, a feature list,
an incident index, or a committed test result. A handoff should record:

```text
Current state: what is implemented and verified
Evidence: commands, files, tests, screenshots, or traces
Known gaps: what is still failing or unknown
Next action: the smallest useful next step
Stop condition: what proves the task is complete
```

### 7. Evaluate the whole agent system

An agent eval is not just “did the response sound right?” Anthropic defines an
eval in terms of a task, trial, grader, transcript, outcome, and evaluation
harness. The outcome is the resulting environment state: a database row, test
suite, rendered file, or deployed artifact—not the agent’s claim that it did
the work.

For each important skill, create a small evaluation set with:

- representative user requests, including ambiguous and adversarial cases;
- a clean fixture or isolated worktree;
- multiple trials, because agent behavior varies between runs;
- deterministic graders wherever possible (tests, schemas, file checks,
  parsers, link checks, or snapshots);
- a human or model grader only for the residual subjective dimensions;
- transcript/tool-call inspection when the path matters, not just the final
  answer; and
- a regression case for every previously fixed failure.

OpenAI’s self-improvement work adds an important operational rule: production
corrections should become bounded, reviewed eval cases before they become
automated tasks. A user correction may represent a real bug, expected variation,
unsupported behavior, or a product decision. Do not convert raw feedback into
prompt changes without first classifying it.

### 8. Use a failure-to-capability loop

When a skill fails, classify the failure before editing it:

| Failure signal | Likely missing capability | Best repair |
| --- | --- | --- |
| Skill is not selected | Weak discovery metadata | Rewrite `description` with task verbs, triggers, and exclusions |
| Skill is selected but takes the wrong path | Ambiguous workflow or overlapping skills | Add routing boundaries, modes, examples, or a decision table |
| Agent cannot find required knowledge | Poor repository legibility | Add a focused reference, link it from the exact step, or expose the source locally |
| Agent uses the wrong tool | Tool overlap or weak tool descriptions | Rename/namespace tools, narrow their purpose, improve parameter docs, add evals |
| Agent stops with half-finished work | No durable state or oversized task | Decompose work, add progress artifacts, and require clean handoff |
| Agent claims success incorrectly | Weak termination contract | Add executable acceptance checks and grade environment state |
| Fix works once but regresses | No regression eval | Preserve the failure as a repeatable fixture and run it continuously |
| Harness becomes bloated | Stale assumption about model limits | Remove one component at a time and measure whether performance changes |

This loop is the practical connection between writing skills and harness
engineering: every failure should produce either a clearer contract, a more
legible artifact, a better capability, or a new regression test.

## Research-backed authoring checklist

Before calling a skill production-ready, answer these questions:

- Can an agent decide whether to load it from `name` and `description` alone?
- Is the first loaded body short enough to orient the agent without burying the
  task in reference material?
- Does each reference have a named loading condition?
- Are the task’s important facts available in the repository or through a
  permitted tool?
- Are the boundaries and invariants enforceable by tests, scripts, schemas, or
  inspection commands?
- Does every mutation have an explicit permission and verification path?
- Can another session resume from a durable artifact without guessing?
- Is success graded from the resulting artifact or environment state?
- Is there at least one regression case for each known failure mode?
- Have you re-tested the skill after model or harness changes? Harnesses encode
  assumptions that go stale as models improve.

## References

- [Agent Skills specification](https://github.com/agentskills/agentskills/blob/main/docs/specification.mdx)
- [Claude: creating custom skills](https://claude.com/docs/skills/how-to)
- [OpenAI: Skills in ChatGPT](https://help.openai.com/en/articles/20001066)
- [Codex `agents/openai.yaml` field reference](https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/skill-creator/references/openai_yaml.md)
- [Anthropic: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [Anthropic: Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic: Writing effective tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- [Anthropic: Harness design for long-running application development](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- [Anthropic: Demystifying evals for AI agents](https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents)
- [OpenAI: Harness engineering](https://openai.com/index/harness-engineering/)
- [OpenAI: Unrolling the Codex agent loop](https://openai.com/index/unrolling-the-codex-agent-loop/)
- [OpenAI: The next evolution of the Agents SDK](https://openai.com/index/the-next-evolution-of-the-agents-sdk/)
- [OpenAI: Building self-improving tax agents with Codex](https://openai.com/index/building-self-improving-tax-agents-with-codex/)
- [Kernel skill library contract](SKILL-LIBRARY.md)
