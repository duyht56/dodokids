## Purpose

Defines the offline spatial-planning game in which a child composes arrow commands to guide Đô Đô through a validated grid, complete level-specific objectives and reach home without persistent play history.

## ADDED Requirements

### Requirement: Versioned local route puzzle
The game SHALL generate each puzzle locally from a versioned rule set and random seed. A puzzle SHALL declare its grid bounds, start, destination, blocked cells, ordered objectives, command limit and level, and SHALL require no network response or remote asset to become playable.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `route_planner` with compatible bundled dependencies and no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed and version are replayed in a test
- **WHEN** the generator receives the same level, seed and generator version
- **THEN** it produces the same pedagogical board topology and objective contract

### Requirement: Independent solvability validation
Every generated puzzle SHALL pass an independent validator before presentation. The validator SHALL confirm that all declared cells are in bounds, required cells are distinct and traversable, objectives can be completed in their declared order, and at least one legal command sequence reaches the destination within the configured command limit. Multiple valid routes MAY be accepted.

#### Scenario: Generated board is unsolvable
- **WHEN** no legal command sequence can satisfy the objectives and reach the destination within the command limit
- **THEN** the board is rejected before presentation and generation retries only within a bounded attempt limit

#### Scenario: Equivalent route also solves the puzzle
- **WHEN** the child submits a legal route different from the generator's construction route but satisfying every objective and reaching the destination
- **THEN** the puzzle is completed successfully

### Requirement: Compose then execute commands
The planning state SHALL let the child append `up`, `down`, `left` and `right` commands, undo the last command, clear the queue and explicitly start execution. Adding a command SHALL NOT move Đô Đô before execution starts, and the queue SHALL NOT exceed the puzzle's visible command limit.

#### Scenario: Child edits a planned route
- **WHEN** the child adds commands and then selects undo or clear before execution
- **THEN** the command queue changes while Đô Đô remains at the start cell

#### Scenario: Command queue is full
- **WHEN** the queue has reached the puzzle's command limit
- **THEN** additional direction commands are not added and the existing plan remains editable

### Requirement: Stepwise board execution
Execution SHALL apply queued commands in order and visibly move Đô Đô one grid cell at a time. Direction controls and queue editing SHALL be disabled while execution is active. A move outside the grid or into a blocked cell SHALL stop at the last valid cell with neutral guidance and SHALL NOT create a losing state.

#### Scenario: Route hits a blocked cell
- **WHEN** the next command would move Đô Đô onto an obstacle
- **THEN** execution stops before the obstacle, identifies the blocked step neutrally and returns to an editable planning state on the same puzzle

#### Scenario: Route ends before home
- **WHEN** all queued commands execute legally but Đô Đô has not reached the destination
- **THEN** the game shows the current position and lets the child revise the route on the same puzzle

### Requirement: Objective-aware completion
A puzzle SHALL complete only when Đô Đô reaches the destination after satisfying every declared objective in order. Visiting the destination early SHALL NOT complete the puzzle and SHALL preserve the same board for another attempt.

#### Scenario: Required star is collected
- **WHEN** Đô Đô visits the star before reaching home on a star-level puzzle
- **THEN** the star is marked collected and reaching home completes the puzzle

#### Scenario: Destination is reached without the required objective
- **WHEN** Đô Đô reaches home without first collecting the required star, key or ordered checkpoint
- **THEN** the game gives neutral objective guidance and does not complete the puzzle

### Requirement: Five-level route progression
The game SHALL define five increasing levels while retaining a maximum visible queue of eight commands: L1 uses short unobstructed routes; L2 adds turns and static obstacles; L3 requires one star before home; L4 requires a key before passing its door or completing the route; and L5 requires two declared objectives in order before home. Completing a puzzle SHALL advance one level until L5, and later successes SHALL continue with fresh L5 puzzles until exit.

#### Scenario: Child completes an L3 puzzle
- **WHEN** the child collects the star and reaches home on a valid L3 route
- **THEN** the next fresh puzzle is generated at L4

#### Scenario: Child completes an L5 puzzle
- **WHEN** the child satisfies the ordered objectives and reaches home at L5
- **THEN** the next fresh puzzle is another non-repeated L5 variant

### Requirement: Semantic route variety
Puzzle variety SHALL distinguish pedagogical topology using level, grid shape, start, destination, obstacles and ordered objectives. Cosmetic color, animation timing and command-button layout SHALL NOT create a new semantic variant. Immediate replay exclusion SHALL exist only in the mounted run.

#### Scenario: Only board colors differ
- **WHEN** two generated puzzles have the same topology and objective order but different cosmetic colors
- **THEN** they share the same semantic variant identity

#### Scenario: Fresh puzzle is requested
- **WHEN** a completed puzzle advances to the next puzzle in the mounted run
- **THEN** the generator avoids the immediately used semantic variant when another valid variant is available

### Requirement: Non-punitive visual-first support
The game SHALL have no timer, score penalty or lose state. A blocked, incomplete or objective-missing route SHALL preserve the puzzle and provide concise visual guidance; after repeated unsuccessful executions the game SHALL identify the first blocked or unmet step without revealing an entire solution.

#### Scenario: Child repeatedly submits an incomplete route
- **WHEN** the active puzzle reaches its configured support threshold
- **THEN** the game highlights the first actionable problem and keeps planning controls available

### Requirement: Responsive accessible controls
The board, command queue and primary actions SHALL remain usable without horizontal scrolling at supported phone widths down to 320 points. Direction and run controls SHALL have at least 48-by-48-point touch targets and accessible labels that do not rely on color alone.

#### Scenario: Game renders on a narrow phone
- **WHEN** the route planner is shown at a 320-point viewport width
- **THEN** the entire board width, eight command slots and primary controls remain reachable without horizontal scrolling or clipped labels

### Requirement: Optional non-blocking instruction audio
Instruction audio MAY auto-play and be replayed when an approved bundled clip exists. Missing or failed audio MUST NOT block board generation, command planning, execution or completion because the visual interaction carries the full puzzle construct.

#### Scenario: Bundled instruction audio is unavailable
- **WHEN** the game starts offline without a matching optional instruction clip
- **THEN** the visual prompt and complete route-planning interaction remain playable

