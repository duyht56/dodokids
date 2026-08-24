## Purpose

Defines "Săn hình" (`shape_hunt`), the offline visual-scanning game in which a
child sweeps a scatter/grouped field of objects and taps EVERY instance of one
target kind — a single value on the `shape`, `color` or `object` attribute — then
submits, with a generator and an independent validator that guarantee the target
set is exactly the cells matching the target value and support that never marks a
target.

## ADDED Requirements

### Requirement: Deterministic local shape-hunt puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the shape primitives and the memory-match object pool). A puzzle SHALL declare its level, target attribute (`shape`, `color` or `object`), the target value on that attribute, a Vietnamese label for the target kind, its layout strategy, and its field of cells — each cell carrying everything the renderer needs (kind, shape, colour code and hex, glyph, theme, asset id, a Vietnamese label and a normalized position). The field layout SHALL reuse the `tap_count` placement engine (`createCountLayout` / `placementsFitViewport` / `countObjectSize`). Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `shape_hunt` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: The answer is exactly the matching set
Every puzzle SHALL place `K` target instances (cells whose value on the target attribute equals the target value) plus at least one distractor (a cell whose value differs), all within the level's field-size and target-count ranges. The recorded answer SHALL be EXACTLY the set of cells matching the target value, and the validator SHALL prove this independently of the generator by re-deriving the matching set from the cells alone (`shapeHuntMatchingCells`): every answer cell matches the target value and every non-answer cell does not (no false positives, no false negatives). The validator SHALL reject an answer with a target dropped, a distractor added, an unknown id, or a distractor edited to carry the target value while the answer is unchanged.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** the independently re-derived matching set equals the recorded `targetCellIds` and every cell's membership matches whether its value equals the target value

#### Scenario: A distractor is edited to match the target
- **WHEN** a distractor cell is edited so its value on the target attribute equals the target value, without adding it to the answer
- **THEN** the validator rejects the puzzle

#### Scenario: The answer set is changed
- **WHEN** a cell is dropped from or an extra cell is added to `targetCellIds`
- **THEN** the validator rejects the puzzle

### Requirement: One attribute varies so the target set is unambiguous
Each field SHALL vary exactly one attribute. A `shape` hunt SHALL keep ONE colour across the whole field (shape is the only cue) and a `color` hunt SHALL keep ONE shape across the whole field (colour is the only cue); an `object` hunt SHALL use object cells whose distinct identity is the cue. All cells in a field SHALL be of one kind — shapes for a `shape` or `color` hunt, objects for an `object` hunt. Colours SHALL be limited to the colour-blind-safe trio orange, blue and green with fixed hex values; shapes SHALL be circle, square, triangle and diamond, and square and diamond SHALL never appear in the same field; object cells SHALL be drawn only from the bundled memory-match assets with matching glyph, theme and label. The validator SHALL reject a foreign colour, a square/diamond mix, a mixed-kind field, a swapped glyph, a foreign object id, or a second attribute varying in a shape or colour hunt.

#### Scenario: Shape hunt keeps one colour
- **WHEN** a `shape` puzzle is generated
- **THEN** every cell has the same colour and the target cells are exactly the cells of the target shape

#### Scenario: Foreign colour is injected
- **WHEN** a cell is edited to a colour outside orange/blue/green
- **THEN** the validator rejects the puzzle

#### Scenario: Square and diamond are mixed
- **WHEN** a shape field is edited to hold both a square and a diamond
- **THEN** the validator rejects the puzzle

### Requirement: Five-level progression scaling field and distractor variety
The game SHALL define five levels whose field size and distractor variety grow: L1 a small field hunting `shape`; L2 hunting `shape` or `color`; L3 hunting `color` or `object`; L4 a larger field hunting `shape` or `object`; L5 the largest field hunting `shape`, `color` or `object`. On every level the target-count maximum SHALL stay below the field-size minimum so at least one distractor is always present. Placements SHALL be in bounds, fit the phone viewport at the renderer's object size and never overlap. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, countdowns or a lose state.

