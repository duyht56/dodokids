## MODIFIED Requirements

### Requirement: Auto-play and replay question audio

ActivityContainer SHALL play `activity.audio.files?.question` on mount. Replay SHALL replace the current question session. Unmount SHALL stop audio.

#### Scenario: Question plays on mount

- **WHEN** an activity mounts with a question URL
- **THEN** the question URL starts playing

#### Scenario: Replay is disabled during feedback

- **WHEN** wrong or success feedback is playing
- **THEN** the replay control cannot start question audio

#### Scenario: Unmount stops the session

- **WHEN** ActivityContainer unmounts
- **THEN** its active audio session is cancelled and released

### Requirement: Wrong feedback progresses by attempt

ActivityContainer SHALL lock answer input while wrong feedback plays, display the matching feedback text, then return to answering after playback finishes, is skipped because URL is missing, or fails.

#### Scenario: First wrong plays hint1

- **WHEN** the child answers wrong on attempt 1
- **THEN** `hint1` audio/text is selected and `onWrong(1)` is reported

#### Scenario: Second wrong plays hint2

- **WHEN** the child answers wrong on attempt 2
- **THEN** `hint2` audio/text is selected and `onWrong(2)` is reported

#### Scenario: Third and later wrong plays explain

- **WHEN** the child answers wrong on attempt 3 or later
- **THEN** `explain` audio/text is selected, the explain-played flag is recorded, and the child may retry after feedback

### Requirement: Success feedback depends on prior mistakes

ActivityContainer SHALL use `correct` for first-try success and `explain` for success after a prior wrong answer, unless explain was already played after the third wrong attempt.

#### Scenario: First-try success plays correct

- **WHEN** the child answers correctly on attempt 1
- **THEN** `correct` audio/text plays

#### Scenario: Correct after a wrong answer plays explain

- **WHEN** the child answers correctly on attempt 2 or later and explain has not already played
- **THEN** `explain` audio/text plays

#### Scenario: Correct after third-wrong explain does not repeat explain

- **WHEN** explain already played after a wrong attempt and the child then answers correctly
- **THEN** `correct` audio/text plays as the short acknowledgement

### Requirement: Advance after feedback or explicit Continue

ActivityContainer SHALL invoke `onCorrect(attempt)` exactly once after success feedback finishes, is skipped/failed, or the child explicitly presses Continue. Parent screens SHALL advance immediately on this callback and SHALL NOT use a fixed audio delay.

#### Scenario: Feedback finishes naturally

- **WHEN** success feedback resolves `finished`
- **THEN** the container enters advancing and calls `onCorrect(attempt)` once

#### Scenario: Child presses Continue during feedback

- **WHEN** the Continue button is pressed while success feedback is loading or playing
- **THEN** the container cancels/releases feedback before calling `onCorrect(attempt)`

#### Scenario: Double press cannot double-advance

- **WHEN** Continue is pressed repeatedly or completion races with the press
- **THEN** the phase/token guard permits only one `onCorrect` call

#### Scenario: Next question cannot overlap feedback

- **WHEN** the parent advances to the next activity
- **THEN** old feedback is already stopped before the next question session starts

#### Scenario: Missing or failed success audio

- **WHEN** the chosen success URL is missing or fails to play
- **THEN** the activity advances without crashing or waiting indefinitely
