import { z } from "zod";

/**
 * Zod Schema for canonical PromptAsset
 *
 * Immutable, versioned prompt assets referenced by agent profiles.
 * Every asset:
 * - Has deterministic identity (id + version)
 * - Is locked against runtime mutation
 * - Tracks origin (hand-written vs generated)
 * - Includes integrity metadata for change detection
 * - Supports version pinning for reproducibility
 *
 * Completes → Phase 1.3 Deliverable: Immutable prompt asset layer
 */

export type PromptOrigin = "hand-written" | "generated" | "external" | "synthesized";

/**
 * ID pattern: DNS-safe (lowercase letters, digits, hyphens)
 * Examples: advisor-architecture, reviewer-typescript, profile-prompts-v1
 * Used in asset URLs: /assets/prompts/<id>/<version>
 */
const PROMPT_ASSET_ID_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

const VALID_ORIGINS = ["hand-written", "generated", "external", "synthesized"] as const;

export const promptAssetSchema = z.object({
  id: z.string().min(3).max(100).regex(PROMPT_ASSET_ID_PATTERN, {
    message: "id must be DNS-safe: lowercase letters, digits, hyphens only",
  }),
  version: z.string().min(1).max(50).describe("Semantic version: 1.0, 2.1.3, etc."),
  content: z.string().min(10).max(10000).describe("Immutable prompt text (read-only at runtime)"),
  origin: z.enum(VALID_ORIGINS as readonly [PromptOrigin, ...PromptOrigin[]]),
  created: z.string().datetime().describe("ISO 8601 timestamp when asset was created"),
  checksum: z
    .string()
    .regex(/^[a-f0-9]{64}$/, {
      message: "checksum must be SHA-256 hex (64 chars)",
    })
    .describe("SHA-256 integrity digest"),
  immutable: z.boolean().describe("If true, runtime must not mutate this asset"),
  tags: z.array(z.string().min(1).max(50)).optional().describe("Search/discovery tags"),
  metadata: z.unknown().optional().describe("Additional adapter-specific metadata"),
});

export type PromptAsset = z.infer<typeof promptAssetSchema> & {
  immutable?: boolean;
};

/**
 * Single asset validation with detailed error diagnostics
 */
export function validatePromptAsset(
  candidate: unknown,
): ReturnType<typeof promptAssetSchema.safeParse> {
  return promptAssetSchema.safeParse(candidate);
}

/**
 * Batch validation with per-error diagnostics
 * Returns array of { index, asset, errors }
 */
export function validatePromptAssetList(candidates: unknown[]): Array<{
  index: number;
  asset: PromptAsset | null;
  isValid: boolean;
  errors: string[];
}> {
  return candidates.map((candidate, index) => {
    const result = validatePromptAsset(candidate);
    if (result.success) {
      return { index, asset: result.data, isValid: true, errors: [] };
    } else {
      const errors = result.error.issues.map(
        (issue) => `${issue.path.join(".")}: ${issue.message}`,
      );
      return { index, asset: null, isValid: false, errors };
    }
  });
}

/**
 * Detect duplicate asset IDs (ignoring version)
 * Multiple versions of same ID are allowed; duplicates within version are not
 */
export function detectDuplicateAssetIds(
  assets: PromptAsset[],
): Array<{ id: string; versions: string[]; indices: number[] }> {
  const seen = new Map<string, Map<string, number[]>>();

  assets.forEach((asset, index) => {
    if (!seen.has(asset.id)) {
      seen.set(asset.id, new Map());
    }
    const versionMap = seen.get(asset.id)!;
    if (!versionMap.has(asset.version)) {
      versionMap.set(asset.version, []);
    }
    versionMap.get(asset.version)!.push(index);
  });

  const duplicates: Array<{
    id: string;
    versions: string[];
    indices: number[];
  }> = [];

  seen.forEach((versionMap, id) => {
    const allIndices: number[] = [];
    const versionsWithDupes: string[] = [];

    versionMap.forEach((indices, version) => {
      if (indices.length > 1) {
        versionsWithDupes.push(version);
        allIndices.push(...indices);
      }
    });

    if (versionsWithDupes.length > 0) {
      duplicates.push({
        id,
        versions: versionsWithDupes,
        indices: allIndices,
      });
    }
  });

  return duplicates;
}

/**
 * Deterministic JSON serialization for digest computation
 * Excludes checksum field to allow digest-over-content verification
 * - Sorts keys alphabetically
 * - Excludes checksum (it's computed over this, not included)
 * - Preserves metadata structure
 * - Stable across tool invocations
 */
export function serializePromptAssetForDigest(asset: PromptAsset): string {
  const sorted = {
    content: asset.content,
    created: asset.created,
    id: asset.id,
    immutable: asset.immutable,
    metadata: asset.metadata,
    origin: asset.origin,
    tags: asset.tags?.sort(),
    version: asset.version,
  };
  return JSON.stringify(sorted);
}

/**
 * Snapshot serialization (includes checksum for full state capture)
 */
export function serializePromptAsset(asset: PromptAsset): string {
  const sorted = {
    checksum: asset.checksum,
    content: asset.content,
    created: asset.created,
    id: asset.id,
    immutable: asset.immutable,
    metadata: asset.metadata,
    origin: asset.origin,
    tags: asset.tags?.sort(),
    version: asset.version,
  };
  return JSON.stringify(sorted);
}

/**
 * SHA-256 digest for asset integrity verification
 * Digest matches checksum field for validation
 * Computed over asset fields EXCLUDING checksum
 */
export async function digestPromptAsset(asset: PromptAsset): Promise<string> {
  const serialized = serializePromptAssetForDigest(asset);
  const encoded = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Verify asset integrity: checksum must match computed digest
 */
export async function verifyPromptAssetIntegrity(asset: PromptAsset): Promise<boolean> {
  const computedDigest = await digestPromptAsset(asset);
  return computedDigest === asset.checksum;
}

/**
 * Enforce immutability constraint at runtime
 * Returns true if asset can be mutated, false if locked
 */
export function canMutatePromptAsset(asset: PromptAsset): boolean {
  return !asset.immutable;
}
