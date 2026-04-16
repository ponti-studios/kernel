import { describe, expect, it } from "bun:test";
import type { RenderedOutput } from "../../render/index.js";
import { planSync, toManifestEntry } from "../index.js";

function fileOutput(content: string): RenderedOutput {
  return {
    scope: "catalog",
    templateId: "kernel-review",
    kind: "file",
    path: "/tmp/kernel-review.md",
    content,
    adapterVersion: "2.0.0",
  };
}

function linkOutput(target: string): RenderedOutput {
  return {
    scope: "claude",
    templateId: "kernel-review",
    kind: "symlink",
    path: "/tmp/kernel-review",
    target,
    adapterVersion: "2.0.0",
  };
}

describe("sync planner", () => {
  it("skips unchanged outputs", () => {
    const output = fileOutput("same");
    const plan = planSync("catalog", [output], [toManifestEntry(output)]);

    expect(plan.actions).toHaveLength(0);
    expect(plan.remove).toEqual([]);
    expect(plan.tracked).toEqual([toManifestEntry(output)]);
  });

  it("rewrites changed outputs and removes orphans", () => {
    const previous = [
      toManifestEntry(fileOutput("before")),
      {
        path: "/tmp/orphan.md",
        kind: "file" as const,
        hash: "deadbeef",
        templateId: "orphan",
        adapterVersion: "2.0.0",
      },
    ];
    const next = fileOutput("after");
    const plan = planSync("catalog", [next], previous);

    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0]?.path).toBe(next.path);
    expect(plan.actions[0]?.hash).toBe(toManifestEntry(next).hash);
    expect(plan.remove).toEqual(["/tmp/orphan.md"]);
  });

  it("tracks symlink target changes by hash", () => {
    const previous = toManifestEntry(linkOutput("/tmp/catalog-a"));
    const next = linkOutput("/tmp/catalog-b");
    const plan = planSync("claude", [next], [previous]);

    expect(plan.actions).toHaveLength(1);
    expect(plan.actions[0]?.kind).toBe("symlink");
    expect(plan.actions[0]?.target).toBe("/tmp/catalog-b");
    expect(plan.remove).toEqual([]);
  });
});
