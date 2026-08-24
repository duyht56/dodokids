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
  current-visit marks are memory-only. As of 2026-08-25 it is LIVE and
  catalog-visible (`catalogVisible: true`); its Vietnamese glyph strokes were
  smoothed in pack v5 (`mobile/src/explore/games/tracingSmoothing.ts`, applied in
  `createTracingStroke`). Its route still fails closed on a server kill switch.
- Dẫn đường cho Đô Đô (`route_planner`) is a sibling offline spatial game (it
  originally filled the hidden Tracing slot): local grid generator/solver/validator in
  `mobile/src/explore/games/routePlanner{Types,Engine,Game}.ts`, rendered by
  `mobile/src/explore/renderers/RoutePlannerRenderer.tsx`, run as a continuous
  one-at-a-time L1→L5 progression owned by `ExplorePlayScreen`. All run state
  (level, seed, commands, support, replay exclusions) is memory-only; optional
  audio (`mobile/src/explore/audio.ts`) is never a required dependency.
- Explore shared play layer (OpenSpec `fix-explore-catalog-round-1`, 2026-08):
  the round planner in `mobile/src/explore/variety.ts` rotates bucket serving
  order per batch and serves `recentBucketKeys` last, so one-exercise batches
  cover every reachable mode (contract: `npm run test:explore-variety-buckets`);
  `buildNearTargetOptions(..., { exclude })` in `games/numberUtils.ts` is the
  shared, non-median distractor builder; range/arithmetic progress is
  `{ level, recent }` with 5-of-7 window promotion; continuous runs end after
  `CONTINUOUS_RUN_TARGET` (8) correct answers (Route Planner after Stage 5);
  `ExploreMascot` (`explore/components/ExploreMascot.tsx`) is the only mascot;
  the play screen owns a global 🔊 replay button and renders exercises through
  `ExploreExerciseView`; catalog order/grouping is bundled `GAME_COPY` order
  plus a UI-only group table in `ExploreCatalogScreen`.
- Explore number `hear_select` on every level (OpenSpec
  `enable-explore-number-hear-select-all-levels`, 2026-08): `number_explorer`
  offers the audio-first `hear_select` mode at all L1–L10 when the bundled pack
  covers the range, keeping each level's visual modes for the audio-missing
  profile; declared buckets/capacity in `variety.ts` cover both profiles and
  `generatorVersion` bumped to `number-explorer-v4` (seeded stream changed).
- Explore count second mode (OpenSpec `add-explore-count-target-mode`, 2026-08):
  `tap_count` (`games/countGame.ts`) now has a seed-deterministic `mode`
  discriminator — `count_all` (count all, pick the number) and `count_target`
  ("chạm đúng N": tap exactly N of a larger single-asset set and submit, checked
  by the independent validator + `TapCountRenderer`); both declared as
  `variety.ts` buckets `count_all`/`count_target` (variantKey `count:<mode>:<N>`),
  `generatorVersion`/`validatorVersion` bumped to `tap-count-v4`, ladder still
  L1(1–5)→L4(1–20)→L10(1–50); new best-effort audio keys `count_target_*`.
- Explore compare range cap (OpenSpec `cap-explore-compare-range`, 2026-08):
  `quantity_compare` (`games/compareGame.ts`) is capped at range 20 per BRD §7.4
  via a compare-specific `COMPARE_LEVEL_ORDER = [1,2,3,4]` — L1(5)/L2(10)/L3(15)/
  L4(20), equal re-homed to L3 and the grouped arrangement to L4; `variety.ts`
  buckets trimmed to four levels; `generatorVersion` bumped to `quantity-compare-v4`
  (mirrored in kido-server `explore.registry.ts`). The shared `RANGE_LEVEL_ORDER`
  ten-range ladder other range games use is untouched. The Explore presentation is
  a "bập bênh" seesaw (`explore/components/SeesawComparisonBoard.tsx`, wired from
  `QuantityCompareRenderer.tsx`) — presentation only, reusing the seeded
  counts/side/slots/assets with no version change; the plank rests level until a
  correct pick then tilts toward the side with MORE (native driver, static under
  reduced motion). The shared `components/activities/QuantityComparisonBoard.tsx`
  (lesson `compare_tap`) is not touched.
