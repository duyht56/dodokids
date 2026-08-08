## ADDED Requirements

### Requirement: Scrambled draggable items and numbered slots
The system SHALL display the `payload.items` (3–5) in scrambled order as draggable cards and provide numbered drop slots (1, 2, 3…). Layout follows `payload.direction`: `horizontal` shows a row of slots, `vertical` shows a stacked list.

#### Scenario: Items start scrambled
- **WHEN** a sort-sequence activity mounts
- **THEN** the item cards appear in an order different from their `correctPosition` order, with numbered target slots shown

#### Scenario: Vertical direction
- **WHEN** `direction` is `vertical`
- **THEN** items render as a stacked, reorderable vertical list

### Requirement: Drag and drop reorder
The system SHALL let the child drag a card into a slot using a gesture with a drag threshold of ≥8pt to start the drag, a lifted state (scale ~1.05, raised shadow, coral accent) while dragging, and a 48pt snap tolerance to drop into the nearest slot.

#### Scenario: Lift on drag start
- **WHEN** the child presses and moves a card beyond the 8pt threshold
- **THEN** the card enters a lifted state and follows the finger

#### Scenario: Snap to nearest slot
- **WHEN** the card is released within 48pt of a slot
- **THEN** the card snaps into that slot

### Requirement: Order validation
A "Kiểm tra thứ tự" confirm button SHALL validate the arrangement by comparing each item's slot index against its `correctPosition`. Correct positions SHALL light up green sequentially; wrong positions SHALL be marked (amber) and shake, and a "Xáo lại" (reshuffle) action SHALL be available to retry.

#### Scenario: All positions correct
- **WHEN** every item sits in its `correctPosition`
- **THEN** slots light up green in sequence and a correct outcome is reported

#### Scenario: Some positions wrong
- **WHEN** at least one item is in the wrong slot
- **THEN** correct slots show green, wrong slots show amber and shake, and a wrong outcome is reported
