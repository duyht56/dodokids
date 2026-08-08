# explore-number-bond-game Specification

## Purpose

Defines the child-facing `Ngôi nhà tách gộp` experience for composing and decomposing the benchmark wholes 5 and 10 with concrete objects.

## Requirements

### Requirement: Fixed ten-interaction run
A normal `number_bond` run SHALL contain exactly ten `split_group` interactions. Interactions 1–5 MUST use whole 5 and interactions 6–10 MUST use whole 10. The ordered slots MUST NOT depend on answers, tries, hints, child identity or persisted history.

#### Scenario: Fresh run is generated
- **WHEN** a child starts `number_bond`
- **THEN** exactly ten independently validated exercises are returned, with totals `[5,5,5,5,5,10,10,10,10,10]`

### Requirement: Authored prefilled part
Every normal-run slot SHALL declare one positive `prefilledPart` smaller than its fixed whole. The generator SHALL derive a positive complement and encode model operands as `[prefilledPart, complement]`. Each five-slot block SHALL expose at least four distinct prefilled values.

#### Scenario: Whole 5 is authored with part 2
- **WHEN** the slot is generated
- **THEN** the visual model operands are `[2,3]` and both parts sum to 5

### Requirement: Locked and tappable parts
The renderer SHALL show the authored first part in a locked `Có sẵn` room and a `Bé thêm` room whose default count is 0. The complete `Bé thêm` room SHALL be a tap target; each tap adds exactly one object up to the whole. No separate add, subtract or reset control SHALL be rendered, and no prompt or badge SHALL reveal the complement before a correct check.

#### Scenario: Child counts into the room
- **WHEN** the child taps the empty `Bé thêm` room twice
- **THEN** it shows two objects and the number 2 while the system-prefilled count remains unchanged

### Requirement: Child-authored complement check
The child SHALL choose how many objects to add and activate `Kiểm tra`. The child-added count MAY be lower or higher than the complement. Incorrect feedback SHALL identify only that the result is not enough or is too many and MUST NOT reveal the complement.

#### Scenario: Incorrect count is checked
- **WHEN** a child checks a count below the complement
- **THEN** the room remains editable, no answer is revealed and no correct callback is emitted

#### Scenario: Overfilled count is checked
- **WHEN** a child checks a count above the complement
- **THEN** the editable room resets to 0 for a fresh recount, the locked room is preserved and no answer is revealed

### Requirement: Untimed conceptual completion
A correct check SHALL reveal `N gồm A và B` with both concrete groups visible. The reveal SHALL remain until `Gộp lại`. The recombined whole and explanation SHALL then remain until `Tiếp tục`. Only `Tiếp tục` SHALL emit completion, exactly once.

#### Scenario: Complement of 2 for whole 5 is completed
- **WHEN** the child checks three objects in `Bé thêm`
- **THEN** the renderer shows `5 gồm 2 và 3` and enables `Gộp lại` without a timer or automatic advance

#### Scenario: Recombination completes
- **WHEN** the child activates `Gộp lại`
- **THEN** the whole is shown again until the child activates `Tiếp tục`, which emits the correct callback exactly once

### Requirement: Concept-first presentation
Countable objects and spoken whole-part language SHALL precede arithmetic notation. Whole-10 interactions MAY show `A + B = 10` only after the concrete relationship has been revealed.

### Requirement: Phone-safe interaction hierarchy
The board SHALL use the `Bé thêm` room itself as the only add action and provide one full-width `Kiểm tra` button below it. Labels, objects, counts and the button MUST remain readable and MUST NOT overlap.

### Requirement: Deterministic and private conformance
The validator SHALL reject wrong slot totals, invalid prefilled parts, inconsistent operands, non-positive complements, mismatched v4 versions and failed deterministic replay. Run state SHALL remain transient and SHALL NOT be persisted or transmitted.
