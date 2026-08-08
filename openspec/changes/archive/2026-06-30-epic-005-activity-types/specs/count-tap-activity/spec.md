## ADDED Requirements

### Requirement: Scene with tappable objects (phase 1)
The system SHALL display `payload.sceneImage` across the content zone with tappable object targets overlaid on it and a live counter ("n 🍃"). Tapping an untapped object SHALL highlight it (coral outline + numbered badge), increment the counter, and play the next count word ("Một", "Hai", "Ba"… via Vietnamese TTS). The same object SHALL NOT be counted twice.

#### Scenario: Tap counts an object
- **WHEN** the child taps an untapped object
- **THEN** the object gets a coral outline and a numbered badge, the counter increments, and the corresponding count word is spoken

#### Scenario: Re-tap ignored
- **WHEN** the child taps an already-counted object
- **THEN** the counter does not change and no new badge is added

### Requirement: Number answer selection (phase 2)
After all objects are tapped (or the child confirms), the system SHALL present `payload.answerOptions` as four large number buttons (minimum 80×80pt). Selecting a number SHALL compare it to `payload.targetCount` and report the outcome.

#### Scenario: Answer options appear after counting
- **WHEN** every scene object has been tapped
- **THEN** four number buttons from `answerOptions` are shown

#### Scenario: Correct number chosen
- **WHEN** the child selects the number equal to `targetCount`
- **THEN** a correct outcome is reported

### Requirement: Reset counting
The system SHALL provide a "Đếm lại 🔄" reset that clears all tapped objects and the counter so the child can count again.

#### Scenario: Reset clears progress
- **WHEN** the child taps "Đếm lại"
- **THEN** all object highlights and badges are removed and the counter returns to 0
