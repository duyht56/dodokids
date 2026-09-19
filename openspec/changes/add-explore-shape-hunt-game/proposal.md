## Why

Khám phá (Explore) has classification (`odd_one_out`, "find the one that
differs") but nothing that trains the opposite, foundational school-readiness
skill: **visual scanning with one-to-one attention** — sweeping a busy field and
acting on *every* item of a kind, not just spotting a single outlier. This is the
"gạch hết các hình tròn / khoanh hết các con cá" worksheet task every preschool
uses, and it is the natural tier-2 partner to Ai lạc đàn?.

The Explore engine already has everything needed to build it offline and
stateless: the `tap_count` field-placement engine lays out a non-overlapping
scatter/grouped field, and `odd_one_out` already owns a colour-blind-safe token
vocabulary (shapes, the colour trio, the bundled memory-match object pool). A new
game can reuse both and add only a generator, an independent validator and a
"tap-all-then-submit" renderer.

## What Changes

- **One new local, offline, stateless game** registered end to end (contract
  codes in all three packages, mobile registry/variety/renderer map/thumbnail/
  catalog group, kido-server registry, a conformance script
  `npm run test:explore-shape-hunt`, a kido-server spec and this capability spec):
  `shape_hunt` ("Săn hình").
- A field of many objects; the child taps EVERY instance of one target kind
  ("Chạm hết các hình TRÒN", "Chạm hết các hình màu CAM", "Chạm hết các con CÁ")
  and submits "Xong". The target is a single value on one attribute
  (`shape` / `color` / `object`); the field varies exactly that one attribute so
  the target set is never ambiguous.
- A **deterministic seeded generator** and an **INDEPENDENT validator** that
  re-derives the target set from the cells alone and proves it is EXACTLY the
  recorded answer — no false positives, no false negatives — on top of a
  byte-identical replay-by-seed check.
- A renderer that toggles a selection check per cell, checks the whole set only
  on submit, honours the `supportLevel` contract by dimming distractors (never a
  target), is reduced-motion friendly, makes Đô Đô cheer on success and offers a
  gentle retry on a wrong submit without ever ending the run.
- A progressive one-board-per-level L1→L5 run (like `odd_one_out` and
  `stack_tower`): no XP, streak, countdown or lose state; levels scale the field
  size and the distractor variety.
- Best-effort audio: one new generic instruction phrase `shape_hunt_find_all`
  and the `game_shape_hunt` catalog name added to `promptAudio.ts` and mirrored
  in `kido-pipeline/src/explore/exploreAudioInventory.ts`; the on-screen prompt
  names the specific target and stays authoritative, and a missing clip never
  blocks play.

## Capabilities

### New Capabilities

- `explore-shape-hunt-game`: tap-every-instance visual-scanning puzzles with a
  deterministic generator, an independent "answer = matching set" validator,
  non-revealing distractor-dimming support, and a progressive L1→L5 run.

## Impact

- Mobile Explore only: a new `games/shapeHuntGame.ts`, a new
  `renderers/ShapeHuntRenderer.tsx`, the `shape_hunt` code added to
  `EXPLORE_GAME_CODES` (docs contract + mobile + server types), and registration
  in `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `thumbnails.ts` and the
  catalog group table; two phrase entries in `promptAudio.ts` (mirrored in the
  pipeline inventory) plus a `shapeHuntKeys` builder.
- kido-server: `shape_hunt` added to `PUBLIC_GAMES` and the local bundled
  `ROUND_2_GAMES` map, so the public catalog now advertises thirteen games; no
  runtime generation on the server (local game).
- No schema, curriculum, progress, reward, analytics or Explore-history change
  (`explore-stateless-privacy`): all play state is memory-only.
- App bundle grows by one short best-effort clip; until the pack is approved and
  exported the new key resolves to silence and the on-screen prompt is the
  authoritative instruction.
