# sort-sequence-activity Specification

## Purpose
Sort-sequence activity: child drags scrambled item cards from a source row into numbered target slots, then validates the order against each item's `correctPosition`.

## Requirements
### Requirement: Scrambled draggable items and numbered slots
The system SHALL display the `payload.items` (3–5) using a two-row layout: a **source row** (Row 1) containing the item cards in scrambled order, and a **target row** (Row 2) containing fixed numbered slots (1, 2, 3…). Each source card SHALL show a `?` badge. Each empty target slot SHALL show its position number with a dashed border. The layout is horizontal only.

#### Scenario: Items start scrambled in source row
- **WHEN** a sort-sequence activity mounts
- **THEN** all item cards appear in the source row in an order different from their `correctPosition` order, and the target row shows empty numbered slots (1..N) with dashed borders

#### Scenario: Empty slot shows position number
- **WHEN** a target slot has no card placed in it
- **THEN** the slot displays its position number and a dashed border

### Requirement: Drag and drop reorder
The system SHALL let the child drag a card from the source row into a target slot, or drag a placed card back to the source row / to a different slot. Dragging SHALL start after a drag threshold of ≥8pt, show a lifted/floating state (scale ~1.05, raised shadow, coral accent) while dragging, and drop into a slot when released over that slot's bounds.

#### Scenario: Lift on drag start
- **WHEN** the child presses and moves a card beyond the 8pt threshold
- **THEN** the card enters a lifted state and follows the finger

#### Scenario: Drop from source into a slot
- **WHEN** a source card is released over a target slot's bounds
- **THEN** the card is placed into that slot (moved out of the source row); if the slot already held a card, the previous card returns to the source row

#### Scenario: Drop a placed card back to source
- **WHEN** a placed card is dragged and released outside all slot bounds
- **THEN** the card returns to the source row and its slot becomes empty again

### Requirement: Order validation
A "Kiểm tra thứ tự" confirm button SHALL be disabled until every slot is filled. When pressed it SHALL validate the arrangement by comparing each slot's card against the `correctPosition` for that slot index. Correct slots SHALL turn green (border `#4CAF50`, background `#EAF7EA`, badge `N ✓`); wrong slots SHALL turn amber (border `#FFC107`, background `#FFFBEA`, badge `N ⚠`) and shake. A "Xáo lại" (reshuffle) action SHALL be available to retry.

#### Scenario: Check disabled until all slots filled
- **WHEN** at least one target slot is empty
- **THEN** the "Kiểm tra thứ tự" button is disabled

#### Scenario: All positions correct
- **WHEN** every slot holds the card whose `correctPosition` equals that slot's number
- **THEN** slots light up green in sequence and a correct outcome is reported

#### Scenario: Some positions wrong
- **WHEN** at least one slot holds a card in the wrong position
- **THEN** correct slots show green, wrong slots show amber and shake, and a wrong outcome is reported

#### Scenario: Vertical direction payload rendered as two-row
- **WHEN** `payload.direction` is `vertical`
- **THEN** the activity ignores the value and renders the horizontal two-row layout (source row + numbered slot row)
