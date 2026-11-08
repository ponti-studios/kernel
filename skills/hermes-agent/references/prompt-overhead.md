# Prompt Overhead — measure, dump, defer

Recipes for "how many tokens does Hermes add?", for proving a change actually
reduced it, and for reading the system prompt as text.

## 1. Measure

```bash
hermes prompt-size            # human summary
hermes prompt-size --json     # system_prompt, skills_index, memory, user_profile, tools, toolsets_breakdown
```

`prompt-size` builds an inspection agent offline — no API call, no cost. It
reports **bytes**; divide by ~5 for tokens with this text mix.

Then confirm on the wire. Run the probe from a directory with **no AGENTS.md**
(an empty scratch dir), or project context inflates the number:

```bash
cd ${HERMES_HOME:-~/.hermes}/cache/scratch/hm-base
hermes chat -q 'Reply with exactly: OK' -Q     # prints session_id
sqlite3 -header -column ${HERMES_HOME:-~/.hermes}/state.db "select api_call_count, input_tokens,
  cache_read_tokens, cache_write_tokens from session_model_usage
  where session_id='<id>' and (task is null or task='');"
```

Prompt total = `input_tokens + cache_read_tokens + cache_write_tokens`. Report
the three parts separately: caching shifts between `input` and `cache_read`
from run to run, so a single run's `input_tokens` alone is not comparable.
Ignore rows whose `task` is set — those are side calls (`title_generation`),
which show up as a second row for the same session.

### Reconciling the numbers

The byte totals carry an identity worth checking every time: **fixed prompt
bytes = `system_prompt.bytes` + `tools.json_bytes`**. A recorded total that
misses it by roughly the tool-schema delta was never re-totalled after the
toolset changed — its token count can be fresh while its byte count still
carries the retired schemas. Recompute instead of quoting the stale figure, and
name which number moved if the user is comparing against a baseline.

Only the wire count is a real token number. The ~5:1 byte ratio is a
whole-prompt sanity check for this text mix, not a per-section converter:
`estimate_tokens_rough` and `estimate_tokens_from_schemas` both apply chars/4
(≈3.9 B/token), which overstates a schema-heavy prompt by ~28%. Scaling a
block's byte share to the measured total is acceptable for a one-off "which
block dominates" statement — present it as proportional, not counted — and it
is **wrong for predicting a delta**: the marginal rate drifts as you remove
content, so the same kind of change can cost 5 B/token once and 11.5 B/token the
next time. Three configs, same machine, same prompt bytes, each measured twice
and identical: 21 tools / 40,001 B = 13,132 tokens; 17 / 27,564 B = 10,682;
14 / 20,645 B = 10,082. Predict nothing from bytes; A/B it on the wire.

Two readings that look like counting bugs and are not:

- `hermes prompt-size --platform <surface>` only yields a full tool array for
  cli-shaped surfaces; a name like `desktop` comes back with ~13 kB of prose
  and zero tools, so its bytes are not comparable to a cli baseline.
- `skills_index.bytes` exceeds the sum of `skills_breakdown[*].index_line_bytes`
  because the index repeats category headers; the gap is formatting.

To read the prompt a session was actually sent, join to the stored text rather
than re-rendering it:

```bash
sqlite3 ${HERMES_HOME:-~/.hermes}/state.db "select length(p.prompt) from sessions s
  join system_prompts p on p.hash = s.system_prompt_hash where s.id='<id>';"
```

That stored text runs a few percent shorter than `prompt-size` renders
(rendering re-adds the timestamp/runtime block), so a small drift between a
recorded total and a fresh measurement is expected; a drift the size of the
tool-schema block is not.

## 2. Where the bytes live