#### Scenario: Level ranges hold across a corpus
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** every field size and target count sits inside the level's declared ranges, at least one distractor is always present, and every declared attribute is generated

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose field-size range it no longer fits
- **THEN** the validator rejects the puzzle

### Requirement: Tap-all-then-submit feedback that never ends the run
The renderer SHALL let the child toggle a selection check on any live cell and submit with a "Xong" button (disabled until at least one cell is selected). A submit whose selected set equals the target set SHALL make Đô Đô (`ExploreMascot`) cheer, mark the puzzle solved and report `onAnswer(true)`. A submit whose selected set does not equal the target set SHALL play a gentle "try again" beat and report `onAnswer(false)` WITHOUT ending the run, revealing which cells are targets, or clearing the selection — the child keeps adjusting. All motion SHALL use the native animation driver and SHALL be skipped when the system requests reduced motion. Object glyphs SHALL render as puzzle content only and no emoji SHALL be used as a UI icon or as the mascot. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The full target set is submitted
- **WHEN** the child selects exactly the matching cells and taps Xong
- **THEN** Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: An incomplete set is submitted
- **WHEN** the child taps Xong with a selection that is not the full target set
- **THEN** a gentle retry beat plays, `onAnswer(false)` is called, the selection stays editable and no cell is marked correct or wrong

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps and submits update state, sound and `onAnswer` as usual without the bounce animation

### Requirement: Support that narrows without revealing a target
The renderer SHALL derive hint cells from the pure helper `shapeHuntSupportCells(cells, targetCellIds, supportLevel)`, which returns only DISTRACTOR cells to dim and lock. At support level 1 it SHALL dim up to two distractors and at support level 2 up to four, but it SHALL always leave at least one distractor live so the field never collapses to "tap the rest". No target SHALL ever be in the dimmed list at any support level.

#### Scenario: Support level 2 on a busy field
- **WHEN** the play screen passes `supportLevel` 2
- **THEN** at most four distractor cells are dimmed, at least one distractor stays live and no target cell is dimmed

#### Scenario: No support
- **WHEN** the play screen passes `supportLevel` 0
- **THEN** nothing is dimmed

### Requirement: Attribute variety and best-effort audio
The round-variety bucket of a puzzle SHALL be its target attribute and its variant identity SHALL be the position-agnostic multiset of its tokens keyed by attribute and target value, so two fields differing only in cell order are the same variant. The declared buckets per level SHALL equal the level's attributes and every declared attribute SHALL reach the child in at least 20% of chained one-exercise rounds. The on-screen prompt SHALL name the specific target ("Chạm hết các hình tròn nhé.", "Chạm hết các hình màu cam nhé.", "Chạm hết các con cá nhé.") and SHALL be authoritative; the audio SHALL reference the single best-effort `shape_hunt_find_all` clip and a missing clip SHALL never block play.

#### Scenario: One-exercise rounds at L5
- **WHEN** chained one-exercise rounds are requested at L5 with the play screen's exclusion window, last bucket and rotation
- **THEN** `shape`, `color` and `object` each make up at least 20% of the served puzzles

#### Scenario: Prompt clip is not bundled
- **WHEN** the `shape_hunt_find_all` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen naming the target and the puzzle is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-shape-hunt-contracts.cjs` (`npm run test:explore-shape-hunt`: at least 200 seeds per level, replay equality, the "answer = matching set" rule with independent re-derivation, level/palette/shape/one-attribute rules, viewport and non-overlap geometry, tamper rejection, support never marking a target, chained one-exercise rounds and renderer presentation rules) and by `kido-server/src/modules/explore/explore.shape-hunt.spec.ts` (corpus conformance, tamper rejection, the support helper, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-shape-hunt` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.shape-hunt.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
