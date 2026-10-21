## MODIFIED Requirements

### Requirement: Deterministic local matrix puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the drawn-shape primitives and the Đô Đô mascot). A puzzle SHALL declare its level (one of the scored levels L1–L3, or the warm-up level 0), its grid size, the token kind, the attribute fixed by the ROW index and the distinct attribute fixed by the COLUMN index, the row-major cells with the "?" cell and every covered cell hidden, the "?" cell's index, the covered cells' indices in ascending order, the answer options and the answer option id. Every seeded draw SHALL be namespaced by the level so two levels of the same grid size and kind never produce the same puzzle. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay. The generator, validator and config versions SHALL be `missing-cell-v3`, `missing-cell-validator-v3` and `missing-cell-config-v3` (manifest `missing-cell-manifest-v3`, dependency versions `3`), mirrored in the kido-server explore registry with levels [1, 2, 3].

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `missing_cell` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

#### Scenario: Version is bumped
- **WHEN** the bundled game and the kido-server registry describe `missing_cell`
- **THEN** both report generator `missing-cell-v3`, validator `missing-cell-validator-v3`, config `missing-cell-config-v3`, manifest `missing-cell-manifest-v3`, dependency versions `3` and levels [1, 2, 3]

#### Scenario: A level outside the ladder is asked for
- **WHEN** the generator is asked for level 4, 5 or -1
- **THEN** it throws `EXPLORE_MISSING_CELL_LEVEL_UNSUPPORTED`

### Requirement: Distractors the child cannot tell apart from the answer without reading the grid
On a 3×3 grid (every scored level, L1–L3) the "?" cell SHALL be one corner of a 2×2 block of the grid (its row and column plus one other row and one other column, drawn by seed), the block's three other corners SHALL be covered, and the four options SHALL be exactly the four cells of that block, so every option-only cue (whether it is on the board, which features it shares with other options, how often its values show on the board) is the same for all four. On the 2×2 grid of the warm-up level no cell SHALL be covered, because covering any cell besides the "?" one either hides a whole row or column or leaves two diagonal cells that read two ways; the distractors SHALL be one board cell sharing the "?" cell's row or column (drawn by seed) and one off-board distractor that shares that board cell's other value and carries one value found nowhere on the board (never a square beside a diamond), sharing no value with the answer. Every hidden cell's completion SHALL be among the options, and the validator SHALL check the hidden cells are corners of one 2×2 block holding the "?" cell, that every option completes a corner of that block or is one of the level's off-board distractors, and the count of off-board distractors. The level contents SHALL stay as the level intro lines describe them: 3×3 with 4 options at L1–L3 (shape × colour, dots × colour, either kind) and 2×2 shape × colour with 3 options at the warm-up level.

#### Scenario: A 3×3 board is generated
- **WHEN** a puzzle is generated at L1, L2 or L3
- **THEN** exactly three cells are covered, they and the "?" cell span two rows and two columns, and the four options are the four cells of that block

#### Scenario: A 2×2 warm-up board is generated
- **WHEN** a puzzle is generated at the warm-up level
- **THEN** no cell is covered and the options are the answer, one board cell sharing the "?" cell's row or column, and one token with exactly one value found nowhere on the board that shares no value with the answer

#### Scenario: A covered cell is shown
- **WHEN** a covered cell's token is put back on the board while it is still listed as covered, or the list loses it
- **THEN** the validator rejects the puzzle

#### Scenario: A distractor is taken from the board instead of a covered cell
- **WHEN** a covered cell's option is swapped for a cell that is on the board
- **THEN** the validator rejects the puzzle

### Requirement: No shortcut beats reading the grid
Measured over at least 2000 seeds per level, a naive solver that picks uniformly among the options a shortcut leaves SHALL succeed, on every scored level (all 3×3): for "the option not on the board" at most 1/3; for "the option sharing features with the most other options" at most the guessing rate plus 0.1; and for every measured shortcut (also: sharing the fewest features, values showing least on the board, only values seen on the board, both board shortcuts at once, reading one axis only, one axis plus "not on the board") at most 1/2. Every scored level SHALL be a 3×3 grid. On the 2×2 warm-up level "the option not on the board" and "only options whose values all show on the board" SHALL each stay at most 1/2, and the contract SHALL record that both at once (elimination) wins every 2×2 board — the reason the 2×2 grid is never scored.

#### Scenario: Shortcuts are measured
- **WHEN** the contract generates 2000 puzzles per level and scores each shortcut
- **THEN** every threshold above holds, elimination wins 100% only on the warm-up level, and the measured rates are printed

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-missing-cell-contracts.cjs` (`npm run test:explore-missing-cell`: at least 200 seeds per level including the warm-up level, replay equality, an independent re-derivation of the matrix, of the one-way reading and of the unique row-and-column completion, the covered-cell and distractor rules, the vocabulary-only and 1-D rules, the naive-solver thresholds on at least 2000 seeds per level, the answer-position-not-fixed rule, tamper rejection, chained one-exercise rounds, the three-level ladder and the warm-up registration, the old-ladder starting-level map, renderer presentation rules, the worked solution through a pause and the warm-up demo on the real renderer), by `mobile/scripts/verify-explore-play-shell-contracts.cjs` §10 (the warm-up on the real play screen), `verify-explore-leveled-rounds-contracts.cjs` §7, `verify-explore-parent-config-contracts.cjs` (the saved starting level across a relaunch) and by `kido-server/src/modules/explore/explore.missing-cell.spec.ts` (corpus conformance at the warm-up level and L1–L3 with an independent unique-completion and one-way-reading proof, the covered-cell and off-board rules, the two headline shortcut thresholds, every scored level 3×3, tamper rejection, the warm-up only from L1, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-missing-cell` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer, and prints the measured success of every naive solver per level

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.missing-cell.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration

