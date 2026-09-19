## Purpose

Defines "Ô thiếu" (`missing_cell`), the offline 2-D matrix-completion game in
which a 2×2 or 3×3 grid has ONE attribute fixed by the row index and a second,
distinct attribute fixed by the column index, one cell is blank, and the child
taps the option that completes it. A generator and an independent validator
guarantee the grid is a well-formed matrix whose blank has a UNIQUE completion
under BOTH its row rule and its column rule, and that options are drawn only from
the grid's own vocabulary.

## ADDED Requirements

### Requirement: Deterministic local matrix puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the drawn-shape primitives and the Đô Đô mascot). A puzzle SHALL declare its level, its grid size, the token kind, the attribute fixed by the ROW index and the distinct attribute fixed by the COLUMN index, the row-major cells with exactly one blank, the blank index, the answer options and the answer option id. Every seeded draw SHALL be namespaced by the level so two levels of the same grid size and kind never produce the same puzzle. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `missing_cell` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: A well-formed matrix with a unique row-and-column completion
Every puzzle SHALL be a well-formed matrix: reading the visible grid alone, every cell in a row SHALL share one value on the row attribute and every cell in a column SHALL share one value on the column attribute, the per-row values SHALL be distinct across rows and the per-column values distinct across columns, and the row and column attributes SHALL be two DISTINCT attributes of the token kind. The validator SHALL re-derive those per-row and per-column values from the visible grid, independently of the generator, and SHALL prove that EXACTLY ONE option satisfies BOTH the blank's row value and its blank's column value (a unique completion) and that it equals the recorded answer. The validator SHALL reject a matrix whose row or column no longer agrees on its rule, an answer that is not the unique completion, and an answer id that is not an option.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** the visible grid is a well-formed matrix and exactly one option matches both the blank's row value and its column value, and that option is the recorded answer

#### Scenario: The answer points at a distractor
- **WHEN** the answer id is changed to an option that does not satisfy both the row and column rules
- **THEN** the validator rejects the puzzle

#### Scenario: A row no longer follows its rule
- **WHEN** a visible cell is changed so its row no longer shares one value on the row attribute
- **THEN** the validator rejects the puzzle

### Requirement: Options are vocabulary-only and 1-D is never enough
Every answer option SHALL be a combination drawn from the grid's own vocabulary — its value on the row attribute SHALL be one of the grid's row values and its value on the column attribute SHALL be one of the grid's column values — and the options SHALL be unique with the answer among them. The distractors SHALL include one that shares the blank's row (the right row attribute but the wrong column attribute) and one that shares the blank's column (the right column attribute but the wrong row attribute), so a single-axis (1-D) match can never decide the answer; only reading BOTH the row and the column selects it. The option order SHALL be a seeded shuffle so the answer is never at a fixed position, reproduced by the byte-identical replay.

#### Scenario: An off-axis option is offered
- **WHEN** an option uses a value that appears on neither the grid's rows nor its columns
- **THEN** the validator rejects the puzzle

#### Scenario: Distractors force reading both axes
- **WHEN** any generated puzzle is checked
- **THEN** a distractor matches only the blank's row and another matches only its column, so no single-axis match is sufficient

#### Scenario: The answer position is not fixed
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** the answer appears at more than one option position across the corpus

### Requirement: Five levels scaling grid size and rule complexity
The game SHALL define five levels whose grid size scales from 2×2 (L1–L2) to 3×3 (L3–L5) and whose rule complexity grows: L1 a shape×colour 2×2, L2 adding a count×colour (dots) 2×2, L3 a shape×colour 3×3, L4 a count×colour 3×3, and L5 a 3×3 mixing both kinds. The round-variety bucket of a puzzle SHALL be its token kind and every declared bucket SHALL be reachable at its level. The declared round-variety capacity per level SHALL be reachable. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, countdowns or a lose state.

#### Scenario: Grid scales across the ladder
- **WHEN** the levels are inspected
- **THEN** the grid size is 2×2 at L1–L2 and 3×3 at L3–L5 and never shrinks with level

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the puzzle

#### Scenario: Both kinds reach a mixed-kind level
- **WHEN** chained one-exercise rounds are requested at a level that declares two kinds
- **THEN** every served puzzle is a declared kind and both kinds reach the child across the rounds

### Requirement: Tap-an-option feedback that never ends the run
The renderer SHALL let the child tap an answer option: an option equal to the answer SHALL fill the blank cell, make Đô Đô (`ExploreMascot`) cheer, mark the puzzle solved and report `onAnswer(true)`. A wrong option SHALL play a gentle "try again" shake and report `onAnswer(false)` WITHOUT ending the run, filling in the answer, or locking the option — the child simply tries another. All motion SHALL use the native animation driver and SHALL be skipped when the system requests reduced motion. No emoji SHALL be used as a UI icon or as the mascot (shapes are drawn Views and counts use the shared DotGroup). The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The correct option is tapped
- **WHEN** the child taps the option that completes the blank
- **THEN** the cell fills, Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: A wrong option is tapped
- **WHEN** the child taps an option that is not the answer
- **THEN** a gentle shake plays, `onAnswer(false)` is called, nothing locks and the answer is not filled in

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps update state, sound and `onAnswer` as usual without the fill/shake animation

### Requirement: Support dims distractors without revealing the answer
At support level 1 or higher the renderer SHALL dim one or more distractor options, and it SHALL never dim the answer and SHALL always leave at least one distractor live beside the answer, so support narrows the choice without handing the answer over. At support level 0 no option SHALL be dimmed.

#### Scenario: Raised support dims a distractor
- **WHEN** the play screen passes `supportLevel` 1 or 2
- **THEN** one or more distractor options are dimmed, the answer is never dimmed and at least one distractor stays live

#### Scenario: No support
- **WHEN** the play screen passes `supportLevel` 0
- **THEN** no option is dimmed

### Requirement: Best-effort audio and authoritative grid
The on-screen prompt SHALL be shown and, together with the grid itself, SHALL be authoritative; the audio SHALL reference the best-effort `missing_cell_choose` clip and a missing clip SHALL never block play. The variant identity of a puzzle SHALL be its full grid (kind, axes and every cell by position) and its bucket SHALL be the token kind.

#### Scenario: Prompt clip is not bundled
- **WHEN** the `missing_cell_choose` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen and the puzzle is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-missing-cell-contracts.cjs` (`npm run test:explore-missing-cell`: at least 200 seeds per level, replay equality, an independent re-derivation of the matrix and the unique row-and-column completion, the vocabulary-only and 1-D-is-not-enough rules, the answer-position-not-fixed rule, tamper rejection, chained one-exercise rounds and renderer presentation rules) and by `kido-server/src/modules/explore/explore.missing-cell.spec.ts` (corpus conformance with an independent unique-completion proof, tamper rejection, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-missing-cell` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.missing-cell.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
