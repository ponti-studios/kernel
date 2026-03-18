/**
 * Generator types for file generation orchestration.
 */

/**
 * Generation result returned by the generator after processing.
 */
export interface GenerationResult {
  /** Successfully generated files */
  generated: string[];

  /** Files that failed to generate */
  failed: Array<{ path: string; error: string }>;

  /** Files that were skipped (up to date) */
  skipped: string[];

  /** Files that were removed (no longer in profile) */
  removed: string[];
}
