## ADDED Requirements

### Requirement: Seeded pair board
The game SHALL generate L1–L5 boards with respectively 2, 3, 4, 6 and 8 unique pairs by selecting approved identities, duplicating each exactly once and applying a seeded shuffle.

#### Scenario: Board validates
- **WHEN** a board is generated for L3
- **THEN** it contains 8 cards, exactly 4 identities and exactly two cards for each identity

### Requirement: Memory card interaction state
The mobile game SHALL allow at most two unmatched cards to be face-up, lock additional input while a pair resolves, keep matched cards resolved, and turn a mismatched pair back without negative language. Completing all pairs SHALL end the exercise naturally.

#### Scenario: Rapid third tap
- **WHEN** a child taps a third card while two cards are resolving
- **THEN** the third tap is ignored and board state remains consistent

### Requirement: No speed pressure or failure
The memory game SHALL have no countdown, time limit, losing state or move-based reward. Difficulty SHALL come from pair count and approved controlled similarity only.

#### Scenario: Child takes a long time
- **WHEN** the child leaves the board open longer than an expected duration
- **THEN** the game remains playable and does not declare failure

### Requirement: Memory asset eligibility
Assets SHALL be approved, single-object, recognizable, background-free and tagged `memoryEligible`. Low levels MUST reject variants likely to be confused as the same object; every selected pair identity MUST be distinct from other pairs.

#### Scenario: Similar variants at L1
- **WHEN** L1 sampling selects two variants of the same canonical object
- **THEN** the validator rejects the board and requests another bounded generation attempt

### Requirement: Responsive deterministic board
The card order SHALL remain stable across re-render/orientation changes, and supported layouts SHALL preserve minimum child touch targets for 4–16 cards using configured grids or scrolling when required.

#### Scenario: Orientation changes
- **WHEN** the device orientation changes during an exercise
- **THEN** card positions adapt without reshuffling identities or losing matched state

### Requirement: Memory generator conformance
The game SHALL demonstrate at least 200 valid boards across pair counts, asset pools and seeds, including replay equality, pair cardinality and similarity-policy tests.

#### Scenario: Conformance corpus runs
- **WHEN** the memory conformance suite executes
- **THEN** at least 200 boards validate and replay identically
