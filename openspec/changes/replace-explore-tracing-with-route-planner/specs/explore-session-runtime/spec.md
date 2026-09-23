## MODIFIED Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run. A finite game-owned run policy SHALL contain 5–10 interactions; games without an explicit policy retain their existing run-size behavior. A game MAY instead declare a continuous one-at-a-time run whose level progression and replay exclusions exist only while its play route is mounted. All run state SHALL NOT be persisted to local storage, secure storage, database, analytics or a remote service.

#### Scenario: Existing five-interaction game starts
- **WHEN** a registered game without a finite or continuous game-owned policy is opened
- **THEN** its current run-size and level-selection behavior remain unchanged

#### Scenario: Continuous route-planner run starts
- **WHEN** the registered `route_planner` game is opened
- **THEN** the shell generates one validated L1 puzzle and owns only the current mounted run's level, puzzle, commands, support state and replay exclusions

#### Scenario: Child exits during an interaction
- **WHEN** the child leaves the game and later opens it again
- **THEN** a new run starts at its initial interaction with a new random seed

#### Scenario: App process restarts
- **WHEN** the app is terminated during Explore and relaunched
- **THEN** no Explore run can be resumed or reconstructed

## ADDED Requirements

### Requirement: Continuous one-at-a-time generation
A continuous local run SHALL request and validate exactly one puzzle for presentation at a time. Successful completion SHALL apply the game's declared next-level rule and generate a fresh puzzle; an unsuccessful attempt SHALL retain the same puzzle for revision. Continuous generation SHALL stop immediately when the route unmounts.

#### Scenario: Continuous puzzle is completed
- **WHEN** the child successfully completes the active route-planner puzzle
- **THEN** the current puzzle is discarded and one fresh puzzle is generated at the declared next level

#### Scenario: Continuous puzzle is not completed
- **WHEN** execution is blocked, incomplete or missing an objective
- **THEN** the same puzzle remains active and no new random puzzle is substituted

#### Scenario: Continuous run exits
- **WHEN** the child leaves the route-planner screen
- **THEN** level, board seed, command queue, attempts, hints and replay exclusions are discarded

