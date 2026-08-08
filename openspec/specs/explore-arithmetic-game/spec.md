# Explore Arithmetic Game

## Purpose

Define the deterministic, visually scaffolded and offline-capable arithmetic game used in Explore.

## Requirements

### Requirement: Visual arithmetic modes
The game SHALL support add-then-count, remove-then-count, count-on from the larger addend, make-10 decomposition and two- or three-operand operations. Feedback SHALL animate the represented add/remove/split operation rather than reveal only a symbolic equation.

#### Scenario: Remove objects
- **WHEN** an exercise starts with 7 objects and removes 3
- **THEN** the visual and independently derived result both show 4 remaining

### Requirement: Arithmetic safety constraints
The generator MUST NOT produce a negative intermediate/result or exceed the configured range. Three operands MUST remain disabled until L5 and an explicit config/evidence gate permits them.

#### Scenario: Subtraction would be negative
- **WHEN** candidate operands would compute 3−5
- **THEN** the generator rejects the candidate and no exercise is delivered from it

### Requirement: Arithmetic levels and scaffolding
The game SHALL configure L1 range 5 with add/remove objects, L2 range 10 with count-all, L3 range 10 with count-on, L4 range 20 with decomposition/make-10, L5 range 20 with two/three operands, and optional Advanced range 50. Range 20 SHALL include visual scaffolding; Advanced 50 MUST use tens-ones, number line or an equivalent approved representation.

#### Scenario: Advanced exercise lacks scaffolding
- **WHEN** a range-50 exercise uses only an abstract equation
- **THEN** the validator rejects it

### Requirement: Deterministic semantic animation
Exercise payloads SHALL contain only versioned semantic animation steps supported by the renderer. The validator SHALL verify that each step preserves the canonical operand/result model; arbitrary executable animation code MUST NOT be accepted.

#### Scenario: Invalid remove step
- **WHEN** an animation step removes more objects than are present
- **THEN** validation fails before delivery

### Requirement: Arithmetic conformance
The generator and validator SHALL demonstrate at least 200 valid exercises across modes, levels, boundary values, operand counts and representations with deterministic replay.

#### Scenario: Conformance corpus runs
- **WHEN** the arithmetic conformance suite executes
- **THEN** at least 200 exercises pass range, intermediate-result, representation, animation and replay checks
