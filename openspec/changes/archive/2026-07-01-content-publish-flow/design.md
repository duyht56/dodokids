## Context

`kido-pipeline` (Next.js admin + Bull workers, DB `kido_pipeline`) authors learning content through Seed Review → generate → AI review → asset/audio gen → admin review. `kido-server` (NestJS, DB `kido`) serves children and queries content with `lessonStatus: 'imported'` / activity `status: 'imported'`. The two systems share a data contract (`activity.types`, status enum `draft|pending_review|approved|rejected|imported`) but the handoff is broken: the pipeline import step (`src/pipeline/steps/5-import.ts`) writes activities with `status: 'approved'` only, produces no server-shaped lesson documents, and the two services point at different database names. There is no explicit, trustworthy "publish to production" step.

The mobile app already ships the full Lesson Player (`mobile/src/screens/child/LessonPlayerScreen.tsx`) and all six activity components. Constraints carried in from prior decisions: keep `kido-pipeline` otherwise untouched; the Human Gate is the only quality gate (AI review #2 dropped); duplicate detection is owned by Seed Review (not repeated here); the pipeline is the single source of truth for content.

## Goals / Non-Goals

**Goals:**
- An explicit publish path: WYSIWYG Human Gate (pipeline admin) → mechanical idempotent copy into the server DB.
- Reviewers see exactly what a child sees, using real assets/audio.
- Fix the `approved`-vs-`imported` / database-name handoff so the server runtime actually finds published content.
- A deterministic safety net (schema + asset-URL guard) since the human gate is the sole quality gate.
- A clear, single-direction edit-after-import path that prevents drift.

**Non-Goals:**
- No AI review #2; no duplicate-detection panel (Seed Review owns it).
- No changes to Seed Review, generation, AI review #1, or asset/audio steps.
- No content editing on the server side.
- No `react-native-web` reuse of the mobile player (option B chosen — see Decisions).
- No asset binary migration; assets stay in their public GCS buckets.

## Decisions

### D1 — Human Gate preview: web replica player (option B)
Rebuild a faithful web version of the Lesson Player inside the pipeline admin (`LessonPlayerWeb` + per-action-type components) rather than reusing the RN components via `react-native-web`.
- **Why:** chosen by the team to avoid the `react-native-web` shim cost for `reanimated 4` / `gesture-handler` / `lottie-react-native` / `react-native-svg`, and to keep `kido-pipeline` self-contained without pulling in the mobile package.
- **Alternative considered:** option A (`react-native-web` + shared package) — highest fidelity, no drift, but higher setup cost and cross-package coupling.
- **Consequence / accepted debt:** the web replica can drift from the real mobile player. Mitigated by sourcing both from the same `activity.types` contract, reviewing render fidelity per action type, and treating the replica as the canonical *review* surface (it must render the same activity JSON the mobile app consumes).

### D2 — Single source of truth = pipeline; edit-after-import re-flows
All content edits happen in the pipeline (hotfix) and re-enter the Human Gate, then re-copy. The server never edits content.
- **Why:** any second editable copy reintroduces the drift this change exists to remove. One authoring surface, one gate, one publish.
- **Alternative considered:** direct server edit, or a server-side mini-gate hybrid — both create a divergent copy that a later re-import can silently overwrite.

### D3 — Transfer = mechanical idempotent upsert, pull-style
A publish module copies approved pipeline content into the server DB via upsert keyed by `activityId` / `lessonId`. It opens a connection to the server DB (or calls a thin server ingest endpoint) and writes `status: 'imported'` / `lessonStatus: 'imported'`, building the server-shaped lesson documents the runtime expects.
- **Why idempotent upsert:** re-publish and edit-after-import must overwrite in place, never duplicate.
- **Why it also creates lessons:** the runtime gates on `lessonStatus: 'imported'`; copying activities alone (today's bug) leaves nothing for `lessons.service` to find.
- **Alternative considered:** server pulls pipeline DB directly at request time — rejected; it couples runtime latency/availability to the pipeline DB and skips the gate.

### D4 — Deterministic guard replaces the dropped AI review #2
Before each write, validate against the server schema and assert every asset URL returns HTTP 200. Reject and report on failure.
- **Why:** with the human gate as the only gate, a cheap deterministic check is the safety net against malformed payloads or broken/unresolved assets reaching children — without the cost/latency/redundancy of a second LLM review.

### D5 — Per-week batch publish
Approval is per-activity (checklist-gated) but publish is confirmed once per week, only when all of the week's activities are approved.
- **Why:** 48×5×6 ≈ 1440 activities; a per-activity publish click makes the human the bottleneck. Week batching matches the existing week-import mental model and Telegram "week ready" notifications.

## Risks / Trade-offs

- **Web-replica player drifts from the mobile player** → "looks fine in review" ≠ "looks fine on device". Mitigation: drive the replica from the shared `activity.types`; per-action-type fidelity review; keep the replica consuming the exact activity JSON the mobile app reads; revisit option A if drift bites.
- **Two databases hold content (pipeline = authoring SoT, server = published projection)** → potential divergence. Mitigation: one-direction copy only; idempotent upsert; server content read-only; edit-after-import always re-flows.
- **Human gate is the sole quality gate** → a missed defect can publish. Mitigation: mandatory production-ready checklist + deterministic guard + server rollback/unpublish path.
- **Cross-DB write from the pipeline** (if the publish module writes the server DB directly) → coupling/credentials risk. Mitigation: prefer a thin server ingest endpoint that applies the deterministic guard server-side; otherwise scope the pipeline's server-DB credential to upsert only. (See Open Questions.)
- **Asset URL becomes unreachable after publish** → runtime serves a broken asset. Mitigation: guard checks at publish time; rollback/unpublish for post-publish breakage; assets are immutable/public so this should be rare.

## Migration Plan

1. Land the web-replica `LessonPlayerWeb` in the pipeline admin behind the existing review route; verify render parity per action type against the mobile components.
2. Add the production-ready checklist and per-week publishable state to the admin (approval still writes existing `approved` status).
3. Build the publish/transfer module (idempotent upsert + deterministic guard + server-shaped lesson construction). Run it in dry-run (guard + report, no write) first.
4. Wire week publish to the transfer; backfill-publish already-approved weeks so the server DB matches.
5. Add the kido-server activity-management page (view + rollback/unpublish + transfer monitoring).
6. **Rollback strategy:** the transfer is idempotent and additive; to back out, unpublish affected weeks/activities (server stops serving on non-`imported`). The pipeline DB and assets are untouched, so re-publishing restores state.

## Open Questions

- Transfer mechanism: pipeline writes the server DB directly vs. a thin authenticated kido-server ingest endpoint that runs the guard server-side. Leaning toward the ingest endpoint (keeps the guard and DB ownership on the server side).
- Unpublish representation on the server: a distinct status (e.g. `unpublished`) vs. reverting to `approved`/removing `imported` — must stay compatible with the runtime's `imported` gate and existing indexes.
- Whether week-level publish should also assemble/refresh the server `lessons` aggregate in a single transaction (per STORY-012-06) or per-activity with a final lesson upsert.
