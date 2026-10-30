---
name: hermes-agent-skill-authoring
description: "Author in-repo SKILL.md files: frontmatter and structure."
version: 2.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [skills, authoring, hermes-agent, conventions, skill-md]
    related_skills: [requesting-code-review]
---

# Authoring Hermes-Agent Skills (in-repo)

## Overview

There are two places a SKILL.md can live:

1. **User-local, repo-backed:** authored skills belong in a git repo — on this machine `~/Developer/kernel`
   (remote `ponti-studios/kernel`) under `skills/<name>/`, the same library described in 3. Any older
   `~/Developer/skills` checkout is obsolete; do not write there. `~/.agents/skills/<name>` is the install
   store every agent reads, and `~/.hermes/skills/<name>` holds the loader symlink the installer creates.
   Whether an entry there is a symlink to its source (an edit is live) or a copy (an edit is invisible until
   reinstall) depends on how it was installed — `ls -l` the entry before you assume an edit landed. A skill
   whose source of truth is another project repo stays a symlink there and is `.gitignore`d — the validator
   reports it as *external* and skips it, because CI has no checkout of the other project. When the user
   names a skills directory, use that one. Layout, validator design and cross-framework portability:
   `references/skill-library-repo.md`.
2. **In-repo (this skill is about this case):** `skills/<category>/<name>/SKILL.md` or `optional-skills/<category>/<name>/SKILL.md` inside the hermes-agent repo — committed, shipped with the package. Use `write_file` + `git add`. `skill_manage(action='create')` does NOT target this tree.
3. **Kernel library:** `~/Developer/kernel` (remote `ponti-studios/kernel`), under `skills/<name>/`, catalogued in `skills.sh.json`. Validated by `python3 scripts/validate_skills.py` (catalog parity, links, name/directory agreement), `muse skills validate <path>` (format), and `python3 -m unittest discover -s tests`. Install and update with `npx skills`: `npx skills add ponti-studios/kernel --skill <name> -g --yes` writes `~/.agents/skills/<name>` and creates the `~/.hermes/skills/<name>` symlink itself, `npx skills update -g --yes` refreshes, and `npx skills list -g` prints each entry's `Source:`. `muse skills validate` owns *format only* — `muse skills install` copies to `~/.config/muse/skills/<name>` and wires no loader, so it is not the installer. Read the repo's own README/AGENTS install section before choosing an installer. Mechanics and the wiring: `references/skill-library-repo.md`.

In-repo skills must meet the repo's **hardline authoring standards** (see AGENTS.md, "Skill authoring standards (HARDLINE)" — that section is the source of truth; this skill is the operational walkthrough). Reviewers reject PRs that violate them, so meeting them up front is cheaper than a salvage pass later.

## When to Use

- User asks you to add a skill "in this branch / repo / commit"
- You're committing a reusable workflow that should ship with hermes-agent
- You're editing an existing skill under `skills/` or `optional-skills/` (use `patch` for small edits, `write_file` for rewrites; `skill_manage` still works for patch on in-repo skills, but not for `create`)
- Don't use for: personal skills — on this machine those live in `~/.agents/skills/` with a symlink into `~/.hermes/skills/` (see Overview), where `skill_manage` cannot edit them in place

## Decide the Tier First: Bundled vs Optional

- **Bundled (`skills/<category>/`)** — daily-driver behavior, broadly useful across many user types, low footprint. Hard bar: you can say "a user will load this in 5+ sessions per month" with a straight face.
- **Optional (`optional-skills/<category>/`)** — niche, vertical-specific (blockchain, gaming, finance, one app), recurring-job/task skills, or anything heavy. Installed via `hermes skills install official/<category>/<skill>`.

**When in doubt, optional.** Promoting later is easy; demoting is churn. "Would be useful to anyone who ever needs this" is an optional-tier argument, not a bundled one.

Pick the category by what the tool IS, not what it feels like (an AI-agent CLI goes in `autonomous-ai-agents/` even if it "feels productivity"). Confirm existing categories with `search_files(pattern='*', target='files', path='skills')` and don't invent new top-level categories casually.

