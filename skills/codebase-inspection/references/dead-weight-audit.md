# Dead-weight audit: what can actually be removed

Use when someone asks what in a repo no longer earns its place. The output is a ranked list with
evidence, not a cleanup spree: most "unused" findings are wrong, and a wrong deletion costs more than
the dead line it saved.

## Procedure

1. **Inventory before looking for dead code.** File count and bytes per area answers "is this even a
   size problem" without reading a file:

   ```bash
   git ls-files | awk -F/ '{area = (NF>1 ? $1"/"$2 : "(root)"); n[area]++} END {for (a in n) print n[a], a}' | sort -rn
   ```

2. **Build the import graph before trusting any analyzer.** For every source file, count inbound
   references from other sources. A file with zero inbound imports is a candidate; everything else is
   not, whatever the tool says. Exclude entrypoints by nature: framework route files, configs
   (`vite.config.ts`, `drizzle.config.ts`, `vitest.config.ts`), CLI modules, `*.d.ts`.

   Make the pattern match **any** import extension — `from './x'`, `from './x.js'`, `from './x.svelte'`,
   `import('./x')`. A regex that only allows `.js` reports every component as orphaned.

3. **Run a static analyzer for the classes the import graph cannot see** — unused exports, unused
   dependencies, unused devDependencies (`pnpm dlx knip --reporter compact`). Treat its output as
   _claims_ to verify, never as findings.

   When the analyzer is not installed (the normal case on a fresh clone), measure with `rg` instead —
   and this version also catches the finding the analyzers miss, code a rewrite orphaned while its
   tests carried on passing:

   ```bash
   # per exported symbol: app files that use it vs test files that use it
   for f in $(rg -o --no-filename 'export (?:async )?function (\w+)' -r '$1' src/); do
     printf '%-30s app=%s tests=%s\n' "$f" \
       "$(rg -l "\b$f\b" src --glob '!**/*.test.*' --glob '!**/__tests__/**' | wc -l | tr -d ' ')" \
       "$(rg -l "\b$f\b" --glob '*.{test,spec}.*' | wc -l | tr -d ' ')"
   done

   # generated source that is untracked: invisible on the author's machine, fatal on a fresh clone
   git status --porcelain | grep '^??' | grep -Ei 'routeTree|\.gen\.|generated|schema\.prisma'
   git ls-files | grep -Ei 'routeTree|\.gen\.'    # what the repo actually ships
   ```

   **A type-check that runs before code generation makes every untracked generated file a latent CI
   failure.** `tsc -b && vite build` breaks on a clone where a route tree, Prisma client or similar is
   absent, because a dev run already wrote it locally. Prove it by moving the file aside and re-running
   the type-check, then either track the file or generate before the check in the build script. Prove
   clone reproducibility with `git archive HEAD | tar -x -C /tmp/fresh && ln -s "$PWD/node_modules"
   /tmp/fresh/node_modules`, then run the repo's build gate in `/tmp/fresh`.

4. **Triage by framework convention, not by the analyzer.** The false positives are predictable:

   | Analyzer says                | Usually means                                                                                                                    |
   | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
   | Route/component files unused | The framework resolves them by convention — `+page.svelte`, `+layout.svelte`, `+server.ts`, or a component imported from a route |
   | Exports unused               | Imported by a route loader / form action the analyzer does not parse as a consumer                                               |
   | `tailwindcss` unused devDep  | Consumed by the build plugin (`@tailwindcss/vite`) and a CSS `@import`, not by JS                                                |
   | CSS-only design-system dep   | Imported in a stylesheet (`@import "@scope/ui/styles.css"`) — grep `.css`, not only `.ts`                                        |

   Verify a claimed-unused export by grepping the source tree for the symbol **and excluding the file
   that defines it** — otherwise the definition counts as a use and every export looks live.

5. **Prove a dependency removal by building, not by reading.** A dependency with no import can still be
   load-bearing: a native module has no `import` in the app, but the bundler needs the binding resolvable
   from the app package, so removing it breaks `build` while typecheck and tests stay green. Remove one
   group at a time, then run install → typecheck → build → test; on failure restore that dep and record
   why it stays.

6. **Separate "unused" from "vestigial feature".** Tables, repository methods and tests that only
   reference each other, plus a production call site passing an empty value (`brands: []`), describe a
   feature nobody uses — removing it is a schema migration plus code, not a cleanup, and it is the
   user's product decision. Report it as one ranked item with the call-site evidence.

   When the user says remove it, the deletion spans every layer in one change — contract schema, tables,
   repository methods, parser, the parameter and the branch that consumed it, and their tests — because
   a partial removal leaves a parameter nobody can justify. Then the migration half:

   - **Editing the schema leaves the tables in every existing database.** Generate the migration
     (`drizzle-kit generate`, `prisma migrate dev`) and commit the SQL with the code; an edited schema
     with no migration produces a fresh install that differs from every upgraded one.
   - **Generated SQL assumes a pristine database.** `DROP TABLE x` fails when `x` was already dropped by
     hand or by an earlier ad-hoc statement, and the generator cannot know. Edit the migration to
     `DROP TABLE IF EXISTS` — a fresh install still creates and then drops it, which is why the
     statement stays.
   - **Back up the live database first**, and confirm anything archived out of a table is already
     durable elsewhere before the table goes. Dropping a frozen table is data loss with a friendly
     name.
   - **A failing migration runner is often not about the SQL.** Read the error before editing the file:
     a CLI run under a different Node ABI than the native binding it loads, or a config whose default
     path is relative to the package rather than the repo root, both surface as a migration failure.
     Fix the invocation (explicit runtime, absolute path), not the migration.

7. **Audit the automation too.** A CI workflow that has never passed provides negative value: it hides
   the first real failure. Check run conclusions (`gh run list --limit 5`), read the first failing log,
   and either fix the invocation or delete the check. This is often the highest-value finding in a
   "what can be removed" pass, and it is never a file. The runtime half is the same class: a service
   whose log repeats one failure hundreds of times, or whose supervisor records a non-zero exit code
   between restarts, is a system that stops doing its job quietly —
   `rg -c 'ERROR|crash|Could not acquire|database is locked' logs/ | sort -t: -k2 -nr | head`, then
   `launchctl list | grep <job-label-prefix>` (second column = last exit code).

## Reporting

One table, three columns: the claim, what the source actually shows, the verdict (delete / keep /
needs-migration). Name what you deliberately kept and why — the kept list is what stops the next
session re-running the same analysis.

## Pitfalls

- **Never delete on analyzer output alone.** Every removal needs a grep showing no consumer, or a build
  proving the dependency optional.
- **A green build after a removal is the proof, not the intent.** Run the full pipeline, not just
  typecheck: native bindings and bundler resolution only fail at build or boot.
- **Do not propose deleting archives.** ADRs, completed task files and changelogs are history; dead
  weight means code, deps, configs and stale instructions, not the record of decisions.
- **Tests are not dead code because only tests use them** — but the converse matters more. When the
  _consumer_ was deleted (a rewrite dropped the panel, the route, the caller) and the helper survives
  only in its own tests, the helper and those tests both go: the tests are green evidence of nothing,
  not a reason to keep the code. Distinguish the two by whether the feature still exists; the
  app-versus-tests count in step 3 separates them mechanically. Report source lines and test lines as
  separate numbers either way.
- **A dropped table is not undone by reverting the schema.** Check the migration actually ran against
  the live database (`sqlite3 <db> "select name from sqlite_master where type='table'"`) rather than
  trusting that the command exited 0 on the first attempt.