- Explore Đợt 2 (OpenSpec `add-explore-round-2-games`, 2026-08): two more
  local games — `stack_tower` and `odd_one_out` (progressive five-board runs)
  — each owning its variety
  policy/keys in `mobile/src/explore/games/<game>Game.ts`; renderers receive
  `supportLevel` (0/1/2 from the play screen's miss count) and the screen
  demotes a range/arithmetic run one level after three misses in a row
  (`demoteRangeProgress`/`demoteArithmeticProgress`). Đô Đô's feedback voice,
  game names and all new prompts are ONE audio batch: inventory in
  `promptAudio.ts` mirrored by `kido-pipeline/src/explore/exploreAudioInventory.ts`,
  pack `explore-audio-vi-v2` (mobile accepts v1+v2); see
  `openspec/changes/add-explore-round-2-games/audio-batch-v2.md` for the run.
- Explore Đợt 3 feel pass (OpenSpec `polish-explore-round-3-feel`, 2026-08):
  presentation-only motion + best-effort voice, no generator/validator/version or
  audio-pack change. `NumberBondRenderer` slides leaves into/out of the "Bé thêm"
  box, settles the two parts on "Gộp lại", and speaks the bundled
  `numberBondFeedbackKeys` + number clips via `onSpeakFeedback`; all animations use
  the native driver and are skipped under reduced motion (same gate as
  `MemoryMatchRenderer`), resting in today's static end state.
- Explore Đợt 3 feel (OpenSpec `polish-explore-round-3-feel`, 2026-08),
  presentation-only: `MemoryMatchRenderer` turns each card with a real flip
  (per-card `scaleX` 1→0→1, face swapped at the mid-point, native driver,
  skipped under reduced motion) driven only by the reducer's `faceUp`/`matched`
  state — no `memoryGame.ts`/`memoryState` change, replay byte-identical.
- Explore Đợt 3 feel (OpenSpec `polish-explore-round-3-feel`, 2026-08),
  presentation-only: `ArithmeticRenderer`/`VisualMathScene` run the "máy cộng trừ"
  machine (`MathMachine`) — operand groups feed in on `SemanticAnimationView`/
  `addGroup`/`removeGroup` and the `?` result emerges from the funnel — and draw
  the add/subtract number line as a ticked, labelled ruler with the `hopProgress`
  hop; native driver, skipped under reduced motion (same gate, static end state),
  `supportLevel` visuals unchanged, no `arithmeticGame.ts`/version change.
- Explore arithmetic BRD §7.6 modes (OpenSpec `add-explore-arithmetic-brd-modes`,
  2026-08): `arithmetic_machine` (`games/arithmeticGame.ts`) wires the strategy
  modes as a seed-deterministic `mode` discriminator alongside add/subtract on the
  L1→L6 ladder — `count_on` (L3, count on from the larger), `make_10` (L4, complete
  the ten, answer = the missing part, ten-frame scaffold), `three_operand` (L5,
  a+b+c with each operand ≤6) and `tens_ones` (L6 = Advanced range 50, place value
  beside the number line). Reachability is level-driven (reaching the level IS the
  "stable with two operands" gate, no external config flag); each mode has an
  INDEPENDENT validator + byte-identical seed replay, is a declared `variety.ts`
  bucket (`arithmetic:<mode>`), and reuses `VisualMathScene`/`TensOnes`/number-line/
  ten-frame primitives with `supportLevel` intact. `generatorVersion`/`validatorVersion`
  bumped `arithmetic-machine-v3`→`v4` (mirrored in kido-server `explore.registry.ts`);
  new best-effort `dem_tiep` count-on clip (next audio batch).
- Explore pattern families + fix_error (OpenSpec
  `enhance-explore-pattern-families-fixerror`, 2026-08): `pattern_finder`
  (`games/patternGame.ts`) splits cycles into distinct, labelled grammar families
  `shape_cycle`/`color_cycle`/`object_cycle` (colour rule vs shape rule vs object
  rule) with a bigger colourblind-safe token pool (6 shapes, 7 colours, 10 emoji),
  and adds a seed-deterministic `mode` discriminator — `complete` (hide a slot)
  and `fix_error` ("tìm chỗ sai": tap the one rule-breaking cell, the independent
  validator enumerates every single-cell repair to prove exactly one). Variety
  buckets are the families + `fix_error`; `generatorVersion`/`validatorVersion`
  bumped to `pattern-finder-v4`/`pattern-finder-validator-v3` (mirrored in
  kido-server `explore.registry.ts`); new best-effort prompt keys
  `pattern_next_color`/`pattern_blank_color`/`pattern_find_error` (next audio batch).
- Explore memory pool + hint (OpenSpec `expand-explore-memory-pool-add-hint`,
  2026-08): `MEMORY_ASSETS` expanded 16 → 37 (each a single, background-free,
  distinct-`similarityGroup` object) so runs stay fresh; `generatorVersion`
  bumped `memory-match-v3`→`v4` (pool changes the seeded draw; validator logic
  unchanged, mirrored in kido-server `explore.registry.ts`, which also drifted
  and is now realigned). `MemoryMatchRenderer` adds a presentation-only support
  hint: after `HINT_AFTER_MISMATCHES` mismatches in a row, Đô Đô peeks one
  still-hidden pair (`hintPair`) for `HINT_PEEK_MS`, armed from the resolve
  timeout (deferred setState), never touching the reducer's matched set —
  replay/scoring unaffected, skipped-friendly under reduced motion.
- Explore tier-2 games (Đợt 3 Slice 3, OpenSpec `add-explore-<code>-game` each):
  six new offline/stateless/no-reward games registered end-to-end exactly like
  the Đợt 2 games — `shape_hunt` (tap all of a kind, reuses tap_count field +
  odd_one_out tokens),
  `sort_bins` (tap-only classify into 2–3 bins), `missing_cell` (2-D Raven matrix,
  reuses pattern hidden-slot), `peekaboo_recall` (what's-missing, reuses memory
  cover/reveal), `subitize_flash` (flash N 1–6 then Đô Đô auto-hides ~1s — approved,
  no countdown clock; supportLevel re-peeks/stays-open), `mirror_build` (build the
  symmetric right half). All tap-only, progressive L1→L5, deterministic generator +
  independent validator (byte-identical replay), Đô Đô mascot, React-Compiler-safe
  (setState deferred in callbacks/timeouts). Registration points per game: codes in
  the 3 EXPLORE_GAME_CODES, games/renderers/rendererRegistry, registry.ts,
  variety.ts (+ verify-explore-variety-buckets generator map), thumbnails.ts
  fallback icon (no PNG yet), a catalog group, kido-server explore.registry
  PUBLIC_GAMES + bundled def + explore.service.spec catalog count, a
  verify-explore-<game> script, a kido-server spec, and best-effort audio keys
  mirrored to promptAudio + exploreAudioInventory (silent until next audio batch).
  Server registered-public catalog count is 17, and as of 2026-08-25 all 17 are
  catalog-visible (tracing re-enabled + smoothed to pack v5). Deferred:
  `tangram_assemble` (needs drag/rotate, not tap-only); dropped: `balance_scale`
  (redundant with the compare seesaw). Also pending: catalog PNG art for all Đợt-2
  and tier-2 games; route predict-ahead mode; number_bond slot shuffle.
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
