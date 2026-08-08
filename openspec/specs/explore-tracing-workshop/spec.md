# Explore Tracing Workshop

## Purpose

Define the versioned vector content, local tracing evaluator, progressive guidance, privacy boundary and pedagogical constraints for Explore tracing practice.

## Requirements

### Requirement: Versioned tracing path pack
The system SHALL provide reviewed, versioned vector paths for basic straight/diagonal/curved/hook/loop/zigzag strokes, simple routes/mazes, basic shapes, digits 0–9, Latin A–Z/a–z and Vietnamese-specific Ă/Â/Đ/Ê/Ô/Ơ/Ư upper/lowercase glyphs. Each item SHALL define ordered strokes, start/direction cues, bounds and tolerance metadata.

#### Scenario: Path pack item is invalid
- **WHEN** a path has non-finite coordinates, leaves its viewBox, omits required start data or uses an invalid stroke order
- **THEN** pack validation fails and the item cannot be enabled

### Requirement: Progressive tracing evaluation
The mobile evaluator SHALL assess ordered-stroke progress using a level-scaled corridor and direction/progress constraints. It SHALL not accept jumping directly to the end and SHALL preserve previously completed strokes after a local deviation.

#### Scenario: Child leaves current corridor
- **WHEN** the gesture deviates beyond the allowed corridor on the current stroke
- **THEN** only the current local segment requests guidance and completed strokes remain complete

### Requirement: Tracing levels
The workshop SHALL configure L1 single strokes with wide corridor and magnetism, L2 two-stroke combinations with multiple guides, L3 basic shapes, L4 fully guided letters/digits, and L5 letters/digits with fewer guides and tighter tolerance.

#### Scenario: L1 is selected
- **WHEN** an L1 item starts
- **THEN** it uses a single simple stroke with the widest configured assistance profile

### Requirement: Escalating non-punitive guidance
Repeated difficulty SHALL animate the next direction, highlight the nearest valid continuation, widen tolerance or enable configured snap support. The workshop SHALL have no losing state and SHALL not reset the whole item as punishment.

#### Scenario: Multiple deviations occur
- **WHEN** the child repeatedly leaves the current stroke corridor
- **THEN** support escalates and the child can continue from the current stroke

### Requirement: Vietnamese diacritic order
For Vietnamese glyphs with diacritics, the path definition and evaluator SHALL complete the base letter body before additional marks unless an explicitly reviewed glyph exception exists.

#### Scenario: Vietnamese glyph is traced
- **WHEN** the child traces `Ă`
- **THEN** the evaluator expects the `A` body before the breve strokes

### Requirement: No tracing persistence
Tracing coordinates, path choice, completion, tries, hints, duration and progress/error summaries SHALL exist only in memory while the exercise is mounted. They MUST NOT be written to storage, analytics or a server.

#### Scenario: Tracing exercise exits
- **WHEN** an item completes, exits or unmounts
- **THEN** all tracing play data is discarded and re-entry starts from the beginning

### Requirement: Fine-motor pedagogical boundary
Letter tracing SHALL be described only as fine-motor/form-familiarity practice. Instructions MUST NOT require sound identification, letter naming, phonics, spelling or claim reading competence, and no tracing evidence SHALL appear in parent reports.

#### Scenario: Letter tracing is presented
- **WHEN** a child opens a letter path
- **THEN** copy remains within fine-motor/form familiarity and no report or history is created

### Requirement: Tracing conformance and device verification
The evaluator and path pack SHALL include geometric boundary tests plus representative phone/tablet gesture tests for every category before enablement.

#### Scenario: Category is enabled
- **WHEN** an operator enables letter tracing
- **THEN** its reviewed pack version has passed schema, geometry and representative-device verification
