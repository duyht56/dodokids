## MODIFIED Requirements

### Requirement: Authored prefilled part
Every normal-run slot SHALL declare a non-empty `prefilledPool` of distinct positive values, each smaller than its fixed whole. The generator SHALL draw exactly one prefilled part from that pool using the exercise seed, derive a positive complement and encode model operands as `[prefilledPart, complement]`. The pools of each five-slot block SHALL be authored so that every possible combination of draws still yields at least four distinct prefilled values; the run-policy validator SHALL verify this over every combination, not over the union of the pools, because the ten slots are generated independently.

#### Scenario: Whole 5 is authored with part 2
- **WHEN** the slot whose pool is `[2]` is generated
- **THEN** the visual model operands are `[2,3]` and both parts sum to 5

#### Scenario: Whole 5 review slot draws from its pool
- **WHEN** the slot whose pool is `[1,2,3,4]` is generated with a seed
- **THEN** the prefilled part is one of those values, the operands are `[prefilledPart, 5 - prefilledPart]` and the same seed replays byte-identically

#### Scenario: Pools that could collapse a block
- **WHEN** the run-policy validator evaluates a block whose pools admit a combination of draws with fewer than four distinct prefilled values
- **THEN** the policy is rejected and the game fails registration

### Requirement: Locked and tappable parts
The renderer SHALL show the authored first part in a locked `Có sẵn` room and a `Bé thêm` room whose default count is 0. The complete `Bé thêm` room SHALL be a tap target; each tap on its empty area adds exactly one object up to the whole, and each tap on an object already inside it removes exactly that object. No separate add, subtract or reset control SHALL be rendered, and no prompt or badge SHALL reveal the complement before a correct check.

#### Scenario: Child counts into the room
- **WHEN** the child taps the empty `Bé thêm` room twice
- **THEN** it shows two objects and the number 2 while the system-prefilled count remains unchanged

#### Scenario: Child takes an object back out
- **WHEN** the `Bé thêm` room shows three objects and the child taps one of them
- **THEN** it shows two objects and the number 2, the locked room is unchanged and nothing is reset

### Requirement: Child-authored complement check
The child SHALL choose how many objects to add and activate `Kiểm tra`. The child-added count MAY be lower or higher than the complement. Incorrect feedback SHALL identify only that the result is not enough or is too many and MUST NOT reveal the complement. An overfilled room SHALL keep its objects so the child corrects it object by object; it SHALL NOT reset to 0.

#### Scenario: Incorrect count is checked
- **WHEN** a child checks a count below the complement
- **THEN** the room remains editable, no answer is revealed and no correct callback is emitted

#### Scenario: Overfilled count is checked
- **WHEN** a child checks a count above the complement
- **THEN** the objects stay in the editable room, the feedback invites removing objects, the locked room is preserved and no answer is revealed

### Requirement: Phone-safe interaction hierarchy
The board SHALL use the `Bé thêm` room itself as the only add action and the objects inside it as the only remove action, with one full-width `Kiểm tra` button below. The board SHALL size its object tiles from the window and scroll when needed so that `Kiểm tra` and `Gộp lại` stay reachable on a 667pt-tall phone. Đô Đô's prompt bubble SHALL be the only instruction text: the board SHALL NOT repeat the instruction in a caption and SHALL show the revealed relationship sentence exactly once. The mascot SHALL be the shared `ExploreMascot` (cheering once the parts are recombined), and the renderer SHALL NOT render its own replay button because the play shell provides one.

#### Scenario: Board on an iPhone SE
- **WHEN** a whole-10 interaction with nine objects in one room is shown on a 375×667pt window
- **THEN** every tile stays a comfortable tap target and the `Kiểm tra` button can be reached without clipping

### Requirement: Deterministic and private conformance
The validator SHALL reject wrong slot totals, prefilled parts outside the slot's pool, inconsistent operands, non-positive complements, mismatched v4 versions and failed deterministic replay. Run state SHALL remain transient and SHALL NOT be persisted or transmitted.

#### Scenario: Prefilled part outside the slot pool
- **WHEN** a run-slot exercise is presented with a prefilled part that its slot pool does not contain
- **THEN** validation fails even if the operands still sum to the whole

## ADDED Requirements

### Requirement: Replay variety across runs
Consecutive `number_bond` runs SHALL differ. The run creator passes each slot the variant key of the previous run at the same index, and a slot whose pool contains more than one value SHALL NOT reopen with the prefilled part it used in the previous run. A slot with a single-value pool MAY repeat (fail-open; never an error).

#### Scenario: Child chooses "Chơi lượt mới"
- **WHEN** a new run starts right after a completed run
- **THEN** every slot with more than one pool value opens with a different prefilled part than before, block order 5→10 is kept and every exercise still validates against its slot pool
