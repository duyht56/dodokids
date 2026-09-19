## Why

Publishing an approved week to kido-server runs **synchronously inside a single
HTTP request**: `PublishWeekButton` → `POST /api/publish/[week]` →
`publishWeekToServer()` uploads every local asset to GCS, builds the payload, and
POSTs `/admin/publish` — all before the response returns, while the operator sees
only a `...` spinner. For a full week (up to ~8 lessons × 8 activities plus their
images/audio) the asset upload alone can run long enough to hit request/proxy
timeouts, and if the tab is closed or the request drops the operator has no idea
whether content reached production. There is mature Bull + Redis queue infra
(generate/image/audio/seed-review) with a `jobId`/progress pattern already used
for every other long pipeline step — publish is the last operator action still
blocking and blind. Move it onto a queue with live, staged progress so the
operator can see exactly where a publish is and trust that it finished.

## What Changes

- Add a **`publish` Bull queue + worker** that runs the existing publish logic as
  a durable background job, broken into observable phases: *verify week approved
  → upload local assets to GCS (n/total) → build payload → transfer to
  `/admin/publish` → persist report*. The worker emits `job.progress` at each
  phase; the underlying server ingest (deterministic guard + idempotent upsert)
  is unchanged, which is what makes a queued retry safe.
- Change `POST /api/publish/[week]` to **enqueue** and return a `jobId`
  immediately instead of blocking until publish completes. Add a
  `GET /api/publish/status/[jobId]` route the UI polls for `{ phase, done, total,
  state, report, error }`.
- **Single-flight per week**: a second publish (or dry-run) for a week already in
  flight is refused/deduped rather than double-uploading and double-posting.
- Update `PublishWeekButton` to enqueue, then poll and render a **staged progress
  bar** (current phase + assets uploaded + activities written) until the job
  finishes, then show the existing written/rejected report. Progress is derived
  from durable job state, so it survives a reload or navigating away and back.
- Surface the `publish` queue in the existing admin queue panel (counts,
  paused state, attached-worker count) and include it in pause/resume and
  worker start/stop, at parity with the other queues.
- Dry-run keeps its fast, upload-free path but flows through the same job so the
  UI has one code path; it simply skips the GCS-upload phase.

## Capabilities

### New Capabilities

- `queued-publish`: Publishing an approved week runs as a durable background
  queue job with a stable `jobId`, staged progress phases (verify → upload →
  build → transfer → done), a status endpoint the UI polls, single-flight
  guarding per week, and terminal success/failure carrying the written/rejected
  report. Covers the publish job lifecycle and progress contract, not the
  server-side transfer mechanics.

### Modified Capabilities

- `content-human-gate`: The "Per-week batch publish" action SHALL enqueue a
  background publish job and display live staged progress that survives reload,
  rather than issuing one synchronous blocking request; the final
  written/rejected report is shown on job completion.
- `pipeline-operations`: The `publish` queue SHALL join the set of queues the
  operator can observe (counts, paused state, attached-worker count) and
  pause/resume and whose worker can be started/stopped from the admin UI, at
  parity with generate/image/audio/seed-review.

## Impact

- **kido-pipeline**:
  - `src/queue/index.ts` — new `publishQueue` + `PublishJobData`; add to
    `closeQueues`.
  - `src/queue/workers/publish.worker.ts` (new) — runs staged publish, emits
    progress; registered in the workers set the UI can start/stop.
  - `src/publish/publish-client.ts` — refactor `publishWeekToServer` so its
    phases (upload / build / transfer) can report progress to the worker; no
    change to the wire payload or server contract.
  - `app/api/publish/[week]/route.ts` — enqueue + return `jobId` (was
    synchronous); new `app/api/publish/status/[jobId]/route.ts`.
  - `app/api/pipeline/queue/route.ts` + worker-control route — add `publish` to
    the queue/worker name set.
  - `app/components/PublishWeekButton.tsx` — enqueue → poll → progress bar →
    report.
- **kido-server**: none. `POST /admin/publish` (deterministic guard, idempotent
  upsert, reference-only assets, auth token) is unchanged; queued retries rely on
  its existing idempotency.
- **mobile**: none.
- **Infra**: publish now needs a running worker consuming the `publish` queue
  (same Redis, same start/stop UI as the other workers); no new services.
- **No impact**: activity/lesson schema, the `draft → pending_review → approved →
  imported` lifecycle (publish still sets `imported`), the publish auth-token
  work in `publish-activities-to-production` (orthogonal; both touch
  `publish-client.ts` but for different concerns).
