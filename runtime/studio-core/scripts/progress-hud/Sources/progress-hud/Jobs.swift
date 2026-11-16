import Foundation

/// One generation job, as written by lib/progress.mjs.
struct Job: Decodable, Identifiable, Equatable {
    let id: String
    let kind: String
    let label: String
    let model: String
    let status: String
    let detail: String
    let startedAt: String
    let updatedAt: String
    let pid: Int32
    let expectSeconds: Double?

    enum CodingKeys: String, CodingKey {
        case id, kind, label, model, status, detail, pid
        case startedAt = "started_at"
        case updatedAt = "updated_at"
        case expectSeconds = "expect_seconds"
    }
}

/// A job as the window shows it: how long it has run, and how full its bar is.
struct JobRow: Identifiable, Equatable {
    let id: String
    let kind: String
    let label: String
    let model: String
    let status: String
    let detail: String
    let started: Date
    let fraction: Double
}

enum JobReader {
    static let stale: TimeInterval = 30 * 60
    static let recent: TimeInterval = 6

    /// Timestamps come from JavaScript's toISOString, so they carry milliseconds.
    static func date(_ text: String) -> Date? {
        try? Date(text, strategy: Date.ISO8601FormatStyle(includingFractionalSeconds: true))
    }

    static func processAlive(_ pid: Int32) -> Bool {
        pid > 0 && (kill(pid, 0) == 0 || errno == EPERM)
    }

    /// Running jobs whose process is still alive, plus jobs that finished a moment ago.
    static func rows(in directory: URL, now: Date = Date()) -> [JobRow] {
        guard let names = try? FileManager.default.contentsOfDirectory(atPath: directory.path) else {
            return []
        }
        var rows: [JobRow] = []
        for name in names where name.hasSuffix(".json") {
            let url = directory.appending(path: name)
            guard let data = try? Data(contentsOf: url),
                  let job = try? JSONDecoder().decode(Job.self, from: data),
                  let updated = date(job.updatedAt),
                  let started = date(job.startedAt)
            else { continue }
            let quiet = now.timeIntervalSince(updated)
            let elapsed = now.timeIntervalSince(started)
            if job.status == "running" {
                guard quiet <= stale, processAlive(job.pid) else { continue }
                let expect = max(job.expectSeconds ?? 60, 1)
                rows.append(row(job, started, min(elapsed / expect, 0.95)))
            } else if quiet <= recent {
                rows.append(row(job, started, 1))
            }
        }
        return rows.sorted { $0.started < $1.started }
    }

    private static func row(_ job: Job, _ started: Date, _ fraction: Double) -> JobRow {
        JobRow(
            id: job.id, kind: job.kind, label: job.label, model: job.model,
            status: job.status, detail: job.detail, started: started, fraction: fraction
        )
    }
}
