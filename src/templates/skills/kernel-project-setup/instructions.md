Get an existing project running on your local machine.

## Prerequisites

Before cloning:

- Bun installed (`curl -fsSL https://bun.sh/install | bash`)
- Docker Desktop running (for local infrastructure)
- Git with SSH key configured
- Access to any private registries

## First-Time Setup

```bash
git clone git@github.com:<org>/<repo>.git && cd <repo>

# Install dependencies — always from monorepo root, never from a package subdirectory
bun install

# Configure environment
cp .env.example .env.local
# Fill in required values — see README or team secrets manager

# Start local infrastructure and apply migrations
docker compose up -d
bun run db:migrate
bun run db:seed   # if available

# Verify everything works before starting dev
bun run typecheck && bun run build && bun test

bun run dev
```

## Environment Variables

- `.env.example` — committed, contains all required keys with placeholder values
- `.env.local` — gitignored, contains actual secrets
- Never commit `.env.local` or any file with real credentials
- Secrets live in the team's designated secrets manager (1Password, Doppler, etc.)

## Monorepo Workflow

```bash
bun install                              # install all packages from root
bun run --filter @your-org/api dev      # run dev in a specific workspace
bun run --filter '*' typecheck          # run typecheck across all workspaces
```

## Daily Workflow

```bash
git pull origin main
bun install           # pick up any new packages
bun run db:migrate    # apply any new migrations
bun run dev
```

Before pushing:

```bash
bun run typecheck && bun run lint && bun test
```

## Health Diagnostics

Run in order. Stop at the first failure — later checks depend on earlier ones passing.

| Area         | Command                                                                      | Healthy signal                                  |
| ------------ | ---------------------------------------------------------------------------- | ----------------------------------------------- |
| Runtime      | `bun --version`                                                              | Returns a version ≥ 1.0                         |
| Docker       | `docker compose ps`                                                          | All infrastructure services show "Up (healthy)" |
| Dependencies | `bun install --frozen-lockfile`                                              | Exits 0 with no warnings                        |
| Environment  | `diff <(grep -oP '^[A-Z_]+' .env.example) <(grep -oP '^[A-Z_]+' .env.local)` | No missing keys                                 |
| Type check   | `bun run typecheck`                                                          | Exits 0                                         |
| Build        | `bun run build`                                                              | Exits 0, output in `dist/`                      |
| Tests        | `bun test`                                                                   | All pass                                        |
| Lint         | `bun run lint`                                                               | Exits 0                                         |

**Report format:** `healthy` | `degraded (specific issues)` | `broken (remediation steps)`.

If broken, run the "Resetting a Broken Environment" steps below before further diagnosis.

## Cleaning Up

Targets: `dist/`, `.vite/`, `.turbo/`, `node_modules/.cache/`, `*.tmp`, `*.log`

```bash
rm -rf dist .vite .turbo node_modules/.cache
bun run build   # verify build still works
```

## Resetting a Broken Environment

```bash
docker compose down -v        # stop containers and destroy local data volumes
rm -rf node_modules
bun install
docker compose up -d
bun run db:migrate && bun run db:seed
bun run dev
```

## Guardrails

- Never install from a package subdirectory in a monorepo — always from root
- Never commit `.env.local` or real credentials
- Document any non-obvious setup step immediately in the README
- If setup takes more than 15 minutes, something is missing from the docs — fix it first
