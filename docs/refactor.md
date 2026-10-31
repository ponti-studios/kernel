# Kernel refactor review

Completed locally on 2026-10-31. Canonical changes are in this worktree; the global
Codex installation uses this local source. Publication to GitHub is separate.

## Requirements and evidence

| Requirement | Implemented result | Evidence |
| --- | --- | --- |
| Reduce discovery cost | 60 top-level skills became six domain routers and three independent project/preference packages | skills.sh.json; installer discovery reports exactly nine |
| Keep all writing together | Documents, essays, master scripts, derivatives, written scenes, interface copy, dossiers and Studio communications route through writing-workflows | writing entrypoint; moved procedures; independent representative-request review |
| Reserve Studio for production | Recording/rendering/assembly, physical production, canon, costs and operational state remain in Studio | Studio entrypoint and writing handoffs |
| Preserve useful expert material | Detailed procedures, schemas, datasets, scripts and fixtures are bundled beneath the router | all 60 former names mapped; original resource audit accounts for all files |
| Remove pointless and contradictory guidance | Repeated discovery/output sections, obsolete authoring recipes, unused TTS helper, plugin discovery metadata and stale paths removed or corrected | source changes; corrections summarized below |
| Self-contained installation | Shared runtime has one source and generated package copies; no nested discoverable skills, symlinks or links escaping the package | bundle equality check; structure/format validators; isolated package execution |
| Preserve functioning scripts | Writing/runtime/canon/ledger test suites run from isolated copies; real podcast CLI startup checked; segment traversal regression added | check_isolated_packages.py; eight validator tests; 126-script syntax pass before unused helper removal |
| Keep catalog and docs consistent | README and contribution rules describe current packages, ownership and checks | catalog parity; format validation for all nine packages; git diff --check |
| Migrate consumers | Nine canonical packages installed through npx skills; obsolete global names removed; source audit clean | installed audit: nine installed/locked, zero drift, stale entries, collisions or unprovenanced packages |
| Check project consumers | Six project locks use only retained ship-ios and studio-dev entrypoints; both installed entrypoints exist | project-consumers.json |

## Content decisions

Specialist detail loads on demand from WORKFLOW.md references. The three retained
standalone packages have concrete purposes: ponti-principles carries personal
preferences; ship-ios and studio-dev are invoked by existing project automation.
The shared Studio runtime is implementation support rather than another visible skill.

Removed 70 repeated discovery/output sections. Rewrote skill authoring around
canonical source, progressive loading, portability and meaningful evidence.
Corrected automatic commit/push/device-install instructions, unrelated-failure
scope expansion, forced Desktop writes and overwrites, blanket prototype gates,
unconditional migration ordering and rollback, unsupported module overrides,
provider-specific auth/database defaults, stale model/price recommendations,
unsafe live SQLite relocation and resume-specific receipt matching.

Writing now owns interface copy and Studio documentation, emails, marketing and
requirements. Physical dossier writing is separate from physical production
decisions. Production consumes approved text and sends text revisions back to
writing. Current user instructions and repository contracts take precedence.

Security material retains upstream attribution in LICENSE-NOTES.md and
UPSTREAM-PLUGIN.json. Dataset license and provenance files remain bundled.
Directory aliases became explicit internal references rather than symlinks.

## Independent behavioral review

The independent read-only review covered approved social posts, readiness-only
assessment, a login fix with another auth provider, interface error copy, receipt
consolidation and podcast production. It confirmed the domain routing and found
six defects. All were corrected: podcast startup import, path-traversing/duplicate
segment IDs, invalid social preflight example, readiness completion scope,
unsupported podcast overrides and receipt discovery criteria. Added regressions
exercise the actual podcast CLI and untrusted segment IDs.

## Resource accounting

Compared every original tracked resource with its mapped destination: 902 remain
at mapped paths. The other 16 paths are accounted for as follows:

- Five former per-skill UI metadata files removed because those procedures are
  no longer independently callable.
- One obsolete authoring companion removed after its useful guidance was merged.
- One plugin manifest moved to UPSTREAM-PLUGIN.json for attribution.
- Three dataset directory symlinks replaced with direct references.
- One unused TTS helper removed; maintained media procedures cover its capability.
- Five Studio document/communication references moved into writing-workflows.

## Verification scope

Structural validation, shared-resource equality, eight validator tests, all nine
format checks and isolated writing/Studio tests pass. Original runtime tests used
mocked providers; the new podcast regression also passes. No paid model generation,
App Store upload, live database migration or device deployment was performed.
Those actions are not needed to validate the package refactor. Instruction quality
was reviewed against actual procedures and representative requests; no finite test
suite can establish that every future task will route or execute correctly.

The local worktree is uncommitted and unpublished. Existing project lock versions
were preserved because their package names and executable entrypoints remain
available; consumers pull a published update explicitly when appropriate.

## Guidance used

- https://agentskills.io/specification
- https://agentskills.io/skill-creation/best-practices

Use concrete domain expertise and progressive disclosure. Keep defaults scoped,
resources portable and the user's requested outcome authoritative.
