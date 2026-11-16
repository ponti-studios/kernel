import AppKit
import SwiftUI

// A floating, glassy progress window for studio generation. It appears while an
// image or video job is running and quits after a quiet minute.
// Usage: progress-hud <jobs-directory>

@MainActor
final class HUDController {
    let directory: URL
    let model: JobModel
    let panel: NSPanel
    private var timer: Timer?

    init(directory: URL) {
        self.directory = directory
        model = JobModel(directory: directory)
        panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 340, height: 120),
            styleMask: [.borderless, .nonactivatingPanel],
            backing: .buffered,
            defer: false
        )
        panel.level = .floating
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = true
        panel.hidesOnDeactivate = false
        panel.isMovable = false
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        panel.contentView = NSHostingView(rootView: HUDView(model: model))
        model.onIdle = { NSApp.terminate(nil) }
    }

    func start() {
        model.refresh()
        timer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.tick() }
        }
    }

    private func tick() {
        model.refresh()
        if model.rows.isEmpty {
            panel.orderOut(nil)
            return
        }
        placeIfNeeded()
        panel.orderFrontRegardless()
    }

    private func placeIfNeeded() {
        guard let screen = NSScreen.main else { return }
        panel.contentView?.layoutSubtreeIfNeeded()
        let size = panel.contentView?.fittingSize ?? NSSize(width: 340, height: 120)
        let origin = NSPoint(
            x: screen.visibleFrame.maxX - size.width - 24,
            y: screen.visibleFrame.maxY - size.height - 24
        )
        panel.setFrame(NSRect(origin: origin, size: size), display: true)
    }
}

/// Only one window at a time: a live owner of the pid file wins.
func claimPidFile(in directory: URL) -> Bool {
    let pidFile = directory.appending(path: ".window.pid")
    if let text = try? String(contentsOf: pidFile, encoding: .utf8),
       let other = Int32(text.trimmingCharacters(in: .whitespacesAndNewlines)),
       other != getpid(), JobReader.processAlive(other) {
        return false
    }
    try? String(getpid()).write(to: pidFile, atomically: true, encoding: .utf8)
    return true
}

let arguments = CommandLine.arguments
let jobsPath = arguments.count > 1
    ? arguments[1]
    : (NSHomeDirectory() as NSString).appendingPathComponent("Documents/studio/runtime/jobs")
let jobsDirectory = URL(fileURLWithPath: jobsPath, isDirectory: true)
try? FileManager.default.createDirectory(at: jobsDirectory, withIntermediateDirectories: true)

MainActor.assumeIsolated {
    guard claimPidFile(in: jobsDirectory) else { exit(0) }
    let app = NSApplication.shared
    app.setActivationPolicy(.accessory)
    let controller = HUDController(directory: jobsDirectory)
    controller.start()
    app.run()
}
