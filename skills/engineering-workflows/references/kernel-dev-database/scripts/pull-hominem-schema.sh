#!/usr/bin/env bash
# Pull live Hominem PostgreSQL schema + row-count snapshots.
# This reads live state, never migration files.
set -euo pipefail

HOMINEM_DATABASE_URL="${HOMINEM_DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:5434/hominem}"
OUT_DIR="${OUT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/snapshots}"
TS="$(date +%Y%m%d_%H%M%S)"
HOMINEM_SOURCE='<redacted Postgres URL>'
HOMINEM_OUT="$OUT_DIR/hominem_${TS}.md"

mkdir -p "$OUT_DIR"

{
  echo "# Hominem schema snapshot"
  echo
  echo "Source: \`$HOMINEM_SOURCE\`"
  echo "Pulled: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo

  for schema in app auth public ops; do
    echo "## Schema \`$schema\`"
    echo

    tables="$(psql "$HOMINEM_DATABASE_URL" -Atqc "
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = '$schema' ORDER BY table_name;
    ")"

    if [[ -z "$tables" ]]; then
      echo "_(no tables)_"
      echo
      continue
    fi

    while IFS= read -r t; do
      [[ -z "$t" ]] && continue
      count="$(psql "$HOMINEM_DATABASE_URL" -Atqc "SELECT COUNT(*) FROM \"$schema\".\"$t\";" 2>/dev/null || echo "?")"
      cols="$(psql "$HOMINEM_DATABASE_URL" -Atqc "
        SELECT string_agg(column_name || ' ' || data_type, ', ' ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = '$schema' AND table_name = '$t';
      ")"
      echo "### \`$schema.$t\` ($count rows)"
      echo
      echo "$cols"
      echo
    done <<< "$tables"
  done
} > "$HOMINEM_OUT"

echo "Wrote $HOMINEM_OUT"
