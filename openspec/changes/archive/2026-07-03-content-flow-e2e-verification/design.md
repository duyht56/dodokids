## Context

The full content flow already exists across three repos:

- **kido-pipeline**: `seeds/*.json` → `import-seeds.ts` (upserts to `seeds`, status `pending_review`, `pipelineStatus: pending`, enqueues seed review) → seed review (AI audit + human action `use_suggestion|keep|reject|edit`) → seed becomes `approved` → `run-pipeline.ts` (`--week`/`--seed`) queries `{status:'approved', pipelineStatus:'pending'}` and runs `PipelineRunner`: generate(1) → review(2, AI, auto-fix if score≥60) → assets(3) → image(4)+audio(4) → activity `pending_review`. Human gate UI (`app/review/...`) → approve/reject.
- **kido-server**: `POST /admin/publish` (guard + idempotent upsert), `/admin/published*`, `GET /lessons/today`, `GET /lessons/:lessonId`.
- **mobile**: `LessonPlayerScreen` → `GET /lessons/today` → `mapServerLesson` → activity components.

Publish is per-week and human-triggered (`publish-week.ts <week>` → `POST /admin/publish`), with a `--dry-run`.

Constraints from the answered requirements: **real Vertex generation** (no stub), deliverable is **seeds + runbook + fixes**, packaging is **2 weeks × 1 lesson (6 types)** = 2 publish batches, error scenarios are **reject→regenerate**, **image/TTS fail→retry**, **mobile missing/unmappable**. (Publish-guard rejection was explicitly out of scope as a formal scenario.)

## Goals / Non-Goals

**Goals:**
- Produce a fixed 12-activity, all-type verification seed set that is safe to run repeatedly.
- Produce a runbook that an operator can follow to drive the whole flow with real generation and record observed state at each hop.
- Document the three error scenarios (expected vs. observed) and fix whatever blocks the flow from completing.

**Non-Goals:**
- No stub/offline generation mode (explicitly real generation).
- No automated CI harness (deliverable is a runbook, not a test script).
- No new curriculum content — verification weeks are throwaway/out-of-range.
- Not re-speccing the whole pipeline; only fixes that change behavior get delta specs.

## Decisions

### D1 — Verification weeks out of the live range
Use dedicated week numbers outside the normal curriculum (e.g. **week 90 and 91**, subject `toan`, `day: "D1"`), `activityIndex` 1–6, one lesson per week. Rationale: real generation writes to the shared MongoDB and publishes to the kido-server DB; out-of-range weeks avoid colliding with real lessons and with mobile's "today" selection. Because mobile "today" is driven by the child's week progression, verification lessons are fetched via `GET /lessons/:lessonId` (or a test child positioned at the verification week) rather than relying on "today" — the runbook specifies the exact fetch.
- **Alternative rejected**: reuse a real week (e.g. w23) — risks clobbering/di­sturbing actual content and confuses "today".

### D2 — SeedId format locked to the reject route
The reject→regenerate route reconstructs `SEED-${subject}-w${week2}-D${day===1?'1':'4'}-${index2}`. Verification seeds MUST use exactly this format (`SEED-toan-w90-D1-01` … `-06`, `SEED-toan-w91-D1-01` … `-06`) and `day: "D1"` so regeneration can find them. This coupling is fragile; the runbook calls it out, and if it breaks for our data it is a candidate fix (make the reject route look up the seed by `activityId` first — it already tries `$or: [{seedId},{activityId}]`, so seeding `activityId` on the seed doc is the safer path).
- Chosen packaging: `day: "D1"` for both weeks keeps the reconstructed seedId valid (day maps to 1).

### D3 — watch_video is out of scope (deferred post-MVP)
`watch_video` is NOT part of the Math curriculum (see [KIDO_MATH_CURRICULUM.md](../../../docs/KIDO_MATH_CURRICULUM.md) §5.1) and has no generation path. It is dropped from this verification and deferred post-MVP. The verification covers the **5 MVP action types** only, so nothing here depends on a video/thumbnail generation step.

