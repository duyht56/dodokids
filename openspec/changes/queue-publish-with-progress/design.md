## Context

Publish is the only long-running operator action still executed **inside its
triggering HTTP request**. `PublishWeekButton` POSTs `/api/publish/[week]`, which
calls `publishWeekToServer(week, dryRun)` synchronously:

1. `uploadLocalAssetsForWeek(week)` — uploads every not-yet-uploaded local asset
   to GCS (the slow part; unbounded by week size).
2. `buildPublishPayload(week, dryRun)` — assembles lessons/activities.
3. `fetch POST ${KIDO_SERVER_URL}/admin/publish` — server runs its deterministic
   guard + idempotent upsert and returns a `{ written, rejected }` report.

The UI shows only `...` until (2)+(3) return. Every other long pipeline step
(seed-review, generate, image, audio) already runs on **Bull + Redis** queues
(`src/queue/index.ts`), with `enqueueSeedReview()` returning
`{ jobId, total, estimatedSeconds }` and `GET /api/pipeline/queue` surfacing
counts / paused state / attached-worker count. Publish should adopt the same
pattern. The server ingest is idempotent and unchanged, which is what makes a
backgrounded, retryable publish safe.

Constraints:
- Reuse existing Bull infra and the queue/worker admin controls; no new
  service, no new external dependency.
- `publishWeekToServer` is also called by the `publish-week.ts` CLI, which must
  keep working unchanged.
- kido-server contract (`/admin/publish`, auth token, guard, upsert) is frozen
  by this change.

## Goals / Non-Goals

**Goals:**
- Publish enqueues and returns a `jobId` immediately; the actual work runs on a
  `publish` worker.
- Staged, countable progress (verify → upload n/total → build → transfer
  n/total → done) readable via a status endpoint and rendered as a progress bar.
- Progress survives reload (re-attach by `jobId`).
- One in-flight publish per week; retries are safe (idempotent ingest).
- `publish` queue reaches parity in the admin queue/worker panel.

**Non-Goals:**
- No change to the server ingest, the content guard, idempotent upsert, or the
  `draft → pending_review → approved → imported` lifecycle.
- No websocket/SSE push; short-interval polling is sufficient and matches the
  existing `AutoRefresh` pattern.
- Not touching the `publish-activities-to-production` auth-token work (orthogonal;
  both edit `publish-client.ts` for different reasons).
- No mobile impact.

## Decisions

### 1. Progress lives in Bull job state, not a new Mongo model
Use Bull's own job lifecycle plus `job.progress(payload)` as the source of truth,
and read it back with `publishQueue.getJob(jobId)`. Progress payload shape:
`{ phase: 'verify'|'upload'|'build'|'transfer'|'done', done: number, total:
number, message?: string }`. The terminal report is the job's `returnvalue`
(success) or `failedReason` (failure).
- **Why:** zero new schema, mirrors the existing queues, and `jobId` in the
  client makes reload re-attach trivial. Bull already persists state in Redis.
- **Alternative considered — a `PublishJob` Mongo doc / reuse `PipelineLog`:**
  more durable across a Redis flush, but adds a model + write path and a second
  source of truth to keep in sync. Rejected for the primary path; see Risk on
  retention. The final report is independently recoverable via
  `GET /admin/published`, so losing Redis state is not data loss.

### 2. Status via polling, not push
`GET /api/publish/status/[jobId]` returns `{ state, phase, done, total, report,
error }` derived from `getJob(jobId)` + `job.getState()`. `PublishWeekButton`
polls every ~1.5s while the job is non-terminal.
- **Why:** simplest, and the admin app already polls (`AutoRefresh`,
  `/api/pipeline/queue`). SSE/websockets add infra for a single operator screen.

### 3. Single-flight per week via an in-flight check, not a fixed jobId
Before enqueuing, scan `getWaiting()` + `getActive()` for a job whose
`data.week === week`; if found, return that job's id instead of adding a new one.
Otherwise enqueue with a fresh id and `week` in `data`.
- **Why:** a deterministic Bull id (`publish-w${week}`) would let a *completed*
  job block a legitimate re-publish until it is manually removed. An explicit
  in-flight scan allows re-publishing a week after the previous job finished,
  while still refusing concurrent duplicates.
- Worker concurrency is `publishQueue.process(1, …)` so at most one publish runs
  at a time globally — protects both GCS upload churn and the server.

### 4. Thread progress through `publishWeekToServer`, keep the CLI intact
Add an optional `onProgress?: (p: PublishProgress) => void` parameter (and thread
a per-asset callback into `uploadLocalAssetsForWeek`). The worker passes a
callback that calls `job.progress(...)`; the CLI passes nothing and behaves
exactly as today. Dry-run passes through the same function and simply skips the
upload phase (already the case) — the worker just won't emit `upload` progress.
- **Why:** one publish code path for CLI, sync fallback, and worker; no behavior
  fork.

### 5. `publish` queue joins the admin queue/worker registry
Add `publishQueue` + `PublishJobData` to `src/queue/index.ts` and `closeQueues`;
add `publish.worker.ts`; add `'publish'` to the `NAMES` set in
`app/api/pipeline/queue/route.ts` and to the worker start/stop control set.
- **Why:** parity so an operator can see counts, pause/resume, and — critically —
  spot a zero-worker `publish` queue where jobs would silently pile up in
  `waiting`.

## Risks / Trade-offs

- **Redis evicts a completed job before the UI reads its report** → tune
  `removeOnComplete`/`removeOnFail` to retain recent publish jobs (small N or a
  TTL of minutes, not the default immediate removal); and the written content is
  still verifiable via `GET /admin/published`, so no data is lost even in the
  worst case.
- **`uploadLocalAssetsForWeek` currently reports only a final `{ uploaded }`
  count** → to get per-file upload progress it must accept a callback invoked per
  asset. If that refactor is deemed too invasive, fall back to a coarse
  three-step progress (verify → upload → transfer) without per-asset counts; the
  spec's countable-upload scenario would then degrade gracefully to phase-only.
- **Operator forgets to start the publish worker → job stuck in `waiting`** →
  mitigated by the zero-worker warning added to `pipeline-operations`, and by
  starting the publish worker together with the others in the "start all"
  control.
- **Two workers processing publish concurrently** → prevented by
  `process(1)` and the single-flight per-week check; the idempotent server ingest
  is the final backstop.
- **Reload mid-publish** → the client keeps `jobId` (in component state / URL)
  and re-attaches via the status endpoint; a truly fresh session with a lost
  `jobId` falls back to the queue panel, which still shows the active publish job.

## Migration Plan

Additive and reversible; no data migration.
1. Land the queue/worker + `publishWeekToServer(onProgress)` refactor (CLI
   unaffected).
2. Switch `POST /api/publish/[week]` from calling `publishWeekToServer` directly
   to enqueuing + returning `jobId`; add the status route.
3. Update `PublishWeekButton` to enqueue → poll → progress → report.
4. Add `publish` to the queue/worker admin panel.
5. Start a `publish` worker in the pipeline process set (dev + deploy runbook).

**Rollback:** revert the route to call `publishWeekToServer(week, dryRun)`
synchronously — the function is retained with its original signature — and revert
the button. No server or schema state to unwind.

## Open Questions

- Retention policy for completed publish jobs in Redis (fixed count vs TTL) — pick
  a value that comfortably outlives the UI poll window.
- Should the publish worker auto-start with the other workers by default, or stay
  opt-in like the rest of the start/stop controls?
- Do we also want to persist the final report to `PipelineLog` (durable audit)
  even though it is recoverable from `GET /admin/published`?
