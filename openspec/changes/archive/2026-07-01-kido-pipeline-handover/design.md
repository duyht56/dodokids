## Context

`kido-pipeline` authors content into `kido_pipeline`, and the archived `content-publish-flow` change added the Human Gate + `POST {kido-server}/admin/publish`. But the pipeline has two run paths that disagree:

- **Workers** (`src/queue/workers/generate.worker.ts`): generate → review → assets → enqueue image/audio → set `status: 'pending_review'`. Correct — content waits for the Human Gate.
- **CLI runner** (`src/pipeline/runner.ts` → `finishPipeline`): generate → review → assets → image → audio → `5-import.ts`, which sets `status: 'approved'` in the pipeline DB. This auto-approves (skips the Human Gate) and never publishes to `kido-server`.

`5-import.ts`, `POST /api/import/[week]`, and `/import/w{week}` are a legacy local-import that predates publish and conflicts with it. `docs/KIDO_CONTENT_PIPELINE.md` (the spec the backlog references) is missing; `docs/KIDO_PIPELINE.md` exists but under-describes the issue.

### EPIC-012 ↔ code reconciliation (review result)

| Story | Backlog | In code | Verdict |
|---|---|---|---|
| 012-01 Generate | `POST /api/pipeline/generate` | `steps/1-generate.ts` via worker/CLI, no HTTP | Implemented; HTTP endpoint intentionally omitted |
| 012-02 AI Review (18 rules) | `POST /api/pipeline/review` | `steps/2-review.ts` + `prompts/review.prompt.ts` (18 rules) | Implemented inline |
| 012-03 Assets find-or-create | `POST /api/pipeline/assets/find-or-create` | `steps/3-assets.ts` | Implemented inline |
| 012-04 Image (Imagen) | `POST /api/pipeline/generate-image` | `steps/4-image.ts` + `image.worker` | Implemented |
| 012-05 Audio (TTS) | `POST /api/pipeline/generate-audio` | `steps/4-audio.ts` + `audio.worker` | Implemented |
| 012-06 Week Import | `POST /api/pipeline/import` | **legacy `5-import.ts` + publish module — conflict** | **Fix in this change** |
| 012-07 Hot-fix | `PATCH /api/pipeline/fix-activity` | `scripts/hotfix.ts` (re-flows to gate) | Implemented as CLI |

## Goals / Non-Goals

**Goals:**
- One flow: both run modes end at `pending_review` → Human Gate → publish.
- Retire the legacy local-import so `imported` only means "published to `kido-server`".
- Ship the missing spec (`KIDO_CONTENT_PIPELINE.md`) and fix `KIDO_PIPELINE.md` for handover.

**Non-Goals:**
- No backlog per-step HTTP endpoints (queue/CLI is the chosen architecture — documented, not "fixed").
- No changes to seed review, generate, AI review, assets, media workers, Human Gate, or the publish module.
- No `kido-server` or mobile changes; no data migration.

## Decisions

### D1 — CLI runner ends at `pending_review` (mirror the worker)
Replace the `importStep(...)` call in `finishPipeline` with an update setting `status: 'pending_review'` after assets+media (the exact end-state the worker produces). CLI mode becomes a synchronous equivalent of the worker path, not a bypass.
- **Why:** the Human Gate is the single quality gate for children's content; a run mode that auto-approves defeats it. Convergence also makes CLI a safe local/debug tool.
- **Alternative considered:** keep auto-approve behind a `--force` flag — rejected; it keeps a foot-gun that silently ships unreviewed content.

### D2 — Retire the legacy local-import, don't keep it as an alias
Remove `5-import.ts` from the run path. For the admin surface, **deprecate** `POST /api/import/[week]` and `/import/w{week}`: keep the route returning a clear "use publish" response (410/redirect) rather than silently mutating statuses, and point the page at `/published` + the week publish action.
- **Why:** two meanings of "import" is the core handover confusion. `imported` must mean one thing (published to server). Deprecating the route (vs hard-deleting) avoids breaking bookmarks while removing the harmful behavior.
- **Alternative considered:** hard-delete the route/page — acceptable, but a deprecation response is friendlier for an in-flight handover and still removes the bug.

### D3 — Documentation as a first-class deliverable
Create `docs/KIDO_CONTENT_PIPELINE.md` as the authoritative spec (steps 0–5 + publish, status lifecycle diagram, the 18 review rules, seed-review rules, queue/CLI contracts, publish handoff, ops runbook, known gaps). Update `docs/KIDO_PIPELINE.md`: correct the runner/publish note to reflect the fix, add the EPIC-012 table above, a handover runbook, and the intentional HTTP-endpoint deviation.
- **Why:** the backlog treats `KIDO_CONTENT_PIPELINE.md` as the source of truth; its absence is a handover blocker.

## Risks / Trade-offs

- **CLI users lose the "one command → done" convenience** → now they must approve in the gate. Mitigation: this is the intended safety behavior; document it in the runbook and note the gate is fast/batched.
- **Existing pipeline-DB activities already at `approved`/`imported` from legacy runs** → they were never human-reviewed. Mitigation: call this out in the runbook; recommend re-verifying such activities through the gate before publish. No automatic migration (out of scope).
- **Deprecated import route referenced elsewhere** → dashboard/links may point to it. Mitigation: grep for references and update links to `/published`.

## Migration Plan

1. Update `runner.ts finishPipeline` to end at `pending_review`; drop the `importStep` import/call.
2. Retire `5-import.ts` (remove from run path); deprecate `/api/import/[week]` + `/import/w{week}` with a "use publish" response and update any links.
3. Add tests: CLI runner leaves `pending_review`; parity with worker end-state.
4. Write `docs/KIDO_CONTENT_PIPELINE.md`; update `docs/KIDO_PIPELINE.md`.
5. **Rollback:** restore the `importStep` call and un-deprecate the route (revert); no data changes to undo.

## Open Questions

- Should already-`approved`/`imported` legacy activities be bulk-reset to `pending_review` for a clean re-review, or left as-is with a documented caveat? This design leaves them as-is (no migration) and documents the caveat; a one-off reset script could be added later if the team wants a clean slate.
