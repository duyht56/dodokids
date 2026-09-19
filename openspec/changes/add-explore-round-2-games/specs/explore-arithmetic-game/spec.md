## ADDED Requirements

### Requirement: Support level visuals
The arithmetic renderer SHALL consume the play screen's `supportLevel` (0, 1 after two misses, 2 after four) and layer help onto the SAME exercise without changing the generator, validator, options or answer. At level 1 the renderer SHALL show the count of each operand group as an emphasised count chip (the operands only, never the result) and SHALL highlight the operands line (`a + b = ?` / `a − b = ?`). At level 2 the renderer SHALL additionally play the exercise's own semantic animation step from `params.model.animationSteps` (`addGroup`: the second group slides in to join the first; `removeGroup`: the removed tiles drop out; number-line add/remove and `moveOnLine`: the hops and landing nodes swell in order) and SHALL keep only the answer card plus ONE distractor card active, dimming and locking every other card. Which distractor survives MUST be derived deterministically from the exercise `randomSeed` (no `Math.random`, nothing persisted), so replaying a seed dims the same card. The child MUST still tap the answer at every level; no level reveals the result. Motion SHALL be skipped when the system requests reduced motion, and the static end state SHALL be identical to the picture shown without support.

#### Scenario: Two misses on a picture exercise
- **WHEN** the child has missed twice on `4 + 1 = ?` and the play screen passes `supportLevel` 1
- **THEN** a count chip "4" appears under the first group and "1" under the second, the operands line is highlighted, no chip or label shows "5", and all three answer cards stay as they were

#### Scenario: Two misses on a subtraction
- **WHEN** `supportLevel` is 1 on `5 − 2 = ?`
- **THEN** the scene shows the chips "5" and "2" joined by the minus sign under the tile group, and the remaining count is not printed anywhere

#### Scenario: Support level 2 narrows the cards
- **WHEN** the play screen passes `supportLevel` 2 for an exercise with options [3, 5, 6] and answer 5
- **THEN** exactly one of 3 and 6 (chosen from the exercise seed) dims and locks without a shake, the other distractor and the answer stay tappable, and the same seed always dims the same card

#### Scenario: Support level 2 plays the step
- **WHEN** `supportLevel` becomes 2 on an `addGroup` exercise
- **THEN** the second operand group slides in to join the first, the motion replays once, and the picture rests in its ordinary static state afterwards

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion and `supportLevel` reaches 2
- **THEN** the count chips, the highlighted operands line and the dimmed card apply without any animation, and the scene shows its static end state

#### Scenario: Support does not change the exercise
- **WHEN** the same seed is rendered at `supportLevel` 0, 1 and 2
- **THEN** the exercise envelope, its options and its answer are byte-identical and the validator result is unchanged
