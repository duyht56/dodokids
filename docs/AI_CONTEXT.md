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
  `mobile/src/explore/renderers/RoutePlannerRenderer.tsx`, played in leveled
  rounds since 2026-10-21 (see the route/mirror bullet below; it used to be the
  only continuous one-at-a-time game). All run state (level, seed, commands,
  support, replay exclusions) is memory-only; optional audio
  (`mobile/src/explore/audio.ts`) is never a required dependency.
- Explore shared play layer (OpenSpec `fix-explore-catalog-round-1`, 2026-08):
  the round planner in `mobile/src/explore/variety.ts` rotates bucket serving
  order per batch and serves `recentBucketKeys` last, so one-exercise batches
  cover every reachable mode (contract: `npm run test:explore-variety-buckets`);
  `buildNearTargetOptions(..., { exclude })` in `games/numberUtils.ts` is the
  shared, non-median distractor builder; range/arithmetic progress is
  `{ level, recent }` with 5-of-7 window promotion; the play screen has had no
  continuous mode since 2026-10-21 (`isContinuousExploreRunGame` is always
  false, kept only for older contract calls);
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
  local games — `stack_tower` and `odd_one_out` (progressive five-board runs;
  stack_tower four boards since `fix-explore-stack-tower-light`)
  — each owning its variety
  policy/keys in `mobile/src/explore/games/<game>Game.ts`; renderers receive
  `supportLevel` (0/1/2 from the play screen's miss count) and the screen
  demotes a range/arithmetic run one level after three misses in a row
  (`demoteRangeProgress`/`demoteArithmeticProgress`). Đô Đô's feedback voice,
  game names and all new prompts are ONE audio batch: inventory in
  `promptAudio.ts` mirrored by `kido-pipeline/src/explore/exploreAudioInventory.ts`,
  pack `explore-audio-vi-v2` (mobile accepts v1+v2); see
  `openspec/changes/add-explore-round-2-games/audio-batch-v2.md` for the run.
  Later batches: v3 (go-live re-record), v4 (`number_bus` `nb_*`), v5 (whole
  lines, below), v6 (`balance_scale`), v7 (2026-10-19: Ú òa look/support lines,
  Đúng vị trí question lines `ord_tap`/`ord_tap_row`; 2026-10-20 its level intros
  `ordinal_intro_2..5`), v8 (2026-10-21, owner listened and approved all 55
  takes; mobile + pipeline branch `feat/explore-audio-v8`): 30 new ids — Dẫn đường/Soi gương (9)
  `route_intro_2..5`, `mirror_intro_2..5`, `mirror_hint_pair`; Máy nối tiếp
  (10) `game_number_chain`, `chain2_forward_q`, `chain2_reverse_q`,
  `chain2_ask_end`, `chain2_ask_start`, `chain2_mantra_forward`,
  `chain2_mantra_reverse`, `chain2_hint_dots`, `chain2_intro_3`,
  `chain2_intro_4`; Ú òa cốc (9) `peekaboo_mantra`, `peekaboo_cups_which`,
  `peekaboo_cups_which_next`, `peekaboo_hint_place`, `peekaboo_missing_done`,
  `peekaboo_cups_done`, `peekaboo_cups_intro_3..5` (appended in this order at
  the end of `PROMPT_PHRASES` in mobile `promptAudio.ts` and in the pipeline
  inventory), the Ô thiếu mantra `missing_cell_solve` and the Đúng vị trí game name
  `game_ordinal_position` (review D13: its catalog card was silent); plus Đô Đô's 12
  «Mình…» lines re-worded and re-recorded as «Bé…» (persona,
  `docs/KIDO_DODO_PERSONA.md`): `fb_retry_2`, `fb_level_up`, `fb_easier`,
  `fb_run_complete`, `fb_level_next`, `fb_level_again`, `tracing_continue_glow`,
  `tracing_next_stroke`, `tracing_follow_dots`, `nb_count_model`, `nb_today`,
  `nb_counted_already`, with the 13 whole lines that contain them (`nb_today` 3–8,
  `nb_remodel` 3–9). Pack v8 = 515 clips (241 whole lines); the export drops
  `tower_which_bigger` (Xếp tháp; its v7 file stays in the folder, unbundled).
  `test:explore-prompt-audio` fails if a game has no `game_<code>` phrase or a phrase
  says «mình». Re-take chosen clips with
  `VIENEU_TEMPERATURE=0.7 npm run explore-audio:generate -- --keys <key…>` (forced,
  rejected included; reports clips shared by aliases). The Thám tử Đô Đô branch
  (`feat/explore-clue-detective`) still names its own batch v8 and must become v9.
  `SUPPORTED_EXPLORE_AUDIO_PACK_VERSIONS` in
  `explore/exploreAudioCapability.ts` lists every accepted pack.
- Explore prompt timing: the play shell reads `exercise.audioRefs` on mount,
  except `RENDERER_CUED_PROMPT_GAMES` (`peekaboo_recall`, `number_chain`), whose
  renderer cues each line through `onPromptCue` when it fits the board (Ú òa: the
  look line, then the question only once the gap is revealed or the cups are
  down; Máy nối tiếp: each blank's question; 🔊 repeats the last cue).
  The support hint row/voice comes from
  `supportHintPhraseId(gameCode, level, hasAudio, exercise?)` (a game's own line
  where the generic «nghe lại / nhìn kỹ từng lựa chọn» does not fit; Ú òa picks
  its line by the board's mode).
  `ordinal_position` speaks its actual question (`ordinalPositionKeys(isGrid,
  row, ordinal, fromLeft)`), no longer one generic sentence, and as a
  `BOARD_QUESTION_PROMPT_GAMES` member every board reads it (never skipped as a
  repeat of the previous board's sentence). The cue reset is a `useLayoutEffect`
  so it runs before the new board's own cue effect.
- Explore whole-line audio ("câu liền", OpenSpec `add-explore-whole-line-audio`,
  2026-10, in progress): every composed SENTENCE (a number/word stitched into a
  phrase fragment, e.g. "Có tất cả" + "sáu" + "bạn nhé.") gets one clip rendered
  whole at authoring time (VieNeu `dodo-clone2`, `VIENEU_TEMPERATURE=0.7`, Human
  Gate) and bundled as pack `explore-audio-vi-v5`; NO runtime/server TTS.
  Mobile is the source of truth: `mobile/src/explore/promptLines.ts` (pure)
  defines line templates whose refs come only from the `promptAudio.ts` key
  builders, keys `explore-audio:vi:line:<templateId>:<params '-'-joined>:v1`,
  and `resolvePromptSegments` (longest line match, left to right). It is dumped
  to the committed `mobile/src/explore/explorePromptLines.generated.json`
  (`npm run explore-lines:dump`), which kido-pipeline reads — never hand-mirror
  line transcripts. `explore/audio.ts` plays a bundled line as ONE clip and
  otherwise the stitched clips exactly as before (automatic fallback), with a
  cancellable 280 ms gap after each sentence. `exercise.audioRefs`,
  generators, validators and key builders are unchanged (no contract change).
  The generated registry also exports `EXPLORE_AUDIO_DURATIONS_MS` (trimmed PCM,
  empty until the v5 export), used by the `number_bus` speech estimate and mantra
  timing; a hand rollback must keep that export (even `{}`) because `audio.ts`
  imports it. Line clips are `.m4a`; phrase/word/number/label clips stay WAV.
  The answer echo «N! Có tất cả N bạn nhé.» (`next_number`, `count_on`) is its
  own two-sentence line `nb_count_finish`; a line that opens on a number never
  takes the number that ends a stitched fragment before it.
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
  Since 2026-10-20 (OpenSpec `merge-explore-spin-into-pattern`) a sixth family
  `rotation` replaces the standalone `spin_pattern` game: level 3 only, six
  arrows of one colour (`components/ArrowGlyph.tsx`) turning a quarter turn per
  step, hole at index 4–5, three options taken from the row, `complete` mode
  only, question clip `spin_which`, intro `pattern_intro_3` names the arrows;
  versions are now `pattern-finder-v6`/`pattern-finder-validator-v5`. The
  catalog groups are "Quy luật" (pattern_finder, missing_cell), "Trí nhớ"
  (peekaboo_recall, memory_match) and "Sắp xếp và dẫn đường".
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
  `missing_cell` (2-D Raven matrix, reuses pattern hidden-slot; since
  2026-10-20, OpenSpec `fix-explore-missing-cell-leak`, `missing-cell-v2`: a 3×3
  board covers the other three corners of a 2×2 block around the "?" cell and
  offers exactly that block, a 2×2 board covers nothing and offers one board
  mate plus one off-board token, the validator proves the board reads one way
  only, the contract bounds naive solvers on 2000 seeds per level, and a right
  answer plays a worked solution with the mantra `missing_cell_solve` before
  `onAnswer(true)`; since 2026-10-21, OpenSpec
  `update-explore-missing-cell-warm-up`, `missing-cell-v3`: the scored levels
  are L1–L3, all 3×3 (shape, dots, either kind — the old L3–L5), and the 2×2
  board is generator level 0 (`MISSING_CELL_WARM_UP_LEVEL`, outside `levels`),
  played only as the unscored warm-up because elimination wins it 100%; a
  starting level saved on the old five-level ladder is moved once by the
  `kido-parent-preferences` store, persist version 1 →
  `migrateExploreParentConfig`: 1–3 → L1, 4 → L2, ≥5 → L3),
  `peekaboo_recall` (what's-missing, reuses memory cover/reveal; since
  2026-10-21 "what is under this cup" from L3, see the Ú òa entry below), `mirror_build`
  (build the symmetric right half). `peekaboo_recall` shows its set for
  a look window (1 s per object, at least 3 s) timed by the shared, numeral-free
  `explore/components/SandTimer.tsx` (owner-approved 2026-09-13; answering stays
  untimed and running out fails nothing). All tap-only, progressive L1→L5 (`missing_cell`
  and `peekaboo_recall` play leveled rounds since 2026-10-18, `mirror_build` since
  2026-10-21, see below), deterministic generator +
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
  `tangram_assemble` (needs drag/rotate, not tap-only); `balance_scale` was dropped
  then (redundant with the compare seesaw) and rebuilt 2026-10-16 as a different
  construct (see the Cân thăng bằng entry below). Also pending: catalog PNG art for all Đợt-2
  and tier-2 games; route predict-ahead mode.
- Explore game codes (2026-09-23, OpenSpec `add-explore-number-bus-game`;
  `balance_scale` appended 2026-10-16): `EXPLORE_GAME_CODES` is identical —
  same 12 codes, same order — in
  `docs/kido-explore-contract.ts`, `mobile/src/types/explore.ts` and kido-server
  `explore.types.ts`: `tracing_workshop`, `route_planner`, `pattern_finder`,
  `memory_match`, `stack_tower`, `missing_cell`, `peekaboo_recall`,
  `mirror_build`, `ordinal_position`, `number_chain`,
  `number_bus`, `balance_scale` (`spin_pattern` was removed 2026-10-20 when it
  became pattern_finder's `rotation` family). The legacy `number_explorer`/`odd_one_out`/`sort_bins` are gone
  from docs/server as well (their server specs removed). kido-server
  `explore.registry.ts` mirrors each bundled local game through
  `BUNDLED_LOCAL_GAMES` (prefix, assets, levels); `number_bus` ("Xe buýt hai
  tầng") is local-only and offline with levels L1–L4 (GĐ1) and is never
  generated server-side. `explore.contract-codes.spec.ts` guards the three-way
  code equality and the server↔mobile mirror (`memory_match`/`pattern_finder`
  excepted: legacy server manifests). Public server catalog count is 13.
  `ExploreRunSlot.level` is the declared default; the mobile authored-run
  branch plays clamp(startingLevel + `constraints.levelOffset`, game levels).
- Cân thăng bằng (`balance_scale`, OpenSpec `add-explore-balance-scale-game`,
  2026-10-16): local, offline, L1–L6, teaches the worksheet "cân nặng"
  substitution ("1 quả lê nặng bằng 2 quả táo, đổi 1 lê lấy 2 táo"). Game module
  `mobile/src/explore/games/balanceScaleGame.ts` (generator, independent
  validator, pure weights/tilt/`balanceSupportCue`, line builders that return
  on-screen text + clip keys together); renderer
  `renderers/BalanceScaleRenderer.tsx` + `renderers/balanceScale/*` (pure layout
  in `layout.ts`, `ScaleView`, basket/cards). Live scale in `balance`/`measure`
  (cannot be missed), HELD scale + "Thả cân" elsewhere; tapping a big item swaps
  it for its small items (required in `exchange`, always in `chain`, support 2
  in `predict`/`choose`). Second authored-run game, played in LEVELED ROUNDS
  (owner 2026-10-17): each run of the 6-slot policy is one round of six boards
  at one level; `ExplorePlayScreen` then moves up a level when at least
  `BALANCE_ROUND_PASS` (4) were right on the first try, else plays a fresh round
  of the same level (at most `maxRepeats` = 1 extra round; failing it ends the
  run naturally), and passing level 6 ends the run. The next round's board is
  locked until the round lines have been spoken; authored slots keep their whole
  exclusion list (`LocalExploreProvider` only windows non-authored requests), and a
  round that needs a level's whole pool draws up to max(500, 50 × capacity) times
  in `planExploreRound` so it finds the last unseen board. The rule is the pure
  `nextExploreRound`; a game opts in through `getExploreLeveledRounds` in
  `registry.ts` (round size + pass mark + max extra rounds + optional per-level
  intro line; `LEVELED_ROUND_RULE` = 6/4/1); the top bar shows "Bậc N/max";
  level and round count live only in the mounted screen. The play shell skips its generic
  retry/hint voice and hint row for it (`SELF_VOICED_MISS_GAMES`): the renderer
  says its own number-free miss line. Audio pack `explore-audio-vi-v6`
  (`bal_*` phrases incl. round lines `fb_level_next`/`fb_level_again`/
  `bal_intro_2..6`, nine `balance-*` labels, `nang_bang`/`may` words, whole
  lines `bal_ask`/`bal_is`/`bal_tap` whose item params are 1-based
  `BALANCE_ITEMS` numbers — append-only order). Contract:
  `npm run test:explore-balance-scale`. Thumbnail `balance-scale.png`.
  Leveled rounds are shared since 2026-10-18 (OpenSpec
  `update-explore-leveled-rounds`): `pattern_finder`, `missing_cell`,
  `peekaboo_recall`, `number_chain` and (2026-10-20, intro lines
  `ordinal_intro_2..5` in pack v7) `ordinal_position`, then (2026-10-21, see the
  Dẫn đường + Soi gương entry below) `route_planner` and `mirror_build` left
  `isProgressiveExploreRunGame`, so a
  round is a one-level `LocalExploreProvider` batch of `roundSize`
  (`getExploreRunSize` returns it); multi-board batches in `planExploreRound`
  draw until every bucket has ⌈count/buckets⌉ unseen boards (even mode mix);
  a leveled game may declare `warmUp` (`ExploreWarmUp`: generator level outside
  `levels`, board count, demo count, closing line; only `missing_cell`: two 2×2
  boards, the first shown by Đô Đô through the renderer prop `demo`):
  `getExploreWarmUp(game, startLevel)` gives it only at the lowest level, the
  play screen puts it before the first round of the visit's first run
  (`warmUpCount` leading boards, `warmUpOfferedRef`), never counts it (no
  first-try, never a round end, header «Làm quen k/2» with its own dots) and ends
  it like a move up (`fb_level_next` + `missing_cell_intro_3`);
  the play screen clears `lastPromptKeyRef` at each round swap and remembers
  each level's last two rounds (`roundKeysByLevelRef`, memory-only) so a new run
  avoids the boards of its start level; `LocalExploreProvider` keeps 2×count
  exclusions for multi-board batches; the authored branch caps earlier
  exclusions at capacity − slots (balance L2 has 12 boards); Ú òa's look
  window waits for the board to open (`opened`). Only games whose renderer
  reports every miss may opt in (memory/tracing and number_bus's board_all /
  free_split only send `onAnswer(true)`); `stack_tower` reports wrong
  placements since 2026-10-21 but stays progressive because the owner chose not
  to turn it on yet. Each leveled game's rule is
  pinned in the contract (`RULE_EXCEPTIONS`: default 6/4/1, `mirror_build`
  4/3/1, `balance_scale` its own pass mark). Contract:
  `npm run test:explore-leveled-rounds`.
  Authored runs (`createExploreRunBatch`) generate slots in order and exclude
  every board already picked this run, so no run repeats a board (applies to
  `number_bus` too). Shared audio (`explore/audio.ts`, 2026-10-16):
  `playExploreFeedbackAudio(refs, { onStart })` reports when a line really
  starts, and `playExploreGentleFeedbackAudio` plays a reminder only once no
  prompt is pending or sounding (a 🔊 replay included) and no feedback is in
  flight, dropping itself via `stillWanted`; renderers reach both through
  `onSpeakFeedback(refs, { gentle, onStart, stillWanted })`, which now returns a
  promise that settles when the line has played. Other feedback never cancels a
  gentle line; leaving Explore does. The play screen's timed break reminder is
  spoken as a gentle line (it used to cut off the board's question); every
  other existing caller is unchanged.
- Explore play reliability (OpenSpec `fix-explore-play-reliability`, 2026-10-21,
  "Đợt 1" of the 12-game review; mobile branch `fix/explore-dot1-bugs`):
  feedback lines take `stillWanted` (checked when the line's turn comes) and
  `dedupe`, and resolve `true/false`; the play screen ties retry/hint to a board
  token + solved flag and drops a renderer's waiting line once its board is
  replaced. The run PAUSES while the exit card is open or AppState is
  `background`/`inactive`: shell timers go through `explore/pausableTimers.ts`
  (API `pause/unpause` — kido-server `explore.stateless-privacy.spec` forbids
  "resume" in the play screen), voice stops, renderers get `disabled` +
  `paused`; Ú òa re-runs a full look when paused during the look (once covered
  or revealed it holds the board, review C04, see the Ú òa cups entry), `useBusSequencer(paused)` holds Cân/Xe buýt
  beats. Xe buýt `stage.speak/say` return promises (count_on/next_number report
  after the closing line); follow-up branch `fix/explore-dot1-followup`: a mantra
  cut by a pause is re-said, `stage.mantra` moves the scene on exactly once, and
  number_bus reports `onBoardBusy` from the child's answer until `onAnswer(true)`
  so the shell does not re-ask a board closing itself. Tracing: strokes ≤
  `SHORT_TRACING_STROKE_LENGTH` (12) are judged on geometry — forward reach along
  the stroke from where the finger landed (wobble or a sideways swipe adds
  nothing), ≥ ¾ traced finishes on reaching the end; longer ones keep the
  ≥4-sample guard and report `insufficientData`; the workshop only takes the
  completion of the seed being practised. Route ✓ uses `routeCheckpointProgress` (ordered, as the engine).
  Contract scripts can mount real renderers through
  `mobile/scripts/explore-render-harness.cjs` (hooks, fake clock, RN stubs):
  `test:explore-play-shell`, `test:explore-tracing`, `test:explore-route-planner`,
  number_bus §12.
- Xếp tháp light fix (OpenSpec `fix-explore-stack-tower-light`, 2026-10-21,
  owner kept the game; mobile branch `fix/explore-stack-tower-light`): the
  two-block "Bạn nào to hơn?" warm-up and the `compare` dimension are gone;
  four levels renumbered L1–L4 (config of the old L2–L5) as `stack-tower-v2`
  (kido-server `BundledLocalGameSpec.version` = 2, levels [1..4]); a run is
  still progressive, one board per level (`PROGRESSIVE_RUN_SIZE.stack_tower = 4`),
  so any stored starting level opens on L1. The renderer now reports EVERY
  misplacement as `onAnswer(false)` (the physical slide-back stays; support
  comes only from the shell), yet it stays a progressive climb, out of leveled
  rounds, by the owner's choice (2026-10-21); `test:explore-leveled-rounds` pins
  it in `PROGRESSIVE_WITH_MISSES` (renderer reports misses, no
  `LEVELED_ROUNDS` entry, still `isProgressiveExploreRunGame`). Each floor block
  sits in a tap cell `layout.blocks[i].hit` ≥ `STACK_TOWER_MIN_HIT` (48pt) that
  is the touchable view (hitSlop cannot reach past a parent);
  `test:explore-stack-tower` measures the real tap areas through the render
  harness on 320/375/430pt phones. The renderer draws `layoutStackTowerStage`:
  32pt floor reserve (`STACK_TOWER_FLOOR_RESERVE`, spare top room used first,
  shrinking only while `stackTowerLayoutReadable` holds: level ratio and a 6pt
  step between blocks next in size) and an 8pt pad above Đô Đô, on a stage
  hung from the scene's TOP, so the
  shell's hint strip taking up to 32pt from the bottom on a miss moves
  nothing; `nextStackTowerSceneSize` relays out only past the reserve, on a new
  width, or growth before the first tap (then a trying block springs home and
  Đô Đô's hops follow the new layout). Xếp tháp and Lật thẻ run their beats on
  `useBusSequencer(paused)`, so the climb, the memory turn-back/peek and both
  reports hold while paused. Passenger dots are ink (`DotGroup` coral = the
  orange car). Phrase `tower_which_bigger` left `promptAudio.ts` and the
  pipeline inventory (its `.wav` stays bundled until the next pack export).
- Dẫn đường + Soi gương leveled (OpenSpec `update-explore-route-mirror-leveled`,
  2026-10-21; mobile branch `feat/explore-route-mirror-leveled`, kido-server branch
  of the same name): `route_planner` reports every failed run (edge, obstacle,
  locked door, short of / past home, missing star or checkpoint order) as ONE
  `onAnswer(false)` after the walk and keeps the board; it plays
  `LEVELED_ROUND_RULE` 6/4/1 with `route_intro_2..5`. The play screen lists it in
  `SELF_VOICED_MISS_GAMES` and the new `BOARD_GUIDANCE_GAMES` (no shell text under
  the board on a miss; praise/round lines float over the board's bubble only while
  it is locked). Its walk/result/guidance timers are a renderer-owned
  `createPausableTimers()` held on `paused`; under reduced motion the whole path
  shows at once (900 ms hold); walked cells are tinted. `mirror_build` is v2:
  `MIRROR_ROUND_RULE` 4/3/1 with `mirror_intro_2..5`; L5 is 5×(2·3) (never > 3
  columns a side); boards whose left half is its own reflection are redrawn
  (`mirrorBuildCopyIsWrong`, validator too, minOn ≥ 2); support shows ONE pair
  picked once per board (`mirrorBuildDemoPair`: missing ON cell furthest from
  the mirror, else an extra ON cell), cleared when its right cell is tapped,
  then column distance dots at level 2 — no anchor that follows the answer, no
  dimming; spoken/hint line `mirror_hint_pair`. Cell size comes from
  `mirrorBuildCellLayout(width, rows, cols, gridBudget)` (44–68 pt, keeps to the
  20 pt column unless 44 pt needs the padding, 8 pt from the edge, gap 6→4) over
  the measured play area. kido-server mirrors versions through
  `BundledLocalGameSpec.version` (mirror_build = 2, same code as
  `fix/explore-missing-cell-leak`). The render harness has `knobs.window`;
  `test:explore-mirror-build` measures rendered cells at 320/375/430 pt.
  New lines `route_intro_2..5`, `mirror_intro_2..5`, `mirror_hint_pair` (9) wait
  for audio v8; they ARE in `kido-pipeline` `exploreAudioInventory.ts` on the
  integration branch `integrate/explore-2026-10-21` (66389c5; the route-mirror
  branch itself has no pipeline commit) — without them,
  `test:explore-prompt-audio` fails when mobile sits next to kido-pipeline.
  Soi gương switches to a compact layout (smaller prompt, no helper line under
  the grid, tighter gaps) when the measured board is too short for the roomy
  one at its level, so "Xong" never lands under the play screen's feedback
  strip on 16:9 Android phones (that strip is `pointerEvents="none"` too). After
  a pause, a renderer playing out the child's action (`onBoardBusy`, Dẫn đường's
  walk) never gets the question read over its ending (the renderer releases
  busy on every way out: ending, edit, unmount); one cut off mid-line gets
  1.5 s to go on before the question is read (never silence), except a game in
  `RENDERER_CUED_PROMPT_GAMES` that spoke after its latest cue — that cue is
  stale (Máy nối tiếp v2's filled cell) and is not read again.
  Pause follow-ups from the adversarial review of Đợt 1 (same change): the shell
  holds `onAnswer` calls made while paused (`heldAnswersRef`) and answers them
  when play goes on (miss first); `handleTryAgainSound` is silent while paused;
  renderer feedback lines are numbered against the board's question
  (`voiceSeqRef`/`questionSeqRef`/`rendererLinesRef`): a solved board, or one
  whose renderer was busy (`onBoardBusy`), is NOT asked again on the way back;
  if a renderer line asked after the question was in flight when the pause
  began, the renderer gets `RENDERER_GOES_ON_MS` (1.5 s) to say it again or
  report the board, and the question is read only if it stays silent (a new
  pause cancels that read). Xe buýt's mantra cut by a pause is re-said from
  the start by `stage.mantra` before the bus moves on, and the bus reports
  `onBoardBusy` from the child's answer, so no question is read on the way back;
  Máy nối tiếp v2 says its mantra through `throughPause` (re-said whole, success
  waits for it) and reports `onBoardBusy` from the right second card until
  `onAnswer(true)` (integration commit 0ca421f, task 8.7); Ú òa clears its cue
  once the set is covered and is busy during the why (integration commit
  9779e61); a break reminder dropped by the pause
  is said once afterwards (`breakLineOwedRef`). Route guidance cut by a pause is
  re-said by the renderer (`speakGuidance`/`owedGuidanceRef`). The play-shell
  contract §7 mounts the real `ExplorePlayScreen` through the harness with
  recorded audio/SFX stubs (`harness.stubs[...]`, `@/constants/layout` alias).
- Máy nối tiếp v2 (`number_chain`, OpenSpec `rework-explore-number-chain`,
  2026-10-21; mobile branch `feat/explore-number-chain-rework`, server mirror at
  `BundledLocalGameSpec.version` 2): the child fills BOTH blanks of the
  two-machine chain in the worksheet's order (`params.blanks`: forward
  mid→end, reverse mid→start; `answer.values`). Levels: L1 forward + dots on both
  machines, L2 + reverse, L3 dots only on the machine worked first
  (`dotSteps` 1), L4 no dots, L5 range 0–20; L1–L4 range 0–10, machines 2–4.
  From L2 a round is 2 forward + 2 `reverse_add` + 2 `reverse_sub` (buckets by
  machine 2). Cards: `{a, a±g, m, m±g}`, m = 2x − a the sign / run-forward
  card (always present; g = 1, else 2); the off card's side (toward / away from
  the input x) is drawn evenly and independently for each pair, and same-sign /
  mixed-sign machines evenly, before the chain is chosen; blank 1 never shows
  blank 2's answer or sign card — do not swap in `buildNearTargetOptions`. Owner
  approved 2026-10-21 (direction A): no ±1 machines, L1–L4 in 0–10 with 0, L5 up
  to 20, and a known gap kept on L1–L4 — blank 1 (the middle) is never farther
  from 5 than its sign card at 0–10 (count k, ignore the sign, pick nearer 5
  passes 26–30% of rounds; L5 is the reverse-reasoning gate); review after
  playtest. Format limit (2026-10-21): direction + card distance to the input
  tops out at ~76% of blank 1 and 87–88% of blank 2 (a card next to the input
  is never right) — generator tuning stopped, contract locks it at the measured
  level; a "build the answer" format for Đợt 3 awaits the owner. Renderer
  reports every miss, cues each blank's question (`number_chain` is in
  `RENDERER_CUED_PROMPT_GAMES`), keeps missed cards faded until the row changes,
  and after the second blank replays the chain forward with `DotGroup`
  `changed` dots while saying the mantra, then `onAnswer(true)` (busy via
  `onBoardBusy` meanwhile; a mantra cut by a pause is re-said through
  `throughPause`; a pause in the `NEXT_CELL_MS` move to blank 2 cues blank 2's
  question at once, so the way back never re-reads blank 1's). `DotGroup`
  gained optional `size`/`changed`. Contract `npm run test:explore-number-chain`
  measures every trick class through the real planner (no-knowledge,
  direction-only, steps-only, the structural "nearer 5" class and the
  direction + distance class at their measured levels, reverse; `NC_REPORT=1`
  prints the table) and drives the renderer through the harness. Audio v8 (not
  rendered): `game_number_chain` + nine `chain2_*` lines (no `chain2_intro_5`:
  L2 / L5 reuse pack-v7 `chain_intro_2` / `chain_intro_4`, «…số lớn tới hai
  mươi…»), mirrored in the pipeline inventory.
- Ú òa "Dưới cốc này là gì?" (OpenSpec `upgrade-explore-peekaboo-cups`,
  2026-10-21, owner decision after the 12-game review; mobile/kido-server/
  kido-pipeline branches `feat/explore-peekaboo-cups`): `peekaboo_recall` v2 has
  two board kinds, `params.mode` `missing` (L1 3 objects, L2 4; cards = the
  missing one + exactly one still on the board + new ones, so neither "seen
  before" nor "not on the board" answers alone) and `cups` (L3 3 cups, L4 4, L5 4
  with two cups asked in a row; cards = exactly the objects under the cups;
  `askedSlots` by seeded permutation). Answer shape `assetIds` (one per
  question). `variantKey` = kind + arrangement + removed slot / asked cups, never
  the cards. Look = `peekabooLookMs` (1 s per object, ≥ 3 s). The renderer
  shows why after the last right answer (gap filled / cups lifted left to right)
  and says `peekaboo_missing_done` / `peekaboo_cups_done` through
  `onSpeakFeedback`, then reports `onAnswer(true)` (held while paused; a pause
  after the cover/cups/reveal never shows the set again, C04). On the play
  screen (integration commit 9779e61) the renderer puts an empty cue on record
  once the set is covered (`onPromptCue([])`), so neither 🔊 nor the way back
  from a pause reads the look line / mantra over the cover, and reports
  `onBoardBusy` from the last right answer until `onAnswer(true)`, so the
  answered question is not read over the why (even with the v8 clips missing;
  `test:explore-play-shell` §8 drives the real screen + real renderer); the
  bubble follows the phase; cups are Views; one row of objects and one of cards
  sized by the pure `renderers/peekabooLayout.ts`. Mantra `peekaboo_mantra` is
  the cups look line; 9 new phrases wait for audio batch v8 (in the pipeline
  inventory on the integration branch); `levelIntroLine
  ('peekaboo')` maps L2 to the existing `peekaboo_intro_3`. kido-server
  `BundledLocalGameSpec.version` (same lines as the Ô thiếu branch) = 2.
  Contract `npm run test:explore-peekaboo` runs naive solvers on real planner
  rounds (memory-free tricks ≈ guessing; v1's "pick the familiar card" was
  100%), the layout on five devices and the mounted renderer.
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
  parameter of `getOrCreateLibraryClip` rather than a global (exception: Explore
  whole-line clips from `add-explore-whole-line-audio` are staged as WAV and
  exported as `.m4a`).
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
