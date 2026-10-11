---
name: inbox-triage
description: Route raw inbox captures to their permanent vault homes. Use for triaging or emptying inboxes; do not use for deep extraction from a long source.
license: MIT
when:
  - routing raw inbox captures to permanent vault homes
  - triaging or emptying inboxes
outputs:
  - each inbox item routed to its canonical home with metadata updated
termination:
  - every item has a canonical home or is preserved for write-notes
  - no material is silently discarded and routed items are removed from inbox
argumentHint: the inbox item or batch to triage
---

# Inbox Triage

Process one item at a time into the existing canonical home. Preserve a long or multi-topic capture for `write-notes`; do not silently discard material. Update the destination's metadata according to vault canon, then remove only the routed inbox item.

## Canon (inlined)

Migrated from `Documents/agents/canon/` — read the applicable file before acting:

- `references/canon-maintenance-contract.md`
