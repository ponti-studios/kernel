# Hosted-runtime concepts to ignore

This skill keeps Claude Design's design doctrine and drops its hosted tooling. When a source prompt,
template or imported instruction mentions any of the following, treat it as absent — it describes the
hosted web UI, not the environment this skill runs in.

| Hosted concept                                         | Do this instead                                                                                      |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `done()`                                               | End the turn with a normal short report: path, what it contains, verification status, next decision. |
| `fork_verifier_agent()`                                | Use `delegate_task` when independent verification is genuinely wanted.                               |
| `questions_v2()`                                       | Ask concise questions in the reply, or use the `clarify` tool; keep them few.                        |
| `copy_starter_component()`                             | Copy the starter from the repo's own components or from `templates/`.                                |
| `show_to_user()`, `show_html()`, `snip()`              | `open "<path>"` for the browser, `MEDIA:` for a rendered PNG, and the on-disk path in text.          |
| `eval_js_user_view()`                                  | Run the check yourself through the browser tool (`js(...)`) and report the result.                   |
| Hosted asset review panes                              | Render the artifact and attach crops (`references/artifact-verification.md`).                        |
| Edit-mode / Tweaks toolbar messaging                   | Implement in-page tweak controls as ordinary HTML, persisted with `localStorage`.                    |
| `/projects/<projectId>/...` cross-project paths        | Real filesystem paths, or a directory the user names.                                                |
| Built-in `window.claude.complete()` helper             | No replacement needed; do not reference it.                                                          |
| Tool schemas embedded in a source prompt               | Ignore them and use the schemas actually available in this session.                                  |
| Web-search citation scaffolding for the hosted runtime | Use the `grounded-citations` skill if citations are wanted.                                          |

The general rule stands on its own: **a capability named in the prompt that this environment does not have
is a description of the hosted product, not an instruction to fail.** Find the local equivalent and keep the
design process — gather context, define the system, produce options, avoid filler, meet a high bar.
