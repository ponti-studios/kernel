---
title: Ponti Studios Current System
id: ponti.current-system
knowledge_type: reference
domain: ponti-studios/vision
scope: understanding-current-operations
status: active
updated: 2026-08-25
slug: ponti-studios-current-system
owner: charlesponti
applies_to: []
---
# Ponti Studios Current System

This is the compact current-state map. It answers what exists today; the portfolio document explains why it matters.

## Company shape

Ponti Studios is one flat product company with one shared platform, one design language, and multiple strategic bets.

```text
Kernel → reusable AI-agent skills
Foundation → shared infrastructure
Hominem → product monorepo, apps, API, data, auth, queues
Ponti Studios UI → shared design system
Labs → experiments and prototypes
Toolbox / Pipeline / Public Data → supporting workflows
```

## Active boundaries

### Shared platform

- [[ponti-studios/projects/kernel|Kernel]] — skills used by Claude, Codex, and other agent runtimes.
- [[ponti-studios/projects/foundation|Foundation]] — PostgreSQL, Redis, MinIO, Compose, and CI/CD.
- Ponti Studios UI — published tokens, primitives, patterns, and native/web entry points.

### Product systems

- [[ponti-studios/projects/hominem/_index|Hominem]] — product monorepo containing Omiro, Career, Finance, and the Hominem API.
- Labs / Labyrinth — experimental application surface.
- Commune — independent community application.
- Earth — Earth Intelligence application.
- Health — symptom-guidance product/case-study surface.

### Supporting systems

- Toolbox — local CLIs and applications.
- Public Data — reference dataset build and publication.
- Pipeline — experimental content-production scaffold.
- Charles Ponti — public brand and portfolio surface.

## Ownership rule

Hominem applications and shared packages communicate through the Hominem API. Foundation supplies infrastructure. Kernel supplies agent skills. Ponti Studios UI supplies interface primitives and tokens. Supporting systems remain separate unless a repository documents a deliberate integration.

## Canonical links

- [[ponti-studios/projects/_index|Engineering Catalog]]
- [[ponti-studios/strategy/product-portfolio|Product Portfolio]]
- [[ponti-studios/projects/hominem/engineering.architecture|Hominem Engineering Architecture]]
- [[.agents/skills/project-operations/references/documentation|Documentation System]]
- [[drawings/hominem-ponti.architecture|Master Architecture Diagram]]
