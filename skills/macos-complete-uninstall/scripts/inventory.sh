#!/usr/bin/env bash
# Inventory a macOS app/CLI's complete footprint BEFORE uninstalling it.
# Usage: ./inventory.sh <term>        e.g. ./inventory.sh openclaw
# Read-only: reports locations, deletes nothing.
# Targets macOS /bin/bash 3.2: no ${var,,}, no associative arrays, no mapfile.
# Every name match uses find -iname or grep -i: pathname globs are case-sensitive and would
# silently miss a capitalized target name (e.g. "Cartograph").
set -u

TERM_Q="${1:?usage: inventory.sh <search-term>}"
# Lowercased at runtime so the process sweep never matches this script's own command line.
NEEDLE=$(printf '%s' "$TERM_Q" | tr '[:upper:]' '[:lower:]')
HOME_DIR="$HOME"

hr() { printf '\n=== %s ===\n' "$1"; }

hr "binary on PATH"
which -a "$NEEDLE" 2>/dev/null || echo "  (none)"
echo "-- PATH duplicates (same path listed N times means N rc files export it):"
echo "$PATH" | tr ':' '\n' | grep -i "$NEEDLE" | sort | uniq -c

hr "package managers"
brew list --formula 2>/dev/null | grep -i "$NEEDLE"
brew list --cask    2>/dev/null | grep -i "$NEEDLE"
npm ls -g --depth=0 2>/dev/null | grep -i "$NEEDLE"
pip3 list 2>/dev/null | grep -i "$NEEDLE"
echo "(no output above = not managed by any of them)"

hr "dotdirs + data"
DATA_DIRS=$( { find "$HOME_DIR" -maxdepth 1 -iname "*$NEEDLE*" 2>/dev/null
               find "$HOME_DIR/.config" "$HOME_DIR/.cache" "$HOME_DIR/.local/share" \
                    -maxdepth 1 -iname "*$NEEDLE*" 2>/dev/null
             } | sort -u )
if [ -z "$DATA_DIRS" ]; then
  echo "  (none)"
