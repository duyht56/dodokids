## 1. Converge the CLI runner on the gate flow

- [x] 1.1 In `src/pipeline/runner.ts` `finishPipeline`, replace the `importStep(...)` call with an update setting the activity `status: 'pending_review'` after assets + image + audio (mirror `generate.worker.ts`)
- [x] 1.2 Remove the now-unused `importStep` / `5-import` import from `runner.ts`; keep the audio attach (`audioFiles`) behavior
- [x] 1.3 Verify the seed still transitions `pipelineStatus: 'done'` and day/week Telegram notifications still fire
- [x] 1.4 Add a test asserting a CLI sync run leaves the activity at `pending_review` (not `approved`/`imported`)

## 2. Retire the legacy local-import

- [x] 2.1 Remove `src/pipeline/steps/5-import.ts` from the run path (delete the file or reduce it to a no-op that is no longer called)
- [x] 2.2 Deprecate `app/api/import/[week]/route.ts`: return a clear "use the publish flow" response (e.g. 410) instead of mutating activity/seed statuses
- [x] 2.3 Deprecate `app/import/[week]/page.tsx`: point users to `/published` and the week publish action; stop offering local import
- [x] 2.4 Grep for references to the import route/page/step and update links (dashboard, docs) to the publish flow

## 3. Authoritative spec — KIDO_CONTENT_PIPELINE.md

- [x] 3.1 Create `docs/KIDO_CONTENT_PIPELINE.md` covering Step 0 (seed review) → Step 5 + publish, with the canonical status lifecycle (`draft → pending_review → approved → imported`)
- [x] 3.2 Document the 18 AI-review rules (from `prompts/review.prompt.ts`) and the seed-review rules
- [x] 3.3 Document the queue/CLI contracts (Bull queues, worker responsibilities, `pipeline:week` sync mode) and the publish handoff to `kido-server`
- [x] 3.4 Document known gaps and the intentional deviation (queue/CLI instead of the backlog's per-step HTTP endpoints)

## 4. Update KIDO_PIPELINE.md for handover

- [x] 4.1 Correct the runner/publish note (#11) to reflect that CLI now ends at `pending_review` and legacy import is retired
- [x] 4.2 Add the EPIC-012 ↔ code reconciliation table
- [x] 4.3 Add a handover runbook: how to run (workers vs CLI), monitor (`pipeline_logs`, `/seeds`, `check-seed-review-status`), troubleshoot (Redis, Gemini/Imagen rate limits), and the caveat about legacy `approved`/`imported` activities needing re-verification
- [x] 4.4 Link `KIDO_CONTENT_PIPELINE.md` as the authoritative spec

## 5. Verification

- [x] 5.1 Run `npm test` (vitest) in `kido-pipeline` and confirm green
- [x] 5.2 Typecheck (`npx tsc --noEmit -p tsconfig.json`) with no new errors introduced by this change
- [x] 5.3 Manually confirm both run modes leave an activity at `pending_review` and only publish reaches `imported`
