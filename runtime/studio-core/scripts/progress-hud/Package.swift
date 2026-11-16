// swift-tools-version: 6.2
import PackageDescription

let package = Package(
    name: "progress-hud",
    platforms: [.macOS(.v26)],
    targets: [
        .executableTarget(name: "progress-hud", path: "Sources/progress-hud")
    ]
)
