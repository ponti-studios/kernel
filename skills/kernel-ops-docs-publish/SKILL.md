---
name: kernel-ops-docs-publish
description: "Coordinates documentation publishing as release media: video, optional slides, metadata, and YouTube publication. Use when a feature, release, or workflow needs documentation artifacts prepared, published, and verified as part of the documentation system."
license: MIT
compatibility: Video-first documentation workflows published to YouTube.
metadata:
  author: project
  version: "1.0"
  category: Documentation
  tags:
    - docs
    - documentation
    - release
    - video
    - content
when:
  - a feature or release needs documentation published
  - a workflow needs a video walkthrough or explainer as the primary documentation artifact
  - slides or supporting media need to accompany a documentation release
  - a documentation package needs to be published, linked, or verified on YouTube
applicability:
  - Use for documentation publishing workflows where video is the primary artifact
  - Use when documentation must be coordinated as a release package rather than a prose page
termination:
  - Required documentation artifacts are identified
  - Video and supporting artifacts are published or queued for publication
  - Published metadata, links, and release packaging are verified
outputs:
  - Documentation publishing plan
  - Published or queued YouTube documentation artifact
  - Release package checklist with verification status
disableModelInvocation: true
---

Publish documentation as media. This skill owns the documentation release package: video-first artifacts, optional slides, publishing metadata, YouTube release steps, and verification.

It does not replace the craft skills used to make the artifacts. Use `kernel-write-video` for script and production-plan work. Use the appropriate slides/deck workflow when slides are required.

## Non-Negotiables

- Documentation is published as media, not as a doc site.
- Video is the default primary artifact.
- Supporting artifacts such as slides, release notes, or links must be packaged around the published video when required.
- Publishing is not complete until metadata, destination, and links are verified.

## Required Workflow

1. Identify the documentation goal: feature walkthrough, release explanation, onboarding flow, or operational guide.
2. Determine the required artifact package:
   - video
   - optional slides
   - title, description, tags, timestamps, and link metadata
   - release notes or supporting links if needed
3. If the video script or production plan does not exist, route that work to `kernel-write-video`.
4. If slides are required, route that work to the appropriate slides/deck workflow.
5. Assemble the publishing package for YouTube:
   - final title
   - final description
   - link destinations
   - thumbnail or visual assets if required
   - ordering within the release package
6. Publish or queue the artifact.
7. Verify the published result:
   - correct video
   - correct metadata
   - correct links
   - correct visibility / release state

## Artifact Rules

- The video should explain the real workflow or feature clearly enough to serve as documentation.
- Slides are supporting artifacts, not the primary system of record, unless the release explicitly requires them.
- Metadata must make the artifact discoverable and understandable without extra context.
- Links must point to the correct release, product, or supporting material.

## Guardrails

- Never route documentation work into a doc-site workflow when the system of record is media publication.
- Never treat a raw recording as complete documentation without publishing metadata and verification.
- Never publish the wrong visibility, stale links, or misleading titles/descriptions.
- Never claim a documentation release is done until the published artifact can actually be found and consumed in its intended destination.
