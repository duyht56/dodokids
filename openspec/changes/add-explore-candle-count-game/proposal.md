## Why

Khám phá (Explore) trains counting-out ("produce a set of exactly N") only as a
secondary mode of `tap_count` ("chạm đúng N"), where the child taps N objects out
of a scattered field. The stronger, more familiar preschool form of the same
skill is BUILDING the set into fixed positions — the "cắm cho đủ N ngọn nến lên
bánh" birthday-cake task every 4–5-year-old knows. Producing a set into a fixed
ten-frame anchor makes the one-to-one correspondence visible and gives the child
a place-and-count rhythm a scattered tap cannot.

The Explore engine already has everything needed to build it offline and
stateless: the `tap_count` COUNT_LEVELS ranges give an age-appropriate target N,
and the TenFrame/slot primitives in VisualMathPrimitives give a fixed ten-frame
anchor for the candle positions. A new game can reuse both and add only a
generator, an independent validator and a "place-then-submit" renderer.

## What Changes

- **One new local, offline, stateless game** registered end to end (contract
  codes in all three packages, mobile registry/variety/renderer map/thumbnail/
  catalog group, kido-server registry, a conformance script
  `npm run test:explore-candle-count`, a kido-server spec and this capability
  spec): `candle_count` ("Cắm nến").
- A cake shows a FIXED ten-frame of empty slots; the child places EXACTLY N
  candles ("Cắm cho đủ N ngọn nến lên bánh nhé.") and submits "Xong". Tapping a
  slot adds a candle, tapping it again removes it, and there is no overfill beyond
  the ten slots.
- The target N REUSES the count-target generation: N is drawn from the `tap_count`
  COUNT_LEVELS ranges, capped small (N ≤ 10) exactly as `count_target` did, with
  the ceiling and floor scaling L1→L5. The candle positions REUSE a fixed
  ten-frame-style slot layout (ten slots in a 2×5 grid).
- A **deterministic seeded generator** and an **INDEPENDENT validator** that
  re-derives the fixed slot positions and proves the exercise declares EXACTLY
  them, that the recorded answer's placed-candle count equals the drawn N, and
  that N fits the level range and the slot count (no overfill possible), on top of
  a byte-identical replay-by-seed check.
- A renderer that adds/removes a candle per slot, is correct only when the placed
  count equals N on submit, reads the running total aloud best-effort with the
  bundled number clips, shows the target as a dots/ten-frame anchor at raised
  support, is reduced-motion friendly, makes Đô Đô cheer on success and offers a
  gentle retry on a wrong submit without ever ending the run or filling in the
  answer.
- A progressive one-board-per-level L1→L5 run (like `shape_hunt` and
  `stack_tower`): no XP, streak, countdown or lose state; levels scale the N
  range.
- Best-effort audio: two new phrase clips `candle_count_prompt` /
  `candle_count_suffix` and the `game_candle_count` catalog name added to
  `promptAudio.ts` and mirrored in
  `kido-pipeline/src/explore/exploreAudioInventory.ts`; the on-screen prompt names
  the specific N and stays authoritative, and a missing clip never blocks play.

## Capabilities

### New Capabilities

- `explore-candle-count-game`: produce-a-set-to-a-target puzzles with a
  deterministic generator, an independent "placed count = N, slots = the fixed
  ten-frame" validator, a dots/ten-frame support anchor, and a progressive L1→L5
  run.

## Impact

- Mobile Explore only: a new `games/candleCountGame.ts`, a new
  `renderers/CandleCountRenderer.tsx`, the `candle_count` code added to
  `EXPLORE_GAME_CODES` (docs contract + mobile + server types), and registration
  in `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `thumbnails.ts` and the
  catalog group table; two phrase entries plus the game-name entry in
  `promptAudio.ts` (mirrored in the pipeline inventory) plus a `candleCountKeys`
  builder.
- kido-server: `candle_count` added to `PUBLIC_GAMES` and the local bundled
  `ROUND_2_GAMES` map, so the public catalog now advertises fourteen games; no
  runtime generation on the server (local game).
- No schema, curriculum, progress, reward, analytics or Explore-history change
  (`explore-stateless-privacy`): all play state is memory-only.
- App bundle grows by two short best-effort clips; until the pack is approved and
  exported the new keys resolve to silence and the on-screen prompt is the
  authoritative instruction.
