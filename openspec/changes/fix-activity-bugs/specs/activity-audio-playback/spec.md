## ADDED Requirements

### Requirement: Auto-play question audio on activity mount
ActivityContainer SHALL call `speak(activity.audio.question)` immediately on mount and stop audio on unmount.

#### Scenario: Question audio plays on mount
- **WHEN** ActivityContainer mounts with a valid `activity.audio.question` URL
- **THEN** `speak()` is called with that URL within the first render cycle

#### Scenario: Audio stops on unmount
- **WHEN** ActivityContainer unmounts (e.g. user advances to next activity)
- **THEN** `stop()` is called to prevent audio bleeding into the next activity

### Requirement: Hint audio progresses on wrong attempts
ActivityContainer SHALL play `hint1` on the 1st wrong attempt, `hint2` on the 2nd, and `explain` on the 3rd. Missing hints are silently skipped.

#### Scenario: First wrong attempt plays hint1
- **WHEN** child answers wrong on attempt 1 and `activity.audio.hint1` is set
- **THEN** `speak(activity.audio.hint1)` is called

#### Scenario: Second wrong attempt plays hint2
- **WHEN** child answers wrong on attempt 2 and `activity.audio.hint2` is set
- **THEN** `speak(activity.audio.hint2)` is called

#### Scenario: Third wrong attempt plays explain
- **WHEN** child answers wrong on attempt 3 and `activity.audio.explain` is set
- **THEN** `speak(activity.audio.explain)` is called

#### Scenario: Missing hint is skipped silently
- **WHEN** child answers wrong but the corresponding hint URL is undefined
- **THEN** no audio call is made and no error is thrown

### Requirement: Correct audio plays on correct answer
ActivityContainer SHALL play `activity.audio.correct` when the child answers correctly, if that URL is set.

#### Scenario: Correct audio plays on success
- **WHEN** child answers correctly and `activity.audio.correct` is set
- **THEN** `speak(activity.audio.correct)` is called before `onCorrect` callback

#### Scenario: No correct audio — silent success
- **WHEN** child answers correctly and `activity.audio.correct` is undefined
- **THEN** no audio call is made; activity advances normally
