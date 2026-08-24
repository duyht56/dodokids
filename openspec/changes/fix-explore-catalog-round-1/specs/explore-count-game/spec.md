## MODIFIED Requirements

### Requirement: Tap-and-count interaction
The count game SHALL present a seeded layout of objects, allow each target object to be counted once, then ask the child to select the corresponding number card. Re-tapping an already counted object MUST NOT increment the count. The screen MUST NOT reveal the target total before the child has counted it: the count badge SHALL show only the number of objects counted so far, and no visible text or accessibility label SHALL name the total. The number cards SHALL become available once the child has counted at least one object; the child MAY answer before every object has been tapped. A wrong number card SHALL dim and lock so it cannot be re-tapped while the objects stay live for further counting; only the correct card completes the exercise. Tapping a distractor object (the non-target identity) SHALL give a short shake and the try-again cue without penalty and MUST NOT be reported as a wrong answer.

#### Scenario: Object is tapped twice
- **WHEN** the child taps the same object more than once
- **THEN** it remains counted once and the interaction does not report an inflated count

#### Scenario: Badge before and during counting
- **WHEN** the exercise is shown and the child has counted `k` target objects
- **THEN** the badge shows only `k` (starting at 0) and neither the badge, the prompt nor any accessibility label contains the target total

#### Scenario: Child answers before tapping every object
- **WHEN** the child has counted at least one object and selects the correct number card
- **THEN** the exercise is completed as correct even though some target objects were never tapped

#### Scenario: Wrong number card
- **WHEN** the child selects a number card that is not the target count
- **THEN** that card is dimmed and locked, the child can keep counting and choose another card, the round is reported as not first-try, and no "lose" state or count reset occurs

#### Scenario: Distractor object is tapped
- **WHEN** the child taps an object of the distractor identity
- **THEN** the object shakes briefly, the try-again cue plays, the count does not change and the tap is not reported as a wrong answer

## ADDED Requirements

### Requirement: Count-aloud and tap feedback
Each time a target object is counted the renderer SHALL play the select cue, speak the running count with the bundled number-name clip for that value (best-effort; a missing clip never blocks play), and give the tapped object a brief scale bounce. Motion SHALL be skipped when the system requests reduced motion. The mascot SHALL be the shared Đô Đô component (`ExploreMascot`), never an emoji placeholder, and SHALL cheer briefly when the correct card is chosen. The renderer SHALL NOT carry its own prompt-replay control; replay is the play screen's global control.

#### Scenario: Third object is counted
- **WHEN** the child counts the third target object
- **THEN** the select cue plays, the number-name clip for 3 ("ba") is requested via the feedback-audio callback, and the object bounces once

#### Scenario: Number clip is not bundled
- **WHEN** the number-name clip for the current count is missing from the bundled pack
- **THEN** the tap still counts, the badge updates and play continues silently for that value

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** counting and distractor taps update state and audio as usual without the bounce or shake animation
