## ADDED Requirements

### Requirement: Four levels without the two-block warm-up
`stack_tower` SHALL have four levels and no `compare` dimension: L1 three blocks by `size` (ratio ≥ 1.4), L2 four blocks by one of `size`, `length` or `height` (≥ 1.25), L3 four passenger cars by `quantity` (distinct 1–6 dots), L4 five blocks by one of `size`, `length` or `height` (≥ 1.2). These supersede the five-level table and the "Bạn nào to hơn?" warm-up of `add-explore-round-2-games`. Because the level → seeded-stream mapping changed, the generator, validator, config and dependency manifest SHALL be version 2 (`stack-tower-v2`), and the server catalog SHALL mirror levels `[1, 2, 3, 4]` and version 2. A run SHALL stay progressive (no leveled rounds) and play one board per level, L1→L4. Any starting level a parent stored before this change (including 5, 0, negative, fractional or non-numeric values) SHALL open that run at L1 without an error.

#### Scenario: Stored level from the old table
- **WHEN** `kido-parent-preferences` holds `explore.startingLevelByGame.stack_tower = 5` and the child opens Xếp tháp
- **THEN** the run serves four boards at L1, L2, L3, L4 and the first board asks for three blocks "Xếp từ to đến nhỏ nhé."

#### Scenario: Retired level rejected
- **WHEN** a v2 exercise is moved to level 5, or carries the v1 generator/validator versions
- **THEN** the validator rejects it

### Requirement: Every misplacement is reported
A block tapped out of order SHALL keep its physical answer (tried on the build, the build leans 8° where there is one, the block springs back to the floor) and the renderer SHALL also report each such tap through `onAnswer(false)`. The play shell then plays the try-again cue, raises its support level (1 after the first miss, 2 after the second) and stays on the board; the renderer SHALL take its support level only from the shell (`supportLevel` 1 outlines and pulses the next correct block, 2 also dims all but the next two) and SHALL NOT play its own try-again cue. The finished build SHALL be reported once through `onAnswer(true)` after the climb, within 1.5 seconds of the last tap.

#### Scenario: Two wrong taps, then the build
- **WHEN** the child taps two blocks out of order and then places every block in order
- **THEN** `onAnswer(false)` is reported twice while the board stays, the hint row and support rise to level 2, and `onAnswer(true)` is reported once after Đô Đô's climb

### Requirement: Every floor block has a tap cell of at least 48pt
`layoutStackTowerScene` SHALL give every floor block a tap cell (`hit`) that holds the block, is at least 48pt wide and high, stays inside the scene, sits in the floor band below the build and overlaps no other cell; blocks in one floor row SHALL still span no more than 85% of the scene width. The renderer SHALL make that cell the touchable view (a touch never reaches past its parent, so hit slop around a block-sized view cannot enlarge it), draw the block inside it, and let placed blocks take no touches. Measured from the rendered views on 320, 375 and 430pt-wide phones (normal and shortened scene heights), every floor block's real tap area SHALL be at least 44×44pt and no two SHALL overlap, at every step of the build.

#### Scenario: Five small blocks on a 320pt phone
- **WHEN** an L4 tower is shown in the scene a 320×568pt phone gives the renderer
- **THEN** each block still on the floor answers taps over at least 48×48pt, including blocks drawn 18pt wide

### Requirement: The climb and the report hold while the run is paused
The renderer's beats (each hop of Đô Đô's climb, the train's roll-off, the think-face reset and the report of the finished build) SHALL run on the shared pausable clock (`useBusSequencer(paused)`). While the run is paused (exit card open, app away) no further hop or roll-off SHALL start and the build SHALL NOT be reported; when play goes on the climb SHALL continue where it stopped and the report SHALL follow after the remaining time. Under reduced motion the report beat SHALL hold the same way.

#### Scenario: Exit card during the climb
- **WHEN** the last block is placed and the child opens the exit card while Đô Đô is climbing, waits, then taps "Ở lại chơi"
- **THEN** nothing is reported while the card is open, and after it closes Đô Đô finishes the climb and the next board follows

### Requirement: Passenger dots are visible on every car
Passenger cars SHALL draw their `DotGroup` dots in the ink colour, which no car uses, so every car — the orange one included — shows its dot count.

#### Scenario: Orange car
- **WHEN** an L3 board has an orange car carrying one dot
- **THEN** that dot is drawn in ink on the orange car
