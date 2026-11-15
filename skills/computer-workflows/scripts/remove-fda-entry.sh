#!/usr/bin/env bash
set -euo pipefail

mode=remove
selected_row=
while [[ "$#" -gt 0 ]]; do
    case "$1" in
        --dry-run)
            mode=dry-run
            shift
            ;;
        --row)
            [[ "$#" -ge 2 ]] || { echo "--row requires a row number" >&2; exit 2; }
            selected_row=$2
            shift 2
            ;;
        --*)
            echo "Unknown option: $1" >&2
            exit 2
            ;;
        *)
            break
            ;;
    esac
done
if [[ "$#" -ne 1 ]]; then
    echo "Usage: computer-workflows fda-remove [--dry-run] [--row N] <exact-entry-name>" >&2
    exit 2
fi
if [[ -n "$selected_row" && ! "$selected_row" =~ ^[1-9][0-9]*$ ]]; then
    echo "Row number must be a positive integer: $selected_row" >&2
    exit 2
fi

entry_name=$1
open 'x-apple.systempreferences:com.apple.settings.PrivacySecurity.extension?Privacy_AllFiles'
sleep 2

osascript - "$mode" "$selected_row" "$entry_name" <<'APPLESCRIPT'
on run argv
    set mode to item 1 of argv
    set requestedRow to item 2 of argv
    set targetName to item 3 of argv

    tell application "System Events"
        tell process "System Settings"
            tell window "Full Disk Access"
                set fdaOutline to outline 1 of scroll area 1 of group 1 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1
                set matchingRows to {}
                repeat with rowIndex from 1 to count of rows of fdaOutline
                    try
                        set rowName to value of static text 1 of UI element 1 of row rowIndex of fdaOutline
                        if rowName is targetName then set end of matchingRows to rowIndex
                    end try
                end repeat

                if requestedRow is not "" then
                    set rowNumber to requestedRow as integer
                    if rowNumber > (count of rows of fdaOutline) then error "Row is out of range: " & requestedRow number 1
                    set selectedName to value of static text 1 of UI element 1 of row rowNumber of fdaOutline
                    if selectedName is not targetName then error "Row " & requestedRow & " is " & selectedName & ", not " & targetName number 2
                    if mode is "dry-run" then return "Would remove row " & requestedRow & ": " & targetName
                    select row rowNumber of fdaOutline
                else
                    if (count of matchingRows) is 0 then error "No Full Disk Access entry named " & targetName number 3
                    if mode is "dry-run" then
                        set rowList to ""
                        repeat with matchRow in matchingRows
                            if rowList is not "" then set rowList to rowList & ", "
                            set rowList to rowList & (matchRow as text)
                        end repeat
                        return "Found " & (count of matchingRows as text) & " matching Full Disk Access row(s) for " & targetName & ": " & rowList & " (no changes made)"
                    end if
                    if (count of matchingRows) is greater than 1 then error "Multiple matching entries; preview them, then use --row N: " & targetName number 4
                    set rowNumber to item 1 of matchingRows
                    select row rowNumber of fdaOutline
                end if

                click button 2 of group 1 of scroll area 1 of group 1 of group 3 of splitter group 1 of group 1
                delay 1

                set remainingRows to 0
                repeat with rowIndex from 1 to count of rows of fdaOutline
                    try
                        set rowName to value of static text 1 of UI element 1 of row rowIndex of fdaOutline
                        if rowName is targetName then set remainingRows to remainingRows + 1
                    end try
                end repeat
                if remainingRows is (count of matchingRows) then error "Entry is still listed: " & targetName number 5
                return "Removed one Full Disk Access entry named " & targetName & "; app was not uninstalled"
            end tell
        end tell
    end tell
end run
APPLESCRIPT