**No router / index / hub skills.** A skill whose core content is a routing table pointing at sibling skills adds an indirection hop and duplicates the siblings' own `When to Use` triggers. If the skill would be empty without "load skill X instead" pointers, don't write it — the catalog and each sibling's triggers already do that job.

**Split by output shape, not by pipeline stage.** A skill that emits nine artifacts is several skills when each output has its own shape, validation and consumer: an agent loading it pays for eight prompts it will not use, and the trigger ("write a LinkedIn post from this script") is buried behind a `--stage` flag. Group stages that share a shape — long-form and short-form video are both spoken prose — and keep production artifacts whose fields are a contract with another program (shot lists, manifests, render specs) in their own skill, because those are read by a renderer rather than by a person. When splitting, slice prompts and schemas out of the original by export name and assert byte equality per constant before deleting the source; retyping a prompt is a silent product change nobody catches in a diff.

## Required Frontmatter

Validator source of truth: `tools/skill_manager_tool.py::_validate_frontmatter`. Validator hard requirements:

- Starts with `---` as the first bytes (no leading blank line).
- Closes with `\n---\n` before the body.
- Parses as a YAML mapping.
- `name` field present.
- `description` field present (validator ceiling 1024 chars — but see the repo hardline below, which is much stricter).
- Non-empty body after the closing `---`.

