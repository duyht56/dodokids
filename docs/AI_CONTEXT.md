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
   graph (**35 skills, 7 domains** — code mirror `kido-pipeline/src/curriculum/lang-skill-catalog.ts`).
   Its `pho` domain is no longer blocked by the contract — `audio_select` landed
   (OpenSpec `add-audio-select-activity`, 2026-07-14); **31/35 skills are
   contract-ready** (only `lang_word_match` is contract-blocked; `lang_phoneme_delete`,
   `lang_synonym`, `lang_story_retell` are post-MVP). **Seeds now exist**: the D2
   session of all 48 weeks was authored as `metadata.version: "lang-v3"` (384 D2
   seeds); the D5 session is still the earlier lang-v1 corpus.
10. `docs/KIDO_LANG_CURRICULUM.md` - the `tieng_viet` learning path over that
    graph: 2 lessons/week on **D2 + D5**, 48 weeks, 16 seeds/week; organised by
    skill (like math), not by theme (like English). The old `pho` "word list vs
    image pack" question is resolved: `pho` seeds are TEXT-only (`questionCore` +
    `answerSpec`), pull their word/phonetics data from
    `kido-pipeline/src/curriculum/vi-phonetics.ts` (authoring-only), and mint TTS
    clips lazily at generate — no image vocabulary pack, no preloaded audio.
11. `docs/KIDO_ENGLISH_CURRICULUM.md` - English (`tieng_anh`) framework. DRAFT:
    theme/pattern/skill axes, 12 themes over 48 weeks (day 3), 14 skills. Its
    `en_phonics_initial`/`en_rhyme`/`en_dialogue_response` skills use
    `audio_select`, which has now landed (shared with the `tieng_viet` catalog,
    item 9).
12. `docs/KIDO_SEED_AUTHORING.md` and `docs/prompts/gen-math-seed.routine.md` -
    seed creation rules.
13. `docs/KIDO_MEDIA_STORAGE.md` - CHỐT 2026-09-21: where published media
    lives (Cloudflare R2, not GCS), the shipping clip format (AAC-LC `.m4a`),
    and the per-language TTS split (`vi` → VieNeu, `en` → Gemini). Authoritative
    over any "GCS" wording still left in items 5-6. Its companion
    `docs/KIDO_MEDIA_MIGRATION_HANDOFF.md` carries the LIVE state: as of
    2026-09-21 the code is merged but NOTHING has run against production yet,
    and VieNeu has never been called end-to-end by the pipeline. Read it before
    assuming any of this migration has happened.
14. `docs/KIDO_BACKLOG.md` - story-level backlog and acceptance criteria.

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

