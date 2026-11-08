# Carbon hotkey reference (key codes + modifier masks)

For apps that expose their global hotkey as two `UserDefaults` numbers. Take these from the SDK, not
memory — the header is authoritative for the OS you are building against:

```bash
SDK=$(xcrun --show-sdk-path)
H="$SDK/System/Library/Frameworks/Carbon.framework/Versions/A/Frameworks/HIToolbox.framework/Versions/A/Headers/Events.h"
grep -E "kVK_" "$H"                 # virtual key codes
grep -E "cmdKey|shiftKey|optionKey|controlKey" "$H"   # modifier masks
```

## Modifier masks (sum them)

| Modifier | Name         | Value |
| -------- | ------------ | ----- |
| ⌘        | `cmdKey`     | 256   |
| ⇧        | `shiftKey`   | 512   |
| ⌥        | `optionKey`  | 2048  |
| ⌃        | `controlKey` | 4096  |

Common combinations: ⌥⌘ `2304` · ⌃⌥ `6144` · ⌃⇧⌘ `4864` · ⌃⌥⇧ `6656`.

## Key codes

Position-based (ANSI), so a code follows the **physical** key, not the character your layout produces.

| Group      | Codes                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Letters    | A 0 · S 1 · D 2 · F 3 · H 4 · G 5 · Z 6 · X 7 · C 8 · V 9 · B 11 · Q 12 · W 13 · E 14 · R 15 · Y 16 · T 17                             |
| Digits     | 1 18 · 2 19 · 3 20 · 4 21 · 6 22 · 5 23 · 9 25 · 7 26 · 8 28 · 0 29                                                                    |
| Symbols    | `=` 24 · `-` 27 · `]` 30 · `[` 33 · `'` 39 · `;` 41 · `\` 42 · `,` 43 · `/` 44 · `.` 47 · `` ` `` 50                                   |
| Editing    | Return 36 · Tab 48 · Space 49 · Delete 51 · ForwardDelete 117 · Escape 53                                                              |
| Arrows     | ← 123 · → 124 · ↓ 125 · ↑ 126                                                                                                          |
| Navigation | Help 114 · Home 115 · PageUp 116 · End 119 · PageDown 121                                                                              |
| Function   | F1 122 · F2 120 · F3 99 · F4 118 · F5 96 · F6 97 · F7 98 · F8 100 · F9 101 · F10 109 · F11 103 · F12 111 · F13 105 · F14 107 · F15 113 |

Note the non-monotonic digits: `5` sorts after `6`, and `F3` sits between `F8` and `F9`. Do not derive a
code by arithmetic or alphabetical ordering.

## Driver commands

```bash
# set (then restart the app — the chord is registered at launch)
defaults write com.example.app hotKeyCode -int 2      # D
defaults write com.example.app hotKeyMods -int 6144   # ⌃⌥

# hex, if you are pasting straight out of a header
defaults write com.example.app hotKeyCode -string 0x02
defaults write com.example.app hotKeyMods -string 0x1800

# back to the built-in default
defaults delete com.example.app hotKeyCode
defaults delete com.example.app hotKeyMods

defaults read com.example.app | grep -i hotkey        # verify what is actually stored
```

## Firing it from a test harness

```bash
osascript -e 'tell application "System Events" to keystroke "d" using {control down, option down}'
```

Needs Accessibility for the _posting_ process, not for the app. Assert against the app's log that one
press produced exactly one action — a synthetic keystroke plus a real one makes double-fire bugs
(see the debounce rule in SKILL.md) look like the app ignoring input.

## Swift read side

```swift
static func hotKey(_ key: String, default def: UInt32) -> UInt32 {
    switch UserDefaults.standard.object(forKey: key) {   // NOT integer(forKey:) — 0 is kVK_ANSI_A
    case let number as Int: return UInt32(number)
    case let text as String:
        let t = text.trimmingCharacters(in: .whitespaces)
        if t.lowercased().hasPrefix("0x"), let v = UInt32(t.dropFirst(2), radix: 16) { return v }
        return UInt32(t) ?? def
    default: return def
    }
}
```
