# Author and maintain agent skills

Start from a demonstrated task, user correction, domain contract, or working
procedure. Add only guidance that changes an agent's decisions. Prefer extending
an existing coherent package over adding another discovery entry.

## Choose the source

Inspect the target library's contribution and installation rules. Edit canonical
source rather than an installed copy. Kernel procedures live beneath a domain
router; independently installed Kernel packages must appear in skills.sh.json.
Project-specific commands and contracts belong in that project unless they are
actually shared. A tool named skill_manage may write to an agent profile rather
than the repository: inspect its documented target before using it.

## Structure

Keep a concise name and description in the discoverable SKILL.md. The description
states the capability and when it applies. Keep essential constraints and a
selection index in the body. Place substantial procedures in linked references,
executable helpers in scripts, and output templates/assets beside their consumer.
Use ordinary Markdown references, not additional nested SKILL.md entrypoints.

Preserve domain schemas, non-obvious failure modes, and operational invariants.
Remove generic tutorials, repeated checklists, historical anecdotes without an
active consequence, and unsupported universal rules. Separate observed facts,
user preferences, defaults and hypotheses. Current user instructions and target
repository rules take precedence over defaults.

## Portability

Resolve bundled resources relative to their package or script. Expose genuine
user-data locations through documented configuration. Bundle required runtime
code so an independently installed package works without a sibling checkout.
Avoid symlinks and hidden dependencies on another installed skill. Kernel's
shared runtime copies are generated from runtime/ and verified for equality.

## Validation

Use the target library's structural checks and available format validator. Test
new executable behavior with representative inputs and failure paths. Copy the
package to an isolated directory and exercise its entrypoint without the source
checkout. Inspect the resulting artifacts rather than relying solely on a green
format check. Do not make paid calls or publish content merely to validate format.

Before replacing an install, compare it with source and preserve intentional
installed-only improvements. Use the supported installer for installation and
removal so its agent links and source records remain consistent. Check the
installed bytes and the agent's actual discovery result afterward.

Format reference: https://agentskills.io/specification
Authoring guidance: https://agentskills.io/skill-creation/best-practices
