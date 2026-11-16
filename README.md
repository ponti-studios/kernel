# Kernel

Agent skills from Ponti Studios. Ten packages, one repo — detailed procedures
load only when needed.

**House policy: whole set, no slices.** Take the full set, or one of the packages
below when that is all you need.

## Packages

| Package               | What's inside                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| apple-workflows       | iOS, macOS and watchOS apps in Swift and SwiftUI: app work, review, shared packages, distribution             |
| engineering-workflows | Application development, tests, builds, reviews, architecture, repository maintenance, skill authoring       |
| design-workflows      | Interface design, motion, brand systems, asset sourcing                                                      |
| security-workflows    | Security reviews, audits, integration risk and requested security controls                                   |
| writing-workflows     | All writing: documents, briefs, essays, scripts, social posts, written scenes, workshops and text extraction |
| studio-workflows      | Image/audio/video production, film craft, physical editions, character canon, costs and project operations   |
| computer-workflows    | File organization, disk space recovery and macOS uninstall procedures                                        |
| ponti-principles      | Charles's engineering preferences                                                                            |
| ship-ios              | Executable iOS release integration used by project automation                                                |
| studio-dev            | Executable repository setup and shared development conventions                                               |

## Take it home

Everything:

```sh
npx skills add ponti-studios/kernel --all -g --yes
```

Just the writing package:

```sh
npx skills add ponti-studios/kernel --skill writing-workflows -g --yes
```

Projects with their own release pipeline can pin the helper packages:

```sh
npx skills add ponti-studios/kernel --skill ship-ios --skill studio-dev --yes
```

Consumers update explicitly. This repository is the source — edit here, validate,
then install through the skill installer. Hand editing an installed copy causes
staleness.

## How it works

`SKILL.md` is the index: it points you to the right procedure under
`references/`. Each procedure keeps its scripts and resources beside `WORKFLOW.md`,
with paths relative to its own folder. A package never depends on personal files
or a particular machine layout.

All writing lives in writing-workflows. Studio production consumes approved text
and sends text revisions back to writing-workflows.

Shared Studio starter lives in `runtime/`. Feed it with
`python3 scripts/bundle_runtime.py` after editing; package copies are checked
for equality. This lets writing and Studio production build independently.

## Previous catalog

This is a breaking change from 60 specialist skills to ten packages.
[The migration map](docs/refactor-map.json) shows where every old skill went.
Existing installations require an explicit migration; an ordinary update of an
old name must not be assumed to install its replacement. Review installed-only
changes before removing old packages, install the replacement, then remove old
entries through the installer so agent links are handled too.

See the [refactor review](docs/refactor.md) for migration evidence, validation and limitations.

## House rules

See [AGENTS.md](AGENTS.md) for validation and publication rules.

## Local commit gate

Run `lefthook install` once in a checkout to install the pre-commit hook. It runs
`python3 scripts/validate_skills.py` and blocks commits when the skill structure,
links, or catalog are invalid.

Licensed under MIT; vendored material retains its attribution and license notes.
