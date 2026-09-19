## MODIFIED Requirements

### Requirement: Visual arithmetic modes
The game SHALL support add-then-count, remove-then-count, count-on from the larger addend, make-10 completion and two- or three-operand operations as a seed-deterministic `mode` discriminator selected from the exercise seed, alongside the add/subtract foundation. `count_on` SHALL start from the larger addend (operand order preserved) and count on the smaller along a number line. `make_10` SHALL complete the ten: the whole is 10 and the answer is the missing second part, presented on a ten-frame filled to the first part so the total is never shown. `three_operand` SHALL add three small operands. `tens_ones` SHALL be a place-value add or subtract within 50. Feedback SHALL animate the represented add/remove/count-on/split/place-value operation using the existing visual-math primitives rather than reveal only a symbolic equation.

#### Scenario: Remove objects
- **WHEN** an exercise starts with 7 objects and removes 3
- **THEN** the visual and independently derived result both show 4 remaining

#### Scenario: Count on from the larger addend
- **WHEN** a `count_on` exercise is generated
- **THEN** the first operand is greater than or equal to the second, the model is a single number-line count-on step to their sum, and the independently derived result equals that sum

#### Scenario: Make ten asks for the missing part
- **WHEN** a `make_10` exercise is generated with a first part of 6
- **THEN** the whole is 10, the answer the child must choose is 4 (the missing part), and the ten-frame shows the 6 filled with the total never displayed

### Requirement: Arithmetic safety constraints
The generator MUST NOT produce a negative intermediate/result or exceed the configured range, and every operand MUST be at least 1 (no "thêm 0" / "bớt 0"). Three-operand exercises MUST remain absent until L5 and each operand MUST stay small (≤ 6) with the sum within range; the Advanced range-50 mode MUST remain absent until L6. Reaching a level — 5 correct answers within the last 7 of the stateless promotion window — SHALL be the evidence gate that unlocks a strategy mode; no external configuration flag SHALL be required, and the exercise's derived `gates` (three-operand, advanced-50) SHALL be validated against the level and mode so a forged flag is rejected.

#### Scenario: Subtraction would be negative
- **WHEN** candidate operands would compute 3−5
- **THEN** the generator rejects the candidate and no exercise is delivered from it

#### Scenario: Three operands stay small and gated to L5
- **WHEN** a `three_operand` exercise is generated
- **THEN** it appears only at L5, has exactly three operands each between 1 and 6 with the sum within range, and its derived `gates.threeOperands` flag is set and validated

#### Scenario: Forged gate is rejected
- **WHEN** an exercise claims `gates.advanced50` at a level whose range is 20 or less
- **THEN** the validator rejects it

### Requirement: Arithmetic levels and scaffolding
The game SHALL configure a six-level ladder: L1 range 5 with add/remove objects, L2 range 10 with add/subtract count-all, L3 range 10 with count-on, L4 range 20 with make-10 completion, L5 range 20 with two/three operands, and L6 Advanced range 50 with tens–ones place value. `ARITHMETIC_LEVEL_ORDER` SHALL cover L1 through L6 and the stateless promotion window SHALL climb L1→L6. Range 20 SHALL include visual scaffolding; Advanced range 50 MUST use tens–ones, number line or an equivalent approved representation and MUST NOT be an abstract equation.

#### Scenario: Advanced exercise lacks scaffolding
- **WHEN** a range-50 exercise uses only an abstract equation
- **THEN** the validator rejects it

#### Scenario: Ladder ranges match BRD §7.6
- **WHEN** the arithmetic level ladder is inspected
- **THEN** the L1→L6 ranges are 5, 10, 10, 20, 20 and 50, with count-on at L3, make-10 at L4, three-operand at L5 and tens–ones at L6

## ADDED Requirements

### Requirement: Arithmetic interaction modes are round-variety buckets
Each mode a level can generate SHALL be declared as a round-variety bucket for that level (`bucketKey` = the mode), with a capacity sufficient for round planning, so that across chained one-exercise rounds every mode the level declares reaches the child. The variant key SHALL preserve operand order for the order-bearing modes (`subtract`, `count_on`, `tens_ones`) so a count-on or subtraction is not conflated with its commuted form.

#### Scenario: Every declared mode reaches the child
- **WHEN** one-exercise rounds are chained at a level with more than one mode
- **THEN** each declared mode is produced and served in at least a fair share of the rounds, and no generated mode is missing from the level's declared buckets

#### Scenario: Order-bearing modes keep operand order
- **WHEN** variant keys are computed for `count_on`, `subtract` and `tens_ones`
- **THEN** the operand order is preserved in the key so a count-on from the larger addend is distinct from its reverse

### Requirement: Arithmetic generator version tracks the mode set
Changing which interaction modes the seeded stream can produce SHALL bump the arithmetic `generatorVersion` and `validatorVersion` (and the config/manifest/dependency versions and the server metadata mirror), and replay-by-seed SHALL remain byte-identical within a version. Explore persists no play history, so a version bump with every mirror updated is the only coordination needed when the seeded stream changes.

#### Scenario: The seeded mode stream changes
- **WHEN** the set of modes the generator can produce from a seed is extended beyond add/subtract
- **THEN** the arithmetic `generatorVersion` and `validatorVersion` are bumped and every mirror (mobile config/manifest/dependency versions and server metadata) is updated

#### Scenario: Replay within a version
- **WHEN** the same seed and level are generated twice under one `generatorVersion`
- **THEN** the two exercises are byte-identical and the independent validator accepts each
