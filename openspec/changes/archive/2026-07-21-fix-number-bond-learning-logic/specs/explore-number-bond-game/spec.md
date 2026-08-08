## MODIFIED Requirements

### Requirement: Number bond normal run
A normal `number_bond` run SHALL contain exactly ten scaffolded split/recombine interactions. Interactions 1–5 MUST use whole 5 and interactions 6–10 MUST use whole 10. Every slot MUST declare one positive prefilled part smaller than the whole. The range transition and anchors MUST NOT depend on answers, tries, hints, identity or persisted evidence.

#### Scenario: Fresh run is generated
- **WHEN** a child starts `number_bond`
- **THEN** the provider returns exactly ten validated `split_group` exercises, the first five with total 5 and the last five with total 10

#### Scenario: Anchors are inspected
- **WHEN** either five-slot block is validated
- **THEN** every prefilled part is positive and smaller than its total and at least four distinct anchors appear

### Requirement: Scaffolded complement interaction
Each normal-run interaction SHALL render one locked system-prefilled part and one child-editable part whose default count is 0. Tapping the editable room itself SHALL add exactly one object. No separate add, subtract or reset control SHALL be rendered.

#### Scenario: Interaction opens
- **WHEN** whole 5 has prefilled part 2
- **THEN** the locked room shows two objects, the child room shows zero and no text or source count reveals that the complement is 3

#### Scenario: Child taps the editable room
- **WHEN** the child room shows 0 and the child taps it twice
- **THEN** it shows two countable objects and the number 2 while the locked room remains unchanged

### Requirement: Child-authored complement check
The child SHALL decide how many objects to add and explicitly activate `Kiểm tra`. The editable room MAY temporarily make the combined count lower or higher than the target whole. Incorrect feedback SHALL identify only `chưa đủ` or `nhiều hơn` and MUST NOT reveal the required complement.

#### Scenario: Child enters too few objects
- **WHEN** whole 5 has prefilled part 2 and the child checks 2 added objects
- **THEN** the game coaches that the result is not enough, remains editable and does not reveal 3

#### Scenario: Child enters too many objects
- **WHEN** whole 5 has prefilled part 2 and the child checks 4 added objects
- **THEN** the game coaches the child to count again, resets the editable room to 0 and does not reveal 3

### Requirement: Untimed conceptual completion
A correct check SHALL reveal the visual and spoken relationship `N gồm A và B`. The relationship SHALL remain visible until the child explicitly recombines the parts. The recombined explanation SHALL then remain visible until the child explicitly activates `Tiếp tục`; only that action MAY report success.

#### Scenario: Complement is completed
- **WHEN** the child checks 3 added objects with prefilled `2` for whole `5`
- **THEN** the board shows `5 gồm 2 và 3` and offers `Gộp lại` without a timer or automatic advance

#### Scenario: Parts are recombined
- **WHEN** the child activates `Gộp lại`
- **THEN** the whole 5 and recombined explanation remain visible until `Tiếp tục`, which emits the correct callback exactly once

### Requirement: Phone-safe visual hierarchy
The board SHALL label the locked and editable parts as `Có sẵn` and `Bé thêm`, make the complete `Bé thêm` room a large tap target, and render only one full-width `Kiểm tra` button below the rooms. Controls MUST NOT cover object groups or counts.

#### Scenario: Board is rendered on a phone
- **WHEN** a whole-10 interaction wraps objects over multiple rows
- **THEN** both rooms, their labels, counts and the primary action remain readable without overlap

### Requirement: Ten-interaction conformance
Conformance SHALL verify exact totals 5/10, authored prefilled parts, locked-part reducer behavior, deterministic replay, v4 version parity and exactly-once completion after recombination.
