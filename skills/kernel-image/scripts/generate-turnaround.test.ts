import { describe, expect, test } from "bun:test";
import { buildTurnaroundPrompt } from "./generate-turnaround.ts";

describe("buildTurnaroundPrompt", () => {
  test("requests all four views and a plain background for a clothed character", () => {
    const prompt = buildTurnaroundPrompt(
      "wyatt",
      "# Wyatt Bose — Identity\n\nbox head, black hoodie",
      "# Traditional Anime Character Style Contract"
    );

    expect(prompt).toContain("front view");
    expect(prompt).toContain("3/4 view");
    expect(prompt).toContain("side view");
    expect(prompt).toContain("back view");
    expect(prompt).toContain("Plain flat white/neutral seamless studio background");
    expect(prompt).toContain("box head, black hoodie");
    expect(prompt).toContain("Traditional Anime Character Style Contract");
    expect(prompt).toContain("fixed default outfit");
  });

  test("skips outfit framing for Void", () => {
    const prompt = buildTurnaroundPrompt(
      "void",
      "# Void — Identity\n\npure black circle head",
      "# Traditional Anime Character Style Contract"
    );

    expect(prompt).toContain("Void has no outfit");
    expect(prompt).not.toContain("fixed default outfit");
  });
});
