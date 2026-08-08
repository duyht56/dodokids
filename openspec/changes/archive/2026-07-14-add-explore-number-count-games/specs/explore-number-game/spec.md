## ADDED Requirements

### Requirement: Number game modes
The number game SHALL support hear-and-select, match-sample, before-or-after, missing-number and order 3–5 number-card modes. Each exercise SHALL have an answer uniquely derivable from its displayed/audio parameters.

#### Scenario: Missing-number exercise
- **WHEN** the generator creates a missing-number sequence
- **THEN** the validator confirms the visible sequence has exactly one valid missing value in range

### Requirement: Number level progression
The game SHALL configure L1 as 1–5, L2 as 1–10, L3 as 1–20, L4 as before/after/missing/order within 20, and L5 as 1–50 with longer sequences. A level SHALL only select modes enabled for that level.

#### Scenario: L1 is generated
- **WHEN** an L1 number exercise is requested
- **THEN** all numbers and answers are within 1–5 and no L4/L5-only mode is used

### Requirement: Meaningful number distractors
Selection modes SHALL generate unique distractors near the target and within the configured range. Distractors MUST exclude the answer and MUST NOT be arbitrary distant values when closer valid values exist.

#### Scenario: Target is near range boundary
- **WHEN** target 1 is generated in range 1–5
- **THEN** distractors remain unique and in range without duplicating target

### Requirement: Number primitive and audio use
The game SHALL render approved number-card primitives and resolve fixed audio templates for number names 0–50; it SHALL not require per-exercise images or manually authored questions.

#### Scenario: Exercise assets resolve
- **WHEN** a valid number exercise is delivered
- **THEN** every number card is a deterministic primitive and instruction audio resolves from a stable template key

### Requirement: Audio-gated offline declaration
The game SHALL remain `offlineCapable=false` while any required Vietnamese number/instruction audio dependency is remote or missing. It SHALL become offline-capable only after the approved `0–50` audio pack is bundled and passes offline playback verification.

#### Scenario: Audio pack is not bundled
- **WHEN** the local generator and validator are installed but required number audio is unavailable locally
- **THEN** the catalog marks the game online-required without disabling local exercise generation

### Requirement: Number generator conformance
The game generator and independent validator SHALL demonstrate at least 200 valid deterministic exercises across modes, levels and boundary values, with replay equality for every case.

#### Scenario: Conformance corpus runs
- **WHEN** the number-game property/conformance test runs at a fixed generator version
- **THEN** at least 200 exercises validate and reproduce from their recorded seeds
