---
name: kernel-write
license: MIT
kind: skill
tags:
  - docs
  - writing
  - workflow
  - planning
  - content
description: >
  A strict, stage-based writing pipeline for content — intake, direction, draft,
  critique, edit, approve, transform — where a frozen essay is the single source
  of truth for derived X posts, TikTok clips, and video scripts. Also covers
  standalone writing artifacts: documents, dossiers, transcripts, and workshops.
when:
  - user wants a Monotone essay (300–800 words) from raw notes
  - user wants to extract an X post or TikTok clips from an essay
  - user wants a short-form video script or production plan
  - user wants a project, product, or studio document drafted or restructured
  - user wants a business dossier or selected business-plan sections
  - user wants a transcript or messy conversation turned into a research document
  - user wants a workshop agenda, facilitation plan, or working session designed
  - user invokes /kernel-write
outputs:
  - Finished, opinionated output per the selected stage or artifact contract
termination:
  - Pipeline: all applicable stages run in order with their gates passed
  - Standalone artifacts follow their own workflow
allowedTools:
  - Read
  - Write
argumentHint: the source material and desired output
---

# Kernel Write — Writing Pipeline

A strict, stage-based writing workflow. The content pipeline treats the essay as
the trunk: X posts, TikTok clips, and video scripts are derived only from the
approved essay — never from raw notes.

## Content Pipeline

Content moves through seven stages. Do not skip stages. Each gate must pass
before the next stage.

| # | Stage | Action | Load | Gate |
|---|---|---|---|---|
| 0 | **Intake & Canon** | Classify source, load voice | `references/stages/intake.md` | source identified, canon loaded |
| 1 | **Direction** | Lock claim + metaphor | `references/stages/direction.md` | one claim, one concrete metaphor |
| 2 | **Draft** | Write the essay | `references/stages/draft.md` | filled, 300–800w, no headers |
| 3 | **Critique** | Review against the style contract | `references/stages/critique.md` | findings cite the rules they violate |
| 4 | **Edit** | Apply findings only | `references/stages/edit.md` | every finding addressed |
| 5 | **Approve** | Version + freeze the essay | `references/stages/approve.md` | essay frozen |
| 6 | **Transform** | Derive X post, TikTok clips, video script | `references/stages/transform.md` → `references/extract-posts.md`, `references/video.md` | derived artifacts self-contained |

## Standalone Artifacts

Writing outside the content pipeline, each with its own workflow:

| Artifact | Load |
|---|---|
| **Document** | `references/doc/doc.md` |
| **Dossier** | `references/dossier/dossier.md` |
| **Transcript** | `references/transcript/transcript.md` |
| **Workshop** | `references/workshop/workshop.md` |

## Workflow

1. Classify the request: content pipeline or standalone artifact? Explicit instruction overrides inference.
2. Content pipeline: run stages 0→6 in order, gates between each.
3. Standalone: load the artifact's workflow and follow it.
4. Voice rules come from `kernel-voice`; the Monotone foundation lives in `references/voice-foundation.md`.

## Quality Bar

- Prefer concrete decisions, open questions, risks, and next actions over generic description.
- Preserve useful frontmatter conventions and relative links.
- Mark unsupported facts as `TBD` instead of inventing details.
- Write in a practical studio voice: direct, sharp, plainspoken, and specific.
- Do not over-polish personal notes; do polish client-facing, portfolio, proposal, and strategy output.
