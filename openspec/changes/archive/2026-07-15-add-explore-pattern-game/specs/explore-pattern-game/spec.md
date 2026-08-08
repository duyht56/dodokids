## ADDED Requirements

### Requirement: Supported pattern grammars
The game SHALL support AB, AAB, ABB and ABC token grammars, increasing/decreasing quantity patterns, and numeric sequences with step 1 or 2. Every exercise SHALL identify a versioned grammar and materialized sequence.

#### Scenario: AB pattern is materialized
- **WHEN** tokens A and B and grammar AB are selected
- **THEN** the visible sequence follows alternating A/B positions except for the single hidden slot

### Requirement: Unique missing answer
The generator SHALL hide only a position with sufficient context, and the independent validator SHALL enumerate permitted candidates and prove exactly one valid answer. Ambiguous or zero-answer sequences MUST NOT be delivered.

#### Scenario: Sequence is ambiguous
- **WHEN** more than one allowed token can complete the hidden position under the declared grammar
- **THEN** validation fails

### Requirement: Level-bounded attributes
Each level SHALL constrain the number and kind of token attributes being tested. Background, absolute position and incidental size MUST NOT act as answer clues unless a future approved grammar explicitly declares that attribute.

#### Scenario: Unintended size difference
- **WHEN** equivalent grammar tokens render at different sizes without size being the tested attribute
- **THEN** the exercise fails presentation validation

### Requirement: Pattern completion interaction
The renderer SHALL show the sequence and missing slot with approved shape/color/number/dot primitives, then accept a tap or configured drag of one answer token. Both interaction modes SHALL submit the same semantic token identity.

#### Scenario: Correct token is dragged
- **WHEN** the child drags the uniquely correct token into the empty slot
- **THEN** the renderer confirms the pattern and records the same answer identity as tap mode

### Requirement: Pattern conformance
The grammar/materializer/validator SHALL demonstrate at least 200 valid exercises across grammars, hidden positions, token vocabularies and levels with deterministic replay and uniqueness checks.

#### Scenario: Conformance corpus runs
- **WHEN** the pattern conformance suite executes
- **THEN** at least 200 exercises have exactly one answer and replay identically
