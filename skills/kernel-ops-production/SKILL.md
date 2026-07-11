---
name: kernel-ops-production
kind: skill
tags:
  - design
  - production
  - docs
description: >
  Enforces physical production, archival print, and technical dossier standards.
  Use when writing or reviewing print specs, conservation language, framing or
  substrate requirements, edition data, authentication language, or archival art
  documentation.
license: MIT
compatibility: Physical production, archival print, and documentation work.
metadata:
  author: project
  version: "1.0"
  category: Design
when:
  - writing or reviewing physical production and print specs
  - documenting an archival print edition or generating a technical dossier
  - writing certification, authentication, or conservation language for a physical artwork
termination:
  - Output matches the relevant production reference
  - Physical production language is technically and archivally aligned
outputs:
  - Physical production language aligned to references
  - Technical dossier or authentication guidance aligned to references
---

Enforce the physical production and archival documentation standards. This skill exists to stop the LLM from improvising print, conservation, or certification language outside the approved production references.

## Non-Negotiables

1. Production and archival language must come from the approved references.
2. Technical dossier and authentication outputs must preserve factual, conservation, and edition accuracy.
3. If a production detail is missing, look it up in the references before writing.

## Routing

Load only the references needed for the task:

- Archival print, substrate, conservation, framing specs → `references/production.md`
- Archival print dossier, edition data, authentication, conservation mandate → `references/technical-dossier.md`

## Guardrails

- Never improvise archival or conservation terminology.
- Never write edition or authentication language without checking the source reference.
- Never mix brand storytelling with technical production facts when precision is required.
