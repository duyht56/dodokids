# Kido AI Context

This is the fast context file for AI agents. Read it after `AGENTS.md` at the
start of a new session.

## Product

Kido is an AI-first, mobile-first learning platform for children age 4-6. The
learning experience is audio-first, visual-first, low-pressure, playful, and
human-reviewed before content reaches production.

Core product principles:

- Children should understand through listening, seeing, and touching, without
  needing to read long UI text.
- Mascot voice/audio is the main instruction channel.
- Avoid negative feedback such as "Sai rồi", "Kém", or shame-based language.
- Content should train school-readiness thinking, not rote grade-1 drilling.
- AI-generated content must pass review and Human Gate before publish.

## Source Hierarchy

When sources disagree, use this order:

1. `AGENTS.md` - agent workflow and repo entry rules.
2. `docs/AI_CONTEXT.md` - implementation-oriented project map.
3. `docs/AI_IMPLEMENTATION_FLOW.md` - standard implement flow.
4. `docs/kido-activity-schema.ts` - canonical activity/lesson wire contract.
5. `docs/KIDO_CONTENT_PIPELINE.md` - authoritative content pipeline lifecycle.
6. `docs/KIDO_PIPELINE.md` - operational overview and runbook.
7. `docs/KIDO_MATH_SKILL_CATALOG_V2.md` - canonical math skill graph.
8. `docs/KIDO_MATH_CURRICULUM.md` - curriculum freeze and naming reconciliation.
9. `docs/KIDO_LANG_SKILL_CATALOG.md` - canonical language (`tieng_viet`) skill
   graph (33 skills, 7 domains). DRAFT: no seeds yet. Its `pho` domain is no
   longer blocked by the contract — `audio_select` landed (OpenSpec
   `add-audio-select-activity`, 2026-07-14); 29/33 skills are contract-ready.
10. `docs/KIDO_LANG_CURRICULUM.md` - the `tieng_viet` learning path over that
    graph. DRAFT PROPOSAL: 2 lessons/week on **D2 + D5**, 48 weeks, 16
    seeds/week; organised by skill (like math), not by theme (like English).
    Note: it argues `pho` needs only a word list + `audio_library` (TTS), not the
    image vocabulary pack — which contradicts skill-catalog §9.2 (unresolved).
11. `docs/KIDO_ENGLISH_CURRICULUM.md` - English (`tieng_anh`) framework. DRAFT:
    theme/pattern/skill axes, 12 themes over 48 weeks (day 3), 14 skills. Its
    `en_phonics_initial`/`en_rhyme`/`en_dialogue_response` skills use
    `audio_select`, which has now landed (shared with the `tieng_viet` catalog,
    item 9).
12. `docs/KIDO_SEED_AUTHORING.md` and `docs/prompts/gen-math-seed.routine.md` -
    seed creation rules.
13. `docs/KIDO_BACKLOG.md` - story-level backlog and acceptance criteria.

Note: `KIDO_SOT_FINAL_v2 (1).pdf` was provided outside the repo, but in this
environment it appears image-based or otherwise not text-extractable. If it is
the canonical Source of Truth, keep a Markdown/text export in `docs/` so future
AI sessions can read it reliably.

## Architecture

End-to-end content/runtime flow:

```text
seed JSON
  -> kido-pipeline seed review
  -> generate activity JSON
  -> AI review
  -> asset resolution
  -> image/audio generation
  -> pending_review
  -> Human Gate approval
  -> publish to kido-server
  -> mobile app fetches lessons
  -> child completes lesson
  -> progress/stars/xp update
```

Main apps:

- `mobile/`: Expo React Native app. Child lesson flow renders normalized server
  lessons through activity components.
- `kido-server/`: NestJS API. Runtime source for published lessons, progress,
  child profile, entitlement, and publish ingest.
- `kido-pipeline/`: Next.js admin + workers/CLI. Authoring database,
  seed-review, generation, media workers, Human Gate, and publish client.

Data ownership:

