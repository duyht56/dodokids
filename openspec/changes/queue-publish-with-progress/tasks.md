## 1. Publish queue + job contract (land first — harmless to current callers)

- [x] 1.1 In `kido-pipeline/src/queue/index.ts` add `publishQueue = new Bull('publish', config.redis.url)`, a `PublishJobData` interface (`{ jobId: string; week: number; dryRun: boolean }`), and include `publishQueue` in `closeQueues()`
- [x] 1.2 Define the shared progress contract type `PublishProgress = { phase: 'verify'|'upload'|'build'|'transfer'|'done'; done: number; total: number; message?: string }` (export from the publish module) and a `createPublishJobId()` helper mirroring `createJobId()`
- [x] 1.3 Add an `enqueuePublish(week, dryRun)` service function: scan `getWaiting()`+`getActive()` for an existing job with matching `data.week`; if found return its `jobId` (single-flight), else `publishQueue.add(...)` with a fresh id and return `{ jobId, existing: boolean }`

## 2. Thread progress through the publish path (keep CLI unchanged)

- [x] 2.1 In `kido-pipeline/src/publish/upload-local-assets.ts`, add an optional per-asset callback to `uploadLocalAssetsForWeek` (e.g. `onEach?: (done, total) => void`) invoked as each asset uploads; default undefined preserves current behavior
- [x] 2.2 In `kido-pipeline/src/publish/publish-client.ts`, add an optional `onProgress?: (p: PublishProgress) => void` parameter to `publishWeekToServer`; emit `verify`/`upload`(n/total)/`build`/`transfer`(n/total)/`done` phases, and pass the per-asset callback into `uploadLocalAssetsForWeek`. No change to payload, headers, or the server contract
- [x] 2.3 Confirm the `publish-week.ts` CLI still calls `publishWeekToServer(week, dryRun)` with no callback and behaves exactly as before (progress is a no-op when `onProgress` is undefined)
- [x] 2.4 Update/extend `publish-client.test.ts`: `onProgress` receives ordered phases with monotonic `done ≤ total`, dry-run skips the `upload` phase, and the token/abort behavior from `publish-activities-to-production` is unaffected

## 3. Publish worker

- [x] 3.1 Add `kido-pipeline/src/queue/workers/publish.worker.ts` following `seed-review.worker.ts`: `connectDB()`, `publishQueue.process(1, …)` calling `publishWeekToServer(week, dryRun, onProgress)` where `onProgress` calls `job.progress(p)`; return the `PublishReport` as the job result
- [x] 3.2 Wire `on('failed')` / `on('completed')` logging and ensure a thrown error ends the job in `failed` state carrying the message (no partial "done")
- [x] 3.3 Set `removeOnComplete`/`removeOnFail` retention so recent publish jobs (and their report/error) stay readable by the status endpoint after finishing (small count or minutes-long TTL, not immediate removal)

## 4. API: enqueue + status

- [x] 4.1 Change `app/api/publish/[week]/route.ts` POST to keep the `checkWeekComplete` guard for live publish, then call `enqueuePublish(week, dryRun)` and return `{ jobId }` (HTTP 202) instead of awaiting `publishWeekToServer`
- [x] 4.2 Add `app/api/publish/status/[jobId]/route.ts` GET: `publishQueue.getJob(jobId)` + `job.getState()`, returning `{ state, phase, done, total, report, error }` (progress from `job.progress`, report from `returnvalue`, error from `failedReason`); 404 when the job id is unknown
- [x] 4.3 Verify a second POST for a week already in flight returns the existing `jobId` (single-flight) rather than enqueuing a duplicate

## 5. Admin UI: enqueue → poll → progress → report

- [x] 5.1 Update `app/components/PublishWeekButton.tsx` to POST (dry-run or live), store the returned `jobId`, and poll `GET /api/publish/status/[jobId]` (~1.5s) while the state is non-terminal
- [x] 5.2 Render a staged progress bar from the polled progress (phase label + `done/total` for upload/transfer) instead of the `...` spinner; on `completed` show the existing written/rejected report, on `failed` show the error and leave the week re-publishable
- [x] 5.3 Persist `jobId` across reload (component state seeded from a query param or the queue panel) so reloading re-attaches to the in-flight job and progress continues

## 6. Queue/worker panel parity

- [x] 6.1 Add `'publish'` to the `NAMES` set and `queueMap()` in `app/api/pipeline/queue/route.ts` so counts / paused state / attached-worker count and pause/resume cover the publish queue
- [x] 6.2 Add the publish worker to the UI worker start/stop control set (and the "start all" path), and confirm a zero-worker publish queue shows the worker-count-zero warning distinct from paused
- [x] 6.3 Update the queue panel component to render the `publish` row alongside the other queues

## 7. Verify, docs & runbook

- [x] 7.1 Run `cd kido-pipeline && npm test` and `npm run build`; all publish/queue tests pass
- [ ] 7.2 Manual: enqueue a dry-run and a live publish for a fully-approved week; watch progress advance through phases, reload mid-run and confirm re-attach, confirm the final report matches the pre-change synchronous output
- [x] 7.3 Update `kido-pipeline/PUBLISHING.md` (and the admin ops notes) to document that publish now runs on the `publish` queue requiring a running publish worker, plus the enqueue/status/progress flow and rollback (revert route to synchronous `publishWeekToServer`)
