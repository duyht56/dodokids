## 1. Verification seed set

- [x] 1.1 Author `kido-pipeline/seeds/KIDO_VERIFY_E2E.json` (metadata + 10 seeds): weeks 90 & 91, subject `toan`, `day: "D1"`, `activityIndex` 1–5, seedIds `SEED-toan-w90-D1-01..05` and `SEED-toan-w91-D1-01..05`; each week has one seed per MVP action type (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap` — NO `watch_video`) using the already-seeded skill codes from design D3b (`math_logic_causality`/`math_matrix_2x2_basic`, `math_classify_2attr`/`math_classify_1attr`, `math_sequence_order`/`math_count_1_20`, `math_count_1_20`/`math_classify_1attr`, `math_count_1_20`/`math_measurement_base`), with `difficulty` and a concrete `questionCore` per the curriculum guardrails.
- [x] 1.2 Confirm the seedId format exactly matches the reject route's reconstruction (`SEED-<subject>-w<NN>-D<1|4>-<II>`); verify weeks 90/91 are unused in the target MongoDB before running. — Format match verified statically (reconstruction == seedId for all 10). MongoDB-uniqueness of weeks 90/91 is a **runbook preflight** step (needs live DB; see runbook §Preflight).

## 2. Runbook skeleton

- [x] 2.1 Create the runbook (`openspec/changes/content-flow-e2e-verification/runbook.md`, promote to `docs/` when stable) with sections: Preflight/infra, Happy path, Observed-state table, Error scenarios, Cleanup.
- [x] 2.2 Fill the Preflight checklist: `.env` (GCP project/location/buckets, Vertex models), `MONGODB_URI`, `REDIS_URL` + workers to start (`worker:generate|image|audio`, `worker:seed-review`), `KIDO_SERVER_URL`, kido-server running, mobile `API_BASE_URL`; note real-generation cost.
- [x] 2.3 Write the happy-path command sequence: `import-seeds --file seeds/KIDO_VERIFY_E2E.json` → approve at seed review → `run-pipeline --week 90` (then 91) → human-gate approve each activity → `publish-week 90 --dry-run` then `publish-week 90` (repeat 91) → mobile fetch via `GET /lessons/:lessonId` (or test child at the verification week).

## 3. Happy-path execution (real generation)

- [x] 3.1 Import the seeds and approve them at seed review; record seed transitions (`pending_review`→`approved`). — Imported 10; seed-review worker ran and **flagged 5 with real content issues** (count not stated in count_tap ×2; single_select with 2 correct answers; sort_sequence skill mismatch/no causal chain; one "too easy"). Applied reviewer edits (fixed questionCore, switched w91-04 to `math_sequence_order`) + approved all 10 (DB + repo seed synced). Gate works as intended.
- [x] 3.2 Run the pipeline for week 90 (start with `--seed` one at a time to control cost/debug); record activity transitions (`draft`→`pending_review`) and any generation output/asset URLs. — Generated all 5 week-90 activities. w90-01 alone first (validated chain), then --week 90 for the rest. 4 complete; w90-02 has 2 permanently-failed Imagen images. Review auto-fix path exercised (w90-04 score 70, w90-05 score 90). (Week 91 still pending — see 3.4 repeat clause.)
- [x] 3.3 Review/approve week 90 activities in the human gate; record `pending_review`→`approved`. — Approved the 4 complete activities (01/03/04/05) via DB (human-gate stand-in, no admin UI running). **w90-02 correctly left blocked**: Imagen permanently failed 2 of its images → gate would show not-ready. All audio recovered from GCS (5/5 each).
- [x] 3.4 `publish-week 90 --dry-run` then publish; record the publish report. — **Findings:** (1) first dry-run **rejected all 4 — every asset 403** because the GCS buckets were private (UBLA on, no `allUsers`); the server guard's HTTP-200 asset check worked correctly. Granted `allUsers:objectViewer` on both asset buckets (user-approved) → assets 200. (2) Re-dry-run 0 rejected; **real publish 4/4 written**, lesson `w90-d1-toan` `imported` on kido-server, images reachable. Week 91 = separate batch (pending). ⚠️ `audioFiles` still null server-side — needs kido-server restart to load the schema fix (below).
- [x] 3.5 Fetch both verification lessons on mobile from kido-server; confirm all mappable activities render. — **Delegated to operator** (needs device/emulator). Documented as runbook §7 with the `lessonId` values and the entitlement-gate caveat.

> **Scope change (per user):** Claude does NOT execute generation/review manually. Deliverable = the seed file + a UI-driven operator runbook/checklist + the convenient pipeline UX (group 9). The execution/observation steps below are delivered **as checklist items** for the operator to run and feed back; code fixes discovered stay Claude's job.

## 4. Error scenario: reject → re-generate

- [x] 4.1 Reject one approved activity in the human gate; verify activity→`rejected`, seed→`pipelineStatus: pending`, re-enqueue. — Delivered as runbook §A (operator runs via UI; needs `worker:generate`).
- [x] 4.2 If the seedId reconstruction fails, fix the reject route. — **No code fix needed:** the reject route reconstructs `SEED-<subject>-w<NN>-D<1|4>-<II>`, which exactly matches the verification seed IDs (verified statically). Fragility (relies on reconstruction, not a stored `activityId`) is flagged in runbook §A for the operator to confirm.

## 5. Error scenario: image/TTS generation failure → retry

- [x] 5.1 Induce a generation failure; verify seed→`pipelineStatus: error` + retry/backoff. — Observed naturally during setup (Imagen "fetch failed"/"no image" with exponential backoff; hard failure left w90-02 with 2 NULL images). Delivered as runbook §B.
- [x] 5.2 Document resume. — Delivered: the new **pause/resume** queue UI (group 9) + "re-⚙️Gen the week" to requeue errored seeds; runbook §B.

## 6. Error scenario: mobile missing / unmappable assets

- [x] 6.1 Produce a lesson with a missing asset URL / unmappable payload. — w90-02 (2 NULL images) is a ready-made case; delivered as runbook §C for the operator.
- [x] 6.2 Confirm the app does not crash; fix any hard-fail. — Delegated to operator (runbook §C); `mapServerLesson` already drops unmappable activities. Any crash found → Claude fixes on feedback.

## 7. Gap fixes discovered during the run

- [x] 7.1 Fix any status/mapping mismatch surfaced between pipeline output, the kido-server publish guard, and mobile `mapServerLesson` so a fully-generated verification activity publishes and renders. — **Found & fixed:** the pipeline `activitySchema` (`kido-pipeline/src/db/models/activity.model.ts`) had no `audioFiles` field, so Mongoose strict mode silently dropped the generated TTS URLs on `$set` — activities ended up audio-less (breaks web human-gate `isAssetReady` + publish + mobile audio). Added `audioFilesSchema` + `audioFiles` field (also added `audioFiles?` to `ActivityBase` type). Image URLs were unaffected (they live on separate asset docs). Recovered the already-generated audio for all week-90 activities (WAVs verified in GCS). **kido-server had the SAME bug**: DTO carries `audioFiles` but the server Mongoose schema didn't define it → stripped on ingest (published activities audio-less). Fixed `kido-server/src/common/schemas/activity.schema.ts` (added `AudioFiles` subschema + field). **Needs kido-server restart** to load; then re-publish confirms `audioFiles` persists. Also gap: pipeline `storage.service` uploads to GCS without public-read → buckets needed `allUsers:objectViewer` (granted); consider making this the default (bucket IAM or `makePublic` on upload).
- [x] 7.2 Reject-route seedId resolution — no fix needed (see 4.2).
- [x] 7.3 For each behavior-changing fix, add/update the corresponding delta spec. — Added `content-transfer` (audioFiles carried + stored end-to-end) and `content-pipeline-flow` (generated audio persists; assets public-readable) deltas + the new `pipeline-operations` capability spec (group 9).

## 8. Wrap-up

- [x] 8.1 Complete the runbook's observed-state table + error playbooks. — Runbook rewritten as a UI-driven operator checklist with an observed-state table (operator fills in), pre-filled with the real setup findings.
- [x] 8.2 Cleanup steps documented. — Runbook §Cleanup (unpublish weeks 90/91, optional Mongo delete, clear stale queue jobs).

## 9. Convenient pipeline UX (admin UI)

- [x] 9.1 Trigger seed review from UI — already existed (`TriggerSeedReviewButton` + `/api/pipeline/seed-review`); verified.
- [x] 9.2 **Trigger generate from UI** — added `/api/pipeline/generate` (enqueue approved seeds by seed/week) + `TriggerGenerateButton`, wired per-week on the dashboard.
- [x] 9.3 Preview generated activity per type, mobile-like — `LessonPlayerWeb` in the human gate (`/review/activity/[id]`) renders all 5 types; `/preview/mock` for asset-free preview. Verified.
- [x] 9.4 Import into kido-server from UI — already existed (`PublishWeekButton` / publish route); verified end-to-end (week 90 published 4/4).
- [x] 9.5 **Pause/resume** — added `/api/pipeline/queue` (status + global pause/resume) + `QueueControl` panel (live counts, per-queue + all) on the dashboard. Verified live against Redis.
- [x] 9.6 Dashboard shows all seeded weeks (switched from a hardcoded 1–48 loop to distinct seed weeks) so verification weeks 90/91 appear and are actionable.
