## MODIFIED Requirements

### Requirement: Responsive accessible controls
The board, command queue and primary actions SHALL remain usable without horizontal scrolling at supported phone widths down to 320 points, and SHALL all be visible at once, without vertical scrolling, on a 375-by-667-point phone viewport beneath the play screen's top bar and above its feedback area. The board SHALL size its square cells from both the available width and the height left after the prompt, command strip and controls, so that a taller board shrinks instead of pushing the run control below the visible area. Direction controls SHALL be arranged as a directional pad — up alone on the top row; left, down and right on the row below — so each key's position matches the direction it adds. Direction and run controls SHALL have at least 48-by-48-point touch targets, 56 points tall at every supported width, and accessible labels that do not rely on color alone. The undo and clear controls SHALL use icons distinct from each other and from the play screen's exit control, with Vietnamese accessible labels that read as removing the last step and clearing the whole route.

#### Scenario: Game renders on a narrow phone
- **WHEN** the route planner is shown at a 320-point viewport width
- **THEN** the entire board width, eight command slots, the directional pad and the run, undo and clear controls remain reachable without horizontal scrolling or clipped labels, and no key is narrower than 48 points

#### Scenario: Game renders on a 375-by-667 phone
- **WHEN** the route planner is shown at a 375-by-667-point viewport with the play screen's top bar and feedback area present, on any level's board
- **THEN** the prompt, the whole board, the eight command slots, the directional pad, the undo and clear controls and the run control are all visible without scrolling, and board cells stay at or above the readable minimum

#### Scenario: Board height is the constraint
- **WHEN** the height left for the board would not fit the cell size derived from the width alone
- **THEN** the board uses the smaller height-derived cell size and the controls below it keep their position and size

#### Scenario: Child looks for the undo and clear controls
- **WHEN** the child has queued commands and looks at the planning controls
- **THEN** undo and clear show icons distinct from each other and from the exit control, and a screen reader announces them as "Xóa bước cuối" and "Xóa cả đường đi"

## ADDED Requirements

### Requirement: Đô Đô character on the board
The figure that walks the board SHALL be rendered from the bundled Đô Đô character image, scaled to the cell, and the renderer SHALL NOT use an emoji as a stand-in for the mascot. Objective and destination markers MAY remain emoji content until dedicated art replaces them.

#### Scenario: Board shows the mascot
- **WHEN** a puzzle is presented or execution moves Đô Đô to a cell
- **THEN** the occupied cell shows the Đô Đô image sized to that cell and no emoji face represents Đô Đô anywhere in the renderer

#### Scenario: Cells are small on a height-constrained board
- **WHEN** the board's cell size is reduced to fit the available height
- **THEN** the Đô Đô image and the objective markers scale down with the cell instead of clipping or overlapping neighbouring cells
