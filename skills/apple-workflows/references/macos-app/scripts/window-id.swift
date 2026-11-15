// Find the CGWindowID of an app's on-screen window, so `screencapture -l <id>` can capture just that window.
//
//   swift window-id.swift [owner-name-fragment]
//
// Why this exists: `screencapture -R <rect>` needs correct top-origin screen coordinates and fails with
// "could not create image from rect" when they are off, while `-x` (whole screen) and `-l <id>` both work — and a
// per-window capture is unaffected by whatever else is on the display or above the window.
//
// PyObjC's Quartz module is not in /usr/bin/python3, so the window server has to be asked from Swift.

import CoreGraphics
import Foundation

let needle = CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ""
let options: CGWindowListOption = [.optionOnScreenOnly, .excludeDesktopElements]

guard let windows = CGWindowListCopyWindowInfo(options, kCGNullWindowID) as? [[String: Any]] else {
    FileHandle.standardError.write(Data("could not read the window list\n".utf8))
    exit(1)
}

var found = false
for window in windows {
    let owner = window[kCGWindowOwnerName as String] as? String ?? ""
    guard needle.isEmpty || owner.localizedCaseInsensitiveContains(needle) else { continue }
    found = true

    let number = window[kCGWindowNumber as String] as? Int ?? 0
    let layer = window[kCGWindowLayer as String] as? Int ?? -1
    let bounds = window[kCGWindowBounds as String] as? [String: Any] ?? [:]
    let x = bounds["X"] ?? "?", y = bounds["Y"] ?? "?"
    let width = bounds["Width"] ?? "?", height = bounds["Height"] ?? "?"
    print("id=\(number) layer=\(layer) owner=\(owner) x=\(x) y=\(y) w=\(width) h=\(height)")
}

// Layer 0 is the normal window layer; anything else is a panel, menubar item or overlay.
if !found {
    FileHandle.standardError.write(Data("no on-screen window matched '\(needle)'\n".utf8))
    exit(2)
}