## REMOVED Requirements

### Requirement: Five levels scaling grid size and rule complexity
**Reason**: The 2×2 levels (L1–L2) are won by elimination (drop the odd token, then the one already on the board) without reading a row or a column, so the owner decided on 2026-10-21 that a 2×2 board never counts towards moving up. The ladder is now three 3×3 levels plus an unscored 2×2 warm-up, so the level table and its scenarios ("Grid scales across the ladder", 2×2 at L1–L2) change; OpenSpec does not let a MODIFIED block drop scenarios, so the requirement is re-added as "Three scored 3×3 levels".

**Migration**: Generator, validator, config and manifest move to version 3 (`missing-cell-v3`); exercises are memory-only. A starting level a parent saved for the old ladder is moved once onto the 3×3 level it meant (requirement "A saved starting level moves onto the 3×3 ladder").

## ADDED Requirements

### Requirement: Three scored 3×3 levels
The game SHALL define three scored levels, all 3×3 with three covered cells and four options, each removing one support from the level before: L1 a shape × colour board (both values show at a glance), L2 a dots × colour board (one value has to be counted), L3 a board of either kind (the kind changes from one puzzle to the next, so the child finds which value runs along the rows every time). The game's `levels` SHALL be [1, 2, 3]. The round-variety bucket of a puzzle SHALL be its token kind, every declared bucket SHALL be reachable at its level and the declared round-variety capacity per level SHALL be reachable. A run SHALL play leveled rounds — 6 boards at one level, moving up a level when at least 4 were right on the first try, with at most one extra round — without streaks, countdowns or a lose state. Moving up to L2 SHALL say «Bây giờ bé đếm chấm trên bảng ba hàng ba cột nhé!» (`missing_cell_intro_4`) and to L3 «Bây giờ có cả hình và chấm, bé nhìn hàng và cột nhé!» (`missing_cell_intro_5`); L1 has no intro line.

#### Scenario: The ladder is inspected
- **WHEN** the levels are inspected
- **THEN** L1, L2 and L3 are 3×3 boards of shape, dots and either kind, and no scored level is 2×2

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the puzzle

#### Scenario: Both kinds reach a mixed-kind level
- **WHEN** chained one-exercise rounds are requested at L3
- **THEN** every served puzzle is a declared kind and both kinds reach the child across the rounds

#### Scenario: No round lands on the warm-up
- **WHEN** a round at any scored level ends with any first-try count
- **THEN** the next round is at a scored level

### Requirement: Unscored 2×2 warm-up with a demo
The 2×2 boards SHALL be the game's warm-up: a generator level (0) outside the game's `levels`, declared in the leveled-rounds table as two boards of which Đô Đô shows the first (requirement "Unscored warm-up before the first round" of explore-session-runtime), ended by «Bây giờ bảng có ba hàng ba cột, bé nhìn kỹ nhé!» (`missing_cell_intro_3`). On a board the play screen marks `demo`, the renderer SHALL ask for the mantra «Nhìn hàng, nhìn cột, ghép đủ hai điều.» as a gentle line (after the board's question), light the "?" cell's row when that line starts and add its column 700 ms later, show the mantra in the speech bubble meanwhile, and keep every option locked (drawn faded, a tap does nothing) until the line has ended and the demo has shown for at least 2 s; then the options wake, the bubble shows the question again and the row and column stay lit while the child chooses. A pause SHALL hold the demo's beats and say a cut mantra again; a missing clip SHALL still light the row and column. A board without `demo` SHALL play at once. After a right answer every warm-up board plays the usual worked solution.

#### Scenario: The demo board
- **WHEN** the first warm-up board appears
- **THEN** the question is read, then the mantra while the row and then the column light up, and only then can the child tap an option

#### Scenario: A tap during the demo
- **WHEN** the child taps an option before the demo has ended
- **THEN** nothing is reported and the board keeps showing the demo

#### Scenario: The second warm-up board
- **WHEN** the second warm-up board appears
- **THEN** nothing is lit and the options are live at once

### Requirement: A saved starting level moves onto the 3×3 ladder
The parent-preferences store SHALL save its preferences under persist version 1. A preference saved under an earlier version SHALL be sanitized and then moved once: an Ô thiếu starting level 1, 2 or 3 opens L1, 4 opens L2 and 5 or above opens L3; when only a global starting level was saved, the same map SHALL pin Ô thiếu's own starting level and every other game SHALL keep the global one. Invalid values SHALL be dropped as before, nothing SHALL crash, and the moved preference SHALL be saved again under version 1 so it is not moved a second time.

#### Scenario: An old L4 is restored
- **WHEN** the app starts with `{"startingLevelByGame":{"missing_cell":4}}` saved under version 0
- **THEN** Ô thiếu's next run opens L2 (3×3 dots) without a warm-up, and the preference is saved as `missing_cell: 2` under version 1

#### Scenario: Junk was saved
- **WHEN** the saved Ô thiếu level is 0, negative, fractional, a string or null
- **THEN** it is dropped and the run starts at L1 with the warm-up
