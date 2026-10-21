## MODIFIED Requirements

### Requirement: Deterministic generation and independent validation
`generateStackTowerExercise(level, seed)` SHALL be a pure function of its arguments: the same seed MUST replay a byte-identical exercise (after `variantKey`/`bucketKey` are stripped). Each block SHALL have a unique id, a unique colour from the bundled palette, and a magnitude that is a fraction of the largest block (largest = 1) or a dot count. Every level has three or more blocks, and the floor order SHALL be a seeded shuffle that is never the build order nor its exact reverse. `validateStackTowerExercise` SHALL independently re-derive the build order from the magnitudes (descending for `size`, ascending otherwise) and reject any exercise whose answer, block count, colours, magnitudes, ratio, floor order, level/dimension pairing, prompt, audio refs, versions or replay disagree.

#### Scenario: Replay by seed
- **WHEN** the same level and seed are generated twice
- **THEN** the two exercises are identical byte for byte

#### Scenario: Swapped answer
- **WHEN** two ids in `answer.orderedBlockIds` are swapped
- **THEN** the validator rejects the exercise

#### Scenario: Trivial floor
- **WHEN** a floor is reordered to the build order or its reverse
- **THEN** the validator rejects the exercise

#### Scenario: Duplicate colour
- **WHEN** two blocks share a colour
- **THEN** the validator rejects the exercise

### Requirement: Completion climb
When the last block is placed the renderer SHALL have Đô Đô — the shared `ExploreMascot` — climb the finished build one block per about 250ms (trains: shorter hops, then the whole train rolls off screen), cheer on top, and only then call `onAnswer(true)`. The climb plus cheer beat SHALL report within 1.5 seconds of the last placement. Under the system reduce-motion setting the renderer SHALL skip all movement, show Đô Đô on top and report within the same budget. Every beat of the climb (each hop, the roll-off, the report) SHALL run on the shared pausable clock (`useBusSequencer(paused)`): while the run is paused (exit card open, app away) no further hop or roll-off starts and the build is not reported, and when play goes on the climb continues where it stopped. Each hop SHALL take its landing spot from the layout on screen when its beat comes, and a board laid out again mid-climb SHALL move Đô Đô to the step she is on in the new layout.

#### Scenario: Five-block tower
- **WHEN** the fifth block is placed on an L4 size tower
- **THEN** Đô Đô climbs five blocks at ~250ms each, cheers, and `onAnswer(true)` fires no later than 1.5s after the tap

#### Scenario: Reduced motion
- **WHEN** the system reports reduced motion and the build is completed
- **THEN** blocks snap into place, Đô Đô is shown on top without a climb, and `onAnswer(true)` fires within the same budget

#### Scenario: Exit card during the climb
- **WHEN** the last block is placed and the child opens the exit card while Đô Đô is climbing, waits, then taps "Ở lại chơi"
- **THEN** nothing is reported while the card is open, and after it closes Đô Đô finishes the climb and the next board follows

#### Scenario: Board laid out again mid-climb
- **WHEN** the scene shrinks past what the board fits while Đô Đô is on her second hop
- **THEN** she is placed on the second step of the new layout and her remaining hops land on the new layout's steps

### Requirement: Support escalation without revealing the answer
The renderer SHALL take its support level only from the play screen's `supportLevel`, which every reported misplacement raises (1 after the first miss, 2 after the second). At support level 1 the next correct block SHALL pulse with an outline (a static outline under reduced motion). At support level 2 the blocks that are clearly wrong SHALL dim so the child chooses between the next block and its neighbour in order; dimmed blocks stay tappable. The renderer keeps no miss count of its own. Support state is memory-only and resets with every exercise.

#### Scenario: Two slides
- **WHEN** the child has slid two blocks back on the current exercise
- **THEN** both misses were reported, the play screen's support level is 2, the next correct block pulses and the clearly wrong blocks dim

#### Scenario: Support level two
- **WHEN** `supportLevel` is 2 and four blocks remain on the floor
- **THEN** the two blocks furthest from the next position dim and the next correct block pulses