- `kido-pipeline` owns authoring content and review state.
- `kido-server` owns runtime content and child progress.
- `mobile` owns local UX state and optimistic/offline fallback.

## Canonical Learning Model

The learning graph is:

```text
Domain -> Skill -> Micro Skill -> Difficulty -> actionType -> Seed -> Activity
```

Canonical math subject code: `toan`.

**Lesson shape (all subjects):** one lesson = one learning day = **exactly 8
activities**, `activityIndex` 1..8 ordered by increasing difficulty (warmup
first, challenge last). This is the canonical rule mirrored by
`ActivityIndex = 1..8` and the `Lesson` comment in
`docs/kido-activity-schema.ts`. Seed routines therefore emit 8 seeds per
day/subject regardless of how many days a subject occupies per week (e.g. math
= 2 days D1/D4 = 16 seeds/week; English = 1 day D3 = 8 seeds/week).

Canonical `actionType` values:

- `single_select`
- `multi_select`
- `sort_sequence`
- `match_pair`
- `count_tap`
- `compare_tap`
- `audio_select` (nghe đề → chọn 1 trong 2–3 clip âm thanh; chỉ
  `tieng_viet`/`tieng_anh`, KHÔNG dùng trong `toan`)
- `watch_video` is post-MVP/future unless explicitly required.

Important schema rules:

- Discriminant is `actionType`.
- `single_select` / `multi_select` use `options[].{optionId, assetRef, isCorrect}`.
- `single_select` uses `correctAnswer`.
- `multi_select` uses `correctAnswers`.
- `count_tap` uses `backgroundAsset` + `targetAsset`; do not use legacy
  `sceneImage`.
- `compare_tap` uses one shared `objectAsset`, `leftCount`, `rightCount`,
  `correctSide`, and `mode`; do not use question image/options.
- `audio_select` uses `options[].{optionId, audioRef, altTextVi}` +
  `correctAnswer` (1 optionId); ≤3 options, each clip ≤4 từ; `promptImage`
  optional; clip tái dùng qua `audio_library` (word-key ASCII + `lang`).

## Current Implementation Map

Mobile:

- API client: `mobile/src/services/api.ts`.
- Server lesson normalization: `mobile/src/types/lesson.ts`, especially
  `mapServerLesson`.
- Lesson player: `mobile/src/screens/child/LessonPlayerScreen.tsx`.
- Activity router: `mobile/src/components/activities/ActivityContainer.tsx`.
- Explore catalog/play: `mobile/src/screens/child/ExploreCatalogScreen.tsx` and
  `mobile/src/screens/child/ExplorePlayScreen.tsx`.
- Xưởng luyện nét uses a dedicated ordered-track flow in
  `mobile/src/screens/child/TracingWorkshopScreen.tsx`: every bundled path is
  directly selectable, completion auto-advances within the selected track, and
  current-visit marks are memory-only. As of 2026-08 it is retained but hidden
  from the child catalog (`catalogVisible: false`); its route also fails closed.
- Dẫn đường cho Đô Đô (`route_planner`) is the visible offline replacement for
  the hidden Tracing slot: local grid generator/solver/validator in
  `mobile/src/explore/games/routePlanner{Types,Engine,Game}.ts`, rendered by
  `mobile/src/explore/renderers/RoutePlannerRenderer.tsx`, run as a continuous
  one-at-a-time L1→L5 progression owned by `ExplorePlayScreen`. All run state
  (level, seed, commands, support, replay exclusions) is memory-only; optional
  audio (`mobile/src/explore/audio.ts`) is never a required dependency.
- Explore catalog visibility is fail-closed: `catalogVisible` (absent = visible)
  on both bundled and server game configs; effective visibility = bundled AND
  applied server, computed by `isExploreGameCatalogVisible`/
  `selectVisibleExploreCatalog`, so stale server metadata cannot re-expose a
  retained-but-hidden game.
- Auth/progress state: `mobile/src/store/authStore.ts` and
  `mobile/src/types/store.ts`.
