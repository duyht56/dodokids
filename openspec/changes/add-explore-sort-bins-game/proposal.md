## Why

Khám phá (Explore) can now spot the odd one out (`odd_one_out`), but it has
nothing that trains the core school-readiness skill it builds toward:
**classification** — deciding, item by item, which of several groups a thing
belongs to and putting it there.
This is the "bỏ đồ vào đúng ngăn / dọn đồ theo nhóm" worksheet task every preschool
uses (fruit vs animal vs xe cộ, or by colour), and it is the natural tier-2 partner
to Ai lạc đàn?.

The Explore engine already has everything needed to build it offline and stateless:
`odd_one_out` owns a colour-blind-safe token vocabulary (the colour trio, the four
shapes with the square/diamond rule, the bundled memory-match object pool) and the
`theme` / `color` / `shape` dimensions with a value helper (`oddOneOutValueOn`). A
new game can reuse all of it and add only a generator, an independent validator and
a tap-a-bin renderer — with NO drag gesture (one item at a time, tap the bin),
which is far more reliable for a 4–6 year old and for tests.

## What Changes

- **One new local, offline, stateless game** registered end to end (contract codes
  in all three packages, mobile registry/variety/renderer map/thumbnail/catalog
  group, kido-server registry, a conformance script `npm run test:explore-sort-bins`,
  a kido-server spec and this capability spec): `sort_bins` ("Dọn đồ").
- The child is shown ONE item at a time and taps the labelled bin (category) it
  belongs to. Bins are 2–3 categories on one dimension (`theme` / `color` /
  `shape`); a correct tap drops the item in and the next item appears; a wrong tap
  is a gentle nudge (the item stays, Đô Đô thinks, support escalates) and never
  ends the run. When every item is sorted, Đô Đô cheers and `onAnswer(true)`.
- The category framework REUSES `odd_one_out`: the same dimensions and value helper,
  the colour trio, the shapes with the square/diamond rule and the memory-match
  object pool. A colour sort keeps ONE shape across every item (only colour tells
  the bins apart) and a shape sort keeps ONE colour, so no item is ever ambiguous;
  a theme sort uses object cells whose theme is the category.
- A **deterministic seeded generator** and an **INDEPENDENT validator** that
  re-derives, from the cells alone: each item's true category, that every present
  category has at least one item, that the bins are EXACTLY the present categories,
  and that the recorded "sorted" solution assigns each item to a bin whose category
  equals its true category — on top of a byte-identical replay-by-seed check.
- A renderer that shows the current item and 2–3 bins, drops a correct item into its
  bin, gently nudges a wrong tap without ever ending the run or revealing the answer,
  honours the `supportLevel` contract through a pure cue helper (level 1 only NAMES
  the item's category, level 2 points at the correct bin), is reduced-motion
  friendly and uses emoji only as puzzle content.
- A progressive one-board-per-level L1→L5 run (like `odd_one_out`):
  no XP, streak, countdown or lose state; levels scale item count
  (4→8), bin count (2→3) and category subtlety.
- Best-effort audio: one new generic instruction phrase `sort_bins_sort` and the
  `game_sort_bins` catalog name added to `promptAudio.ts` and mirrored in
  `kido-pipeline/src/explore/exploreAudioInventory.ts`; the on-screen prompt names
  the specific sort and stays authoritative, and a missing clip never blocks play.

## Capabilities

### New Capabilities

- `explore-sort-bins-game`: tap-a-bin classification puzzles with a deterministic
  generator, an independent "bins = present categories, solution sorts each item
  into its true category" validator, non-revealing naming support, and a progressive
  L1→L5 run.

## Impact

- Mobile Explore only: a new `games/sortBinsGame.ts`, a new
  `renderers/SortBinsRenderer.tsx`, the `sort_bins` code added to
  `EXPLORE_GAME_CODES` (docs contract + mobile + server types), and registration in
  `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `thumbnails.ts` and the
  catalog group table; two phrase entries in `promptAudio.ts` (mirrored in the
  pipeline inventory) plus a `sortBinsKeys` builder.
- kido-server: `sort_bins` added to `PUBLIC_GAMES` and the local bundled
  `ROUND_2_GAMES` map, so the public catalog now advertises fifteen games; no runtime
  generation on the server (local game).
- No schema, curriculum, progress, reward, analytics or Explore-history change
  (`explore-stateless-privacy`): all play state is memory-only.
- App bundle grows by one short best-effort clip; until the pack is approved and
  exported the new key resolves to silence and the on-screen prompt is the
  authoritative instruction.
