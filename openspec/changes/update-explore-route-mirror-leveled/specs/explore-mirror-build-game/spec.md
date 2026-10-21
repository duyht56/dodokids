## ADDED Requirements

### Requirement: Copying the left half is never right
Every board's left half SHALL differ from its own left-right reflection, so a child who copies the left half cell for cell instead of reflecting it is never told the board is right. The generator SHALL draw the pattern again from the next sub-seed until this holds, and the validator SHALL reject a self-symmetric left half. Every board SHALL need at least two cells to be filled.

#### Scenario: A self-symmetric pattern is drawn
- **WHEN** a drawn left half equals its own reflection
- **THEN** the generator draws again, and an envelope carrying such a half fails validation

#### Scenario: Copy strategy over many seeds
- **WHEN** 10,000 boards of any level are answered by copying the left half as it stands
- **THEN** none of them is accepted

### Requirement: One demonstrated pair, never traceable
After the first wrong "Xong" on a board (support level 1) Đô Đô SHALL show ONE pair the child has wrong: the left source cell, the mirror segment of that row and the right cell at the same distance from the mirror, with the shape sliding across the mirror (still rings under reduced motion). The pair SHALL be chosen once per board — an answer cell not yet filled, the furthest from the mirror first, else a filled cell whose source is empty — and SHALL disappear when the child taps its right cell; no other cell SHALL light up afterwards. A second wrong "Xong" (support level 2) SHALL show each column's distance to the mirror (the same count on both sides) without naming any cell. Support SHALL never fill in, dim or lock a cell. Tapping only lit cells and submitting SHALL solve no board.

#### Scenario: First wrong submit on an empty board
- **WHEN** the child taps "Xong" with nothing filled
- **THEN** one left cell, its mirror segment and one right cell are ringed, the support line «Bé nhìn nhé, hai ô cách gương bằng nhau.» shows, and no cell is filled in

#### Scenario: Child taps the shown cell
- **WHEN** the child taps the ringed right cell
- **THEN** that cell toggles, the rings go away and no other cell is ringed

#### Scenario: Second wrong submit
- **WHEN** the child taps "Xong" wrongly again
- **THEN** dots above the columns show their distance to the mirror and no further cell is ringed

### Requirement: Touch targets measured on phones
Every right-half cell SHALL be at least 44 × 44 pt at every level on 320, 375 and 430 pt wide phones, with cells at least 4 pt apart and the whole row on screen. Cells SHALL be sized from the measured play area (`mirrorBuildCellLayout`): the grid keeps to the play column while 44 pt cells fit there and otherwise uses the column's side padding down to 8 pt from the screen edge. On a 375 × 667 phone the grid, the prompt and "Xong" SHALL fit without scrolling at every level. The conformance check SHALL measure the rendered cells, not read a constant.

#### Scenario: Level 5 on an iPhone SE
- **WHEN** a level-5 board is shown on a 375 × 667 phone
- **THEN** each right cell is at least 44 pt, cells are 6 pt apart, and "Xong" is on screen

## MODIFIED Requirements

### Requirement: Five levels scaling grid size and density
The game SHALL define five levels whose grid scales from 3 × (2·2) at L1 to 5 × (2·3) at L5 — never more than 3 columns a side, so cells stay touch targets — and whose pattern density grows with the level, and whose left-half cell count never shrinks with the level. The round-variety bucket of every puzzle SHALL be `mirror` and it SHALL be the only declared bucket at each level. The declared round-variety capacity per level SHALL be reachable. A run SHALL play leveled rounds of 4 boards at one level, moving up when at least 3 were right on the first try, with at most one extra round, and with an intro line for each level above the first (`mirror_intro_2..5`), without streaks, countdowns or a lose state.

#### Scenario: Grid scales across the ladder
- **WHEN** the levels are inspected
- **THEN** the grid is 3 × (2·2) at L1 and 5 × (2·3) at L5 and the left-half cell count never shrinks with the level

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose seed replays to a different envelope
- **THEN** the validator rejects the puzzle

#### Scenario: Only the mirror bucket is served
- **WHEN** chained one-exercise rounds are requested at any level
- **THEN** every served puzzle's bucket is `mirror` and more than one variant reaches the child

## REMOVED Requirements

### Requirement: Support anchors and dims without auto-filling
**Reason**: following the anchor from cell to cell solved every board, and dimming every cell that must stay empty lit up exactly the answer (review A07).
**Migration**: replaced by "One demonstrated pair, never traceable".
