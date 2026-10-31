# Working on Kernel

Kernel is the canonical source of the skills installed from ponti-studios/kernel.
The catalog exposes six domain routers plus ponti-principles and the executable
project integrations ship-ios and studio-dev. Consumers pull updates explicitly.

## Authoring

Extend a relevant domain router with a procedure under
`references/<procedure>/WORKFLOW.md`. Give the entrypoint a short description and
a meaningful selection index. Keep detailed schemas, examples and resources
beside the procedure. Do not add nested SKILL.md files or symlinks: they create
extra discovery entries or unsafe packages. A separate top-level package needs
a concrete independent installation use and a skills.sh.json catalog entry.

All writing belongs to writing-workflows, including documentation, scripts,
social derivatives, podcast copy and written scenes. Studio-workflows owns
non-writing production and operations. Procedures consume approved writing;
text revisions return to writing-workflows.

Keep domain expertise and demonstrated failure modes. Remove generic advice,
duplicated rules, stale machine paths and historical anecdotes without an active
consequence. Current user instructions and target repository rules precede
Kernel defaults. A workflow does not grant new authorization for external actions.

## Runtime

Maintain shared generation code in runtime/. Run
`python3 scripts/bundle_runtime.py` to rebuild copies bundled into independently
installable writing and Studio packages. Do not edit those copies directly.
Resource and import paths must resolve inside an installed package. Generated
runtime copies are intentional distribution resources, not disposable output.

## Validation

After a change, run the checks relevant to it. Before publication:

```sh
python3 scripts/bundle_runtime.py --check
python3 scripts/validate_skills.py
python3 -m unittest discover -s tests
python3 scripts/check_isolated_packages.py
muse skills validate skills/<changed-package> --json
```

The structure validator checks catalog parity, names, metadata limits, links,
nested entrypoints and symlinks. The format validator checks packaging. Isolated
checks copy each generation package outside the repository, exercise its runtime
tests and entrypoints, and use mocked providers rather than paid generation.
These checks do not replace review of instruction quality or intended routing.

Keep README, skills.sh.json and docs/refactor-map.json consistent with moves.
Runtime changes trigger CI checks as well as skill changes.

## Publication and consumers

Changes to main are the published source. Validate first. Commit and push only
within the user's authorization; preserve unrelated working changes. Follow the
repository's direct-main convention when publishing an authorized change.

Install through npx skills, using only the packages each consumer needs. Review
installed-only modifications before replacing an install. Catalog renames are
breaking changes: install replacements explicitly and remove obsolete names
through the installer so agent links and source records are reconciled.

Project release automation can keep ship-ios and studio-dev pinned separately.
Resolve installed helpers from the consuming repository or explicit paths;
never require a particular Kernel checkout location.
