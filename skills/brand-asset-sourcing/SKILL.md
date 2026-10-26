---
name: brand-asset-sourcing
description: "Source brand logos and icons into a project with a manifest."
license: MIT
metadata:
  author: Charles Ponti (charlesponti), Hermes Agent
  version: "0.1.0"
  platforms: [macos, linux]
  hermes:
    tags: [brand, logos, assets, manifest, sourcing]
    related_skills: [file-organization, kernel-audit-integration-security]
---

# Brand Asset Sourcing

Source logos/icons for the brands named in a project's data, place them in the repo, and record a machine-readable manifest mapping source strings to files.

## When to Use

- A project needs brand logos/icons rendered from data (flights, providers, vendors, partners).
- You are asked to "find the logos of all the X mentioned."
- Preparing a UI that shows a brand mark next to a name.

Don't use for generated art (use image generation skills) or for auditing an existing image library (use `reference-image-library`).

## Prerequisites

- `git`, `curl`, `python3` available via `terminal`.
- Network access to the chosen source.
- A target directory in the project, conventionally `logos/` or `assets/logos/`.

## Procedure

1. **Inventory brand strings.** Extract the distinct values from data/code (e.g. `carrier` fields). Preserve the raw strings, including compound values such as "Qantas; Delta codeshare" or "WestJet, marketed by Delta".
   - Completion: a sorted list of every distinct raw string.

2. **Resolve each raw string to one or more canonical brands.** Split compound strings on `;`, `,`, or "marketed by"/"codeshare" markers. Keep a mapping from raw string → brand list.
   - Completion: no raw string left unmapped; compound strings map to multiple brands.

3. **Choose a source per brand class.** Prefer vector (SVG) sources that scale; fall back to raster banners for full wordmarks. Verify license/fair-use terms.
   - Completion: one source chosen per brand with a stated reason.

4. **Verify file naming before downloading.** Query the source's index/API rather than guessing paths (e.g. GitHub contents API). Confirm every brand resolves.
   - Completion: all target brands present in the source index.

5. **Download one file per brand.** Use deterministic filenames based on a stable slug (`<brand-slug>.svg`, plus `<brand-slug>-icon.svg` when a separate mark exists). Reuse one file for brand variants (e.g. "Norwegian Air" and "Norwegian Air UK" → same logo).
   - Completion: files exist for every unique brand; no duplicate bytes under different names.

6. **Write a manifest** (`logos.json` or `assets/logos.json`) mapping each raw source string to its brand(s), slug, identifiers (IATA/ICAO for airlines), and relative file paths.
   - Completion: manifest parses as JSON and covers every raw string from step 1.

7. **Validate.** Parse every SVG as XML; check raster dimensions are usable (≥ 64 px on the short side for icons); report counts.
   - Completion: validation passes or failures are reported with the offending file.

8. **Report.** Give counts (raw strings, unique brands, files), source, and the manifest path. Keep it short.

## Pitfalls

- Compound brand strings are not one brand; resolve them before downloading or you will miss secondary brands.
- Source repositories often key files by ICAO, not IATA (or by slug, not display name). Verify via the API; do not assume.
- A source's `logo.svg` may be a square wordmark and `icon.svg` a separate mark. Pick the variant that matches the rendering size; do not assume they are interchangeable.
- Third-party SVGs are untrusted markup. Validate XML and inspect for embedded scripts/styles before rendering them in an app.
- Non-target carriers (rail, bus, ferry) often appear in travel data. Exclude them unless the user asks for all carriers.
- Reuse one logo for brand variants instead of duplicating files.

## Verification

- [ ] Distinct raw strings enumerated.
- [ ] Every raw string mapped in the manifest.
- [ ] All unique brands have a file.
- [ ] SVGs parse as XML; raster dims acceptable.
- [ ] Manifest is valid JSON.
- [ ] Report includes counts and paths.
---

References: airline-specific sources and identifier mappings live in `references/airline-sources.md`.