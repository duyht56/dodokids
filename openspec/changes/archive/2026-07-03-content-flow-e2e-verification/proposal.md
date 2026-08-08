## Why

The content pipeline → kido-server → mobile flow exists in code (seed import → seed review → generate/review/assets/image/audio → human-gate UI → per-week publish → `/lessons` → mobile render), but it has never been exercised end-to-end across all six action types in one pass. We don't know how the system actually behaves on a fresh full-coverage run, nor how it degrades when things fail (a rejected activity, a failed image/TTS generation, a lesson reaching mobile with missing/unmappable assets). We need a canonical, repeatable verification: a small all-action-type seed set, a documented runbook to drive the whole flow with real generation, and observed/expected behavior for the key failure modes — fixing gaps found along the way.

## What Changes

- Add a **verification seed set**: 10 activities = the **5 MVP action types** (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`) × 2, packaged as **2 weeks × 1 lesson (5 activities each)** so the per-week, human-triggered publish batch runs **twice**. `watch_video` is **out of scope (deferred post-MVP)** — it is not part of the Math curriculum and has no generation path. Seeds use **real, already-seeded curriculum skill codes** (from [KIDO_MATH_CURRICULUM.md](../../../docs/KIDO_MATH_CURRICULUM.md) §5) mapped to each action type, dedicated verification week numbers (out of the live curriculum range), and seedIds matching the format the reject→regenerate route reconstructs (`SEED-<subject>-w<NN>-D<1|4>-<II>`).
- Add an **end-to-end runbook** covering the happy path across all three repos with **real Vertex generation** (Gemini/Imagen/TTS): import seeds → approve at seed review → run pipeline → review in the human gate → publish week to kido-server (per-week, human-clicked) → fetch and render on mobile. The runbook states required infra/env (MongoDB, Redis + workers, GCS, GCP/Vertex keys, kido-server running, mobile pointed at kido-server) and records observed states at each hop.
- Document **error-handling behavior** for three failure scenarios, with expected vs. observed outcomes: (1) human-gate **reject → re-generate** (activity → `rejected`, seed → `pipelineStatus: pending`, re-enqueued to `generateQueue`); (2) **image/TTS generation failure → retry/resume** (seed → `pipelineStatus: error`, worker retry/backoff, how to resume); (3) **mobile receives a lesson with missing/unmappable assets** (skeleton/not-ready/fallback/skip behavior via `mapServerLesson`).
- **Fix gaps discovered** while executing the flow (e.g. seedId-format coupling in the reject route; any status/mapping mismatch between pipeline, server guard, and mobile normalization). Fixes that change specced behavior are recorded as modified-capability deltas as they arise. (`watch_video` is explicitly NOT a gap to fix here — it is deferred post-MVP.)

## Capabilities

### New Capabilities
- `content-flow-verification`: A canonical end-to-end verification asset — a 5-MVP-action-type seed set (2 weeks / 2 publish batches, real curriculum skill codes), a UI-driven operator runbook/checklist that drives seed→pipeline→human-gate→per-week-publish→mobile, and documented expected behavior for the reject→regenerate, generation-failure→retry/pause-resume, and mobile-missing-asset scenarios.
- `pipeline-operations`: Operator controls in the admin UI to run/observe the pipeline without the CLI — trigger seed review, **trigger generation**, preview per-type (mobile-like), publish to kido-server, and **pause/resume** the queues; dashboard lists all seeded weeks.

### Modified Capabilities
- `content-transfer`: audio file URLs (`audioFiles`) are now carried in the publish payload AND stored by kido-server (schema field added so strict-mode does not drop them); reaffirms that published assets must be publicly reachable (HTTP 200) or the guard rejects them.
- `content-pipeline-flow`: generated audio URLs persist on the activity (pipeline schema field added) so the human-gate readiness check and downstream publish/mobile have audio.

### Also produced (not a spec capability)
- `docs/KIDO_MATH_CURRICULUM.md`: the previously-undocumented Math Curriculum Freeze (2026-06-23), plus an engineering reconciliation mapping the doc's CMS Types to implemented `actionType`s and recording skillCode drift. This is the canonical reference the verification seeds draw from.

### Modified Capabilities
<!-- None known up front. Gap-fixes surfaced while running the flow that change specced behavior (candidates: content-pipeline-flow, content-transfer, lessons-api, watch-video-activity) will be added here as delta specs when they are actually made. -->

## Impact

- **kido-pipeline**: new seed file under `seeds/` (verification weeks, 5 MVP types); runbook doc (e.g. `docs/` or the change dir); potential fixes in `app/api/review/[activityId]/reject/route.ts` (seedId coupling) and image/audio worker retry behavior.
- **kido-server**: exercises `/admin/publish` (guard + idempotent upsert) and `/lessons/*`; potential fixes in the publish guard / asset-url checker if the guard rejects otherwise-valid verification content.
- **mobile**: exercises `GET /lessons/today` + `/lessons/:lessonId` and `mapServerLesson`; potential fixes in normalization/skeleton/fallback handling for missing or unmappable payloads.
- **Infra/cost**: real Vertex AI generation incurs cost and requires MongoDB, Redis + running workers, GCS buckets, GCP credentials, a running kido-server, and a mobile build pointed at it. No stub/offline path is used.
- **Data safety**: verification content uses dedicated out-of-range week numbers so it does not collide with live curriculum or mobile's "today" selection; it is publishable/unpublishable independently.
