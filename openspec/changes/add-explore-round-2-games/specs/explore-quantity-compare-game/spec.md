## ADDED Requirements

### Requirement: Support level visuals
The comparison renderer SHALL consume the play screen's `supportLevel` (0, 1 after two misses, 2 after four) and layer help onto the SAME exercise without changing the generator, validator, counts or correct side. At level 1 both side counters SHALL be filled automatically with the side's full count (visible from the start, styled as a hint) so the child compares the two numbers; the sprites SHALL stay tappable for counting aloud and the numbered badges SHALL still track only what the child tapped. At level 2 the renderer SHALL additionally pulse the correct side's frame gently (a soft scale breath plus a hint border); for an `equal` exercise the "Bằng nhau" control SHALL pulse instead. The child MUST still make the pick at every level; the board SHALL NOT auto-answer. The support props on the shared `QuantityComparisonBoard` MUST be additive and optional so the lesson `compare_tap` activity is unchanged. Motion SHALL be skipped when the system requests reduced motion, leaving the hint border as the static cue.

#### Scenario: Two misses reveal the counts
- **WHEN** the child has missed twice on a "nhiều hơn" exercise with 3 on the left and 5 on the right and the play screen passes `supportLevel` 1
- **THEN** the left counter shows 3 and the right counter shows 5 before any sprite is tapped, tapping a sprite still counts it aloud and adds its badge, and both "Bên này!" buttons remain ordinary

#### Scenario: Four misses pulse the correct side
- **WHEN** `supportLevel` is 2 on a non-equal exercise whose correct side is right
- **THEN** the right frame breathes gently with a hint border while the left frame stays still, and the exercise is only completed when the child taps the right "Bên này!"

#### Scenario: Equal exercise at level 2
- **WHEN** `supportLevel` is 2 on an `equal` exercise
- **THEN** neither frame pulses and the "Bằng nhau" control pulses instead, still requiring the child's tap

#### Scenario: Solved board stops pulsing
- **WHEN** the child picks the correct side while a pulse is active
- **THEN** the pulse stops and the ordinary correct (green) reveal is shown

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion and `supportLevel` reaches 2
- **THEN** the counters stay filled and the correct frame (or equal control) shows only its static hint border, with no breathing motion

#### Scenario: Lesson board is unaffected
- **WHEN** the lesson `compare_tap` activity renders the shared board without the support props
- **THEN** the counters show only tapped counts, nothing pulses and the lesson callbacks are unchanged
