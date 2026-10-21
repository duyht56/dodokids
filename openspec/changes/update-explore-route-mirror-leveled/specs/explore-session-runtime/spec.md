## MODIFIED Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run whose validated game-owned policy contains 5–10 interactions. Games without an explicit policy retain their existing run size, except that progressive games MAY declare a shorter run (memory match plays three boards). A game played in leveled rounds SHALL run as a sequence of rounds, each a validated batch of 4–10 boards at one level (see "Leveled rounds"). No game SHALL run continuously (one puzzle at a time with a level owned by the play route); Route Planner, the last such game, plays leveled rounds. Every run SHALL start from the parent's static starting level (or the game's first level) — progressive games play a consecutive window of levels from it, and leveled games play their first round at it. Run state SHALL NOT be persisted to local storage, secure storage, database, analytics or a remote service.

#### Scenario: Existing five-interaction game starts
- **WHEN** a registered game without an explicit run policy, a progressive run size or leveled rounds is opened
- **THEN** its current run-size and level-selection behavior remain unchanged apart from starting at the parent's static level

#### Scenario: Route Planner starts
- **WHEN** the registered `route_planner` game is opened
- **THEN** the shell generates a validated round of 6 boards at the parent's starting level and shows "Bậc x/5" with one dot per board, none filled on the first board

#### Scenario: Parent chose a starting level
- **WHEN** the static parent configuration names a level the game supports
- **THEN** a progressive run plays consecutive levels beginning there, clamped so the window stays inside the game's levels, and a leveled game plays its first round at that level

#### Scenario: Child exits during an interaction
- **WHEN** the child leaves the game and later opens it again
- **THEN** a new run starts at its initial interaction with a new random seed

#### Scenario: App process restarts
- **WHEN** the app is terminated during Explore and relaunched
- **THEN** no Explore run can be resumed or reconstructed

## ADDED Requirements

### Requirement: Leveled round rule per game
Each game that plays leveled rounds SHALL declare its rule: the owner's default is 6 boards, 4 right on the first try and 1 extra round; Soi gương (`mirror_build`) SHALL play 4 boards, 3 right on the first try and 1 extra round because each board is long; Cân thăng bằng keeps its own pass mark. Dẫn đường (`route_planner`) and Soi gương SHALL play leveled rounds with an intro line for each level above the first. The leveled-rounds contract SHALL hold an explicit expected rule for every leveled game, so a game cannot join with an undeclared rule. Stack tower and number bus SHALL keep their run model until the owner decides.

#### Scenario: Soi gương round
- **WHEN** a Soi gương round at level 2 ends with 3 of its 4 boards right on the first try
- **THEN** the next round is 4 new boards at level 3; with 2 of 4 the level is played once more, and a failed extra round ends the run

#### Scenario: Dẫn đường round
- **WHEN** a Dẫn đường round at level 1 ends with 4 of its 6 boards right on the first try
- **THEN** the header shows "Bậc 2/5" and the next round is 6 boards at level 2

### Requirement: Board-guidance games keep the board still
A game whose board shows its own guidance and fills the screen down to its controls (Dẫn đường) SHALL get no shell text under the board on a miss and no generic retry or hint voice (the renderer says what went wrong). The shell's praise and round lines for such a game SHALL be drawn over the top of the board while the board is locked, so the board never shrinks or grows to make room for them, and SHALL be hidden once the board is playable again.

#### Scenario: A failed run on Dẫn đường
- **WHEN** the child's run stops at an obstacle
- **THEN** the "try again" chime plays, Đô Đô's bubble says what happened, and nothing is added under the board

#### Scenario: A board is solved
- **WHEN** Đô Đô gets home
- **THEN** «Đúng rồi!» floats over the bubble while the board is locked and the board keeps its size

### Requirement: A pause never loses or misplaces a line
While the run is paused, an answer a renderer reports (its own clock ran on behind the exit card) SHALL make no chime, praise or board change; it SHALL be answered once play goes on, a miss before a success. A "try again" cue a renderer fires while paused SHALL be silent. When play goes on, the shell SHALL NOT read the board's question again if the board is solved or if, when the pause began, the renderer was saying its own line about the board asked for after the board's question (a closing line, a mantra, a failed run's guidance) — that renderer goes on instead; any other board SHALL hear its question again as before. A break reminder that the pause dropped before it started SHALL be said once play goes on, once.

#### Scenario: Success reported behind the exit card
- **WHEN** a renderer reports a solved board while the exit card is open
- **THEN** nothing chimes or praises and the board stays; after «Ở lại chơi» the chime and praise play and the next board comes

#### Scenario: Closing line cut by the exit card
- **WHEN** the child opens the exit card while the renderer is saying its closing line and then stays
- **THEN** the board's question is not read over the solved board

#### Scenario: Break reminder due behind the card
- **WHEN** the break reminder comes due while the exit card is open
- **THEN** it is said once after «Ở lại chơi», and not again after a later pause

## REMOVED Requirements

### Requirement: Continuous one-at-a-time generation
**Reason**: Route Planner, the only continuous game, plays leveled rounds; the play screen has no continuous mode left.
**Migration**: Route Planner boards come in validated rounds of 6 at one level (requirement "Leveled round rule per game").
