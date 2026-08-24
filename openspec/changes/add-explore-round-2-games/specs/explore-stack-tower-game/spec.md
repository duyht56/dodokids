## Purpose

"Xếp tháp cho Đô Đô" (`stack_tower`) is the Khám phá seriation game: the child taps shuffled blocks in order to build a tower, train or skyline for Đô Đô, with every mistake answered by physics instead of a wrong state, fully offline and stateless.

## ADDED Requirements

### Requirement: Seriation dimensions and levels
The stack tower game SHALL be registered as `stack_tower` with five levels that follow the math seriation catalog (`math_seriation_size`, L1 `math_compare_size`): L1 two blocks in the `compare` dimension ("Bạn nào to hơn?"), L2 three blocks by `size`, L3 four blocks by one of `size`, `length` or `height`, L4 four passenger cars by `quantity` (1–6 dots each), and L5 five blocks by one of `size`, `length` or `height`. Each level's variety buckets SHALL be exactly its dimensions, so a level with several dimensions serves each of them. Every measured dimension SHALL keep a minimum ratio of at least 1.2 between consecutive blocks (a step under 20% is ambiguous); quantity cars SHALL carry distinct dot counts between 1 and 6. The on-screen prompt and the spoken clip SHALL be the same sentence per dimension ("Xếp từ to đến nhỏ nhé.", "Xếp từ ngắn đến dài nhé.", "Xếp từ thấp đến cao nhé.", "Xếp từ ít đến nhiều nhé.", "Bạn nào to hơn?").

#### Scenario: Level 3 serves every dimension
- **WHEN** the play screen requests 300 chained one-exercise rounds at L3 with the usual exclusion window, last bucket and rotation
- **THEN** `size`, `length` and `height` each reach the child in at least 20% of the rounds

#### Scenario: Quantity level
- **WHEN** an L4 exercise is generated
- **THEN** it has four cars whose dot counts are distinct integers from 1 to 6 and its prompt reads "Xếp từ ít đến nhiều nhé."

#### Scenario: Ambiguous step
- **WHEN** an exercise's second-largest block is pulled to within less than the level ratio of the largest
- **THEN** the validator rejects the exercise

### Requirement: Deterministic generation and independent validation
`generateStackTowerExercise(level, seed)` SHALL be a pure function of its arguments: the same seed MUST replay a byte-identical exercise (after `variantKey`/`bucketKey` are stripped). Each block SHALL have a unique id, a unique colour from the bundled palette, and a magnitude that is a fraction of the largest block (largest = 1) or a dot count. The floor order SHALL be a seeded shuffle that is never the build order nor its exact reverse for three or more blocks. `validateStackTowerExercise` SHALL independently re-derive the build order from the magnitudes (descending for `size`/`compare`, ascending otherwise) and reject any exercise whose answer, block count, colours, magnitudes, ratio, floor order, level/dimension pairing, prompt, audio refs or replay disagree.

#### Scenario: Replay by seed
- **WHEN** the same level and seed are generated twice
- **THEN** the two exercises are identical byte for byte

#### Scenario: Swapped answer
- **WHEN** two ids in `answer.orderedBlockIds` are swapped
- **THEN** the validator rejects the exercise

#### Scenario: Trivial floor
- **WHEN** a three-or-more-block floor is reordered to the build order or its reverse
- **THEN** the validator rejects the exercise

#### Scenario: Duplicate colour
- **WHEN** two blocks share a colour
- **THEN** the validator rejects the exercise

### Requirement: Tap-to-place build with physical feedback and no wrong state
The renderer SHALL lay the shuffled blocks on the floor and build the answer by taps: a block tapped in order flies to its place (towers stack upward, centred; trains and skylines grow left to right on one baseline). A block tapped out of order SHALL be answered physically and silently: it is tried on the build, the build leans 8 degrees (an `Animated` rotate pivoting at its base) and the block springs back to the floor while the try-again cue plays. The passenger-car (`quantity`) train SHALL NOT use the lean. A wrong placement MUST NOT show any text and MUST NOT be reported through `onAnswer(false)`; the renderer reports the outcome only once, as `onAnswer(true)`, after the completion climb. Passenger cars SHALL show their dots with the shared `DotGroup` and be counted aloud (best-effort) as they join the train.

#### Scenario: Wrong block on a tower
- **WHEN** the child taps a block that is not the next one in build order while at least one block is already placed
- **THEN** the block moves up to the top of the tower, the tower leans 8° and settles back, the block slides back to its floor slot, the try-again cue plays, and no wrong answer is reported

#### Scenario: Wrong car on the passenger train
- **WHEN** the child taps a passenger car that is not the next one
- **THEN** the car is tried at the end of the train and slides back with the try-again cue, and the train does not lean

#### Scenario: Correct placement counted aloud
- **WHEN** the child places the next correct passenger car with 3 dots
- **THEN** the select cue plays, the car joins the train and the number clip for 3 is requested via the feedback channel (silently skipped if not bundled)

