## Why

Khám phá (Explore) has spatial reasoning (`missing_cell`), classification
(`odd_one_out`, `sort_bins`) and paired recognition (`memory_match`), but no game
that trains the plain "what's missing?" working-memory skill a 4–6-year-old
needs: hold a small set of objects in mind, notice one is gone, and name it. That
"Kim's game" recall — remember what was there, then recover the one that vanished
— is a distinct skill from matching two visible cards.

The Explore engine already has everything needed to build it offline and
stateless: the memory game's bundled object pool (`MEMORY_ASSETS` — single,
background-free, instantly-recognisable objects with distinct similarity groups)
and its compatibility rule so a set never mixes look-alikes, plus the memory
renderer's reduced-motion-aware, native-driver cover/reveal card mechanic. A new
game reuses both and adds only a generator, an independent "what's missing"
validator and a tap-an-option renderer with a peekaboo cover.

## What Changes

- **One new local, offline, stateless game** registered end to end (contract
  codes in all three packages, mobile registry/variety/renderer map/thumbnail/
  catalog group, kido-server registry, a conformance script
  `npm run test:explore-peekaboo`, a kido-server spec and this capability spec):
  `peekaboo_recall` ("Ú òa").
- A small set of distinct objects is shown in slots for a ~3s look window beside
  the shared sand timer (an hourglass glyph and a draining bar, NO numerals); Đô
  Đô covers them (peekaboo); ONE object is taken away; the cover lifts to reveal
  the REMAINING objects plus one empty slot; and the child taps, from an options
  row, WHICH object is now missing. The empty slot's position is a spatial cue and
  the child recalls the object that was there. The sand only measures how long the
  set can be looked at: answering has no time limit and running out fails nothing.
  (2026-09-13, product owner: the first cut showed the set for 1.5s with no timer,
  which was too fast for 4–6 year olds — the same call as `subitize_flash`.)
- Options are distinct real objects that INCLUDE the true missing object; every
  distractor is FOREIGN to the original set, so the missing object is the unique
  option that belonged to the recalled set. The option order is a seeded shuffle
  so the answer is never at a fixed position.
- A **deterministic seeded generator** and an **INDEPENDENT validator** that,
  re-derived from the seed alone, proves the original set is `slots` (all distinct
  real objects), that EXACTLY ONE object was removed (the remaining set = the
  original minus the object at `removedSlotIndex`), that the options are distinct
  real objects including the true missing one with only-foreign distractors and
  the answer recorded, on top of a byte-identical replay-by-seed check.
- A renderer that plays the peekaboo (sand-timed look → cover → reveal-with-gap →
  tap): correct → the missing object pops back into its slot and Đô Đô cheers;
  wrong → a gentle no-mark retry (nothing locks, the missing object is never
  filled in); `supportLevel` dims distractor options (never the answer, always
  leaving a live distractor) and, at level 2, shows the full set once more for
  one sand-timed look as a memory aid; reduced-motion-friendly, native-driver
  motion, emoji-free UI.
- A progressive one-board-per-level L1→L5 run (like `missing_cell` and
  `odd_one_out`): no XP, streak, answer time limit or lose state; levels scale the set
  size (2 → 5 objects) and the number of options.
- Best-effort audio: one new phrase clip `peekaboo_recall_which` and the
  `game_peekaboo_recall` catalog name added to `promptAudio.ts` and mirrored in
  `kido-pipeline/src/explore/exploreAudioInventory.ts`; the on-screen prompt and
  the board itself carry the task and stay authoritative, and a missing clip never
  blocks play.

## Capabilities

### New Capabilities

- `explore-peekaboo-recall-game`: what's-missing working-memory boards with a
  deterministic generator, an independent "original set minus one, unique missing
  object among foreign distractors" validator, a distractor-dimming support level,
  and a progressive L1→L5 run.

## Impact

- Mobile Explore only: a new `games/peekabooRecallGame.ts`, a new
  `renderers/PeekabooRecallRenderer.tsx`, the `peekaboo_recall` code added to
  `EXPLORE_GAME_CODES` (docs contract + mobile + server types), and registration
  in `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `thumbnails.ts` and the
  catalog group table; one phrase entry plus the game-name entry in
  `promptAudio.ts` (mirrored in the pipeline inventory) plus a `peekabooRecallKeys`
  builder, and the sand timer shared with `subitize_flash`
  (`explore/components/SandTimer.tsx`). Reuses the shared `MEMORY_ASSETS` object
  pool with no version change.
- kido-server: `peekaboo_recall` added to `PUBLIC_GAMES` and the local bundled
  `ROUND_2_GAMES` map, so the public catalog now advertises seventeen games; no
  runtime generation on the server (local game).
- No schema, curriculum, progress, reward, analytics or Explore-history change
  (`explore-stateless-privacy`): all play state is memory-only.
- App bundle grows by one short best-effort clip; until the pack is approved and
  exported the new key resolves to silence and the on-screen prompt is the
  authoritative instruction.
