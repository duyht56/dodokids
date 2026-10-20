## ADDED Requirements

### Requirement: Short strokes are judged on where the gesture went
A stroke at most 12 normalized units long (the tittles of i and j) SHALL be judged on its geometry alone — start, corridor, direction and the distance actually travelled — so a correct quick dab that sends only two or three touch samples is accepted. Every longer stroke SHALL keep refusing a gesture of fewer than four samples (a jump to the end included); such a gesture SHALL be reported as too little to judge (`insufficientData`), and the child SHALL be pointed at the dots to follow rather than sent back to the start star, which stays the guidance for a wrong start.

#### Scenario: Quick dab on the tittle of i
- **WHEN** the child draws the dot of «i» with a quick dab that reports two touch samples along it
- **THEN** the stroke is accepted and the item completes

#### Scenario: Flick on a long stroke
- **WHEN** a gesture of two or three samples is made on a long stroke
- **THEN** it is not accepted, and the guidance is «Mình nhìn theo các chấm tím nhé.», not «Bắt đầu ở ngôi sao…»

### Requirement: Completion counts only for the item being practised
The renderer SHALL cancel its completion beat when it unmounts, and the workshop screen SHALL accept a completion only when it carries the exercise seed of the item being practised now. A report from a renderer the child left (back to the library) or that was replaced by the next item SHALL be ignored.

#### Scenario: Child leaves right after finishing
- **WHEN** the child finishes a stroke and goes back to the library within the completion beat
- **THEN** the workshop does not advance the track or show the track-complete screen

#### Scenario: Late report from the previous item
- **WHEN** a report from the previous item's renderer arrives while the next item is being practised
- **THEN** it does not skip the item on screen