- Responsive layout (OpenSpec `add-ipad-support`, 2026-09-06): `app.json` has
  `ios.supportsTablet: true`, which makes Expo write all four iPad orientations
  and `UIRequiresFullScreen = false` — so **layout is driven by the window size,
  never by the device**. `mobile/src/constants/layout.ts` owns the single
  breakpoint (`TABLET_BREAKPOINT = 700`, `LARGE_BREAKPOINT = 1024`), the content
  measures, the scale ramp and `columnsFor`; `mobile/src/hooks/useResponsive.ts`
  is the hook (`useIsTablet` is now a wrapper over it) and
  `mobile/src/components/ui/ContentFrame.tsx` the capped/centred column.
  `mobile/src/explore/layout.ts` caps the Khám phá play column
  (`useExploreContentWidth`) and owns the play shell's chrome heights. Rules:
  never read a viewport size at module scope; never pair a percentage cell width
  with `aspectRatio`; widen a phone-tuned cap with `roomyMax` at the call site
  rather than editing a constant the `verify-explore-*.cjs` scripts assert on
  verbatim; and **never give two `flex: n` siblings to a row whose width is
  capped** — once the row is not stretched to the full window (a `maxWidth`, an
  explicit `width`, or a cap on any ancestor), Yoga measures the subtree
  content-first and both columns collapse to their minimum. Give one column a
  real width and let only the other flex (Home's map/panel split, and
  `ActivityContainer` / `DashboardScreen` after 2026-09-06). This is invisible in
  portrait whenever the cap is wider than the portrait window.
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
- Explore Đợt 3 feel (OpenSpec `polish-explore-round-3-feel`, 2026-08),
  presentation-only: `MemoryMatchRenderer` turns each card with a real flip
  (per-card `scaleX` 1→0→1, face swapped at the mid-point, native driver,
  skipped under reduced motion) driven only by the reducer's `faceUp`/`matched`
  state — no `memoryGame.ts`/`memoryState` change, replay byte-identical.
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
  four new offline/stateless/no-reward games registered end-to-end exactly like
  the Đợt 2 games — `sort_bins` (tap-only classify into 2–3 bins),
  `missing_cell` (2-D Raven matrix, reuses pattern hidden-slot),
  `peekaboo_recall` (what's-missing, reuses memory cover/reveal), `mirror_build`
  (build the symmetric right half). `peekaboo_recall` shows its set for
  a ~3s look window timed by the shared, numeral-free
  `explore/components/SandTimer.tsx` (owner-approved 2026-09-13; answering stays
  untimed and running out fails nothing). All tap-only, progressive L1→L5, deterministic generator +
  independent validator (byte-identical replay), Đô Đô mascot, React-Compiler-safe
  (setState deferred in callbacks/timeouts). Registration points per game: codes in
  the 3 EXPLORE_GAME_CODES, games/renderers/rendererRegistry, registry.ts,
  variety.ts (+ verify-explore-variety-buckets generator map), thumbnails.ts
  fallback icon (no PNG yet), a catalog group, kido-server explore.registry
  PUBLIC_GAMES + bundled def + explore.service.spec catalog count, a
  verify-explore-<game> script, a kido-server spec, and best-effort audio keys
  mirrored to promptAudio + exploreAudioInventory (silent until next audio batch).
  Server registered-public catalog count was 11 then (12 now, see the game-codes
  entry below), and as of 2026-08-25 all were catalog-visible (tracing
  re-enabled + smoothed to pack v5). Deferred:
  `tangram_assemble` (needs drag/rotate, not tap-only); dropped: `balance_scale`
  (redundant with the compare seesaw). Also pending: catalog PNG art for all Đợt-2
  and tier-2 games; route predict-ahead mode.
- Explore game codes (2026-09-23, OpenSpec `add-explore-number-bus-game`):
  `EXPLORE_GAME_CODES` is identical — same 12 codes, same order — in
  `docs/kido-explore-contract.ts`, `mobile/src/types/explore.ts` and kido-server
  `explore.types.ts`: `tracing_workshop`, `route_planner`, `pattern_finder`,
  `memory_match`, `stack_tower`, `missing_cell`, `peekaboo_recall`,
  `mirror_build`, `ordinal_position`, `number_chain`, `spin_pattern`,
  `number_bus`. The legacy `number_explorer`/`odd_one_out`/`sort_bins` are gone
  from docs/server as well (their server specs removed). kido-server
  `explore.registry.ts` mirrors each bundled local game through
  `BUNDLED_LOCAL_GAMES` (prefix, assets, levels); `number_bus` ("Xe buýt hai
  tầng") is local-only and offline with levels L1–L4 (GĐ1) and is never
  generated server-side. `explore.contract-codes.spec.ts` guards the three-way
  code equality and the server↔mobile mirror (`memory_match`/`pattern_finder`
  excepted: legacy server manifests). Public server catalog count is 12.
  `ExploreRunSlot.level` is the declared default; the mobile authored-run
  branch plays clamp(startingLevel + `constraints.levelOffset`, game levels).
- Explore catalog visibility is fail-closed: `catalogVisible` (absent = visible)
  on both bundled and server game configs; effective visibility = bundled AND
  applied server, computed by `isExploreGameCatalogVisible`/
  `selectVisibleExploreCatalog`, so stale server metadata cannot re-expose a
  retained-but-hidden game.
- Auth/progress state: `mobile/src/store/authStore.ts` and
  `mobile/src/types/store.ts`.
- Parent area (`mobile/src/navigation/ParentStack.tsx`) is pushed over the Child
  root screen after the PIN gate. Leaving it goes through `leaveParentArea`
  (`mobile/src/navigation/leaveParentArea.ts`), used by `ParentExitButton` at the
  head of every parent tab header and by the relock gate's cancel; it `popTo`s
  back to the child's Home, which unmounts ParentStack and ends the parent
  session. Never `navigate('Child')` from the parent area: in React Navigation 7,
  `navigate` to an EARLIER stack screen pushes a new copy, leaving ParentStack
  mounted underneath — unlocked, or with its RN `Modal` gate stuck on top.
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

- Media storage (OpenSpec-free change, 2026-09-21): published images and audio
  live in **Cloudflare R2**, not GCS — egress is ~the whole bill because every
  device prefetches and caches the catalog, and R2 charges $0 for it at equal
  measured latency from Vietnamese ISPs. `storage.service.ts` speaks S3;
  `R2_PUBLIC_BASE_*` must be a custom domain (never `r2.dev`) and a missing
  bucket now throws instead of being auto-created. Object keys are unchanged, so
  the GCS move was a host swap (`asset-url-rewrite.ts`,
  `scripts/migrate-images-to-r2.ts`). If `PUBLISH_ASSET_ALLOWED_HOSTS` is set on
  kido-server it must list the R2 domains. Details: `docs/KIDO_MEDIA_STORAGE.md`.
- Audio (same change): lesson clips ship as **AAC-LC 32k `.m4a`**
  (`LESSON_CLIP_FORMAT`), ~20 KB instead of ~197 KB per clip. NOT Opus — iOS
  AVFoundation has no Ogg/WebM demuxer so `expo-audio` cannot play it. The
  bundled Explore pack deliberately stays WAV, which is why the format is a
  parameter of `getOrCreateLibraryClip` rather than a global.
- TTS (same change): `lesson-audio.ts` picks a language per slot,
  `tts.service.ts` picks an engine per language — `vi` → VieNeu-TTS v3 Turbo
  over its local OpenAI-compatible server, `en` → Gemini (unchanged; the app
  *teaches* English). VieNeu must NOT receive the `TTS_*_PREFIX` strings: they
  are unspoken control instructions on Gemini's path and a plain TTS reads them
  aloud. Locked by `src/services/tts-routing.test.ts`.
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
- `POST /anonymous-sessions/parental-consent` (change `add-parental-consent`)
  - Body is `{ noticeVersion }` only. The server fills the policy version,
    server-clock `grantedAt`, method, declared role, purposes and the session
    `deviceId`. The same version again is idempotent (original `grantedAt`
    kept). Returns 201 `{ parentalConsent: { noticeVersion, grantedAt } }`;
    409 `household_deleted`; 409 `parental_consent_conflict` only if the write
    keeps losing to concurrent consents (retry).
  - `register`, `recover` and `status` return `parentalConsent` as that summary
    or `null`. Mobile treats `null` as missing (the `ParentConsent` step before
    Setup, or the one-time reconsent gate in `App.tsx`) and an ABSENT field as
    unknown, which never gates.
  - New builds send `X-Kido-Client-Features: parental-consent-v1` on every
    request (`mobile/src/services/api.ts`). With that header, or with env
    `PARENTAL_CONSENT_ENFORCE_ALL=true`, `POST /children` answers 409
    `parental_consent_required` until consent is recorded, and mobile routes
    that back to `ParentConsent`. Dropping the header silently turns
    enforcement off for that build.
  - Accepted versions: `PARENTAL_CONSENT_NOTICES` (server) and
    `PARENTAL_CONSENT_NOTICE_VERSION` (mobile); the wording of each version is
    kept in `docs/KIDO_PARENTAL_CONSENT_NOTICE.md`.
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

# Media migration / regeneration (2026-09-21, see docs/KIDO_MEDIA_STORAGE.md)
npm run migrate:images-r2 -- --dry-run   # copy GCS images → R2 + rewrite URLs
npm run regen:audio -- --dry-run         # rebuild every clip on the new voice/format
```

## Agent Notes

- Use CodeGraph before code search/read when `.codegraph/` exists.
- Prefer the current implementation over older backlog wording when they differ.
- Backlog HTTP endpoints for per-step pipeline actions are intentionally not the
  implementation shape; pipeline is worker/CLI-driven.
- For mobile UI, preserve child-friendly, audio-first, visual-first behavior.
- For content/schema changes, update docs and code together to avoid naming
  drift.
