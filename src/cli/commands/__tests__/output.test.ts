import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { printOutput } from "../output.js";

describe("printOutput", () => {
  let logSpy: ReturnType<typeof spyOn> | undefined;
  let tableSpy: ReturnType<typeof spyOn> | undefined;

  afterEach(() => {
    logSpy?.mockRestore();
    tableSpy?.mockRestore();
    logSpy = undefined;
    tableSpy = undefined;
  });

  it("prints flat arrays as tables by default", () => {
    logSpy = spyOn(console, "log").mockImplementation(() => undefined);
    tableSpy = spyOn(console, "table").mockImplementation(() => undefined);

    printOutput([{ host: "claude", created: 1, updated: 0, removed: 0, unchanged: 8 }], {});

    expect(tableSpy).toHaveBeenCalledTimes(1);
    expect(tableSpy?.mock.calls[0]?.[0]).toEqual([
      {
        host: "claude",
        created: 1,
        updated: 0,
        removed: 0,
        unchanged: 8,
      },
    ]);
  });

  it("omits tracked from sync host tables", () => {
    logSpy = spyOn(console, "log").mockImplementation(() => undefined);
    tableSpy = spyOn(console, "table").mockImplementation(() => undefined);

    printOutput(
      {
        catalogPath: "/tmp/.agents",
        hosts: [
          {
            host: "claude",
            created: 1,
            updated: 0,
            removed: 0,
            unchanged: 8,
            tracked: ["/tmp/.claude/skills/kernel-review"],
          },
        ],
      },
      {},
    );

    expect(tableSpy).toHaveBeenCalledTimes(1);
    expect(tableSpy?.mock.calls[0]?.[0]).toEqual([
      {
        host: "claude",
        created: 1,
        updated: 0,
        removed: 0,
        unchanged: 8,
      },
    ]);
  });

  it("prints json when requested", () => {
    logSpy = spyOn(console, "log").mockImplementation(() => undefined);
    tableSpy = spyOn(console, "table").mockImplementation(() => undefined);

    printOutput(
      {
        catalogPath: "/tmp/.agents",
        hosts: [{ id: "claude", detected: true }],
      },
      { json: true },
    );

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy?.mock.calls[0]?.[0]).toContain('"catalogPath": "/tmp/.agents"');
    expect(tableSpy).not.toHaveBeenCalled();
  });
});