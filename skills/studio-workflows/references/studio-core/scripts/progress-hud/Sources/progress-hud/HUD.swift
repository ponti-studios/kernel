import AppKit
import SwiftUI

/// Watches the jobs folder and keeps the model in step with it.
@MainActor
@Observable
final class JobModel {
    var rows: [JobRow] = []
    private let directory: URL
    private var idleSince = Date()
    var onIdle: (() -> Void)?

    init(directory: URL) {
        self.directory = directory
    }

    func refresh(now: Date = Date()) {
        rows = JobReader.rows(in: directory, now: now)
        if !rows.isEmpty { idleSince = now }
        if rows.isEmpty, now.timeIntervalSince(idleSince) > 60 { onIdle?() }
    }
}

/// One row: what is running, how long, and a glass bar.
struct JobRowView: View {
    let row: JobRow

    private var tint: Color {
        switch row.status {
        case "done": .green
        case "failed": .red
        default: .blue
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Text(row.kind == "video" ? "VID" : "IMG")
                    .font(.caption2.weight(.bold))
                    .padding(.horizontal, 6)
                    .padding(.vertical, 2)
                    .glassEffect(.regular.tint(tint.opacity(0.5)), in: .capsule)
                Text(row.label)
                    .font(.callout.weight(.semibold))
                    .lineLimit(1)
                Spacer(minLength: 8)
                TimelineView(.periodic(from: row.started, by: 1)) { context in
                    Text(elapsed(at: context.date))
                        .font(.caption.monospacedDigit())
                        .foregroundStyle(.secondary)
                }
            }
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Capsule().fill(.primary.opacity(0.12))
                    Capsule()
                        .fill(tint.gradient)
                        .frame(width: geometry.size.width * row.fraction)
                }
            }
            .frame(height: 6)
            Text("\(row.model)  \(row.detail)")
                .font(.caption2)
                .foregroundStyle(.secondary)
                .lineLimit(1)
        }
    }

    private func elapsed(at date: Date) -> String {
        let seconds = max(0, Int(date.timeIntervalSince(row.started)))
        return String(format: "%d:%02d", seconds / 60, seconds % 60)
    }
}

/// The panel's content: a stack of glass rows.
struct HUDView: View {
    let model: JobModel

    var body: some View {
        GlassEffectContainer(spacing: 10) {
            VStack(spacing: 10) {
                ForEach(model.rows) { row in
                    JobRowView(row: row)
                        .padding(12)
                        .frame(width: 320, alignment: .leading)
                        .glassEffect(.regular, in: .rect(cornerRadius: 18))
                }
            }
        }
        .padding(8)
    }
}
