#!/usr/bin/env bash
set -euo pipefail

mode=disable
if [[ "${1:-}" == "--dry-run" ]]; then
    mode=dry-run
    shift
fi
if [[ "$#" -ne 1 ]]; then
    echo "Usage: computer-workflows btm-disable [--dry-run] <exact-entry-name>" >&2
    exit 2
fi
entry_name=$1
open 'x-apple.systempreferences:com.apple.LoginItems-Settings.extension'
sleep 2

osascript - "$mode" "$entry_name" <<'APPLESCRIPT'
on run argv
    set mode to item 1 of argv
    set targetName to item 2 of argv
    tell application "System Events"
        tell process "System Settings"
            tell window "Login Items"
                set backgroundGroup to group 2 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1
                set matchingCheckboxes to {}
                repeat with itemCheckbox in (checkboxes of backgroundGroup)
                    try
                        if (name of itemCheckbox as text) is targetName then set end of matchingCheckboxes to itemCheckbox
                    end try
                end repeat
                if (count of matchingCheckboxes) is 0 then error "No Allow in Background checkbox named " & targetName number 1
                if (count of matchingCheckboxes) is greater than 1 then error "Multiple matching background items; refusing to choose: " & targetName number 2

                set targetCheckbox to item 1 of matchingCheckboxes
                set wasEnabled to value of targetCheckbox
                if mode is "dry-run" then
                    if wasEnabled is 1 then return "Found enabled background item: " & targetName & " (no changes made)"
                    return "Found background item already disabled: " & targetName & " (no changes made)"
                end if

                if wasEnabled is 1 then click targetCheckbox
                delay 1
                if value of targetCheckbox is 1 then error "Background item is still enabled: " & targetName number 3
                return "Background item disabled: " & targetName
            end tell
        end tell
    end tell
end run
APPLESCRIPT
