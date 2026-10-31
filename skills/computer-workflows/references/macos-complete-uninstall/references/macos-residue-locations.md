# macOS residue locations

Every place a third-party app or agent tool leaves something on macOS. Check each one against the
inventory output; the ones that apply get deleted, the ones that don't get reported as checked.

## 1. Binary / install tree
| Location | Notes |
|---|---|
| `~/.<app>/` | Self-managed CLI + runtime + data. Often the largest single item (gigabytes of `runtime/`, `tools/`, `npm/`). |
| `~/.local/bin`, `/usr/local/bin`, `/opt/homebrew/bin` | Symlinks or shims onto the real binary. |
| `/Applications/<App>.app` | User-owned bundles need no sudo. Bundle id: `PlistBuddy -c 'Print :CFBundleIdentifier'`. |
| `~/Applications/<App>.app` | Per-user installs. |
| `~/.config/<app>`, `~/.cache/<app>`, `~/.local/share/<app>` | XDG-style state. |

## 2. Launchd / background execution
| Location | Notes |
|---|---|
| `~/Library/LaunchAgents/<label>.plist` | User agent. `KeepAlive` + `RunAtLoad` means it resurrects and runs at login. |
| `/Library/LaunchAgents`, `/Library/LaunchDaemons` | System-scope, needs sudo. |
| `launchctl list` | Loaded jobs, `PID status label`. |
| `launchctl print gui/$(id -u)` / `print-disabled` | Override DB keeps `"<label>" => enabled` after the plist is gone. Root-owned, inert. |
| `sfltool dumpbtm` | Login items / background item registry (BTM). |
| `crontab -l` | Legacy scheduling. |
| `~/Library/LoginItems`, System Events login items | `osascript -e 'tell application "System Events" to get the name of every login item'`. |

## 3. OS support data (`~/Library`)
| Location | Contents |
|---|---|
| `Application Support/<App>` | Databases, state, sockets (`bridge.sock`), caches. |
| `Application Support/<legacy-name>` | Older product names leave symlinked dirs pointing at the current one. |
| `Caches/<bundle-id>`, `Caches/<app>` | Can be tens of MB (WebKit/GPU caches). |
| `Logs/<app>` | Stdout/stderr targets referenced by the launchd plist. |
| `Preferences/<bundle-id>.plist` | Defaults; check with `defaults read <bundle-id>`. |
| `HTTPStorages/<bundle-id>` + `.binarycookies` | Cookies and URL sessions. |
| `WebKit/<bundle-id>` | WebView data for SwiftUI/WebKit apps. |
| `Saved Application State/<bundle-id>.savedState` | Window restoration. |
| `Containers/<bundle-id>`, `Group Containers/<team-id>` | Sandboxed data. |
| `Application Scripts/<bundle-id>` | Finder/Services scripts. |
| `/Library/Preferences`, `/Library/Logs`, `/var/log` | System-scope equivalents. |

## 4. Keychain
```bash
security dump-keychain | grep -E '"svce"<blob>="[^"]*<term>'
security delete-generic-password -s <exact-service>     # loop until it reports none remaining
```
App credentials, gateway profiles and onboarding tokens live here and outlive the app bundle.

## 5. Browsers
| Location | Contents |
|---|---|
| `<Browser>/NativeMessagingHosts/<vendor>.<name>.json` | Bridge to the app's local service. One per browser variant: Chrome, Chromium, Chrome for Testing, ChromeForTesting, Chrome Beta/Dev/Canary, Edge (+Beta/Dev/Canary), Brave, Arc (`User Data/`), Vivaldi (+Snapshot), Opera, Sidekick, Wavebox, Mozilla (Firefox). |
| `<Browser>/External Extensions/<ext-id>.json` | **Install trigger.** `external_update_url` + vendor marker; while present Chrome re-downloads the extension. |
| `<Profile>/Extensions/<ext-id>/` | Extension payload. |
| `<Profile>/Local Extension Settings/<ext-id>/` | Extension storage. |
| `<Profile>/Secure Preferences` | Extension registry. HMAC-protected (`protection.macs`) — do not edit. |
| `<Profile>/Preferences` | Content settings, site visits, webstore download metadata. Leftover ids here are dormant. |
| `.com.google.Chrome.XXXXXX` | Stale JSON scratch temp files (mtime gives them away). Not footprint. |

Procedure: remove the `External Extensions` trigger + extension dir + local settings while the browser
is **quit**, then relaunch and re-check. Chrome uninstalls it and leaves an empty `{}` tombstone.

## 6. Shell
`~/.zshrc`, `~/.zprofile`, `~/.zshenv`, `~/.zlogin`, `~/.bashrc`, `~/.bash_profile`, `~/.profile`,
`~/.config/fish/config.fish`, `/etc/zshenv|zprofile|zshrc|profile`, `/etc/paths.d/*`,
`~/.config/environment.d/*`, oh-my-zsh / sheldon / mise / direnv managed snippets.
A PATH export is typically duplicated across four files; `which -a` printing the same path N times is
the tell.

## 7. Privacy permissions
```bash
tccutil reset All <bundle-id>          # user-level, no sudo; no-op when nothing was granted
```
Accessibility, Screen Recording, Full Disk Access, Automation and camera/mic grants persist in the TCC
database after the app is deleted (they point at a bundle id, not a path).

## 8. Inert residue — report, don't fight
- Chrome extension tombstone (`"<ext-id>":{}` in Secure Preferences) and webstore download-cohort stats.
- launchd override row (`"<label>" => enabled`) after the plist is deleted.
- Text mentions in unrelated configs, agent inventories, notes and other tools' logs.
- Stale browser temp files whose mtime predates the app.

These hold no code, no configuration and no execution path. Editing the HMAC-protected or root-owned
files that own them risks more damage than the residue costs.
