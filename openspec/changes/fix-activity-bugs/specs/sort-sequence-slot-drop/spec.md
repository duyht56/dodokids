## ADDED Requirements

### Requirement: SortSequence uses bank-to-slot drag model
`SortSequenceActivity` SHALL display a bank row of unplaced items above a numbered slot row. The child drags items from the bank into the numbered slots to arrange them in correct order.

#### Scenario: Initial state shows all items in bank row
- **WHEN** the activity mounts
- **THEN** all items appear in the bank row (scrambled order) and all N numbered slots are empty

#### Scenario: Dragging item from bank to slot places it
- **WHEN** child drags an item from the bank row and drops it on slot N
- **THEN** the item disappears from the bank and appears in slot N; any previously placed item in slot N returns to the bank

#### Scenario: Tapping a placed item returns it to the bank
- **WHEN** child taps an item already placed in a slot
- **THEN** the item returns to the bank row and the slot becomes empty again

#### Scenario: Check button is disabled until all slots are filled
- **WHEN** one or more slots are empty
- **THEN** the "Kiểm tra thứ tự" button is visually disabled and does not respond to taps

#### Scenario: Check with all correct positions reports correct
- **WHEN** all items are placed in their `correctPosition` slots and child taps "Kiểm tra"
- **THEN** `onResult('correct')` is called and all slot borders turn green

#### Scenario: Check with wrong positions reports wrong
- **WHEN** at least one item is in the wrong slot and child taps "Kiểm tra"
- **THEN** `onResult('wrong')` is called, wrong slots shake, correct slots turn green

#### Scenario: Xáo lại resets all slots and bank
- **WHEN** child taps "Xáo lại"
- **THEN** all slots are cleared, items return to bank in a new scrambled order, slot states reset to idle

### Requirement: Slot numbers are clearly visible
Each drop slot SHALL display its position number (1, 2, 3…N) prominently so the child knows which slot is which.

#### Scenario: Slot number is always visible
- **WHEN** a slot is empty or filled
- **THEN** the slot number label is visible (empty slot shows number prominently; filled slot shows number as a small badge or keeps it visible)
