# The Kernel Bakery

Fresh-baked agent skills from Ponti Studios. Nine trays, one bakery — detailed
recipes load only when needed.

**House policy: whole bakery, no slices.** If you want these skills, you take
the whole bread and butter with cheese on top.

## The menu

| Tray                  | What's inside                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| engineering-workflows | Application development, tests, builds, reviews, architecture, repository maintenance, skill authoring       |
| design-workflows      | Interface design, motion, brand systems, asset sourcing                                                      |
| security-workflows    | Security reviews, audits, integration risk and requested security controls                                   |
| writing-workflows     | All writing: documents, briefs, essays, scripts, social posts, written scenes, workshops and text extraction |
| studio-workflows      | Image/audio/video production, film craft, physical editions, character canon, costs and project operations   |
| computer-workflows    | File organization and macOS uninstall procedures                                                             |
| ponti-principles      | Charles's engineering preferences                                                                            |
| ship-ios              | Executable iOS release integration used by project automation                                                |
| studio-dev            | Executable repository setup and shared development conventions                                               |

## Take it home

The whole tray, still warm:

```sh
npx skills add ponti-studios/kernel --all -g --yes
```

Writing fuel for the word ovens:

```sh
npx skills add ponti-studios/kernel --skill writing-workflows -g --yes
```

Projects with release ovens of their own can keep their pinned helper trays:

```sh
npx skills add ponti-studios/kernel --skill ship-ios --skill studio-dev --yes
```

Consumers update explicitly. This repository is the oven — edit here, validate,
then install through the skill installer. Hand editing an installed copy causes
staleness, and nobody likes stale bread.

## How the bakery works

`SKILL.md` is the counter: it points you to the right recipe under
`references/`. Each recipe keeps its ingredients beside `WORKFLOW.md`, measured
relative to its own bowl. A tray never depends on a personal pantry or a
particular kitchen layout.

All writing rises in writing-workflows. Studio production eats approved text
and sends text revisions back to writing-workflows.

Shared Studio starter lives in `runtime/`. Feed it with
`python3 scripts/bundle_runtime.py` after editing; package copies are checked
for equality. This lets writing and Studio production bake independently.

## Yesterday's menu

This is a breaking recipe change from 60 specialist skills to nine trays.
[The migration map](docs/refactor-map.json) shows where every old dish went.
Existing installations require an explicit migration; an ordinary update of an
old name must not be assumed to install its replacement. Review installed-only
changes before removing old packages, install the replacement, then remove old
entries through the installer so agent links are handled too.

See the [refactor review](docs/refactor.md) for migration evidence, validation and limitations.

## House rules

See [AGENTS.md](AGENTS.md) for validation and publication rules.
Licensed under MIT; vendored material retains its attribution and license notes.
