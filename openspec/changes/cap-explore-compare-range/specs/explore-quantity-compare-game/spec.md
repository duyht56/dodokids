## MODIFIED Requirements

### Requirement: Quantity comparison levels
The game SHALL cap the comparison ladder at range 20 for ages 4–6 with exactly four levels and no level exceeding range 20: L1 range 5 with difference at least 2, L2 range 10 including difference 1, L3 range 15 including equal cases, and L4 range 20 including equal cases and different readable group arrangements without changing object identity. Equal cases SHALL be enabled from L3 and the grouped arrangement SHALL be available from L4.

#### Scenario: Equal generated below L4
- **WHEN** an L1 or L2 exercise has equal counts
- **THEN** validation fails because equal mode is not enabled at that level

#### Scenario: Equal enabled from L3
- **WHEN** an L3 or L4 exercise has equal counts and equal mode
- **THEN** the exercise exposes the explicit equal response and validates

#### Scenario: Ladder capped at range 20
- **WHEN** the game's configured levels are enumerated
- **THEN** there are exactly four levels and no generated count exceeds 20

## ADDED Requirements

### Requirement: Seesaw comparison presentation
The game SHALL present each comparison as a "bập bênh" (seesaw / balance-beam) built from a central fulcrum, a plank, and two pans, where each pan holds its side's seeded objects so the child compares by looking and tap-to-counting. Before the child commits an answer the plank SHALL rest level — optionally with a gentle, symmetric idle sway that leans neither way — so it never reveals which side has more. The child SHALL commit an answer by tapping the heavier/"more" pick control or the explicit equal control, and ONLY after a correct pick SHALL the plank tilt down toward the side with MORE objects, or stay level when the two sides are equal, as a confirming "more = heavier" teaching animation. The tilt direction SHALL be derived from the object counts, never from the recorded correct side, so a "less" exercise still tilts toward the larger group. The presentation SHALL reuse the exercise's existing left count, right count, correct side and assets, add no seeded field, and leave the generator, validator and versions unchanged so replay stays byte-identical.

#### Scenario: Level before the child picks
- **WHEN** an exercise is shown and the child has not yet committed an answer
- **THEN** the plank rests level and neither pan sits lower than the other, so the picture does not reveal which side has more

#### Scenario: Tilt toward more on a correct reveal
- **WHEN** the child picks the correct side and the two sides have different counts
- **THEN** the plank tilts down toward the side holding more objects

#### Scenario: Equal stays level on reveal
- **WHEN** the child correctly picks the equal control for an equal exercise
- **THEN** the plank stays level to confirm the two sides are the same

#### Scenario: A wrong pick does not tilt
- **WHEN** the child picks the wrong side
- **THEN** the plank stays level and does not tilt toward either side, so the answer is not revealed

#### Scenario: Less mode tilts toward the larger group
- **WHEN** a "less" exercise is answered correctly by choosing the smaller side
- **THEN** the plank still tilts down toward the larger group, because the tilt reflects physical weight (count) rather than the correct side

### Requirement: Seesaw reduced motion and device fit
The seesaw SHALL animate on the native driver, and under the system reduced-motion setting SHALL skip the tilt animation and instead show the correct resting tilt statically on reveal (and run no idle sway). It SHALL fit a 375-pt phone without horizontal overflow, degrade gracefully at the capped range-20 densities, and keep the Đô Đô mascot and the tap-to-count spoken numbers.

#### Scenario: Reduced motion shows a static resting tilt
- **WHEN** the system reports reduced motion is enabled and the child answers correctly
- **THEN** the plank shows the correct resting tilt without playing the tilt animation and without any idle sway

#### Scenario: Fits a small phone
- **WHEN** the seesaw is rendered on a 375-pt-wide phone at any configured level
- **THEN** the beam, pans and controls fit without horizontal overflow and the mascot and tap-to-count spoken numbers remain present
