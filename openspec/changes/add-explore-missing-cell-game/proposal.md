## Why

Khám phá (Explore) trains 1-D pattern reasoning with `pattern_finder` ("Tìm quy
luật"), where a single sequence follows ONE rule and the child completes the
hidden slot. The next reasoning step for a 4–6-year-old is the 2-D matrix: a grid
where each ROW and each COLUMN follows its own rule, so the missing cell is fixed
only by reading BOTH constraints at once. That "find the missing piece of the
grid" task (Raven-style progressive matrices) is a distinct, stronger skill — the
child must abstract two independent attributes and intersect them, not just
extend a line.

The Explore engine already has everything needed to build it offline and
stateless: the pattern engine's hidden-slot machinery (materialise the full grid,
hide ONE cell, derive the answer, and build options ONLY from the puzzle's own
vocabulary) and the odd_one_out grid/token vocabulary (View-drawn colour-blind-
safe shapes and DotGroup counts). A new game reuses both and adds only a
generator, an independent 2-D validator and a tap-an-option renderer.

## What Changes

- **One new local, offline, stateless game** registered end to end (contract
  codes in all three packages, mobile registry/variety/renderer map/thumbnail/
  catalog group, kido-server registry, a conformance script
  `npm run test:explore-missing-cell`, a kido-server spec and this capability
  spec): `missing_cell` ("Ô thiếu").
- A 2×2 or 3×3 grid where ONE attribute is fixed by the ROW index (constant along
  a row) and a SECOND, DISTINCT attribute by the COLUMN index (constant down a
  column) — a Raven matrix in which each cell is the combination (rowValue,
  columnValue). ONE cell is blank; the child taps the option that belongs there.
  The three rule types map onto three attributes: a colour progression (`color`),
  a shape cycle (`shape`) and a count step (`count`); a shape puzzle pairs
  {shape, color}, a dots puzzle pairs {count, color}.
- Options come ONLY from the grid's own row/column vocabulary — some distractors
  share the blank's row (right row attribute, wrong column attribute), some its
  column, so a single-axis (1-D) match can never decide the answer.
- A **deterministic seeded generator** and an **INDEPENDENT validator** that,
  re-derived from the visible grid alone, proves the matrix is well formed (each
  row fixes one value, each column a second, distinct value) and that EXACTLY ONE
  option satisfies BOTH the blank's row rule and its column rule (a unique
  completion), that every option is a combination drawn from the grid's own
  vocabulary with the answer among them and the answer position not fixed, on top
  of a byte-identical replay-by-seed check.
- A renderer that taps an option to answer: correct → Đô Đô cheers and the cell
  fills; wrong → a gentle no-mark retry (nothing locks, the answer is never filled
  in); `supportLevel` dims distractor options (never the answer, always leaving a
  live distractor); reduced-motion-friendly, native-driver motion, emoji-free UI.
- A progressive one-board-per-level L1→L5 run (like `odd_one_out` and
  `candle_count`): no XP, streak, countdown or lose state; levels scale the grid
  (2×2 → 3×3) and the rule complexity (shape×colour, then count×colour, then a
  3×3 mixing both kinds).
- Best-effort audio: one new phrase clip `missing_cell_choose` and the
  `game_missing_cell` catalog name added to `promptAudio.ts` and mirrored in
  `kido-pipeline/src/explore/exploreAudioInventory.ts`; the on-screen prompt and
  the grid itself carry the rule and stay authoritative, and a missing clip never
  blocks play.

## Capabilities

### New Capabilities

- `explore-missing-cell-game`: 2-D matrix-completion puzzles with a deterministic
  generator, an independent "well-formed matrix + unique row-and-column
  completion" validator, vocabulary-only options, a distractor-dimming support
  level, and a progressive L1→L5 run.

## Impact

- Mobile Explore only: a new `games/missingCellGame.ts`, a new
  `renderers/MissingCellRenderer.tsx`, the `missing_cell` code added to
  `EXPLORE_GAME_CODES` (docs contract + mobile + server types), and registration
  in `registry.ts`, `variety.ts`, `rendererRegistry.tsx`, `thumbnails.ts` and the
  catalog group table; one phrase entry plus the game-name entry in
  `promptAudio.ts` (mirrored in the pipeline inventory) plus a `missingCellKeys`
  builder. The shared `DotGroup` primitive gains an optional, backward-compatible
  `color` prop so a count axis can carry a colour axis.
- kido-server: `missing_cell` added to `PUBLIC_GAMES` and the local bundled
  `ROUND_2_GAMES` map, so the public catalog now advertises sixteen games; no
  runtime generation on the server (local game).
- No schema, curriculum, progress, reward, analytics or Explore-history change
  (`explore-stateless-privacy`): all play state is memory-only.
- App bundle grows by one short best-effort clip; until the pack is approved and
  exported the new key resolves to silence and the on-screen prompt is the
  authoritative instruction.
