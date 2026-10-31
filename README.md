# Kernel

Nine installable agent packages containing Ponti Studios conventions, specialist
procedures, and executable helpers. Detailed procedures load only when needed.

| Package | Use |
| --- | --- |
| engineering-workflows | Application development, tests, builds, reviews, architecture, repository maintenance, skill authoring |
| design-workflows | Interface design, motion, brand systems, asset sourcing |
| security-workflows | Security reviews, audits, integration risk and requested security controls |
| writing-workflows | All writing: documents, briefs, essays, scripts, social posts, written scenes, workshops and text extraction |
| studio-workflows | Image/audio/video production, film craft, physical editions, character canon, costs and project operations |
| computer-workflows | File organization and macOS uninstall procedures |
| ponti-principles | Charles’s engineering preferences |
| ship-ios | Executable iOS release integration used by project automation |
| studio-dev | Executable repository setup and shared development conventions |

## Install

Choose the packages your agent needs:

```sh
npx skills add ponti-studios/kernel --skill writing-workflows -g --yes
npx skills add ponti-studios/kernel --all -g --yes
```

Projects that invoke release helpers can retain their pinned command packages:

```sh
npx skills add ponti-studios/kernel --skill ship-ios --skill studio-dev --yes
```

Consumers update explicitly. Edit this source repository, validate, then install
through the skill installer. Hand editing an installed copy causes drift.

## Package layout

`SKILL.md` selects the relevant procedure under `references/`. Each procedure
keeps its detailed resources beside `WORKFLOW.md`. Paths inside a procedure are
relative to its folder. A package does not rely on a personal archive or a
particular checkout location.

All writing belongs to writing-workflows. Studio production consumes approved
text and returns text revisions to writing-workflows.

Shared Studio runtime source lives in `runtime/`. Run
`python3 scripts/bundle_runtime.py` after editing it; package copies are checked
for equality. This lets writing and Studio production install independently.

## Migration

This is a breaking catalog change from 60 specialist skills to nine packages.
[The migration map](docs/refactor-map.json) identifies each moved procedure.
Existing installations require an explicit migration; an ordinary update of an
old name must not be assumed to install its replacement. Review installed-only
changes before removing old packages, install the replacement, then remove old
entries through the installer so agent links are handled too.

See the [refactor review](docs/refactor.md) for migration evidence, validation and limitations.

## Contribute

See [AGENTS.md](AGENTS.md) for validation and publication rules.
Licensed under MIT; vendored material retains its attribution and license notes.
