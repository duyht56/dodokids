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
  `ordinal_intro_2..5`); `SUPPORTED_EXPLORE_AUDIO_PACK_VERSIONS` in
  `explore/exploreAudioCapability.ts` lists every accepted pack.
- Explore prompt timing: the play shell reads `exercise.audioRefs` on mount,
  except `RENDERER_CUED_PROMPT_GAMES` (`peekaboo_recall`), whose renderer cues
  each line through `onPromptCue` when it fits the board (Ú òa: the look line,
  then the question only once the gap is revealed; 🔊 repeats the last cue).
  The support hint row/voice comes from `supportHintPhraseId` (a game's own line
  where the generic «nghe lại / nhìn kỹ từng lựa chọn» does not fit).
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
  `missing_cell` (2-D Raven matrix, reuses pattern hidden-slot),
  `peekaboo_recall` (what's-missing, reuses memory cover/reveal), `mirror_build`
  (build the symmetric right half). `peekaboo_recall` shows its set for
  a ~3s look window timed by the shared, numeral-free
  `explore/components/SandTimer.tsx` (owner-approved 2026-09-13; answering stays
  untimed and running out fails nothing). All tap-only, progressive L1→L5 (`missing_cell`
  and `peekaboo_recall` play leveled rounds since 2026-10-18, see below), deterministic generator +
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
  `ordinal_intro_2..5` in pack v7) `ordinal_position` left
  `isProgressiveExploreRunGame`, so a
  round is a one-level `LocalExploreProvider` batch of `roundSize`
  (`getExploreRunSize` returns it); multi-board batches in `planExploreRound`
  draw until every bucket has ⌈count/buckets⌉ unseen boards (even mode mix);
  the play screen clears `lastPromptKeyRef` at each round swap and remembers
  each level's last two rounds (`roundKeysByLevelRef`, memory-only) so a new run
  avoids the boards of its start level; `LocalExploreProvider` keeps 2×count
  exclusions for multi-board batches; the authored branch caps earlier
  exclusions at capacity − slots (balance L2 has 12 boards); Ú òa's look
  window waits for the board to open (`opened`). Only games whose renderer
  reports every miss may opt in (memory/stack/route/tracing/number_bus scenes
  only send `onAnswer(true)`); the other five are owner decisions. Contract:
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
  `paused`; Ú òa re-runs a full look, `useBusSequencer(paused)` holds Cân/Xe buýt
  beats. Xe buýt `stage.speak/say` return promises (count_on/next_number report
  after the closing line). Tracing: strokes ≤ `SHORT_TRACING_STROKE_LENGTH` (12)
  are judged on geometry; longer ones keep the ≥4-sample guard and report
  `insufficientData`; the workshop only takes the completion of the seed being
  practised. Route ✓ uses `routeCheckpointProgress` (ordered, as the engine).
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
  comes only from the shell) — not yet a leveled-rounds game. Each floor block
  sits in a tap cell `layout.blocks[i].hit` ≥ `STACK_TOWER_MIN_HIT` (48pt) that
  is the touchable view (hitSlop cannot reach past a parent);
  `test:explore-stack-tower` measures the real tap areas through the render
  harness on 320/375/430pt phones. The board sits on a stage anchored to the
  scene's floor and `nextStackTowerSceneSize` relays it out only when it no
  longer fits, the width changes, or the scene grows before the first tap (the
  shell's hint strip can resize the scene on every miss); a forced relayout
  lets floor blocks finish their slide and moves Đô Đô's remaining hops to the
  new layout. Xếp tháp and Lật thẻ run their beats on
  `useBusSequencer(paused)`, so the climb, the memory turn-back/peek and both
  reports hold while paused. Passenger dots are ink (`DotGroup` coral = the
  orange car). Phrase `tower_which_bigger` left `promptAudio.ts` and the
  pipeline inventory (its `.wav` stays bundled until the next pack export).
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
