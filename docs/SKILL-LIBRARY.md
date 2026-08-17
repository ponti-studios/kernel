# Skill library contract

This repository treats `skills/` as a catalog of independently installable agent skills.

## Canonical layout

Every installable skill is one directory with this shape:

```text
skills/<skill-name>/
├── SKILL.md                 # required entrypoint and routing contract
├── agents/openai.yaml       # optional client-specific metadata
├── references/              # optional deep workflows and source material
├── scripts/                 # optional deterministic helpers
└── tests/                   # optional skill-level evaluation fixtures
```

`SKILL.md` is the only required file. Empty directories are not skills and are
ignored by the catalog. The directory name and frontmatter `name` must match.

## SKILL.md contract

The frontmatter must contain:

- `name`: the exact skill directory name
- `description`: what the skill does and when to load it
- `license`: normally `MIT`
- `when`: concrete activation signals
- `outputs`: the artifact or decision the skill produces
- `termination`: observable definition-of-done checks

Use `metadata.category` and `metadata.tags` for discovery. Keep the entrypoint
short and route detailed procedures into `references/`. References should be
linked with relative paths and must not become alternate entrypoints.

## Catalog contract

`skills.sh.json` is the machine-readable catalog. It must list every directory
that contains `SKILL.md` exactly once, and must not list empty or unfinished
directories. Run:

```bash
python3 scripts/validate_skills.py
```

before opening a PR. The validator checks entrypoints, names, required metadata,
catalog parity, duplicate catalog entries, and broken local Markdown links.

## Adding or consolidating a skill

1. Create `skills/<skill-name>/SKILL.md` with the required contract.
2. Put long workflows, examples, and domain-specific material under `references/`.
3. Add the skill to one grouping in `skills.sh.json`.
4. Add or update the human-facing grouping in `README.md`.
5. Run the validator and any skill-specific tests.

When several skills share the same trigger and quality bar, consolidate them
behind one routing skill and preserve the old material as references. Do not
create a directory until its entrypoint and catalog entry are ready together.