Repo-standard shape (all fields expected, even where the validator doesn't enforce them):

```yaml
---
name: my-skill-name               # lowercase, hyphens, ≤64 chars (MAX_NAME_LENGTH)
description: Concise capability statement, under sixty chars.
version: 0.1.0                    # semver; new skills start at 0.1.0
author: Real Name (github-handle), Hermes Agent
license: MIT
platforms: [linux, macos, windows]   # audit, don't guess — see Platform Gating
metadata:
  hermes:
    tags: [Short, Descriptive, Tags]
    related_skills: [other-in-repo-skill]
---
```

### `description` rules (HARDLINE — the validator's 1024 is NOT the standard)

- **≤ 60 characters.** One sentence. Ends with a period.
- State the capability, not the implementation, and don't repeat the skill name.
- No marketing words ("powerful", "comprehensive", "seamless", "advanced").
- The system prompt skill index truncates at 57 chars + "..." — the trigger/capability must be self-contained in that window.
- If the description contains a `:`, wrap it in double quotes or YAML parses it as a mapping and the docs generator crashes. Quotes don't count toward the 60.

Good: `Track named companies for material news with cited digests.`
Bad: `Use when a user asks to monitor named competitors or companies for product launches, pricing changes, funding, ...` (240 chars — rejected in review)

### `author` rules

- Credit the **human first**, then "Hermes Agent" as secondary collaborator: `Ben Barclay (benbarclay), Hermes Agent`.
- Never `author: Hermes Agent` alone for contributed skills — credit the human, not the tool, even (especially) when an agent drafted the text.
- Maintainer-authored skills: `Teknium (teknium1), Hermes Agent`.

### `related_skills` rules

- Every entry must resolve to an existing **in-repo** skill in the same tree state as your PR. Do not reference skills that were only planned, live in another PR, or exist only in `~/.hermes/skills/`.
- Verify each entry: `search_files(pattern='<name>', target='files', path='skills')` (and `optional-skills/`).

## Platform Gating: audit, don't trust

`platforms:` gates loading by host OS. Set it from what the skill's prose and scripts actually invoke:

| Skill uses only… | `platforms:` |
|---|---|
| Hermes tools + stdlib Python + cross-platform CLIs | `[linux, macos, windows]` |
| bash pipelines, `grep`/`awk`/`sed` chains, heredocs | `[linux, macos]` |
| `osascript`, `defaults`, `pmset` | `[macos]` |
| `apt`/`systemctl`/`/proc` | `[linux]` |

<!-- no-tmp: ok — names the anti-pattern skill authors must avoid -->
POSIX-only signals to search for in `scripts/`: `fcntl`, `termios`, `pty`, `os.fork`, `os.killpg`, `signal.SIGKILL`, `os.kill(pid, 0)` liveness checks, hardcoded `/tmp` `/proc` `/etc`. Default posture: fix cross-platform first (`tempfile.gettempdir()`, `pathlib.Path`, `psutil.pid_exists`); gate narrower only when the dependency is genuinely platform-bound, and say why in `## Pitfalls`.

## Size Limits

- Full SKILL.md: ≤ 100,000 chars enforced (`MAX_SKILL_CONTENT_CHARS`), but target **~100 lines for a simple skill, ~200 for a complex one**. Peer skills sit at 8-14k chars.
- Bulky or branch-specific material goes in `references/*.md`, `templates/`, or `scripts/` — pointed to from SKILL.md, not inlined.
- Don't expect the model to inline-write parsers or non-trivial logic every call — ship a helper script in `scripts/` and reference it by path.

## Body Structure (modern section order)

```
# <Skill> Skill
2-3 sentence intro: what it does, what it doesn't do, dependency stance.

## When to Use          — bulleted triggers (+ "Don't use for:" counter-triggers)
## Prerequisites        — exact env vars, installs, API key sourcing
## How to Run           — canonical invocation through the `terminal` tool
## Quick Reference      — flat command list, no narration
## Procedure            — numbered steps, each with a checkable completion criterion
## Pitfalls             — known limits, things that look broken but aren't
## Verification         — how to prove the skill worked
```

Not every section applies to every skill (a pure-procedure task skill may have no Quick Reference), but When to Use + actionable body + Pitfalls + Verification are the minimum. Cut marketing intros, "Setup Check" no-ops, and re-explanations of env vars already in Prerequisites.

### Reference Hermes tools, not raw shell

When the skill needs a capability, name the proper Hermes tool in backticks: `terminal`, `read_file`, `write_file`, `patch`, `search_files`, `web_search`, `web_extract`, `browser_navigate`, `vision_analyze`, `delegate_task`, `cronjob`. Do NOT name shell utilities the agent already has wrapped (`grep` → `search_files`, `cat` → `read_file`, `sed`/`awk` → `patch`, `find`/`ls` → `search_files target='files'`). A CLI-wrapper skill should frame invocations as `terminal(command="{tool} ...", timeout=...)` — bare shell prose ("run `foo --version`") is a review-blocking non-conformance. If the skill depends on an MCP server, name it and document setup in Prerequisites.

### Never use machine-local paths

Write repo-relative paths (`skills/...`, `tools/skill_manager_tool.py`). A `/home/<you>/...` path baked into a committed skill breaks for every other user and is an instant review flag.

### Scripts, wrappers, and what `linked_files` actually indexes

`tools/skills_tool.py::_LINKED_FILE_SPECS` decides which support files show up in `skill_view`'s `linked_files`. It is a fixed set of globs, so a helper that doesn't match is invisible to future sessions even though it runs fine when invoked by path:

| Directory | Globs indexed | Recursive |
|---|---|---|
| `references/` | `*.md` | no |
| `templates/` | `*.md *.py *.yaml *.yml *.json *.tex *.sh` | yes |
| `assets/` | `*` (files only) | yes |
| `scripts/` | `*.py *.sh *.bash *.js *.ts *.rb` | no |

`.mjs`, `.cjs`, `.tsx`, `.zsh` and `.jsx` are **not** indexed. ESM (`.mjs`, top-level `await`, `import`) is the natural choice for a Node helper, so ship the implementation and wrap it:

```
scripts/
  my-command.sh        # indexed — the public entry point, named in SKILL.md
  lib/my-command.mjs   # the implementation, private
```

```bash
#!/usr/bin/env bash
set -euo pipefail
exec node "$(dirname "${BASH_SOURCE[0]}")/lib/my-command.mjs" "$@"
```

Document the wrapper as the command, not the `.mjs`, so the next session finds the capability in the index and runs the right thing. Wrap standalone commands (a CLI); don't wrap a module that other scripts import.

Templates follow the same table: a config template named `vitest.config.ts`, any `*.toml` or `*.jsonc` is invisible in `linked_files` even though SKILL.md can link to it by path. Give a template an indexed extension (`.yml`, `.json`, `.sh`) when a future session must discover it; otherwise accept that only the path in SKILL.md leads there, and say so.

**Bundling scripts that live elsewhere.** Symlinking (`ln -sfn`) an external script into the skill dir keeps one canonical file, and it is indexed and runnable through the skill path — but the skill stops being portable if copied to another machine. Real copies are portable but drift. Choose deliberately, and record the choice in SKILL.md so the tradeoff is visible.

**Pointing a skill at external code.** When a skill wraps another project's source that may later be ported into the skill, put the location in exactly one `lib/resolve.mjs`: env-var override first, then a default path, raising a message that names both when neither resolves. Every script imports from it, and no other file in the skill names a repo path — the port then becomes a one-line change instead of a rewrite.

**Output directories are configuration too.** The same rule governs everywhere a skill *writes*, not just the code it reads: a render inbox, a per-call usage log dir, a drafts dir, a publishing root are personal-data locations. Each gets its own env var with the old path as its default, resolved through the same `resolve.mjs`, and none of them is spelled as a literal `~/…` inside a script. A skill that hardcodes six of these runs on exactly one machine, and the failure is invisible because the defaults happen to exist there. Then list them in the skill's own `SKILL.md` as a `## Configuration` table (`| Variable | Default | Used for |`) — a future session needs to know what it can override without reading the source.

Secrets follow the same order as paths: **environment first, then one user-level config file, and nothing else** — no repo `.env`, no `~/.localrc`, no per-tool search path. Every extra location is a question the next debugger has to answer, and the answer changes per machine.

**One parser, imported not copied.** Put the parse rule in the project's own config package and have each skill `await import()` it from the build (`packages/config/dist/index.js`), the same way it imports the rest of the codebase. A copied parser starts identical and diverges on the first fix, and the copies live in skills — the last place anyone looks. Two consequences: an unbuilt package must fail loudly and name the build command, and the config module's own path cannot come from the file it parses, so resolve that one entry from an env var plus a single default and read everything else from the file.

Keep the file flat (`key: value`, `#` comments, optional quotes, `~` expanded), map each key to its env var, and ignore unknown keys so a newer file cannot break an older tool. Precedence is **flag → environment variable → file → built-in default**, and the skill's `## Configuration` section carries the key/env/default table.

**Prove precedence, don't assume it.** Run the same dry run three ways — file only, env var overriding the file, and no config at all — and confirm the resolved output moves each time. A single run with defaults proves nothing about portability: the defaults are exactly what hides a broken lookup on the machine you are testing on.

**Port behaviour-identical first, then change.** When you do move that code into the skill, port it so it reproduces the original's output exactly and prove that against the original's own golden artifacts — same inputs, byte-identical results, checked against both the recorded expected files and a live run of the upstream build. Only then layer your change on top: with parity established, every later difference is a deliberate decision rather than a translation bug, and you can say which of the two a diff is. Keep the harness testing both directions from then on — parity in the original mode (the port must still equal upstream) and the new mode's invariants (deterministic output, and whatever pattern the rewrite exists to remove actually absent). When the change is *meant* to alter output, re-record the golden files deliberately and say so; never edit an expected file to make a check pass. Two guards here caught real bugs during a port that a parity check alone would have missed: an invariant assertion on the new mode's output, and a refusal to let the new mode silently fall back to the old code path.

**Ship a free preflight.** Any skill that spends money, writes into a user's data, or depends on config that can be stale gets a `scripts/check-*.sh` that resolves every dependency, prints what it actually resolved (which binary, which config path, which model, which voice), spends nothing, and exits non-zero only on a real failure. Warn — don't fail — on optional gaps, or the check cries wolf and gets ignored. "Which ffmpeg / which vault did this run actually use" is the question a later session cannot answer from the code.

**Make the paid step dry-run by default**, requiring an explicit go-ahead flag (`--yes`) to spend: print per-item and total cost from the provider's own published rate (not an estimate you derived), and offer a single-item path (`--only <id>`) so iterating on one prompt costs one item rather than a batch. An expensive stage behind a default-on script is a user-facing hazard, not a convenience.

**Prove the join, not the stages.** In a chain — script → shot list → narration → clips → cut — every stage can pass its own check while the handoff between two of them is broken: one stage writes a file per item, the next demands a single file, and nothing reconciles them. Run the chain once end to end on the smallest real set that still exercises the join (two items, not twenty), keep the per-item outputs so one item can be re-recorded, and reconcile both sides explicitly — measured footage against measured narration, rows against declared counts. Then price the run: providers often bill a minimum unit, so a four-second request can be charged as five seconds and short items silently carry a penalty. A chain you have only exercised stage-by-stage is a hypothesis, not a pipeline.

## Writing Quality Principles

A skill exists to make the agent's process more predictable — the agent reliably follows the same useful discipline.

1. **Optimize for process predictability.** If a line does not change behavior, cut it.
2. **Choose the right context load.** The description is paid for every turn; details go in the body or linked references.
3. **End steps with completion criteria.** Checkable and, when it matters, exhaustive: "every modified file accounted for" beats "summarize changes."
4. **Co-locate rules with the concept they govern.**
5. **Use strong leading words** ("tight loop," "root cause," "regression test") over long repeated explanations.
6. **Prune duplication and no-ops.** "Be careful" and "use best practices" don't change model behavior — replace with a checkable criterion or delete.

## Tests and Docs (required for repo skills)

1. **Tests** live at `tests/skills/test_<skill>_skill.py` — stdlib + pytest + `unittest.mock` only, no live network. Run via `scripts/run_tests.sh tests/skills/test_<skill>_skill.py -q`. (The generic `tests/tools/test_skill_manager_tool.py` passing proves nothing about YOUR skill.)
2. **Docs regen:** run `python website/scripts/generate-skill-docs.py`, then apply scope discipline — the generator rewrites EVERY auto-gen page. `git checkout --` everything that isn't yours; the final diff must show only your SKILL.md, your one per-skill docs page, a one-line catalog row, and a one-line `website/sidebars.ts` insertion (verify with `search_files(pattern='<your-slug>', path='website/sidebars.ts')` — exactly one hit, or the page is an orphan).
3. **`.env.example`** (only if the skill needs new env vars): one clearly delimited commented block; touch nothing else in the file.

## Workflow

1. **Survey peers** in the target category with `search_files(target='files')` and read 2-3 peer SKILL.md files to match tone and structure. Prefer extending an existing skill over creating a narrow sibling.
2. **Decide tier and category** (see above). When in doubt, optional — and ask before pushing rather than defaulting.
3. **Draft** with `write_file` to `skills/<category>/<name>/SKILL.md` (or `optional-skills/...`).
4. **Validate locally**:
   ```python
   import re, pathlib
   from ruamel.yaml import YAML
   content = pathlib.Path("skills/<category>/<name>/SKILL.md").read_text()
   assert content.startswith("---")
   m = re.search(r'\n---\s*\n', content[3:])
   fm = YAML(typ="safe").load(content[3:m.start()+3])
   assert "name" in fm and "description" in fm
   assert len(fm["description"]) <= 60, f"description {len(fm['description'])} chars — hardline is 60"
   assert fm["description"].endswith(".")
   assert "platforms" in fm
   assert len(content) <= 100_000
   ```
   Also verify every `related_skills` entry exists in-repo.
5. **Add tests + regen docs** (previous section).
6. **Git add + commit** on the active branch; open a PR.
7. **Note:** the CURRENT session's skill loader is cached — `skill_view` / `skills_list` will not see the new skill until a new session. This is expected, not a bug.

## Editing Existing In-Repo Skills

- **Small fix:** `skill_manage(action='patch', ...)` works on in-repo skills, as does `patch`.
- **Major rewrite:** `write_file` the whole SKILL.md.
- **Supporting files:** `write_file` to `references/`, `templates/`, or `scripts/` under the skill dir.
- **Always commit** — in-repo skills are source, not runtime state. Re-run the docs generator when frontmatter changed.

## Common Pitfalls

1. **Using `skill_manage(action='create')` for an in-repo skill.** It writes to `~/.hermes/skills/`, not the repo tree. Use `write_file`. The reverse direction bites too: a user-local skill written as a real directory under `~/.hermes/skills/` lands outside the `~/.agents/skills/` store the user maintains, so their other agents never see it. And once a skill lives in `~/.agents/skills/` (symlinked into the profile), `skill_manage` cannot edit it — both `patch` and `write_file` fail with "not found in active profile" while `skills_list` and `skill_view` still show it, because the write target resolves outside the managed tree. Edit those with `write_file` / `patch` against the real path under `~/.agents/skills/<name>/`, then re-load with `skill_view` to confirm.
2. **Trusting the validator's limits as the standard.** The validator allows 1024-char descriptions; review rejects anything over 60. The validator doesn't check `platforms:`, author format, tests, or docs — review does.
3. **`author: Hermes Agent` on a contributed skill.** Credit the human first.
4. **Leading whitespace before `---`.** Validation fails on any leading blank line or BOM.
5. **Description too generic or trigger buried past char 57.**
6. **`related_skills` pointing at skills that don't exist in-repo** (user-local, planned, or in a sibling PR).
7. **Duplicating a peer.** Survey the category first; extend rather than sibling.
8. **Skipping the docs generator or pushing its unrelated drift.** Both directions are wrong: no regen = orphan skill with no docs page; blind regen = a ballooned diff full of other skills' drift.
9. **Assuming a mid-session write is invisible, or that a visible skill is editable.** A skill you place by hand (`write_file` + symlink) is visible to `skill_view` and `skills_list` immediately — mid-session, no reload needed. `skill_manage` is the narrower one: it resolves only skills inside the managed tree (see pitfall 1). Confirm which case you are in with `skill_view(name)` before assuming either way.
10. **Letting skills accumulate sediment.** When adding a rule, remove the old wording it replaces.
11. **Naming an unindexed script as the entry point.** A `scripts/*.mjs` command runs fine but never appears in `linked_files`, so the next session doesn't know it exists. Expose an indexed extension — a `.sh` wrapper over `lib/*.mjs` (see Scripts, wrappers, and what `linked_files` actually indexes) — and document that wrapper as the command.

12. **Baking transient environment state into a skill body.** "The vault path is wrong and the directory does not exist", "the bundled build is 9.0.1 not 9.0.2", "binary X is missing" are true today and false the moment the user fixes them — then the skill teaches a stale fact and a future session reports a problem that no longer exists. Write the durable rule and its mechanism instead ("this setting is the one most likely to be stale, and it fails quietly"), and let the preflight script report the current state. Chasing one skill through this rewrite later costs more than writing it right the first time.
13. **Editing a user-local skill with `skill_manage`.** Skills under `~/.agents/skills/` (symlinked into `~/.hermes/skills/`) resolve outside the managed tree: `skill_manage` `patch`/`write_file` fail with "not found in active profile" while `skill_view` and `skills_list` still return them. In a review pass restricted to skill tools there is no fallback — fix those with `write_file`/`patch` against the real path when a general tool is available, and say so plainly rather than silently skipping the update.
14. **Committing a skill that is a symlink into another checkout.** In a repo-backed library, a project-owned skill sits in `skills/` as a symlink. Committed as-is it is an absolute link, so a fresh clone stats a path that does not exist and the validator dies with `ENOENT` before reporting anything — the CI failure names a missing directory, not the real cause. `.gitignore` the path, keep the local symlink, and have the validator skip any entry whose realpath lands outside the library root, listing it as external.
15. **A validator that cannot fail is worse than none.** Check the checks: plant a deliberately broken skill (no frontmatter, a link to a missing `references/` file) and confirm it reports both and exits non-zero, then delete it. Order matters too — a `continue` after the first failing category silently skips every later check on that skill, so run link and secret sweeps before the frontmatter gate.
16. **Expanding `~` only at the start of a value.** `file:~/data/x`, `sqlite:~/db` and similar keep their tilde, parse without complaint, and fail later at open time with a path that never existed. Expand after a scheme prefix as well (`(^|:)~(?=/|$)`) and pin it with a test that asserts the prefix is gone.
17. **Resolving a credential at module scope.** `const client = new Client(apiKey())` runs the lookup before argument parsing finishes, so `--dry-run` demands a secret it never uses. Resolve on first real call (a getter) — a dry run that needs a key is a portability bug wearing a security costume.
18. **Trusting one green route as proof of a boot.** When you verify a multi-surface program, hit at least two that read different stores; a page served from cache or a separate index returning 200 says nothing about the one that opens the database.
19. **Selecting a generated input by glob order.** After a run writes `thing-<timestamp>.json`, a glob like `thing-*.json` also matches the `thing-test.json` you wrote for a cheap trial — and `-test` sorts last, so the "latest" file is your own stub and every measurement describes the wrong set. Take the newest by mtime, or pass the exact path the run just printed.
20. **Assuming every skill library is symlinked.** A library that installs by copying (`npx skills add` → `~/.agents/skills/<name>`; `muse skills install` → `~/.config/muse/skills/<name>`, with no loader wiring) leaves the installed copy stale from the first repo edit onward, and it keeps loading, so nothing looks broken. After editing an installed skill, re-install or symlink the source and confirm with `skill_view`. Such a library usually also has a catalog manifest: a new skill directory with no manifest entry fails validation, so add both in one commit.
21. **Reading a per-agent install warning as a failed install.** `npx skills add` fans out to every agent it detects and prints one line per agent; an agent that refuses global installation ("PromptScript does not support global skill installation") is a limitation of that agent, not of the install. Verify the outcome in three places instead of retrying: `ls -ld ~/.agents/skills/<name>` (the store), `ls -l ~/.hermes/skills/<name>` (the loader symlink the installer creates for you — hand-making it duplicates the installer's work and diverges on the next update), and `npx skills list -g`, whose `Source:` column proves which repo the copy came from. Then `diff -rq <repo>/skills/<name> ~/.agents/skills/<name>` to prove the copy is the source, and `skill_view(name, file_path='references/…')` to prove linked files resolve.
22. **Letting one skill exist twice, so neither copy loads.** A real directory at
    `~/.hermes/skills/<category>/<name>/` plus an installed entry at `~/.agents/skills/<name>` (which the
    loader also reaches as `~/.hermes/skills/<name>`) collide: both resolve to the same name and path, so
    `skill_view` refuses the pair and the runtime lists the skill while declaring it unloadable. Nothing
    fails loudly — the symptom is a skill that is present in the index and cannot be read. Find the
    collisions by intersecting the two name sets before adding a skill, and keep the installed copy: delete
    the loose directory.    The same sweep catches the two other silent library faults — an entry whose `npx
    skills list -g` `Source:` is `local`, or a path that no longer exists, can never be updated (`npx skills
    update -g` skips it without a word), and a category directory outside any repo is the only copy of that
    skill that exists anywhere. `local` is not a location: it means the installer holds **no record at all**.
    `~/.agents/.skill-lock.json` is the only provenance store, so diff its keys against the installed
    directories — `~/.agents/skills` minus the lock keys is exactly the set `update` will skip forever, and
    every name in it has to be traced back to a repo by hand. On this machine that set reached 26 of 72
    installed skills with nothing visibly wrong: they load, `skill_view` returns them, and only the lock
    count reveals they are frozen. Re-adding each from its library
    (`npx skills add <repo> --skill <a> --skill <b> -g --yes` takes several in one call) restores both the
    record and the update path.

    Deleting the loose copy is the *last* step, not the first, and only after a diff: the loose one is often
    the richer of the two — a hand-maintained directory grows sections and `references/` long after the repo
    copy was normalised — so blind deletion throws away content the repo never had. Merge rather than choose:
    take the fuller body, keep the repo's frontmatter shape, bump the version, copy any `references/`, run the
    library validator, commit and push, re-install with `npx skills add`, then delete the loose directory and
    prove the result with `diff -rq` (repo vs `~/.agents/skills/<name>`) plus a zero on the collision sweep.

    The store drifts **forward** as well, so run that diff in both directions before reinstalling: an agent
    editing `~/.agents/skills/<name>` instead of the source leaves the repo missing sections the install has
    (`git push --force` blocked by an approval hook, with `git push origin +branch` as the way through; a new
    rule added to a `references/` file). A blind reinstall deletes those silently, because the store is
    overwritten from the source. Fold installed-only content back into the repo first, commit, then reinstall,
    then expect zero mismatches.

23. **Hand-deleting half of an installed skill.** `npx skills remove -g -s <name> -y` removes the store entry
    *and* every agent link the installer wired; deleting `~/.agents/skills/<name>` or the
    `~/.hermes/skills/<name>` symlink by hand leaves the other half behind, and the loader keeps listing a
    skill that no longer resolves. Before removing anything whose source is gone, ask the repo whether it
    still wants the skill: `git log --all -- skills/<name>`. A skill the library already removed is a
    leftover install and safe to delete; one that never existed in the repo lives only in the store, so
    deleting it is the one action that loses it — preserve it into the repo first.

24. **Reading a materialised symlink as drift.** A skill kept compact with `references -> ../../data` installs
    as **real directories**, because the installer dereferences the link. `diff -rq <repo>/skills/<name>
    ~/.agents/skills/<name>` then reports `Only in …/references: asvs`, `fiasse`, `mastg` and every sibling,
    and reinstalling does not clear it — the store is correct. Compare the link's target instead:
    `diff -rq "$(readlink -f <repo>/skills/<name>/references)" ~/.agents/skills/<name>/references`. Do that
    before re-adding a skill, or you will `remove` + `add` a healthy copy chasing a phantom and conclude the
    installer is broken. The same dereference means a symlinked skill is not portable: the store carries the
    content, the repo carries the pointer.

25. **Editing the installed copy, then wondering why the edit came back.** `~/.agents/skills/<name>/` is a
    copy of the source, not the source: the next `skills update -g` overwrites it and the change vanishes
    with no warning. It is not a rare mistake — an agent fixing a skill mid-task edits the path it just
    read, and four skills on this machine carried forward edits that never reached the repo (a
    `git push origin +branch` escape hatch, two style rules, an HTML-artifact rule). Treat an edit to an
    installed copy as a change request against the repo: fold it back, commit, then reinstall. Run
    `node scripts/skills_audit.mjs` in the library repo to see this drift before an update discards it.

## Verification Checklist

- [ ] Tier decided deliberately (bundled bar: 5+ sessions/month; else `optional-skills/`)
- [ ] File at `skills/<category>/<name>/SKILL.md` or `optional-skills/<category>/<name>/SKILL.md`
- [ ] User-local: source committed under the library repo (here `~/Developer/kernel/skills/<name>/`) and installed with `npx skills add`, `diff -rq` clean against `~/.agents/skills/<name>`
- [ ] Kernel library: name added to the right `skills.sh.json` grouping, `scripts/validate_skills.py` + `muse skills validate` + the unittest suite clean, and the skill installed with `npx skills add` (never `muse skills install`) so `skill_view(name)` returns it
- [ ] Frontmatter starts at byte 0 with `---`, closes with `\n---\n`
- [ ] `name`, `description`, `version`, `author`, `license`, `platforms`, `metadata.hermes.{tags, related_skills}` all present
- [ ] Description ≤ 60 chars, one sentence, ends with a period, no marketing words
- [ ] `author` credits the human contributor first
- [ ] `platforms:` audited against actual prose/scripts, not copied from a sibling
- [ ] Every `related_skills` entry resolves in-repo
- [ ] Body follows the modern section order; commands framed through Hermes tools
- [ ] No machine-local paths anywhere in the file
- [ ] Every command named in the body matches an indexed extension under `scripts/`, `templates/`, or `assets/` (an unindexed `.mjs` needs a `.sh` wrapper)
- [ ] Each ordered step has a checkable completion criterion
- [ ] Tests at `tests/skills/test_<skill>_skill.py` pass under `scripts/run_tests.sh`
- [ ] Docs regenerated with scope discipline; sidebar has exactly one entry for the slug
- [ ] `git add` + commit on the intended branch; PR opened
