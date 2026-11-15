# Skill test status

Tracks functional testing of each top-level skill. Check off as tested.
Store generated review artifacts under the gitignored `qa-output/<skill>/` directory.
Removed skills (`gif-search`, `obsidian`) are not listed.

Updated: 2026-11-15. Tested-good commits already on `main` through `118d5eb6`.

## Tested — PASS

- [x] app-configuration
- [x] computer-workflows
- [x] findmy (path level; live tracking not exercised)
- [x] github
- [x] hermes-gateway-messaging (mechanical; no paired bot)
- [x] llm-wiki
- [x] computer-workflows — disk-space-recovery (note: `du ~/Library` times out, needs scoping)
- [x] node-inspect-debugger
- [x] opencode
- [x] product-price-monitor
- [x] design-workflows: web-designs procedure (linear exercise, headless render)
- [x] design-workflows: tailwind-cdn-static-page procedure (single-file exercise, headless render)
- [x] python-debugpy

## Partially tested

- [ ] writing-workflows (only `llm-structured-extraction` procedure tested; rest untested)

## Untested — workflows

- [ ] design-workflows
- [ ] engineering-workflows
- [ ] security-workflows
- [ ] studio-workflows

## Untested — project tools and preferences

- [ ] ai-video-production (partial; local media checks and one real text-to-video render passed; image-to-video blocked by missing R2 access key ID)
  - [x] `ffprobe` measured-duration math with `ceil((measured+0.5)*2)/2`
  - [x] `ffmpeg` pad and concat place narration and silent scenes in their own shot windows
  - [x] `silencedetect=noise=-35dB:d=0.25` confirms line/silence alignment
  - [x] Live provider schema exposes `supported_durations`, `supported_frame_images`, and `pricing_skus` on all 32 listed models
  - [x] SigV4 presign signature matches `aws s3 presign` for the same fixture request
  - [x] Frame-0/last-frame RMSE logic distinguishes the approved keyframe from later motion on a synthetic clip
  - [x] Dry run displayed a per-shot quote before submission; provider reported $0.42 for the 5-second render
  - [x] Generate and assemble one real 5-second video; verify MP4 streams, duration, and `truncated: no` (artifacts in `qa-output/ai-video-production/`)
  - [x] Add per-scene voiceover, verify audio signal is non-silent, and confirm final assembly is not truncated
  - [x] Final output directory contains exactly `audio.mp3` and `video.mp4` with audio; no intermediates
  - [ ] Generate from a keyframe via R2 presigned HTTPS URL and verify real frame-0/last-frame anchoring (blocked: `R2_ACCESS_KEY_ID` missing)
- [ ] apple-notes
- [ ] apple-reminders
- [ ] architecture-diagram
- [ ] arxiv
- [ ] ascii-video
- [ ] asset-and-cost-ledger
- [ ] baoyu-infographic
- [ ] blocked-page-recovery
- [ ] box
- [ ] ccusage-data-export
- [ ] claude-code
- [ ] claude-design
- [ ] codebase-inspection
- [ ] codex
- [ ] competitor-news-monitor
- [ ] computer-use
- [ ] design-md
- [ ] docs-curation
- [ ] document-to-action-items
- [ ] docx
- [ ] dogfood
- [ ] email-inbox-triage
- [ ] git-history-purge
- [ ] google-workspace
- [ ] grounded-citations
- [ ] himalaya
- [ ] humanizer
- [ ] imessage
- [ ] inspecting-hermes-desktop-dom
- [ ] linear-tickets
- [ ] local-services-tailnet
- [ ] apple-workflows — macos-distribution
- [ ] apple-workflows — macos-app
- [ ] manim-video
- [ ] maps
- [ ] meeting-action-items
- [ ] node-service-observability
- [ ] notion
- [ ] on-device-inference-cost
- [ ] online-shopping
- [ ] openrouter-image-generation
- [ ] p5js
- [ ] pdf
- [ ] ponti-principles
- [ ] powerpoint
- [ ] python-package-release
- [ ] reference-image-library
- [ ] requesting-code-review
- [ ] sdlc-review
- [ ] seme-development
- [ ] ship-ios
- [ ] simplify-code
- [ ] skill-library-maintenance
- [ ] songsee
- [ ] songwriting-and-ai-music
- [ ] spec-conformance-alignment
- [ ] spike
- [ ] studio-dashboard
- [ ] studio-dev
- [ ] subsystem-removal
- [ ] apple-workflows — swift-package
- [ ] systematic-debugging
- [ ] tanstack-start-shadcn
- [ ] teams-meeting-pipeline
- [ ] test-driven-development
- [x] animated-presentation (demo.sh E2E: all gates pass, MP4+captions+metadata)
- [ ] typescript-sqlite
- [ ] uber-eats
- [ ] weekly-review-planning
- [ ] xlsx
- [ ] youtube-content
