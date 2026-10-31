---
title: Project Identity Map
knowledge_type: reference
domain: ponti-studios/projects
scope: mapping-project-identities-and-ownership
status: active
updated: 2026-08-25
slug: ponti-studios-project-identity-map
description: Canonical identities, aliases, ownership boundaries, and migration destinations for the studio project archive.
project: ponti-studios
owner: charlesponti
tags: [ponti-studios, projects, identity, migration]
applies_to:
  - "ponti-studios/**"
---
# Project Identity Map

This is the identity layer for `ponti-studios/projects`. It answers one question before any folder moves happen:

> What is this thing actually called, what owns it, and what should it become?

Folder names are historical evidence, not canonical identity. Do not rename or move a project based only on its current path.

## Target destinations

Project state belongs in metadata, not in the path. Every canonical project gets one stable namespace:

| Destination | Meaning |
| --- | --- |
| `projects/<id>/` | Canonical knowledge for any project, regardless of lifecycle |
| `projects/_index.md` | Studio-wide project catalog and views by lifecycle |
| `projects/_templates/` | Templates, not projects |
| `portfolio/case-studies/<id>.md` | Curated public narrative derived from a canonical project |

`portfolio/` is not a second source of truth. It should link to `source_project` in `projects/`.

## Identity rules

- `id` is the stable canonical identity and should be lowercase kebab-case.
- `project` means the owning project only.
- `series` means a content or creative series within a project.
- `alias` records a former name, folder name, codename, or product surface.
- A product surface is not automatically an independent project.
- A repository is not automatically an independent product.
- Ambiguous identities remain marked `review` until the source material resolves them.

## Canonical project map

| Current folder | Canonical identity | Aliases / surfaces | Owner boundary | Lifecycle | Destination | Confidence |
| --- | --- | --- | --- | --- | --- | --- |
| `_ideas` | Idea intake | venture concepts, product concepts awaiting identity | Studio incubation | intake | `projects/<id>/` when promoted | high |
| `01-glow` | Glow Digital | Glow | Client work | archived | `projects/glow/` | high |
| `02-thomson-reuters` | Thomson Reuters | Compass | Client work | archived | `projects/thomson-reuters/` | high |
| `02.5-help-refugees` | Help Refugees | Volunteer Interface | Client / pro-bono work | archived | `projects/help-refugees/` | high |
| `03-mimecast` | Mimecast | Administration Console, Delivery Rescue | Client work | archived | `projects/mimecast/` | high |
| `04-humana` | Humana | Whole Person Care Platform | Client work | archived | `projects/humana/` | high |
| `05-kensho` | Kensho | S&P Global, Adagio | Client work | archived | `projects/kensho/` | high |
| `05.5-whistle` | Whistle | Movement Video Platform | Client work | archived | `projects/whistle/` | high |
| `06-streamyard` | StreamYard | Hopin, Business Tier, Creator Marketplace | Client work | archived | `projects/streamyard/` | high |
| `09-prolog` | Prolog | Hollywood Writer Submission System | Client work | archived | `projects/prolog/` | high |
| `10-revrock` | Revrock | Musician Tour Optimization | Client work | archived | `projects/revrock/` | high |
| `11-lumina` | Lumina | EdTech Platform Rebuild | Client work | archived | `projects/lumina/` | high |
| `altar` | Altar | Real Estate Discovery | Ponti Studios venture | active | `projects/altar/` | high |
| `career` | Career | Guild, Vouch, Crafd, job-scrape | Hominem product surface | active | `projects/hominem/surfaces/career/` (`surface: career`) | high |
| `charlesponti` | Charles Ponti | Personal site / identity surface | Personal studio surface | active | `projects/charlesponti/` | medium |
| `common-goods` | Common Goods | Los Angeles, clothing, food, home goods | Ponti Studios venture / brand | active | `projects/common-goods/` (`series: los-angeles`) | high |
| `commune` | Commune | — | Ponti Studios product | active | `projects/commune/` | high |
| `earth` | Meridian | Earth, Rocco | Ponti Studios product | active | `projects/meridian/` | medium |
| `filekit` | FileKit | — | Toolbox product surface | active | `projects/toolbox/` | high |
| `foundation` | Foundation | Shared infrastructure | Ponti Studios platform | active | `projects/foundation/` | high |
| `health` | Health | — | Ponti Studios product | active | `projects/health/` | high |
| `hollywood` | Hollywood | Hollywood data platform | Ponti Studios product | active | `projects/hollywood/` | high |
| `hominem` | Hominem | Omiro, Career, Finance, Florin | Product monorepo and data authority | active | `projects/hominem/` | high |
| `kernel` | Kernel | Skills library | Ponti Studios platform | active | `projects/kernel/` | high |
| `labs` | Labs | Labyrinth, experiments | Studio experimentation | active | `projects/labs/` | high |
| `monotone` | Monotone | Unsolicited, Confractus, Movie Purgatory | Ponti Studios creative practice | active | `projects/monotone/` (`series: unsolicited`) | high |
| `off-the-menu` | Off the Menu | — | Unclassified creative/product concept | review | `projects/off-the-menu/` | low |
| `omiro` | Omiro | — | Hominem product surface | active | `projects/hominem/surfaces/omiro/` (`surface: omiro`) | high |
| `pipeline` | Pipeline | — | Ponti Studios support infrastructure | active | `projects/pipeline/` | high |
| `ponti-studios-ui` | Ponti Studios UI | UI package | Ponti Studios platform | active | `projects/ponti-studios-ui/` | high |
| `prod-god` | PROD GOD | — | Unclassified product practice / concept | review | `projects/prod-god/` | low |
| `public-data` | Public Data | — | Ponti Studios support infrastructure | active | `projects/public-data/` | high |
| `school` | Ponti School | — | Ponti Studios venture | discovery | `projects/ponti-school/` | medium |
| `studio` | Studio Publishing | Content Publishing System | Ponti Studios internal system | active | `projects/studio/` | high |
| `theatre-management` | Theatre Management | — | Ponti Studios product concept | discovery | `projects/theatre-management/` | medium |
| `toolbox` | Toolbox | FileKit, XKit, MediaKit, PhotoKit, AgentKit | Ponti Studios tool monorepo | active | `projects/toolbox/` | high |

## Known identity conflicts

### Earth / Meridian

The folder is `earth`, but its documents identify the product as Meridian and describe Rocco as an earlier or adjacent identity. The canonical project should be `meridian`; `earth` and `rocco` remain aliases until the product history is documented.

### Common Goods / Los Angeles

Clothing documents now declare `project: common-goods` and `series: los-angeles`. Treat `Los Angeles` as a product line or historical venture identity, not as a separate project.

### Hominem / Omiro / Career

Hominem is the repository and platform boundary. Omiro and Career are product surfaces under `projects/hominem/surfaces/`, represented by `surface` metadata. They should not be promoted to sibling projects unless they have independent strategy, ownership, and operating cadence.

### Monotone / Unsolicited

Monotone is the creative practice. Unsolicited is a `series` within it. Confractus and Movie Purgatory appear to be individual bodies of work or formats, not top-level studio projects.

## Migration gate

Before moving a row marked `medium`, `low`, or `review`:

1. Confirm the canonical name in the project’s index or source repository.
2. Decide whether aliases are historical names, product surfaces, or independent projects.
3. Update frontmatter ownership before changing paths.
4. Create or update the canonical `_index.md`.
5. Add a portfolio projection only if the work has a public narrative.

This map is intentionally conservative. A folder move is approved only when identity and ownership are clear. Lifecycle changes should update frontmatter and project indexes, never require another directory move.
