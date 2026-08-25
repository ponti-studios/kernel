# License notes

This skill consolidates three sources. Each retains its original license.

| Content | Source | License |
|---|---|---|
| `SKILL.md` router, mode structure | Original kernel work | MIT |
| `reviews/`, `plays/`, `agents/`, `templates/` | Vendored from an OWASP-aligned code-security skills plugin | CC-BY-4.0 (per-file frontmatter carries the license) |
| `audit-methodology/` | Vendored from [cloudflare/security-audit-skill](https://github.com/cloudflare/security-audit-skill) at commit `8bac42001ddd90a4dcd8d5a5045199283a8eba75` | MIT |
| `data/asvs`, `data/masvs`, `data/mastg` | OWASP standard datasets (ASVS v5.0, MASVS, MASTG) | Per OWASP project licensing (CC-BY-SA unless noted in each README) |
| `data/fiasse`, `data/secure-code-prompts` | FIASSE SSEM reference material | See bundled files |

Upstream pins for re-syncing are recorded in `SECURITY-SKILLS.lock.json` at the repository root of the consumer's install (`cloudflare-security-audit.mergedInto` points here).

Local modifications made during consolidation:

- Renamed nested `skills/` to `reviews/`; updated relative references.
- Repointed upstream plugin paths (`plugins/code-security-skills/...`) to local equivalents.
- Merged the offensive-audit methodology into this router as Mode 2.