### D3b — Skill codes: use the already-seeded set, not the drifted canonical names
The curriculum doc's skill codes drifted from what the pipeline actually seeds (e.g. doc `math_classify_2d` vs. seeded `math_classify_2attr`; doc `math_matrix_logic` vs. seeded `math_matrix_2x2_basic`). Verification seeds use the **already-seeded** codes so the generator/prompt is on a proven path, mapping two skills to each action type:
- `single_select` ← `math_logic_causality` (cause→effect pick) and `math_matrix_2x2_basic` (2x2 matrix pick)
- `multi_select` ← `math_classify_2attr` and `math_classify_1attr` ("select all matching")
- `sort_sequence` ← `math_sequence_order` and `math_count_1_20` (number-train ordering)
- `match_pair` ← `math_count_1_20` (numeral ↔ quantity) and `math_classify_1attr` (object ↔ group)
- `count_tap` ← `math_count_1_20` (count objects) and `math_measurement_base` (measure in non-standard units)

Naming follows the canonical set (kido-server `actionType` + curriculum doc §5). The doc↔seed skillCode reconciliation is recorded in the curriculum doc §5.2.

### D4 — Runbook as the primary artifact; fixes are incidental
The runbook (living in the change dir, promoted to `docs/` when stable) is the deliverable, structured as: prerequisites/infra → happy-path steps with the exact commands (`import-seeds --file`, seed-review approve, `run-pipeline --week 90`, human-gate approve, `publish-week 90`, mobile fetch) → an observed-state table per hop → the three error-scenario playbooks. Code fixes are made only as needed to get the flow to complete and are recorded against the relevant existing spec if they change behavior.

### D5 — Real-infra preflight
Because generation is real, the runbook starts with a preflight checklist: `.env` for GCP project/buckets/Vertex, `MONGODB_URI`, `REDIS_URL` + running workers (`worker:generate|image|audio`, `worker:seed-review`), `KIDO_SERVER_URL`, kido-server up, mobile `API_BASE_URL`. Cost note: 12 activities × (Gemini + Imagen images + TTS) — run once; prefer `--dry-run` for publish rehearsal.

## Risks / Trade-offs

- **[Real cost / flaky external APIs]** Vertex calls cost money and can rate-limit → Mitigation: 12 activities only; pipeline already has `imagenMinIntervalMs`/backoff; use `--seed` to run one at a time while debugging; `--dry-run` publish first.
- **[Infra not available in this environment]** Mongo/Redis/GCS/kido-server may not be running locally → Mitigation: the deliverable is the seed set + runbook + fixes; actually executing requires the operator's infra. The runbook is written so it can be run wherever infra exists; where we can run locally we record real observations, otherwise expected behavior is documented and marked as such.
- **[Non-standard skillCode fails generation]** a chosen skill code might still generate a weak payload → Mitigation: D3b uses only already-seeded codes; if one misbehaves, swap for another proven code from the same action-type group.
- **[Verification data leaking to production server]** publishing writes to the kido-server DB → Mitigation: out-of-range weeks + documented unpublish (`/admin/published/:id/unpublish`) cleanup step at the end of the runbook.

## Migration Plan

1. Author the seed file (`seeds/KIDO_VERIFY_E2E.json`, weeks 90–91, 10 seeds, 5 MVP types × 2) with correct seedId format + already-seeded skillCodes (D3b) + questionCore per type.
2. Write the runbook skeleton (prereqs, happy path, observed-state table, 3 error playbooks).
3. Execute where infra is available: import → seed-review approve → run-pipeline → human-gate → dry-run publish → publish → mobile fetch; fill in observed states.
4. Fix gaps found; record behavior-changing fixes as delta specs.
5. Run the three error scenarios; record observed outcomes.
6. Cleanup: unpublish verification weeks from kido-server; leave seeds + runbook in repo.
- Rollback: verification content is isolated by week number; unpublish + delete the verification seeds/activities to fully remove.

## Open Questions

- Exact verification week numbers (90/91 proposed) — confirm they are unused in the target MongoDB before running.
- Whether to add a tiny helper to fetch a verification lesson on mobile (e.g. a debug entry to `GET /lessons/:lessonId`) or rely on a test child positioned at the verification week.
- Unifying the canonical curriculum skillCodes with the actually-seeded ones (curriculum doc §5.2) — product+eng decision, out of scope here.