#### Scenario: Compare warm-up
- **WHEN** the child taps the bigger of the two L1 blocks
- **THEN** the exercise completes with Đô Đô hopping onto it; tapping the smaller block only lifts it briefly with the try-again cue

### Requirement: Completion climb
When the last block is placed (or the bigger block is chosen at L1) the renderer SHALL have Đô Đô — the shared `ExploreMascot` — climb the finished build one block per about 250ms (trains: shorter hops, then the whole train rolls off screen), cheer on top, and only then call `onAnswer(true)`. The climb plus cheer beat SHALL report within 1.5 seconds of the last placement. Under the system reduce-motion setting the renderer SHALL skip all movement, show Đô Đô on top and report within the same budget.

#### Scenario: Five-block tower
- **WHEN** the fifth block is placed on an L5 size tower
- **THEN** Đô Đô climbs five blocks at ~250ms each, cheers, and `onAnswer(true)` fires no later than 1.5s after the tap

#### Scenario: Reduced motion
- **WHEN** the system reports reduced motion and the build is completed
- **THEN** blocks snap into place, Đô Đô is shown on top without a climb, and `onAnswer(true)` fires within the same budget

### Requirement: Support escalation without revealing the answer
The renderer SHALL track its own slides per exercise and combine them with the play screen's `supportLevel` on the same scale (`max(supportLevel, min(2, floor(slides / 2)))`). At support level 1 (two slides, or `supportLevel` ≥ 1) the next correct block SHALL pulse (a static ring under reduced motion). At support level 2 the blocks that are clearly wrong SHALL dim so the child chooses between the next block and its neighbour in order; dimmed blocks stay tappable. Support state is memory-only and resets with every exercise.

#### Scenario: Two slides
- **WHEN** the child has slid two blocks back on the current exercise
- **THEN** the next correct block pulses until it is placed

#### Scenario: Support level two
- **WHEN** `supportLevel` is 2 and four blocks remain on the floor
- **THEN** the two blocks furthest from the next position dim and the next correct block pulses

### Requirement: Scene geometry fits the screen
Block and mascot geometry SHALL come from a pure layout (`layoutStackTowerScene`) sized from `useWindowDimensions` and the measured scene: every block and the whole build SHALL stay within 85% of the scene width, the finished build plus Đô Đô on top SHALL fit the scene height, floor slots and build slots SHALL never overlap, towers SHALL be centred and stack upward, and trains/skylines SHALL sit on a common baseline left to right. Small blocks SHALL keep a tap area of at least 48pt via hit slop.

#### Scenario: Small phone
- **WHEN** an L5 tower is laid out in a 280×250pt scene
- **THEN** all five blocks fit on the floor and in the tower, each narrower than 238pt, and Đô Đô's landing spot on the top block is inside the scene

#### Scenario: Tablet
- **WHEN** an L3 skyline is laid out in a 728×560pt scene
- **THEN** the columns stand left to right on one baseline within 619pt and the tallest column leaves room for Đô Đô on top

### Requirement: Offline, stateless, audio best-effort
`stack_tower` SHALL be bundled with generator, validator, config and the Đô Đô asset (`offlineCapable: true`, no remote dependency) and run as a progressive L1→L5 run owned by the play screen. The renderer SHALL keep every state in memory only (no persistence, analytics or lesson side effects). Prompt and feedback audio SHALL be best-effort: the per-dimension phrase and number clips are requested through the shared prompt-audio keys and a missing clip never blocks play; the renderer SHALL NOT carry its own prompt-replay control. The server catalog SHALL mirror the mobile bundled definition (versions, levels, manifest).

#### Scenario: Clips not yet bundled
- **WHEN** the Đợt 2 audio pack has not been generated
- **THEN** every level plays to completion with the on-screen prompt, the select/try-again cues and silent feedback channels

#### Scenario: Server mirror
- **WHEN** the server registry is asked for `stack_tower`
- **THEN** its config/generator/validator versions, levels and dependency manifest equal the mobile `STACK_TOWER_GAME`

### Requirement: Conformance contract
The game SHALL be covered by `mobile/scripts/verify-explore-stack-tower-contracts.cjs` (`npm run test:explore-stack-tower`) and `kido-server/src/modules/explore/explore.stack-tower.spec.ts`, which together prove: the level table, ≥ 200 seeds per level that validate and replay byte-identically with monotone ratios, unique colours and a non-trivial floor; tamper rejection (swapped answer, ratio under minimum, duplicate colour, out-of-range dots, trivial floor, moved level); ≥ 20% reach for every dimension across 300 one-exercise rounds; the layout bounds above across phone and tablet scenes; and the renderer rules (real mascot, no `onAnswer(false)`, 8° lean, try-again cue, climb budget, reduce motion, support pulse/dim, DotGroup, no persistence).

#### Scenario: Contract run
- **WHEN** `npm run test:explore-stack-tower` runs in `mobile/` and the server spec runs in `kido-server/`
- **THEN** both pass without network access or bundled audio clips
