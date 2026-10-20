# Secrets, user data, telemetry, auth, databases, APIs

## Secrets
- **Never print or commit** `.env`, `.env.*`, keys or tokens. Not in logs, PR text, chat or tests.
- A shipped build carries no shared key. Each person signs in and gets a key of their own; the build
  script fails if it finds one. Keep real keys out of builds that do not need them.
- Do not repeat the same warning once he has acknowledged it. (Thames: the `.env.testflight` key
  note is dropped. Still never print or commit the key.)

## User data
- Say where each piece of data lives and who can read it.
- On-device data is protected, excluded from backups where it should be, and cleared on sign-out.
- Searching the person's own data stays local; the query goes nowhere.
- Removal is easy and can be undone briefly. Nothing is learned that the person cannot see and delete.
- Server-side cleanup (dedupe, merge) must stay reconcilable with the device: keep the periodic
  reconcile that lets a worker delete safely.

## Telemetry and crash reports
- Content-free only: closed enums and numbers. **Never add a free string field** to an event.
- Never upload transcripts or conversation logs.
- Default on for TestFlight, off for the App Store until switched on; show a report in full before
  it is sent.

## Auth
- One authority for sessions (Better Auth in Hominem). No custom JWT or session code next to it.
- Email-code or passkey flows; browser traffic uses public URLs, server calls the private ones.
- After changing auth config or deployment topology, run the repo's production verify step.

## Databases (Postgres)
- Production-safe evolution: Goose migrations, Kysely, expand/contract, backfills as separate steps.
- Repository and DTO boundary; ownership-scoped mutations.
- After any schema change: migrate local and test databases, then regenerate types.
- Load the repo's database skill before touching schema or repositories. Backups before anything
  destructive; ask before it.

## APIs and boundaries
- Validate at the edge with a schema; return typed errors. No trusting the client.
- Reply costs, rate limits and paid calls are visible in code and docs; say what a live test costs.
- Models and vendors: keep the model list in one place, check live model availability and
  deprecation dates before choosing, and prefer cheap fast defaults. Never an Anthropic model in
  Thames's picker (word, 2026-10-13). A saved choice that is no longer listed falls back to the
  default.

## Dev services
- You may start local dev services (Metro, `pnpm dev`, API, workers, databases, Docker) to verify a
  change. Confirm before asking him to run anything with `sudo`.
- Fixed-port and proxied services differ (`localhost:4040` vs `https://api.lvh.me`); an
  unauthenticated 302 to hosted login is not a service failure.
- A stale running process can load mismatched dependencies; restart it before blaming the code.
