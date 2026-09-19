## Why

Khám phá (Explore) trains counting (`tap_count`), quantity
comparison (`quantity_compare`) and number sense (`number_explorer`), but nothing
trains SUBITIZING — recognising a small quantity (1–6) at a glance, without
counting one-by-one. Subitizing is a foundational number-sense skill for 4–6 year
olds and is measurably distinct from counting: the child must perceive "how many"
in an instant, not tap each item.

The Explore engine already has everything needed to build it offline and
stateless: the shared visual-math primitives that draw a quantity
(`DotGroup` / `ObjectGroup` / `TenFrame` in `VisualMathPrimitives`), the
`tap_count` COUNT_LEVELS ranges for the target N, `buildNearTargetOptions` for the
number choices, the `tap_count` countable emoji-content pool for objects, and the
`peekaboo_recall` reduced-motion-aware, native-driver cover mechanic. A new game
reuses all of them and adds only a generator, an independent subitizing validator
and a flash-then-cover renderer.

## What Changes

- **One new local, offline, stateless game** registered end to end (contract
  codes in all three packages, mobile registry/variety/renderer map/thumbnail/
  catalog group, kido-server registry, a conformance script
  `npm run test:explore-subitize-flash`, a kido-server spec and this capability
  spec): `subitize_flash` ("Nhìn nhanh").
- A small group of dots/objects (N in the subitizing range 1–6) is FLASHED for
  about a second, then Đô Đô COVERS the group (an ~1s auto-hide the product owner
  approved — this is subitizing, NOT a banned countdown: there is NO countdown
  clock and NO numerals ticking down, only Đô Đô covering the group), and the
  child taps N from a small number-options row.
- The target N REUSES the `tap_count` COUNT_LEVELS ranges (capped at
  `SUBITIZE_MAX_N` = 6, since subitizing is a small-number skill). The number
  cards REUSE `buildNearTargetOptions` (N plus near-value distractors, seeded-
  shuffled so the answer is never at a fixed position). The quantity is drawn with
  the shared `DotGroup` / `ObjectGroup` / `TenFrame` primitives; objects reuse the
  `tap_count` countable emoji-content pool (emoji as CONTENT, never a UI icon).
- A **deterministic seeded generator** and an **INDEPENDENT validator** that,
  re-derived from the seed alone, proves N is in the level's range (always 1–6),
  the shown group has EXACTLY N items, the arrangement is one the level allows, the
  options are distinct in-range numbers that INCLUDE N with near-value distractors
  and the answer recorded, on top of a byte-identical replay-by-seed check (so the
  shuffled option position is reproduced and the answer is never fixed).
- A renderer that plays the flash (brief show → Đô Đô cover on the native driver,
  instant under reduced motion → tap a number): correct → the cover lifts to
  reveal the group and Đô Đô cheers; wrong → a gentle no-mark retry (nothing
  locks, the answer is never filled in). `supportLevel` is the answer-preserving
  path: level 1 has Đô Đô re-peek the group briefly, level 2 keeps the group OPEN
  (no auto-hide) so a struggling child can count — support only changes how long
  the quantity is visible and never touches the options.
- A progressive one-board-per-level L1→L5 run (like `peekaboo_recall`): no XP,
  streak, countdown or lose state; levels scale the N
  range within 1–6 and the arrangement (paired ten-frame vs scattered).
- Best-effort audio: one new phrase clip `subitize_flash_how_many` and the
  `game_subitize_flash` catalog name added to `promptAudio.ts` and mirrored in
  `kido-pipeline/src/explore/exploreAudioInventory.ts`; the on-screen prompt and
  the number cards carry the task and stay authoritative, and a missing clip never
  blocks play.

## Capabilities

### New Capabilities

- `explore-subitize-flash-game`: flash-and-recognise subitizing boards with a
  deterministic generator, an independent "N in range, a group of exactly N,
  options that include N among near distractors" validator, an answer-preserving
  support path (re-peek / keep-open), and a progressive L1→L5 run.

## Impact

- Mobile Explore only: a new `games/subitizeFlashGame.ts`, a new
  `renderers/SubitizeFlashRenderer.tsx`, the `subitize_flash` code added to
  `EXPLORE_GAME_CODES` (docs contract + mobile + server types), and registration
  in `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `thumbnails.ts` and the
  catalog group table; one phrase entry plus the game-name entry in
  `promptAudio.ts` (mirrored in the pipeline inventory) plus a `subitizeFlashKeys`
  builder. Reuses the shared visual-math primitives and the `tap_count` countable
  pool with no version change.
- kido-server: `subitize_flash` added to `PUBLIC_GAMES` and the local bundled
  `ROUND_2_GAMES` map, so the public catalog now advertises eighteen games; no
  runtime generation on the server (local game).
- No schema, curriculum, progress, reward, analytics or Explore-history change
  (`explore-stateless-privacy`): all play state is memory-only.
- App bundle grows by one short best-effort clip; until the pack is approved and
  exported the new key resolves to silence and the on-screen prompt is the
  authoritative instruction.
