## ADDED Requirements

### Requirement: Number bond modes
The game SHALL support splitting one object group into two parts, finding a missing part, finding distinct partitions of one total, and partitioning to make 10. Every accepted part pair MUST be non-negative and sum to the displayed total.

#### Scenario: Missing part is generated
- **WHEN** total is 7 and the visible part is 5
- **THEN** the independently derived missing part is 2

### Requirement: Number bond levels
The game SHALL configure L1 partitions within 5 using objects, L2 within 10, L3 missing-part tasks, L4 multiple valid partitions, and L5 make-10 tasks. Modes not enabled for a level MUST NOT be generated.

#### Scenario: L1 exercise is generated
- **WHEN** an L1 number-bond exercise is requested
- **THEN** total is at most 5 and the visual representation uses countable objects or dots

### Requirement: Multi-answer partition validity
For a multiple-partition exercise, the validator SHALL derive the complete allowed partition set under the configured symmetry policy and SHALL accept distinct valid pairs while rejecting duplicates and pairs with the wrong total.

#### Scenario: Reversed partition under unordered policy
- **WHEN** the child has already supplied 2+5 for total 7 and then supplies 5+2
- **THEN** the second pair is treated as the same partition rather than new progress

### Requirement: Deterministic visual representation
The exercise SHALL use an approved representation from objects, dots, ten-frame or number cards, and its split/group animation SHALL be derived from the same numeric model as the answer.

#### Scenario: Visual model conflicts with answer
- **WHEN** a payload displays 7 objects but declares total 8
- **THEN** the validator rejects the exercise before delivery

### Requirement: Number bond conformance
The generator and validator SHALL demonstrate at least 200 valid exercises across levels, totals, modes and representations with deterministic replay.

#### Scenario: Conformance corpus runs
- **WHEN** the number-bond conformance suite executes
- **THEN** at least 200 exercises pass arithmetic, visual-model and replay checks