| Block                                         | Source                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool schemas                                  | One dict per tool in `tools/<family>_tool.py` (`"name"`, `"description"`, `"parameters"`): `delegate_tool`, `terminal_tool`, `file_tools`, `web_tools`, `skills_tool`, `skill_manager_tool`, `memory_tool`, `tts_tool`, `vision_tools`, `clarify_tool`, `browser_use_cli`, `code_execution_tool`, and `tools/connectors/tool.py` for `manage_connections` |
| `tool_search` / `tool_describe` / `tool_call` | No static schema — built per request in `tools/tool_search.py`, because the `tool_search` description embeds the live catalogue of whatever is deferred                                                                                                                                                                                                   |
| Which tools are eager                         | `toolsets.py` (`_HERMES_CORE_TOOLS`) plus `tools/registry.py` `register()` — that mapping is also what `prompt-size` groups by toolset                                                                                                                                                                                                                    |
| System-prompt prose                           | `agent/prompt_builder.py` (identity, guidance constants) — **code, not a markdown file**; `agent/system_prompt.py` assembles the tiers                                                                                                                                                                                                                    |
| Skills index / memory / profile               | Installed `SKILL.md` frontmatter, `memories/MEMORY.md`, `memories/USER.md`, plus `SOUL.md` folded into the stable tier                                                                                                                                                                                                                                    |

## 3. Apply a defer list

The curated defaults live in `hermes_cli/config_defaults.py` (under
`tools.tool_search.defer`). An explicit list REPLACES them, so build the new
list as _defaults + additions_ and write it in one go:

```bash
hermes config set tools.tool_search.defer '["computer_use","session_search",...,"browser_exec","manage_connections","delegate_task","text_to_speech"]'
```

`hermes config set` parses the JSON into a real YAML list — verify with
`hermes config get tools.tool_search.defer` and by looking for `- name` entries
under `tools:` in `config.yaml`. Never hand-edit the file for this.

Keep `clarify` eager (stubbing it kills the ask-the-user affordance) and keep
`vision_analyze` eager (deferring it drops it out of the catalogue listing, so
it stops being discoverable). Keep `memory` eager too: like `clarify` it is an
affordance, not a utility — a hidden self-improvement hook is forgotten at the
moment it should fire.

Choose candidates by measured usage, not by schema size. Tool calls are already
recorded per message in `${HERMES_HOME:-~/.hermes}/state.db`:

```bash
sqlite3 -header -column ${HERMES_HOME:-~/.hermes}/state.db "select tool_name, count(*) n
  from messages where tool_name is not null and tool_name<>''
  group by 1 order by 2 desc;"
```

That ranking beats byte size, because the price of deferring is one round trip
on every use: a 3.5 kB schema behind ~30 calls in ten days is a better
deferral than a 1.8 kB schema behind 45, and a hot tool stays eager however fat
it is (terminal: 2.7 kB, thousands of calls). A deferred schema gives back
0.8–3.5 kB against ~0.1 kB of new catalogue line, but the token saving is not
proportional to either — measure it (see above).

Names in the list that this surface does not expose (desktop-only tools on
`cli`) are harmless: they simply match nothing.

**Settings are read at process start.** A running desktop app or gateway keeps
its old tool array until relaunch; only new CLI / gateway sessions pick the
change up. Say so instead of reporting an unverified change as done.

## 4. Verify the bridge

```bash
# eager array + catalogue text, exactly as the model sees it
P=$(ls -d ${HERMES_HOME:-~/.hermes}/tools/python-3.14.9*/bin/python3 | head -1)
SP=${HERMES_HOME:-~/.hermes}/hermes-agent/venv/lib/python3.11/site-packages
"$P" -c "
import sys; sys.path.insert(0,'$SP'); sys.path.insert(0,'${HERMES_HOME:-$HOME/.hermes}/hermes-agent')
from hermes_cli.prompt_size import _build_inspection_agent
a=_build_inspection_agent('cli')
print(sorted(t['function']['name'] for t in a.tools))
[print(t['function']['description']) for t in a.tools if t['function']['name']=='tool_search']
"
```

Then prove the round trip. Cheapest evidence is the catalogue itself: every
deferred name must appear as a `- <name>:` line in the `tool_search`
description, since that listing is the only thing making it discoverable. Ask a
fresh session to find a deferred tool by description and report its parameter
names **without invoking it** — a correct parameter list proves
`tool_search` → `tool_describe`; a saved token count proves nothing.

To prove dispatch as well, let it actually call the tool (`... then call
search_files to locate <path>. Reply with only the absolute path.`). Budget for
it: a three-hop loop like that bills ~6 API calls and tens of thousands of
prompt tokens, so run it once after a deferral change, not as a routine check.

