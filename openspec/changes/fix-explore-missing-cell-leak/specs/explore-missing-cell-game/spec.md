## MODIFIED Requirements

### Requirement: Deterministic local matrix puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the drawn-shape primitives and the Đô Đô mascot). A puzzle SHALL declare its level, its grid size, the token kind, the attribute fixed by the ROW index and the distinct attribute fixed by the COLUMN index, the row-major cells with the "?" cell and every covered cell hidden, the "?" cell's index, the covered cells' indices in ascending order, the answer options and the answer option id. Every seeded draw SHALL be namespaced by the level so two levels of the same grid size and kind never produce the same puzzle. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay. The generator, validator and config versions SHALL be `missing-cell-v2`, `missing-cell-validator-v2` and `missing-cell-config-v2` (manifest `missing-cell-manifest-v2`), mirrored in the kido-server explore registry.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `missing_cell` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

#### Scenario: Version is bumped
- **WHEN** the bundled game and the kido-server registry describe `missing_cell`
- **THEN** both report generator `missing-cell-v2`, validator `missing-cell-validator-v2`, config `missing-cell-config-v2`, manifest `missing-cell-manifest-v2` and dependency versions `2`

### Requirement: A well-formed matrix with a unique row-and-column completion
Every puzzle SHALL be a well-formed matrix: reading the visible grid alone, every cell in a row SHALL share one value on the row attribute and every cell in a column SHALL share one value on the column attribute, every row and every column SHALL still show at least one cell, the per-row values SHALL be distinct across rows and the per-column values distinct across columns, and the row and column attributes SHALL be two DISTINCT attributes of the token kind. The visible grid SHALL read ONE way only: read the other way round (the row attribute running down the columns), it SHALL either not fit or complete the "?" cell with no option other than the answer. The validator SHALL re-derive those per-row and per-column values from the visible grid, independently of the generator, and SHALL prove that EXACTLY ONE option satisfies BOTH the "?" cell's row value and its column value (a unique completion) and that it equals the recorded answer. The validator SHALL reject a matrix whose row or column no longer agrees on its rule, a board that reads two ways, an answer that is not the unique completion, and an answer id that is not an option.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** the visible grid is a well-formed matrix that reads one way only and exactly one option matches both the "?" cell's row value and its column value, and that option is the recorded answer

#### Scenario: The answer points at a distractor
- **WHEN** the answer id is changed to an option that does not satisfy both the row and column rules
- **THEN** the validator rejects the puzzle

#### Scenario: A row no longer follows its rule
- **WHEN** a visible cell is changed so its row no longer shares one value on the row attribute
- **THEN** the validator rejects the puzzle

#### Scenario: A 2×2 board shows only two diagonal cells
- **WHEN** a 2×2 board hides the "?" cell and its diagonal cell and offers that diagonal cell as an option
- **THEN** the validator rejects the puzzle, because the two visible cells fit both readings and the diagonal cell completes the "?" cell under the other reading

### Requirement: Options are vocabulary-only and 1-D is never enough
Every answer option SHALL be a combination drawn from the grid's own vocabulary — its value on the row attribute SHALL be one of the grid's row values and its value on the column attribute SHALL be one of the grid's column values — EXCEPT the level's off-board distractors (requirement "Distractors the child cannot tell apart from the answer without reading the grid"). The options SHALL be unique with the answer among them. On a 3×3 grid the distractors SHALL include one that shares the "?" cell's row (the right row attribute but the wrong column attribute) and one that shares its column (the right column attribute but the wrong row attribute), so a single-axis (1-D) match can never decide the answer; on a 2×2 grid exactly one distractor shares the "?" cell's row or its column. The option order SHALL be a seeded shuffle so the answer is never at a fixed position, reproduced by the byte-identical replay.

#### Scenario: An off-axis option is offered
- **WHEN** an option that is not an off-board distractor uses a value that appears on neither the grid's rows nor its columns
- **THEN** the validator rejects the puzzle

#### Scenario: Distractors force reading both axes on a 3×3 grid
- **WHEN** any generated 3×3 puzzle is checked
- **THEN** a distractor matches only the "?" cell's row and another matches only its column, so no single-axis match is sufficient

#### Scenario: The answer position is not fixed
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** the answer appears at more than one option position across the corpus

### Requirement: Tap-an-option feedback that never ends the run
The renderer SHALL let the child tap an answer option; covered cells SHALL NOT be tappable. An option equal to the answer SHALL fill the "?" cell, mark the option, make Đô Đô (`ExploreMascot`) cheer and mark the puzzle solved, then play the worked solution (requirement "Worked solution after a right answer") and only then report `onAnswer(true)`, exactly once. A wrong option SHALL play a gentle "try again" shake and report `onAnswer(false)` WITHOUT ending the run, filling in the answer, or locking the option — the child simply tries another. All motion SHALL use the native animation driver and SHALL be skipped when the system requests reduced motion. No emoji SHALL be used as a UI icon or as the mascot (shapes are drawn Views and counts use a cell-bounded dot cluster). The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: The correct option is tapped
- **WHEN** the child taps the option that completes the "?" cell
- **THEN** the cell fills, Đô Đô cheers, the worked solution plays and `onAnswer(true)` is called once after it

#### Scenario: A wrong option is tapped
- **WHEN** the child taps an option that is not the answer
- **THEN** a gentle shake plays, `onAnswer(false)` is called, nothing locks and the answer is not filled in

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps update state, sound and `onAnswer` as usual, and the worked solution changes colours step by step without the fill, open or shake animation

