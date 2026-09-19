## MODIFIED Requirements

### Requirement: Responsive deterministic board
The card order SHALL remain stable across re-render/orientation changes. Phone boards SHALL use full-row grids for every level — 2 columns for 2 pairs, 3 columns for 3 pairs and 4 columns for 4, 6 and 8 pairs — so no level leaves a ragged last row; wide layouts (≥700pt) MAY use more columns. Card size SHALL be derived from both the viewport width and the available board height (the measured board area, or a documented estimate from the window height until it is measured) so that every level, including the 16-card L5 board, fits a 375×667 portrait phone without vertical scrolling. Cards SHALL never shrink below the 48pt minimum child touch target; only when a screen cannot hold the level's rows at that minimum SHALL the board scroll vertically instead of squashing the cards.

#### Scenario: Orientation changes
- **WHEN** the device orientation or the measured board area changes during an exercise
- **THEN** card positions and sizes adapt without reshuffling identities or losing matched state

#### Scenario: 3-pair board on a phone
- **WHEN** an L2 board (3 pairs) is laid out at a phone width
- **THEN** it renders 3 columns × 2 rows with no ragged row

#### Scenario: 6-pair board on a phone
- **WHEN** an L4 board (6 pairs) is laid out at a phone width
- **THEN** it renders 4 columns × 3 rows with no ragged row

#### Scenario: 8-pair board on a 375×667 phone
- **WHEN** an L5 board (8 pairs) is laid out for a 375×667 portrait window
- **THEN** cards shrink from the height budget so the 4 × 4 board fits without vertical scrolling and every card stays at least 48pt wide

#### Scenario: Screen too small for minimum cards
- **WHEN** the available board height cannot hold the level's rows at the minimum card size
- **THEN** cards stay at the minimum size and the board scrolls vertically rather than shrinking below the touch target

## ADDED Requirements

### Requirement: Memory progress and mascot presentation
The renderer SHALL show the pairs found so far as a row of forward-only dots, one per pair on the board, next to the short count text; within a board dots only fill and never empty. The mascot SHALL be the shared Đô Đô component (`ExploreMascot`), never an emoji placeholder: it cheers from the moment a matching pair is turned until the board unlocks, thinks while a mismatched pair turns back, and is idle otherwise. The renderer SHALL NOT carry its own prompt-replay control; replay is the play screen's global control.

#### Scenario: A pair is found
- **WHEN** the child turns the second card of a matching pair
- **THEN** one more dot fills, the count text updates and Đô Đô cheers until the board unlocks

#### Scenario: A mismatch turns back
- **WHEN** two different cards are face-up and turn back
- **THEN** no dot empties, no negative text appears and Đô Đô shows the thinking motion

### Requirement: Three-board run
A memory run SHALL consist of three consecutive boards starting at the parent's static starting level (or L1), clamped so the window stays inside L1–L5; each board's pair count follows its level.

#### Scenario: Run from L1
- **WHEN** a run starts with starting level 1
- **THEN** the child plays L1, L2 and L3 boards (2, 3 and 4 pairs)

#### Scenario: Run from a late starting level
- **WHEN** a run starts with starting level 4 or 5
- **THEN** the child plays L3, L4 and L5 boards (4, 6 and 8 pairs)
