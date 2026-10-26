# Airline logo sources

## Preferred vector source

- Repo: `Jxck-S/soaring-symbols` (GitHub)
- Assets: `assets/<slug>/{logo,icon,logo-mono,icon-mono}.svg`
- Coverage: major and regional carriers; wordmark + mark variants.
- License: MIT.

## Raster fallback (full wordmarks/banners)

- Repo: `Jxck-S/airline-logos` (GitHub)
- Assets: `<source>_logos/<ICAO>.png` and `<source>_banners/<ICAO>.png`
- Useful sizes: `radarbox_banners` ≈ 500×77 px; `fr24_banners` ≈ 150×23 px; `radarbox_logos`/`flightaware_logos` ≈ 70–90 px square.
- Verify presence with the GitHub contents API; keys are ICAO, not IATA.

## Common identifier mappings

| Carrier | IATA | ICAO | Soaring Symbols slug |
|---|---|---|---|
| American Airlines | AA | AAL | american-airlines |
| British Airways | BA | BAW | british-airways |
| Delta | DL | DAL | delta-air-lines |
| Iberia | IB | IBE | iberia |
| Icelandair | FI | ICE | icelandair |
| JetBlue | B6 | JBU | jetblue-airways |
| Jetstar Airways | JQ | JST | jetstar |
| Norwegian Air | DY | NOZ | norwegian-air-shuttle |
| Norwegian Air UK | DI | NRS | norwegian-air-shuttle (reuse) |
| Qantas | QF | QFA | qantas |
| Ryanair | FR | RYR | ryanair |
| United Airlines | UA | UAL | united-airlines |
| Virgin Australia | VA | VOZ | virgin-australia |
| Volotea | V7 | VLG | volotea |
| WestJet | WS | WJA | westjet |
| easyJet | U2 | EZY | easyjet |

## Notes

- Compound carrier strings in flight data ("Qantas; Delta codeshare", "WestJet, marketed by Delta") resolve to multiple brands; download each brand once.
- Rail carriers (Amtrak, Acela) are not airlines; exclude unless requested.
- Soaring Symbols `logo.svg` files are square wordmarks (viewBox 0 0 64 64); `icon.svg` is the 24×24 mark where present. Not every carrier has an icon variant.