- Canonical lesson completion is first persisted to the typed `rewardSyncStore`,
  then sent to `PATCH /progress/:childId/complete-lesson`; mobile reconciles the
  returned canonical snapshot. Mock/demo fallback is non-persistent practice.

Server:

- Lessons API: `kido-server/src/modules/lessons`.
- Progress API: `kido-server/src/modules/progress`.
- Publish ingest: `kido-server/src/modules/publish`.
- Publish endpoint: `POST /admin/publish`.
- Published content routes: `GET /admin/published`, `GET /admin/published/:id`.

Pipeline:

- Seed review: `kido-pipeline/src/pipeline/seed-review`.
- Runner: `kido-pipeline/src/pipeline/runner.ts`.
- Generation steps: `kido-pipeline/src/pipeline/steps`.
- Workers: `kido-pipeline/src/queue/workers`.
- Publish client: `kido-pipeline/src/publish`.
- Admin Human Gate: `kido-pipeline/app/review`.

## Runtime API Contracts

Mobile-relevant runtime contracts:

- `GET /lessons/today?childId=...`
  - Returns a server-shaped lesson.
  - Mobile maps it with `mapServerLesson`.
  - Imported 8-activity lessons include deterministic `contentVersion` and a
    child-specific frozen `rewardContext`; stubs are explicitly ineligible.
  - Cached canonical lessons preserve this identity for offline completion.
- `PATCH /progress/:childId/complete-lesson`
  - Canonical body is a versioned event with event, content, week-plan, timestamp,
    and exact activity identity. The legacy payload remains rollout compatibility.
  - Server recomputes stars (6-8 = 3, 3-5 = 2, 0-2 = 1), applies revision-CAS
    idempotency, and returns `{ eventId, applied, eventResult, progress }`.
- `GET /progress/:childId/achievements`
  - Returns six cumulative badges and all 48 stable stickers across four worlds.
- `POST /admin/publish`
  - Pipeline -> server content transfer.
  - Server runs deterministic guard and idempotent upsert.

## Content Pipeline Truth

Authoritative lifecycle:

```text
draft -> pending_review -> approved -> imported
```

Invariants:

- `approved` is set only by Human Gate.
- `imported` means published to `kido-server`.
- CLI and worker modes both stop at `pending_review`; neither auto-approves.
- Legacy local import is retired.
- Edit after import should flow through hotfix/review/publish again.

Seed statuses:

- `status`: `pending_review`, `approved`, `flagged`, `edited`, `rejected`
- `pipelineStatus`: `pending`, `processing`, `done`, `error`

Generate runs only when:

```text
status === "approved" && pipelineStatus === "pending"
```

## Seed Rules

Every MVP seed must split:

- `questionCore`: short spoken prompt for the child. No asset list, no answer
  leak, no academic terms.
- `answerSpec`: concrete object/answer specification for generation. Not read to
  the child.

Seed must pass the Logic Signature Test:

```text
A child who has never seen the item can solve it by reasoning from what is on
screen, not by remembering adult knowledge or guessing from irrelevant clues.
```

## Commands

There is no root `package.json`; run commands inside each package.

Mobile:

```bash
cd mobile
npm run lint
npm run start
npm run dev
npm run dev:vm
```

Server:

```bash
cd kido-server
npm run build
npm test
npm run start:dev
```

Pipeline:

```bash
cd kido-pipeline
npm test
npm run build
npm run import-seeds
npm run trigger:seed-review
npm run pipeline:week -- --week 1
npm run publish:week -- 1
npm run admin:dev
```

## Agent Notes

- Use CodeGraph before code search/read when `.codegraph/` exists.
- Prefer the current implementation over older backlog wording when they differ.
- Backlog HTTP endpoints for per-step pipeline actions are intentionally not the
  implementation shape; pipeline is worker/CLI-driven.
- For mobile UI, preserve child-friendly, audio-first, visual-first behavior.
- For content/schema changes, update docs and code together to avoid naming
  drift.
