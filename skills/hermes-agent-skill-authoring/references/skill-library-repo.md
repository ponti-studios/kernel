# A repo-backed skill library

Mechanics for keeping every authored skill in one versioned repo while the agent keeps reading a
directory it does not start.

## Layout and wiring

```
~/Developer/skills/            git repo, remote charlesponti/skills
  skills/<name>/SKILL.md       one directory per skill
  scripts/validate.mjs         frontmatter, links, secrets
  .github/workflows/ci.yml     runs the validator
  SECURITY-SKILLS.lock.json    vendored packs: source repo + commit + what it merged into

~/.agents/skills         -> ~/Developer/skills/skills
~/.hermes/skills/<name>  -> ../../.agents/skills/<name>
```

The loader path *is* the repo checkout (through one symlink), so there is no install or sync step and
therefore nothing to drift. Reproducing the setup on another machine is a clone plus one symlink.

Do not make the repo root `~/.agents/skills` itself: a repo whose root is a dot-directory has nowhere
for a README, validator or CI config, and every one of those has earned its place.

## What the validator checks

- `SKILL.md` exists in every directory
- frontmatter parses, `name` equals the directory name, `description` present and bounded
- every `references/`, `scripts/`, `assets/`, `templates/` link resolves
- no secret patterns (provider keys, private keys)

Run the **link and secret sweeps before the frontmatter gate**: a `continue` on a missing frontmatter
block skips every later check for that skill, so a skill with no frontmatter and a broken link reports
only half its problems. Prove the validator can fail — plant a broken skill, confirm it reports each
category and exits 1, delete it. A validator that always exits 0 is a ritual.

CI runs the same script on push, so a broken skill fails the push rather than the next agent session.

## A second library: the muse-managed kernel repo

`~/Developer/kernel` (remote `ponti-studios/kernel`) is the other library on this machine, and it is wired
differently. A session that assumes the first library's symlink model writes a correct skill and then
cannot see it.

```
~/Developer/kernel/
  skills/<name>/SKILL.md        one directory per skill
  skills.sh.json                groupings: [{title, description, skills: [...]}]
  scripts/validate_skills.py    frontmatter contract, name == directory, local links, catalog parity
  tests/                        unittest over the validator itself
```

- **Frontmatter differs.** `name`, `description`, `license`, `compatibility`, and
  `metadata.{author, version, category, tags}`. No `platforms:`, no `metadata.hermes` — copy the shape from
  a sibling in the same repo, not from `~/Developer/skills`.
- **The catalog is a parity gate.** A skill directory with no `skills.sh.json` entry fails as
  `missing from skills.sh.json`; an entry with no directory fails the other way. Add the name to the right
  grouping in the same commit.
- **muse owns format.** `scripts/validate_skills.py` checks only what muse cannot (name/path agreement,
  links, catalog); `muse skills validate skills/<name>` is the format gate and prints `valid <name>`.
  `muse skills --help` lists the rest: list, inspect, enable, disable, install, import, update, uninstall.
- **Installation copies, it does not link.** `muse skills install skills/<name> --scope user` writes
  `~/.config/muse/skills/<name>` and touches neither `~/.agents/skills/<name>` nor
  `~/.hermes/skills/<name>`. The installed copy goes stale on the next repo edit and still loads. To read
  live source in the current session, point both paths at the repo:

  ```bash
  ln -sfn ~/Developer/kernel/skills/<name> ~/.agents/skills/<name>
  ln -sfn ../../.agents/skills/<name>      ~/.hermes/skills/<name>
  ```

- **A push to main is the deploy.** Consumers pick it up with their own install step, so a local commit is
  not yet shipped.
- **Order:** write → `python3 scripts/validate_skills.py` → `muse skills validate skills/<name>` →
  `python3 -m unittest discover -s tests` → commit → push → install or symlink → `skill_view(name)` to
  confirm it loads with its references attached. Template files are worth parsing before committing
  (JSON/JSONC, YAML, TOML) — a stray quote in a config template fails the copy silently, in someone
  else's repo.

## External skills

A skill whose source of truth is another project repo stays a symlink in `skills/` and is `.gitignore`d.
Committing the symlink instead gives CI an absolute path that does not exist — `ENOENT` from `stat`,
failing the run before it reports anything. The validator resolves each entry; anything whose realpath
falls outside the library root is listed as external and skipped.

If a fresh clone should get them, a submodule pinned to a commit is the mechanism — but it requires
the other repo to be published, so make that a deliberate choice rather than a default.

## Portability across agent frameworks

The `.agents/skills/<name>/SKILL.md` convention (YAML frontmatter `name` + `description`, prose body,
relative links) is read by Hermes, Claude Code, and Vercel eve, so the markdown layer transfers at no
cost. What transfers is the *knowledge*; what does not is anything the skill reaches for at runtime:

| Skill kind | Ports? |
|---|---|
| Knowledge only (prompt craft, canon, review checklists) | yes, unchanged |
| API-only and scheduled (monitors, posting, publishing) | yes, as a thin typed tool |
| Needs local binaries (ffmpeg, ImageMagick), a native module, or one local filesystem | no — the sandbox has none of those |
| Maintains a local append-only store (ledger, blobs, SQLite) | no — that is a storage re-architecture, not a port |

Consequence for authoring: **put hard rules in code, not prose.** "Never judge a generated image"
as advice is skimmable by a model and ignored by a different harness; a script that refuses is not.
A skill that keeps its enforcement in a script ports as a script; a skill that keeps it in a paragraph
ports as a suggestion.
