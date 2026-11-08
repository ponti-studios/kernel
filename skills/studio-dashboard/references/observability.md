# Observability: structured logs + OTel → New Relic

Two signals, one rule each: logs are JSON lines the app writes; traces are started before
the app and never imported by it.

## Logs

One JSON object per line, `level`/`event`/`ts` plus fields, warnings and errors to stderr:

```json
{
  "ts": "…",
  "level": "info",
  "event": "boot.env",
  "file": "/Users/…/.hominem.env",
  "found": true,
  "keys": ["HOMINEM_NEW_RELIC_API_KEY"]
}
```

- `LOG_LEVEL` filters; the default is `info`.
- Report env **key names**, never values — a loader that echoes a config file is the fastest
  way to leak a license key into a log aggregator.
- Emit at the seam, not at the edge: `ledger.write_failed`, `generation.recorded`,
  `otel.started`. A caught-and-swallowed error still needs its line, or the swallow is
  invisible.

## Traces

`apps/web/otel.mjs` runs via `node --import` from the `start` script, before SvelteKit:

```js
new NodeSDK({
  resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'ponti-studio', … }),
  traceExporter: new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
    headers: { 'api-key': licenseKey },
  }),
  instrumentations: [new HttpInstrumentation()],
});
```

- **Endpoint follows the key:** `eu01…` → `https://otlp.eu01.nr-data.net:4318`,
  otherwise `https://otlp.nr-data.net:4318`. Hardcoding the US host with an EU key exports
  into the void without an error you notice.
- **One attribute namespace for domain facts** (`studio.tool`, `studio.model`,
  `studio.cost_usd`, `studio.cost_source`, `studio.units`, `studio.status`,
  `studio.latency_ms`) so spend and latency are queries instead of a log grep. Omit absent
  values rather than sending `0`; a zero cost is a claim.
- **Hand the tracer over, don't import it.** In the preload:

```js
const requireFromSdk = createRequire(import.meta.resolve("@opentelemetry/sdk-node"));
const { trace } = requireFromSdk("@opentelemetry/api"); // the SDK's own instance
globalThis.__studioTracer = trace.getTracer("ponti-studio");
```

Adding `@opentelemetry/api` to the app's dependencies re-resolves SvelteKit's peers and
breaks SSR; app code then does `globalThis.__studioTracer?.startSpan(…)` and no-ops in dev.

- **No key is a supported state.** Log `otel.disabled` with the reason and carry on; never
  let missing credentials abort the server.

## Verify a production start

```bash
cd apps/web && pnpm build
PORT=4408 ORIGIN=http://127.0.0.1:4408 node --import ./otel.mjs build/index.js
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4408/          # expect 200
curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:4408/usage     # expect 200
```

Expect `otel.started` (with the endpoint), `otel.tracer_ready`, and no `level:error` line.
That proves the SDK started and the app served; it does **not** prove the data landed in
New Relic — say which of the two you checked instead of claiming end-to-end.

## Why not the New Relic Node agent

`newrelic` 14.x aborts (exit 134) inside `bootstrapInstrumentation` → `setupSubscribers` →
`tracingChannel`, recursing through Node's bundled undici. Reproduced in the built server
and inside Vite's SSR module graph, on two Node majors, with `undici` and
`diagnostics_channel` instrumentation disabled and with a config file excluding them.
Instrumentation that patches Node internals does not survive this stack; an OTLP exporter
does. Escalate to the vendor only if a specific NR-only feature is required.
