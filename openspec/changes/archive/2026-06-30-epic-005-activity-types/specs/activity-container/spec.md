## ADDED Requirements

### Requirement: Three-zone activity layout
The system SHALL render every activity inside a shared container with three vertical zones: a top zone (~10% height) holding the progress bar and a replay button, a middle zone (~65%) holding the activity-specific content, and a bottom zone (~25%) holding the Đô Đô mascot and speech bubble.

#### Scenario: Zones present for any activity type
- **WHEN** an activity of any `actionType` is rendered
- **THEN** the top progress + replay zone, the middle content zone, and the bottom mascot zone are all present in that order

#### Scenario: Replay re-plays the question audio
- **WHEN** the user taps the replay button
- **THEN** `audioScript.question` is played again without changing answer state

### Requirement: Route by actionType
The container SHALL receive a single `Activity` object and render the matching component for its `actionType`: `single_select` → SingleSelectActivity, `multi_select` → MultiSelectActivity, `sort_sequence` → SortSequenceActivity, `match_pair` → MatchPairActivity, `count_tap` → CountTapActivity, `watch_video` → WatchVideoActivity.

#### Scenario: Correct component selected
- **WHEN** the container receives an activity with `actionType: 'match_pair'`
- **THEN** the MatchPairActivity component is rendered with the activity's `payload`

#### Scenario: Unknown actionType is handled gracefully
- **WHEN** the container receives an activity whose `actionType` has no matching component
- **THEN** the container renders a non-crashing fallback (skip/advance affordance) rather than throwing

### Requirement: Play question audio on mount
The container SHALL play `audioScript.question` once when the activity mounts.

#### Scenario: Audio plays on mount
- **WHEN** an activity first appears
- **THEN** its `audioScript.question` is spoken once

### Requirement: Track attempt count
The container SHALL track the current attempt number (1, 2, 3) for the active activity and pass it to `onWrong` so feedback escalation can branch on it. Attempt count resets when the activity changes.

#### Scenario: Attempt increments on each wrong answer
- **WHEN** the child answers wrong twice on the same activity
- **THEN** the first wrong reports attempt 1 and the second reports attempt 2

#### Scenario: Attempt resets on new activity
- **WHEN** the container advances to the next activity
- **THEN** the attempt count is reset to 1

### Requirement: Outcome callbacks
The container SHALL expose `onCorrect` and `onWrong` callbacks. Activity components report their result through the container, which invokes the appropriate callback with the attempt number.

#### Scenario: Correct outcome surfaced
- **WHEN** an activity component determines the answer is correct
- **THEN** the container invokes `onCorrect` with the current attempt number

#### Scenario: Wrong outcome surfaced
- **WHEN** an activity component determines the answer is wrong
- **THEN** the container invokes `onWrong` with the current attempt number

### Requirement: Enforce touch rules
The container and its activity components SHALL enforce child-safe touch rules: interactive targets have a minimum hit area of 88×88pt, visual feedback on press occurs within 100ms, and a double-tap on the same target within the debounce window is ignored.

#### Scenario: Minimum hit area
- **WHEN** an interactive target's visual size is smaller than 88×88pt
- **THEN** its touchable area is expanded (via hitSlop or padding) to at least 88×88pt

#### Scenario: Double-tap guarded
- **WHEN** the same target is tapped twice in rapid succession
- **THEN** only the first tap is processed and the second is ignored