## 5. Dump the rendered prompt (read it, or hand it to the user)

```python
import os, sys; sys.path.insert(0, os.path.join(os.environ.get("HERMES_HOME", os.path.expanduser("~/.hermes")), "hermes-agent"))
from agent.system_prompt import build_system_prompt_parts
from hermes_cli.prompt_size import _build_inspection_agent
parts = build_system_prompt_parts(_build_inspection_agent("cli"))
for name, text in parts.items():    # stable | context | volatile
    open(f"/tmp/prompt-{name}.md", "w").write(text)
```

`stable` is identity + guidance + skills pointer; `context` holds AGENTS.md /
cwd files (empty in a clean dir); `volatile` holds skills index, memory,
profile and the timestamp. To show the user "the core guidance", dump `stable`
and open that — pointing them at `prompt_builder.py` instead buries the text in
a 4k-line module.

### Interpreter quirk

Hermes runs on its own bundled interpreter (`${HERMES_HOME:-~/.hermes}/tools/python-3.14.9*/`),
and `venv/bin/python` is a shim that re-execs it. Third-party deps such as
`ruamel.yaml` live in `venv/lib/python3.11/site-packages`, which is **not** on
the bundled interpreter's path — importing `hermes_yaml` therefore fails with
`ModuleNotFoundError: No module named 'ruamel'`. Prepend that site-packages
dir to `sys.path` (as above) and it imports. If the layout has changed, read
the launcher at `${HERMES_HOME:-~/.hermes}/hermes-agent/.hermes/bin/hermes` to see the real
path it sets up.

## 6. Shrinking the schemas themselves

Once deferral has emptied the cold half of the array, the remaining bytes are
about half description text and half parameter JSON. Rank tools before touching
any of it:

```python
import sys, json, os
for p in ('~/.hermes/hermes-agent/venv/lib/python3.11/site-packages', '~/.hermes/hermes-agent'):
    sys.path.insert(0, os.path.expanduser(p))
from hermes_cli.prompt_size import _build_inspection_agent
a = _build_inspection_agent('cli')
for t in a.tools:
    f = t['function']
    d = len(f.get('description','').encode())
    p = len(json.dumps(f.get('parameters',{}),separators=(',',':')).encode())
    print(f'{d+p:6} desc={d:5} params={p:5}  {f["name"]}')
```

Four kinds of byte are removable without losing capability, because the
information already exists elsewhere in the same request or in the runtime:

- **A tool re-documenting other tools.** A description that spells out the
  signatures and return shapes of tools that ship their own schemas — often a
  third of that tool's description. Name the helpers in one line and let the
  eager schema be the reference.
- **Two call shapes for one tool.** A batch form plus a legacy single-op form
  in the same schema. Keep the batch form in the schema; keep the legacy fields
  accepted in the handler so stored replays do not break, and say so when
  proposing it.
- **`anyOf` over near-identical object shapes.** Five variants that each
  declare the same identity fields cost more than the union of their unique
  fields. Flatten to one object with an action enum and state the per-action
  requirement in prose; runtime validation usually already branches on action.
- **Paragraphs on rarely-used parameters.** Background/notify/heartbeat-style
  knobs: one clause each, semantics unchanged.

Do **not** trim descriptions that drive tool selection and argument choice
(clarify, read_file, write_file, patch, web_extract, web_search, skill_view,
vision_analyze). That prose is what keeps the right tool called with the right
arguments; the saving is not worth silent misfires, and it is the first thing a
reviewer will push back on.

**Upstream gate.** In the hermes-agent repo the tool array is snapshotted:
`tests/fixtures/prompt_surface/tools/<tool>.json` plus rendered prompts, checked
by `tests/ci/test_prompt_surface.py`. Any description or parameter edit must
regenerate and commit that snapshot —
`scripts/run-in-hermes-env python scripts/ci/prompt_surface.py render` — and
merging a change under that path needs a `hermes-agent-core` approval. The
snapshot is also the honest place to get before/after bytes for a PR body: sum
the per-tool fixture files rather than quoting `prompt-size`. Report bytes
there, not token promises.
