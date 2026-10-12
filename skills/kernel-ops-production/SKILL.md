---
name: kernel-ops-production
description: "Physical production, print, and dossier standards: specs, conservation, framing, editions. Use for print specs or archival documentation."
license: MIT
compatibility: Physical production, archival print, and documentation work.
metadata:
  author: project
  version: "1.0"
  category: Design
  tags:
    - design
    - production
    - docs
---
## When to use

- writing or reviewing physical production and print specs
- documenting an archival print edition or generating a technical dossier
- writing certification, authentication, or conservation language for a physical artwork

## Outputs

- Physical production language aligned to references
- Technical dossier or authentication guidance aligned to references

## Definition of done

- Output matches the relevant production reference
- Physical production language is technically and archivally aligned

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
