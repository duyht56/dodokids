# explore-quantity-compare-game

## Purpose

Defines the Explore quantity comparison interaction: choosing the side with more, fewer, or equal objects using a single canonical sprite, with deterministic level progression, fair symmetric presentation, explore-only outcome semantics and generator/validator conformance.

## Requirements

### Requirement: Quantity comparison modes
The game SHALL support selecting the side with more objects, fewer objects, or recognizing equal quantities. Both sides MUST use the same canonical object sprite and differ only in count and permitted arrangement.

#### Scenario: More mode
- **WHEN** left count is 3, right count is 5 and mode is `more`
- **THEN** the independently derived correct side is right

#### Scenario: Equal mode
- **WHEN** both counts are equal and equal mode is enabled
- **THEN** the exercise exposes an explicit equal response and validates only that response

### Requirement: Quantity comparison levels
The game SHALL enforce L1 range 5 with difference at least 2, L2 range 10 including difference 1, L3 range 20, L4 including equal cases, and L5 allowing different readable group arrangements without changing object identity.

#### Scenario: Equal generated below L4
- **WHEN** an L1–L3 exercise has equal counts
- **THEN** validation fails because equal mode is not enabled at that level

### Requirement: Fair symmetric presentation
The renderer and validator SHALL apply the same object size, surface, panel bounds and visual density policy to both sides. Side placement SHALL be seed-randomized and layout MUST NOT provide an unintended answer clue.

#### Scenario: Correct answer distribution is tested
- **WHEN** the conformance corpus is generated across many seeds
- **THEN** correct sides are not fixed to one position and both panels satisfy fairness bounds

### Requirement: Explore-only outcome semantics
The visual board MAY reuse the canonical `compare_tap` presentational component, but the Explore adapter SHALL keep outcomes only in the active in-memory run and SHALL NOT invoke persistence, analytics, lesson completion, XP, stars or streak behavior.

#### Scenario: Correct side selected
- **WHEN** the child answers an Explore quantity comparison correctly
- **THEN** the active run advances, lesson progress is unchanged and the outcome is not persisted

### Requirement: Comparison generator conformance
The generator/validator SHALL demonstrate at least 200 valid exercises spanning modes, levels, boundaries and sprite pools with deterministic replay and fairness checks.

#### Scenario: Conformance corpus runs
- **WHEN** the comparison conformance suite executes
- **THEN** at least 200 exercises validate and reproduce from versions and seeds