### Requirement: Best-effort audio and authoritative grid
The on-screen prompt SHALL be shown and, together with the grid itself, SHALL be authoritative; the audio SHALL reference the best-effort `missing_cell_choose` clip for the prompt and the best-effort `missing_cell_solve` clip («Nhìn hàng, nhìn cột, ghép đủ hai điều.») for the worked solution, whose words the speech bubble shows while the solution plays. A missing clip SHALL never block play. The variant identity of a puzzle SHALL be its full grid (kind, axes and every cell by position, the "?" cell and covered cells told apart) and its bucket SHALL be the token kind.

#### Scenario: Prompt clip is not bundled
- **WHEN** the `missing_cell_choose` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen and the puzzle is fully playable in silence

#### Scenario: Mantra clip is not bundled
- **WHEN** the `missing_cell_solve` clip is absent from the bundled pack
- **THEN** the bubble still shows the mantra, the worked solution still plays for its minimum length and the run moves on

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-missing-cell-contracts.cjs` (`npm run test:explore-missing-cell`: at least 200 seeds per level, replay equality, an independent re-derivation of the matrix, of the one-way reading and of the unique row-and-column completion, the covered-cell and distractor rules, the vocabulary-only and 1-D rules, the naive-solver thresholds on at least 2000 seeds per level, the answer-position-not-fixed rule, tamper rejection, chained one-exercise rounds and renderer presentation rules) and by `kido-server/src/modules/explore/explore.missing-cell.spec.ts` (corpus conformance with an independent unique-completion and one-way-reading proof, the covered-cell and off-board rules, the two headline shortcut thresholds, tamper rejection, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-missing-cell` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer, and prints the measured success of every naive solver per level

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.missing-cell.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration

## ADDED Requirements

### Requirement: Distractors the child cannot tell apart from the answer without reading the grid
On a 3×3 grid (L3–L5) the "?" cell SHALL be one corner of a 2×2 block of the grid (its row and column plus one other row and one other column, drawn by seed), the block's three other corners SHALL be covered, and the four options SHALL be exactly the four cells of that block, so every option-only cue (whether it is on the board, which features it shares with other options, how often its values show on the board) is the same for all four. On a 2×2 grid (L1–L2) no cell SHALL be covered, because covering any cell besides the "?" one either hides a whole row or column or leaves two diagonal cells that read two ways; the distractors SHALL be one board cell sharing the "?" cell's row or column (drawn by seed) and one off-board distractor that shares that board cell's other value and carries one value found nowhere on the board (never a square beside a diamond), sharing no value with the answer. Every hidden cell's completion SHALL be among the options, and the validator SHALL check the hidden cells are corners of one 2×2 block holding the "?" cell, that every option completes a corner of that block or is one of the level's off-board distractors, and the count of off-board distractors. The level contents SHALL stay as the level intro lines describe them: 2×2 with 3 options at L1–L2, 3×3 with 4 options at L3–L5, and the same token kinds per level.

#### Scenario: A 3×3 board is generated
- **WHEN** a puzzle is generated at L3, L4 or L5
- **THEN** exactly three cells are covered, they and the "?" cell span two rows and two columns, and the four options are the four cells of that block

#### Scenario: A 2×2 board is generated
- **WHEN** a puzzle is generated at L1 or L2
- **THEN** no cell is covered and the options are the answer, one board cell sharing the "?" cell's row or column, and one token with exactly one value found nowhere on the board that shares no value with the answer

#### Scenario: A covered cell is shown
- **WHEN** a covered cell's token is put back on the board while it is still listed as covered, or the list loses it
- **THEN** the validator rejects the puzzle

#### Scenario: A distractor is taken from the board instead of a covered cell
- **WHEN** a covered cell's option is swapped for a cell that is on the board
- **THEN** the validator rejects the puzzle

### Requirement: No shortcut beats reading the grid
Measured over at least 2000 seeds per level, a naive solver that picks uniformly among the options a shortcut leaves SHALL succeed: for "the option not on the board", at most 1/2 at L1–L2 and at most 1/3 at L3–L5; for "the option sharing features with the most other options", at most the guessing rate plus 0.1; for "only options whose values all show on the board", at most 1/2 at L1–L2; and on a 3×3 grid no measured shortcut (also: sharing the fewest features, values showing least on the board, both board shortcuts at once, reading one axis only, one axis plus "not on the board") SHALL exceed 1/2.

#### Scenario: Shortcuts are measured
- **WHEN** the contract generates 2000 puzzles per level and scores each shortcut
- **THEN** every threshold above holds and the measured rates are printed

### Requirement: Worked solution after a right answer
After a right answer the board SHALL show why it is right before the run moves on: the "?" cell's row lights up, then its column is added, then the covered cells open to show the whole matrix, while Đô Đô says the mantra «Nhìn hàng, nhìn cột, ghép đủ hai điều.» and the speech bubble shows it. `onAnswer(true)` SHALL be reported only once the mantra has finished (or was not bundled) and the solution has played for its minimum length. The tokens the covered cells open to SHALL be read from the visible rows and columns (`missingCellHiddenTokens`), never from the generator. Leaving the board mid-solution SHALL report nothing.

#### Scenario: A right answer on a 3×3 board
- **WHEN** the child taps the answer on a 3×3 board
- **THEN** the row, then the column light up, the three covered cells open to their tokens, and only then `onAnswer(true)` is called

#### Scenario: The child leaves during the solution
- **WHEN** the board unmounts before the worked solution ends
- **THEN** no `onAnswer` call is made
