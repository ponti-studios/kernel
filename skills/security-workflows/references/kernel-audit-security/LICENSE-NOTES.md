# License notes

This skill consolidates three sources. Each retains its original license.

| Content | Source | License |
|---|---|---|
| `WORKFLOW.md` router, mode structure | Original kernel work | MIT |
| `reviews/`, `plays/`, `agents/`, `templates/` | Vendored from an OWASP-aligned code-security skills plugin | CC-BY-4.0, Chris Maenner; see [upstream attribution](UPSTREAM-PLUGIN.json) |
| `audit-methodology/` | Vendored from [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) at commit `8bac42001ddd90a4dcd8d5a5045199283a8eba75` | MIT |
| `data/asvs`, `data/masvs`, `data/mastg` | OWASP standard datasets (ASVS v5.0, MASVS, MASTG) | Per OWASP project licensing (CC-BY-SA unless noted in each README) |
| `data/fiasse`, `data/secure-code-prompts` | FIASSE SSEM reference material | See bundled files |

The offensive-audit revision is pinned above. The review plugin's retained
upstream metadata is [UPSTREAM-PLUGIN.json](UPSTREAM-PLUGIN.json). Other dataset
provenance and licenses remain in their bundled README files. Do not assume a
consumer has a separate SECURITY-SKILLS.lock.json file.

Local modifications made during consolidation:

- Renamed nested `skills/` to `reviews/`; updated relative references.
- Repointed upstream plugin paths (`plugins/code-security-skills/...`) to local equivalents.
- Merged the offensive-audit methodology into this router as Mode 2.

- Converted nested skill entrypoints to WORKFLOW.md references and preserved attribution here.
