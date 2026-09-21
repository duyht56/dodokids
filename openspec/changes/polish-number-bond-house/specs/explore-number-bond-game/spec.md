## ADDED Requirements

### Requirement: House presentation
The `split_group` board SHALL present the whole as the roof of a house above the two rooms: the whole number SHALL sit inside the roof and the `Có sẵn` and `Bé thêm` rooms SHALL sit beneath it, so the part–whole relationship reads top-down (whole above, parts below). No separate total label row SHALL be shown. The roof SHALL be presentation only and SHALL NOT change the generator, validator, params, versions or run policy.

#### Scenario: A whole-5 interaction opens
- **WHEN** a `split_group` interaction for whole 5 is shown
- **THEN** the number 5 appears inside the roof above both rooms and no `Số cần tách` label row is rendered

#### Scenario: Replay is unchanged
- **WHEN** the same exercise seed is replayed after this change
- **THEN** the generated envelope is byte-identical to before and only its presentation differs

## MODIFIED Requirements

### Requirement: Locked and tappable parts
The renderer SHALL show the authored first part in a locked `Có sẵn` room and a `Bé thêm` room whose default count is 0. The `Bé thêm` room SHALL show one dashed empty `+` slot after its objects as the only add control; each tap on that slot adds exactly one object, and the slot SHALL NOT be shown once the room holds the whole. Tapping an object in the `Bé thêm` room SHALL take that one object back out. The room background SHALL NOT be a tap target, so an add can never land on an object. No separate add, subtract or reset button SHALL be rendered, and no prompt or badge SHALL reveal the complement before a correct check.

#### Scenario: Child counts into the room
- **WHEN** the child taps the empty `+` slot of the `Bé thêm` room twice
- **THEN** the room shows two objects and the number 2 with a new empty slot after them, while the system-prefilled count remains unchanged

#### Scenario: Child takes one object back
- **WHEN** the child taps one of the objects in the `Bé thêm` room
- **THEN** the count decreases by exactly one and no wrong or lose state is shown

#### Scenario: Room holds the whole
- **WHEN** the `Bé thêm` room holds as many objects as the whole
- **THEN** no empty `+` slot is shown

### Requirement: Child-authored complement check
The child SHALL choose how many objects to add and activate `Kiểm tra`. The child-added count MAY be lower or higher than the complement. Incorrect feedback SHALL identify only that the result is not enough or is too many and MUST NOT reveal the complement.

#### Scenario: Incorrect count is checked
- **WHEN** a child checks a count below the complement
- **THEN** the room remains editable, no answer is revealed and no correct callback is emitted

#### Scenario: Overfilled count is checked
- **WHEN** a child checks a count above the complement
- **THEN** the child's objects are kept, the feedback asks the child to take some back by tapping them, the room is never reset to 0, the locked room is preserved and no answer is revealed

### Requirement: Phone-safe interaction hierarchy
The board SHALL use the `Bé thêm` room's empty `+` slot as the only add action and provide one full-width `Kiểm tra` button below the rooms. `Kiểm tra`, `Gộp lại` and `Tiếp tục` SHALL each be at least 64pt tall. Labels, objects, counts, the roof and the buttons MUST remain readable and MUST NOT overlap.

#### Scenario: Board renders on a narrow phone
- **WHEN** a whole-10 interaction is shown on a 375pt-wide phone with the `Bé thêm` room nearly full
- **THEN** the roof, both rooms, the empty slot and the `Kiểm tra` button are all visible without overlapping, and each call-to-action button is at least 64pt tall