### Requirement: Scene geometry fits the screen
Block and mascot geometry SHALL come from a pure layout (`layoutStackTowerScene`) sized from `useWindowDimensions` and the measured scene (inside its border): every block and the whole build SHALL stay within 85% of the scene width, the finished build plus Đô Đô on top SHALL fit the scene height, floor slots and build slots SHALL never overlap, towers SHALL be centred and stack upward, and trains/skylines SHALL sit on a common baseline left to right. Every floor block SHALL own a tap cell (`hit`) that holds the block, is at least 48pt wide and high, stays inside the scene, sits in the floor band below the build and overlaps no other cell; the blocks of one floor row SHALL still span no more than 85% of the width. The renderer SHALL make that cell the touchable view (a touch never reaches past its parent, so hit slop around a block-sized view cannot enlarge it) and let placed blocks take no touches; measured from the rendered views on 320, 375 and 430pt-wide phones every floor block's tap area SHALL be at least 44×44pt with no overlap, at every step of the build. The board SHALL be drawn on a stage anchored to the scene's floor, and the size it is laid out for SHALL follow `nextStackTowerSceneSize`: a scene that loses height while the board still fits keeps the layout (nothing jumps, a block sliding back is not cut short), more height is used only before the first tap, and a new width or a board that no longer fits is laid out again, with blocks on the floor finishing whatever they were doing.

#### Scenario: Small phone
- **WHEN** an L4 tower is laid out in a 280×250pt scene
- **THEN** all five blocks fit on the floor and in the tower, each narrower than 238pt, every floor block has a tap cell of at least 48×48pt, and Đô Đô's landing spot on the top block is inside the scene

#### Scenario: Tablet
- **WHEN** an L2 skyline is laid out in a 728×560pt scene
- **THEN** the columns stand left to right on one baseline within 619pt and the tallest column leaves room for Đô Đô on top

#### Scenario: Hint strip grows under the board
- **WHEN** the play screen's hint and feedback strip takes 20pt from a scene whose board has room above it, while a misplaced block slides back
- **THEN** the board keeps its layout and moves up with the floor, and the block's slide back plays to the end

### Requirement: Offline, stateless, audio best-effort
`stack_tower` SHALL be bundled with generator, validator, config and the Đô Đô asset (`offlineCapable: true`, no remote dependency) and run as a progressive run owned by the play screen, one board per level, L1→L4 (no leveled rounds). The renderer SHALL keep every state in memory only (no persistence, analytics or lesson side effects). Prompt and feedback audio SHALL be best-effort: the per-dimension phrase and number clips are requested through the shared prompt-audio keys and a missing clip never blocks play; the renderer SHALL NOT carry its own prompt-replay control. The server catalog SHALL mirror the mobile bundled definition (versions 2, levels `[1, 2, 3, 4]`, manifest).

#### Scenario: Clips not yet bundled
- **WHEN** the Đợt 2 audio pack has not been generated
- **THEN** every level plays to completion with the on-screen prompt, the select/try-again cues and silent feedback channels

#### Scenario: Server mirror
- **WHEN** the server registry is asked for `stack_tower`
- **THEN** its config/generator/validator versions, levels and dependency manifest equal the mobile `STACK_TOWER_GAME`

### Requirement: Conformance contract
The game SHALL be covered by `mobile/scripts/verify-explore-stack-tower-contracts.cjs` (`npm run test:explore-stack-tower`) and `kido-server/src/modules/explore/explore.stack-tower.spec.ts`, which together prove: the four-level table and v2 versions, a run of L1→L4 from any stored starting level, ≥ 200 seeds per level that validate and replay byte-identically with monotone ratios, unique colours and a non-trivial floor; tamper rejection (swapped answer, ratio under minimum, duplicate colour, out-of-range dots, trivial floor, moved or retired level, v1 versions); ≥ 20% reach for every dimension across 300 one-exercise rounds; the layout and tap-cell bounds above across phone and tablet scenes; and, through the real renderer in the render harness, the measured tap areas on 320/375/430pt phones, a reported `onAnswer(false)` per misplacement with shell-driven support, the climb and report held while paused, and the board staying put (or Đô Đô following a new layout) while the scene is resized mid-board.

#### Scenario: Contract run
- **WHEN** `npm run test:explore-stack-tower` runs in `mobile/` and the server spec runs in `kido-server/`
- **THEN** both pass without network access or bundled audio clips

## REMOVED Requirements

### Requirement: Seriation dimensions and levels
**Reason**: The two-block "Bạn nào to hơn?" warm-up (L1, `compare`) is dropped and the four remaining levels are renumbered L1–L4, so the level table, the per-level scenarios ("Level 3 serves every dimension", "Quantity level") and the prompt list change. OpenSpec does not let a MODIFIED block drop or rename scenarios, so the requirement is re-added as "Four seriation levels without the two-block warm-up".

