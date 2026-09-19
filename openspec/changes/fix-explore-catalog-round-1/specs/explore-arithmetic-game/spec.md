## MODIFIED Requirements

### Requirement: Arithmetic safety constraints
The generator MUST NOT produce a negative intermediate/result or exceed the configured range. Every operand SHALL be at least 1: the generator MUST NOT produce an addition of 0 ("thêm 0") or a subtraction of 0 ("bớt 0"), and the validator SHALL reject any exercise whose operand after the first is 0 even when the visual model is otherwise consistent. Three operands MUST remain disabled until L5 and an explicit config/evidence gate permits them.

#### Scenario: Subtraction would be negative
- **WHEN** candidate operands would compute 3−5
- **THEN** the generator rejects the candidate and no exercise is delivered from it

#### Scenario: Subtraction of nothing
- **WHEN** an L1–L5 subtraction exercise is generated from any seed
- **THEN** the amount taken away is at least 1 and at most the starting amount, so the prompt never reads "bớt 0" and the result is never negative

#### Scenario: Zero operand is injected
- **WHEN** an exercise whose model is `[5, 0]` with a consistent `removeGroup` step is submitted to the validator
- **THEN** validation fails

### Requirement: Arithmetic conformance
The generator and validator SHALL demonstrate at least 200 valid exercises per level with deterministic replay. The conformance suite SHALL check, for every exercise, that replay by seed is byte-identical, that no operand after the first is 0, that a subtraction prompt ends with "Còn lại bao nhiêu?", that the three answer options are unique, inside `[0, maxRange]` and include the answer, and that the answer is not the middle value of the sorted options in at least 45% of exercises. It SHALL also chain 300 one-exercise rounds per level through the local provider the way the play screen does (exclusion window, last bucket, rotation) and require both `add` and `subtract` to reach the child in at least 25% of rounds.

#### Scenario: Conformance corpus runs
- **WHEN** the arithmetic conformance suite executes
- **THEN** at least 200 exercises per level pass range, operand, prompt, option, animation and replay checks

#### Scenario: One mode starves in one-exercise rounds
- **WHEN** chained one-exercise rounds serve `add` or `subtract` in fewer than 25% of rounds at any level
- **THEN** the conformance suite fails

## ADDED Requirements

### Requirement: Arithmetic prompt copy
The written prompt SHALL ask the question that matches the operation: an addition reads "Có A, thêm B. Có tất cả bao nhiêu?" and a subtraction reads "Có A, bớt B. Còn lại bao nhiêu?". The spoken prompt keys SHALL make the same split (`arith_total_q` for addition, `arith_remain_q` for subtraction) so the written and spoken question never disagree.

#### Scenario: Subtraction prompt
- **WHEN** an exercise has operands 5 and 2 in `subtract` mode
- **THEN** `promptVi` is "Có 5, bớt 2. Còn lại bao nhiêu?" and `audioRefs` ends with the `arith_remain_q` phrase key

#### Scenario: Addition prompt
- **WHEN** an exercise has operands 3 and 2 in `add` mode
- **THEN** `promptVi` is "Có 3, thêm 2. Có tất cả bao nhiêu?" and `audioRefs` ends with the `arith_total_q` phrase key

#### Scenario: Prompt is tampered
- **WHEN** a subtraction exercise is submitted with its question replaced by "Có tất cả bao nhiêu?"
- **THEN** validation fails

### Requirement: Arithmetic answer choices
Each exercise SHALL offer exactly three unique answer options inside `[0, maxRange]` that include the answer. Distractors SHALL be drawn from the shared near-target pool, and when at least one typical-error value is in range — an operand itself (stopped after the first group, or took nothing away) or the result off by one (a miscount) — one distractor SHALL be such a value. The answer MUST NOT be the middle value of the sorted options so consistently that the middle card becomes a tell. Option generation SHALL be deterministic by seed and the validator SHALL accept exactly what the generator produces.

#### Scenario: Typical-error distractor
- **WHEN** the exercise is 4 + 3 with range 10
- **THEN** the options contain 7 and at least one of 4, 3, 6 or 8

#### Scenario: Options are tampered
- **WHEN** an exercise is submitted with a duplicated option or without the answer among its options
- **THEN** validation fails

### Requirement: Arithmetic answer interaction
The renderer SHALL show the operands line and the visual scene, and SHALL present Đô Đô (the shared Explore mascot, never an emoji placeholder) thinking while the child answers and cheering once the correct card is chosen. A wrong card SHALL shake once, grey out and stay locked for the rest of the exercise so it cannot be tapped again; taps that arrive while an answer tap is still being shown, or while the exercise is disabled, SHALL be ignored. The renderer MUST NOT carry its own prompt-replay control; the play screen's top-bar replay serves every exercise that carries `audioRefs`. None of this interaction state SHALL outlive the exercise.

#### Scenario: Wrong card is tapped
- **WHEN** the child taps a card that is not the answer
- **THEN** the card shakes, is greyed out and no longer accepts taps, and the other cards remain available after the tap cool-down

#### Scenario: Cards are mashed
- **WHEN** the child taps two cards within the tap cool-down window
- **THEN** only the first tap is answered

#### Scenario: Correct card is tapped
- **WHEN** the child taps the answer
- **THEN** Đô Đô cheers, every card locks, and the play screen moves to the next exercise
