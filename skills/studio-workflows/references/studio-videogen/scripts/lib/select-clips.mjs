import { existsSync, readFileSync, readdirSync } from "node:fs";
import { extname, join, resolve } from "node:path";

// Resolve precisely the same selected takes for assembly and captions.
export function selectClips(directory, scenes, { allowTestClips = false } = {}) {
  const dir = resolve(directory);
  const files = readdirSync(dir)
    .filter((f) => [".mp4", ".mov", ".mkv", ".webm"].includes(extname(f).toLowerCase()));
  const byId = new Map(files.map((f) => [f.slice(0, -extname(f).length), join(dir, f)]));
  const selectionPath = join(dir, "selection.json");
  if (!scenes) {
    if (existsSync(selectionPath)) throw new Error("--scenes is required to use selected takes");
    if (!files.length) throw new Error(`no video files in ${dir}`);
    return files.sort().map((f) => join(dir, f));
  }
  const hasSelection = existsSync(selectionPath);
  const selection = hasSelection ? JSON.parse(readFileSync(selectionPath, "utf8")) : {};
  return scenes.map((scene) => {
    const entry = selection[scene.id];
    if (entry?.test_capped && !allowTestClips) throw new Error(`${scene.id} is a capped test clip; regenerate it or use --allow-test-clips for a preview`);
    const selected = typeof entry === "string" ? entry : entry?.path;
    if (entry !== undefined) {
      if (typeof selected !== "string" || !/^takes\/[^/]+\.mp4$/.test(selected) || !existsSync(join(dir, selected))) {
        throw new Error(`invalid or missing selected take for ${scene.id}`);
      }
      return join(dir, selected);
    }
    if (hasSelection) throw new Error(`no selected take for scene ${scene.id}`);
    const path = byId.get(scene.id);
    if (!path) throw new Error(`no clip for scene ${scene.id}`);
    return path;
  });
}
