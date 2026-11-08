# Auditing a session's image count and spend

Use when the user asks "how many images did that generate / what did it cost".

1. **Count artifacts on disk, not intentions.** Glob each run's prefix and
   exclude files that predate the session (other apps write to the same temp dir):

   ```bash
   ls -la /tmp/*.png | awk '{print $5, $9}' | sort -k2
   ls -1 ~/Documents/images/<project>/*.png
   ```

2. **Count billed calls, not successes.** Walk the scripts you ran and add one
   call per generation attempt. Filtered rejections and transport failures are
   still billed, so successes + rejections = attempts.

3. **Reconcile.** Attempts minus rejections must equal the artifact count. If it
   does not, a probe's output was overwritten or saved under another prefix —
   find it before reporting a number.

4. **Prefer exact costs over derived ones.** Per-call `usage.cost` comes back in
   the response and lands in `~/.hominem/ai_usage/*.json`; sum those for the
   models in play. If the calls were not logged, say so, and derive from (5).
   Enumerate that tree with `find ~/.hominem/ai_usage -type f -name '*.json'`
   rather than a flat glob: an external archiver reorganises the directory into
   `YYYY/MM/` subdirectories, and a flat glob then returns nothing — which reads
   as "the logs were deleted" when they were merely moved.

5. **Key-level totals for the remainder:**

   ```bash
   curl -s -H "Authorization: Bearer $K" https://openrouter.ai/api/v1/key
   curl -s -H "Authorization: Bearer $K" https://openrouter.ai/api/v1/credits
   ```

   `usage_daily` minus the exact per-render costs gives the spend on logged-out
   probes. `budgets[]` shows the daily workspace cap and its reset time;
   `limit` / `limit_remaining` is the lifetime key limit.

**Caveat to state in the answer:** key-level usage covers every session sharing
that key. If another session used it the same day, part of the total is not
ours — report the derived portion as an estimate rather than an exact figure.

## When per-call cost is unavailable

Do not read "cost not reported" as zero spend. Two mechanisms hide it:

- **Image generations have no retrievable cost record.** The returned id
  (`gen-img-…`) 404s on `GET /api/v1/generation`, so a provider helper that looks
  it up returns an empty object and any usage row keyed on it records nothing.
  Speech has the same gap — that endpoint covers generations, not speech.
- **Key counters settle late.** A call that has just returned can show a `$0.00`
  delta seconds later and a real one a minute after that. Bracket the run: read
  `usage` before and after, record the elapsed time, and re-read before
  concluding anything.

When two calls fall inside one bracket the split is **inferred, not measured** —
say which figure is inferred and from what.

## Where each modality publishes its rate

| Modality | Rate source                                                                                       | Estimate before spending?                               |
| -------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Video    | `pricing_skus` on `GET /api/v1/videos/models` (`duration_seconds`, `duration_seconds_with_audio`) | yes — quote it                                          |
| Speech   | `pricing.prompt` on `GET /api/v1/models?output_modalities=speech`                                 | per-token only; character count is an upper-bound proxy |
| Image    | `GET /api/v1/images/models` reports an empty `pricing` object                                     | no — measure from key totals                            |

Because images cannot be quoted up front, keep the pattern that makes that
affordable: probe geometry and composition at the smallest resolution with no
reference images, then spend on the referenced high-resolution pass only for the
render worth keeping.
