#!/bin/bash
# Fails unless an app carries a team-anchored designated requirement — the property that decides whether a
# customer's Accessibility and Microphone grants survive the next update.
#
# A permission grant binds to the app's designated requirement, not to its name, its path or its bundle id.
# A requirement naming the team
#
#     identifier "com.example.app" and anchor apple generic and certificate leaf[subject.OU] = TEAM
#
# is satisfied by every build that team ever signs. Two other arrangements look fine in `codesign -dv` and
# are not:
#
#   * an ad-hoc signature (`--sign -`) gets a bare cdhash, a new one every build;
#   * a development certificate's requirement adds the development marker (…100.6.2.12) that a Developer ID
#     build does not carry, so alternating between the two clears every grant, each way.
#
# In both cases System Settings keeps showing the toggle as ON while it applies to nothing, so the symptom
# is not a prompt — it is a feature silently degrading (auto-paste becomes a copy, and so on).
#
#   scripts/check-signature.sh /Applications/MyApp.app [TEAM_ID]
#
# Wire it in as a warning on the dev build path and as a refusal on the packaging path.
set -euo pipefail

APP="${1:?usage: check-signature.sh <app> [team id]}"
[ -e "$APP" ] || { echo "error: no such app: $APP" >&2; exit 1; }

# The team is read from the app itself when not supplied, so nothing here hardcodes one project.
TEAM="${2:-}"
if [ -z "$TEAM" ]; then
  TEAM="$(codesign -dv --verbose=4 "$APP" 2>&1 | sed -n 's/^TeamIdentifier=//p' | head -1)"
fi

REQ="$(codesign -d -r- "$APP" 2>&1 | grep -i '^designated' | sed 's/^designated => //' || true)"
echo "    requirement: ${REQ:-none}"

[ -n "$REQ" ] || { echo "error: $APP has no designated requirement — it is not properly signed." >&2; exit 1; }

if ! grep -q "anchor apple generic" <<<"$REQ"; then
  echo "error: $APP is ad-hoc signed. Its requirement is a per-build hash, so every rebuild invalidates the" >&2
  echo "       Accessibility grant while the pane still shows it on." >&2
  exit 1
fi

if [ -n "$TEAM" ] && ! grep -q "$TEAM" <<<"$REQ"; then
  echo "error: $APP's requirement does not name team ${TEAM}, so grants made for it will not apply to builds" >&2
  echo "       signed with the team certificate (and vice versa)." >&2
  exit 1
fi

if grep -q "100.6.2.12" <<<"$REQ"; then
  echo "warning: $APP is signed with a development certificate (…100.6.2.12). A Developer ID build does not" >&2
  echo "         satisfy this requirement, so alternating between them clears the grant each way." >&2
fi

echo "    team-anchored: yes — grants survive future builds"