**Migration**: Generator, validator, config and manifest move to version 2 (`stack-tower-v2`); exercises are memory-only, so nothing stored needs converting. A starting level a parent stored for the old table opens the run at L1.

### Requirement: Tap-to-place build with physical feedback and no wrong state
**Reason**: Every misplacement is now reported through `onAnswer(false)` (the physical slide-back stays), and the "Compare warm-up" scenario no longer exists. Re-added as "Tap-to-place build with physical feedback and reported misses".

**Migration**: None. The play screen already handles `onAnswer(false)` (try-again cue, support level, same board).

## ADDED Requirements

### Requirement: Four seriation levels without the two-block warm-up
The stack tower game SHALL be registered as `stack_tower` with four levels that follow the math seriation catalog (`math_seriation_size`) and no `compare` dimension: L1 three blocks by `size` (minimum ratio 1.4), L2 four blocks by one of `size`, `length` or `height` (1.25), L3 four passenger cars by `quantity` (distinct 1–6 dots), L4 five blocks by one of `size`, `length` or `height` (1.2). Each level's variety buckets SHALL be exactly its dimensions, so a level with several dimensions serves each of them. Every measured dimension SHALL keep a minimum ratio of at least 1.2 between consecutive blocks (a step under 20% is ambiguous). The on-screen prompt and the spoken clip SHALL be the same sentence per dimension ("Xếp từ to đến nhỏ nhé.", "Xếp từ ngắn đến dài nhé.", "Xếp từ thấp đến cao nhé.", "Xếp từ ít đến nhiều nhé."). Any starting level a parent stored before this change (including 5, 0, negative, fractional or non-numeric values) SHALL open the run at L1 without an error.

#### Scenario: Level 2 serves every dimension
- **WHEN** the play screen requests 300 chained one-exercise rounds at L2 with the usual exclusion window, last bucket and rotation
- **THEN** `size`, `length` and `height` each reach the child in at least 20% of the rounds

#### Scenario: Quantity level
- **WHEN** an L3 exercise is generated
- **THEN** it has four cars whose dot counts are distinct integers from 1 to 6 and its prompt reads "Xếp từ ít đến nhiều nhé."

#### Scenario: Ambiguous step
- **WHEN** an exercise's second-largest block is pulled to within less than the level ratio of the largest
- **THEN** the validator rejects the exercise

#### Scenario: Stored level from the old table
- **WHEN** `kido-parent-preferences` holds `explore.startingLevelByGame.stack_tower = 5` and the child opens Xếp tháp
- **THEN** the run serves four boards at L1, L2, L3, L4 and the first board asks for three blocks "Xếp từ to đến nhỏ nhé."

### Requirement: Tap-to-place build with physical feedback and reported misses
The renderer SHALL lay the shuffled blocks on the floor and build the answer by taps: a block tapped in order flies to its place (towers stack upward, centred; trains and skylines grow left to right on one baseline). A block tapped out of order SHALL be answered physically: it is tried on the build, the build leans 8 degrees (an `Animated` rotate pivoting at its base) and the block springs back to the floor; the passenger-car (`quantity`) train SHALL NOT use the lean. Each such tap SHALL also be reported through `onAnswer(false)`, so the play screen plays the try-again cue, raises its support level and stays on the board; the renderer SHALL NOT play its own try-again cue or show text of its own. Passenger cars SHALL show their dots with the shared `DotGroup` and be counted aloud (best-effort) as they join the train.

#### Scenario: Wrong block on a tower
- **WHEN** the child taps a block that is not the next one in build order while at least one block is already placed
- **THEN** the block moves up to the top of the tower, the tower leans 8° and settles back, the block slides back to its floor slot, and one `onAnswer(false)` is reported while the board stays

#### Scenario: Wrong car on the passenger train
- **WHEN** the child taps a passenger car that is not the next one
- **THEN** the car is tried at the end of the train and slides back, the train does not lean, and one `onAnswer(false)` is reported

#### Scenario: Correct placement counted aloud
- **WHEN** the child places the next correct passenger car with 3 dots
- **THEN** the select cue plays, the car joins the train and the number clip for 3 is requested via the feedback channel (silently skipped if not bundled)

### Requirement: Passenger dots are visible on every car
Passenger cars SHALL draw their `DotGroup` dots in the ink colour, which no car uses, so every car — the orange one included — shows its dot count.

#### Scenario: Orange car
- **WHEN** an L3 board has an orange car carrying one dot
- **THEN** that dot is drawn in ink on the orange car
