## Why

`kido-pipeline` (EPIC-012) is functionally implemented — seed review, generate, AI review (18 rules), assets, image, audio, Human Gate, and publish-to-server all exist — but it is not handover-ready. A code review against EPIC-012 surfaced one real correctness bug plus documentation/consistency gaps that would trip up whoever takes it over:

- **CLI sync mode silently bypasses the Human Gate.** `PipelineRunner.finishPipeline` (`src/pipeline/runner.ts`) calls the legacy `5-import.ts`, which sets `activity.status = 'approved'` directly in `kido_pipeline`. The worker mode instead ends at `status: 'pending_review'` and requires a human to approve before publish. So the same content reaches different states depending on how the pipeline is run, and CLI-run content is auto-approved with no human review and never published to `kido-server`.
- **Two conflicting "import" concepts.** The legacy local-import path (`5-import.ts`, `POST /api/import/[week]`, `/import/w{week}` page) marks content `approved`/`imported` *inside the pipeline DB*, which predates and contradicts the current publish flow (`src/publish/` → `POST {kido-server}/admin/publish`). "imported" should only ever mean "copied to the runtime server".
- **Missing/there-but-stale docs.** `docs/KIDO_CONTENT_PIPELINE.md` (the authoritative spec the backlog references) does not exist. `docs/KIDO_PIPELINE.md` exists but mis-describes the runner/publish issue as merely "legacy vs new" and has no EPIC-012 reconciliation or handover runbook.

EPIC-012's backlog HTTP endpoints (`POST /api/pipeline/generate|review|assets|generate-image|...`) are **not** treated as gaps: the pipeline is intentionally queue/CLI-driven. This is documented as a deliberate deviation rather than "closed".

## What Changes

- **Converge both run modes on one flow** (BREAKING for CLI behavior): `PipelineRunner.finishPipeline` stops calling the legacy import and instead ends at `status: 'pending_review'`, mirroring the worker. Both modes now go: generate → review → assets → media → `pending_review` → Human Gate → publish.
- **Retire the legacy local-import path**: remove/retire `5-import.ts` from the runner, and deprecate `POST /api/import/[week]` + the `/import/w{week}` page in favour of the publish flow, so `imported` only ever means "published to `kido-server`".
- **Create `docs/KIDO_CONTENT_PIPELINE.md`**: the authoritative pipeline spec — Step 0–5 + publish, the activity/seed status lifecycle, the 18 AI-review rules, seed-review rules, queue/CLI contracts, and the publish handoff.
- **Update `docs/KIDO_PIPELINE.md`**: correct the runner/publish note, add an EPIC-012 ↔ code reconciliation table, a handover runbook (run/monitor/troubleshoot/known-gaps), and the intentional HTTP-endpoint deviation.

## Capabilities

### New Capabilities
- `content-pipeline-flow`: The canonical authoring flow and activity status lifecycle — both run modes converge on `pending_review → Human Gate → publish`; the legacy local-import that produced `approved`/`imported` inside the pipeline DB is retired so `imported` only means "published to the runtime server".

### Modified Capabilities
<!-- No requirement changes to existing synced specs. content-human-gate / content-transfer describe the gate + publish; this change makes the upstream flow feed them consistently, without altering their requirements. -->

## Impact

- **Pipeline** (`kido-pipeline`): `src/pipeline/runner.ts` (`finishPipeline` no longer auto-approves); retire `src/pipeline/steps/5-import.ts`; deprecate `app/api/import/[week]/route.ts` + `app/import/[week]/page.tsx`. No change to seed review, generate, AI review, assets, image/audio workers, Human Gate, or the publish module.
- **Docs**: new `docs/KIDO_CONTENT_PIPELINE.md`; updated `docs/KIDO_PIPELINE.md`.
- **Behavioral**: CLI-run content now requires Human Gate approval before it can be published (previously auto-approved). No data migration; existing activities already `approved`/`imported` in the pipeline DB are unaffected but should be re-verified through the gate before publish.
- **Out of scope**: adding the backlog's per-step HTTP endpoints (intentional queue/CLI architecture); `kido-server` changes; mobile.
