---
title: idea validation prd studio
knowledge_type: process
domain: ponti-studios/projects
scope: validating-ideas-into-prds
status: active
updated: 2026-08-25
slug: idea-validation-prd-studio
applies_to: []
---
# Idea Validation & PRD Studio

**Concept:** tooling for going from a rough idea to a validated spec —
literally what this vault's old category files were doing manually. Pulls
together the Entrepreneur/business-plan wishes and the PRD/user-story
tooling wishes that were previously filed as unrelated bullets under
different personas.

## Core features

- Paste rough notes/utterances → LLM extracts user stories + acceptance criteria
- "How baked is this?" percentage score for an idea
- Searchable catalog of PRDs and acceptance criteria for common feature types
- Comprehensive business-plan generator (affordable tier, e.g. $9.99)
- Public idea board: share ideas, get upvote/downvote feedback
- Market trend analysis + strategy development tools
- Directory of experienced consultants, mentors, and VC introductions
- Underlying engine: a tuned "writing agent" / best-in-class writing prompt
  shared with `resume-customization.md` (vault example: `projects/hominem/surfaces/career/features/resume-customization.md`)

## Roadmap

- **MVP:** paste notes → LLM extracts user stories + a percentage "baked-ness" score
- **V1:** PRD generator + searchable catalog of past PRDs/acceptance criteria
- **V2:** public share/upvote layer for ideas, plus mentor/VC directory

## Priority note

Arguably the meta-product for this vault itself — worth prototyping against
`ponti-studios/projects/_ideas/` as the first test corpus, since that's exactly the
transformation this restructuring just did by hand.

## Sources

Merged from (now deleted): `product.features.professional-business-hr.md`
(Entrepreneur, Business Leader sections), `product.features.general-other.md`
(Miscellaneous & Niche Ideas — utterance extraction), `ai-experiments.md`
(user story generator, writing agent, "ultimate writing LLM prompt").