else
  printf '%s\n' "$DATA_DIRS" | while IFS= read -r d; do du -sh "$d" 2>/dev/null; done
  echo "-- subdir sizes:"
  printf '%s\n' "$DATA_DIRS" | while IFS= read -r d; do
    [ -d "$d" ] && du -sh "$d"/* 2>/dev/null
  done
fi

hr "application bundles"
# Two independent match routes: the path contains the term, or the bundle identifier does.
# Bundle ids carry vendor suffixes ("com.tinyapp.TablePlus-setapp"), so a name-only glob misses them.
NAME_MATCHES=$(find /Applications "$HOME_DIR/Applications" -maxdepth 3 -name "*.app" 2>/dev/null \
               | grep -i "$NEEDLE")
ID_MATCHES=$(mdfind "kMDItemCFBundleIdentifier == '*$NEEDLE*'" 2>/dev/null | grep '\.app$')
ALL_APPS=$(printf '%s\n%s\n' "$NAME_MATCHES" "$ID_MATCHES" | grep -v '^$' | sort -u)
if [ -z "$ALL_APPS" ]; then
  echo "  (none)"
else
  printf '%s\n' "$ALL_APPS" | while IFS= read -r a; do
    echo "-- $a"
    /usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier' "$a/Contents/Info.plist" 2>/dev/null
    /usr/libexec/PlistBuddy -c 'Print :CFBundleShortVersionString' "$a/Contents/Info.plist" 2>/dev/null
    ls -ld "$a"   # ownership tells you whether rm needs sudo
  done
fi

hr "launchd services"
launchctl list 2>/dev/null | grep -i "$NEEDLE" || echo "  (nothing loaded)"
launchctl print gui/"$(id -u)" 2>/dev/null | grep -i "$NEEDLE" || true
PLISTS=$( { find "$HOME_DIR/Library/LaunchAgents" /Library/LaunchAgents /Library/LaunchDaemons \
                 -maxdepth 1 -iname "*$NEEDLE*" 2>/dev/null; } | sort -u )
if [ -z "$PLISTS" ]; then echo "  (no plists)"; else printf '%s\n' "$PLISTS" | sed 's/^/  /'; fi
echo "-- login/background item registry:"
sfltool dumpbtm 2>/dev/null | grep -i -B3 -A3 "$NEEDLE" | head -30 || echo "  (none)"

hr "processes"
python3 - "$NEEDLE" <<'PY'
import os, sys, subprocess

needle = sys.argv[1]
out = subprocess.run(['ps', '-eo', 'pid=,ppid=,command='], capture_output=True, text=True).stdout
rows = []
for line in out.splitlines():
    parts = line.strip().split(None, 2)
    if len(parts) != 3:
        continue
    rows.append((int(parts[0]), int(parts[1]), parts[2]))

# Walk up our own ancestry: this script, its shell wrapper and the agent harness all
# carry the search term in their command line and would otherwise self-match.
ancestors, cursor = set(), os.getpid()
parent_of = {pid: ppid for pid, ppid, _ in rows}
while cursor in parent_of and parent_of[cursor] not in ancestors:
    ancestors.add(cursor)
    cursor = parent_of[cursor]

hits = [(pid, cmd) for pid, _, cmd in rows
        if needle in cmd.lower() and pid not in ancestors]
print('  %d matching process(es)' % len(hits))
for pid, cmd in hits[:25]:
    print('   ', pid, cmd[:130])
PY

hr "listening ports"
lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | grep -i "$NEEDLE" || echo "  (none attributable by name)"

hr "OS support dirs (~/Library)"
LIB_DIRS="Application Support
Application Support/Google/Chrome
Caches
Logs
Preferences
HTTPStorages
WebKit
Saved Application State
Containers
Group Containers
Application Scripts
Cookies
Developer/Xcode/DerivedData"
LIB_HITS=$(printf '%s\n' "$LIB_DIRS" | while IFS= read -r sub; do
             [ -d "$HOME_DIR/Library/$sub" ] || continue
             find "$HOME_DIR/Library/$sub" -maxdepth 1 -iname "*$NEEDLE*" 2>/dev/null
           done)
if [ -z "$LIB_HITS" ]; then echo "  (none under ~/Library)"; else printf '%s\n' "$LIB_HITS" | sed 's/^/  /'; fi
echo "-- system-wide:"
find /Library/Preferences /Library/Logs /Library/Application\ Support /var/log \
     -maxdepth 1 -iname "*$NEEDLE*" 2>/dev/null | sed 's/^/  /'

hr "keychain"
security dump-keychain 2>/dev/null | grep -E "\"[sl]vce\"<blob>=\"[^\"]*$NEEDLE" | sort -u || echo "  (none)"

hr "browser integrations"
echo "-- native messaging manifests:"
find "$HOME_DIR/Library/Application Support" -maxdepth 4 -type d -name NativeMessagingHosts \
     -exec ls {} \; 2>/dev/null | grep -i "$NEEDLE" || echo "  (none)"
echo "-- external extension install triggers (these REINSTALL extensions):"
TRIGGER_HITS=0
for f in "$HOME_DIR/Library/Application Support"/*/External\ Extensions/*.json; do
  [ -f "$f" ] || continue
  if grep -q -i "$NEEDLE" "$f" 2>/dev/null; then
    TRIGGER_HITS=1
    echo "  TRIGGER: $f"
    sed 's/^/    /' "$f"
  fi
done
[ "$TRIGGER_HITS" -eq 0 ] && echo "  (none)"
echo "-- installed extension dirs (extension id appears in the path):"
grep -l -i "$NEEDLE" "$HOME_DIR/Library/Application Support"/*/*/"Secure Preferences" 2>/dev/null \
  | sed 's|/Secure Preferences||' \
  | while read -r prof; do
      echo "  profile: $prof"
      python3 - "$prof" "$NEEDLE" <<'PY'
import json, sys
prof, needle = sys.argv[1], sys.argv[2]
try:
    d = json.load(open(prof + '/Secure Preferences', encoding='utf-8', errors='ignore'))
except Exception as exc:
    print('    (unreadable: %s)' % exc)
    raise SystemExit
for cid, c in d.get('extensions', {}).get('settings', {}).items():
    if needle in json.dumps(c).lower():
        m = c.get('manifest', {}) or {}
        print('    EXT %s | %s | location %s | perms %s'
              % (cid, m.get('name'), c.get('location'), m.get('permissions')))
PY
    done

hr "shell rc files"
for f in .zshrc .zprofile .zshenv .bashrc .bash_profile .profile .config/fish/config.fish; do
  [ -f "$HOME_DIR/$f" ] && grep -n -i "$NEEDLE" "$HOME_DIR/$f" | sed "s|^|  $f:|"
done
echo "-- other configs mentioning it (text-only refs are usually harmless):"
grep -rIl -i "$NEEDLE" "$HOME_DIR/.config" "$HOME_DIR/.gitconfig" 2>/dev/null | head -10

hr "scheduled jobs"
crontab -l 2>/dev/null | grep -i "$NEEDLE" || echo "  (no crontab entries)"

hr "privacy permissions (reset after removal)"
echo "  tccutil reset All <bundle-id>    # no-op if never granted"
echo "  sqlite3 \"\$HOME/Library/Application Support/com.apple.TCC/TCC.db\" \\"
echo "     \"select service,client from access where client like '%$NEEDLE%'\"   # may need Full Disk Access"

hr "done — read every section before deleting anything"
