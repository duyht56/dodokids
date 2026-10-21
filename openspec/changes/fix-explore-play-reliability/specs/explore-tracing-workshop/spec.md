## ADDED Requirements

### Requirement: Short strokes are judged on where the gesture went
A stroke at most 12 normalized units long (the tittles of i and j) SHALL be judged on its geometry alone, not on its sample count, so a correct quick dab that sends only two or three touch samples is accepted. Because the start radius covers the whole of such a stroke, the gesture SHALL also begin within the first half of it (past where the trace is), and its travel SHALL be measured as its forward reach along the stroke — from where the finger landed, only the part of each point's projection that goes past the furthest point already reached — not as the length of the finger's path or the span of its projections, so wobble, a tilted or sideways swipe and a drift back up the dot add nothing: a gesture reaching forward less than a quarter of the stroke, or less than a third of what is left of it, SHALL count as a tap (too little to judge), and any progress it claims SHALL be travelled along the stroke (at least 55% of that distance, less a 0.5-unit allowance for landing on the glow just ahead of the ink). A gesture on a short stroke SHALL keep partial progress only when at least half of the finger's movement went along the stroke. A short stroke already traced at least three quarters of the way SHALL be finished by a gesture that reaches its end. Every longer stroke SHALL keep refusing a gesture of fewer than four samples (a jump to the end included); such a gesture SHALL be reported as too little to judge (`insufficientData`), and the child SHALL be pointed at the dots to follow rather than sent back to the start star, which stays the guidance for a wrong start. A refused jump SHALL commit no progress on any stroke, so a later gesture cannot finish a stroke the finger never travelled.

#### Scenario: Quick dab on the tittle of i
- **WHEN** the child draws the dot of «i» with a quick dab that reports two touch samples along it
- **THEN** the stroke is accepted and the item completes

#### Scenario: Taps on the end of the dot
- **WHEN** the child taps the end marker of the dot of «i» twice, at any level
- **THEN** neither tap is accepted, no ink is committed to the dot and the item does not complete

#### Scenario: Swipes across the dot
- **WHEN** the child swipes sideways across the middle of the dot of «i», then across its bottom
- **THEN** neither swipe is accepted or commits progress, and the item does not complete

#### Scenario: A real hand's swipe across the dot
- **WHEN** the child swipes across the dot of «i» with the swipe tilted up the dot or wobbling, twice, at any level
- **THEN** no ink is left on the dot after either swipe and the item does not complete

#### Scenario: Continuing from the glow near the end of the dot
- **WHEN** a first dab stops at 80% of the dot and the child continues from the glow to the end marker
- **THEN** the stroke is accepted

#### Scenario: Continuing from where the ink is drawn
- **WHEN** a first dab stops between 60% and 85% of the dot and the child continues from the end of the ink as drawn on screen to the end marker
- **THEN** the stroke is accepted

#### Scenario: A tap cannot finish the dot from halfway
- **WHEN** the dot is traced 60% of the way and the child taps its end marker
- **THEN** the tap is not accepted; with three quarters traced, reaching the end finishes the dot

#### Scenario: Flick, then a wiggle at the end of a long stroke
- **WHEN** a two-sample flick from the start to the end of a long stroke is refused and the child then wiggles at the end
- **THEN** the stroke is not completed

#### Scenario: Flick on a long stroke
- **WHEN** a gesture of two or three samples is made on a long stroke
- **THEN** it is not accepted, and the guidance is «Mình nhìn theo các chấm tím nhé.», not «Bắt đầu ở ngôi sao…»

### Requirement: One miss, one sentence
A miss SHALL say one guidance sentence. When the same miss raises the help level and the help line is the sentence just said, it SHALL NOT be said or shown a second time. Guidance about the stroke being traced SHALL be merged when repeated while waiting, and SHALL be dropped if, when its turn comes, that stroke is done or the item is gone, so it never plays over the next stroke's or glyph's instruction. Praise for a finished stroke or item is not dropped. All text on screen — the prompt bubble of every item included («Bé tô theo chữ nhé.» for letters, the words its clip says) — SHALL call the child «bé»; a clip that still says «Mình…» is re-recorded in the next audio batch.

#### Scenario: Second dab on a long stroke
- **WHEN** a second quick dab raises help to level 1 on a long stroke
- **THEN** «Bé nhìn theo các chấm tím nhé.» is said once and shown once

#### Scenario: Stroke finished while guidance waits
- **WHEN** misses on a stroke are still queued when the child completes that stroke
- **THEN** only the praise for the stroke plays

### Requirement: Completion counts only for the item being practised
The renderer SHALL cancel its completion beat when it unmounts, and the workshop screen SHALL accept a completion only when it carries the exercise seed of the item being practised now. A report from a renderer the child left (back to the library) or that was replaced by the next item SHALL be ignored.

#### Scenario: Child leaves right after finishing
- **WHEN** the child finishes a stroke and goes back to the library within the completion beat
- **THEN** the workshop does not advance the track or show the track-complete screen

#### Scenario: Late report from the previous item
- **WHEN** a report from the previous item's renderer arrives while the next item is being practised
- **THEN** it does not skip the item on screen
