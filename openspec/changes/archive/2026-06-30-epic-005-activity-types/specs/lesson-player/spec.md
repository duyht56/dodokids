## MODIFIED Requirements

### Requirement: Single-select answer options (2×2 grid)
The system SHALL delegate rendering of the current activity's content to `ActivityContainer`, which routes to the matching activity component by `actionType` (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`, `watch_video`). The player no longer renders the option grid directly; single-select's 2×2 / 2×1 / row layouts are provided by the `single-select-activity` capability. The player passes the active `Activity` to the container and reacts to its `onCorrect` / `onWrong` outcomes.

#### Scenario: Player delegates to container
- **WHEN** the player renders the current activity
- **THEN** it mounts `ActivityContainer` with that activity, and the container renders the component matching the activity's `actionType`

#### Scenario: Single-select still renders as a grid
- **WHEN** the current activity is `single_select`
- **THEN** the container routes to SingleSelectActivity, which renders the option grid for the payload's `layout`

#### Scenario: Outcome drives the player flow
- **WHEN** the container reports a correct outcome
- **THEN** the player records the result and advances (auto-advance timing unchanged)

## ADDED Requirements

### Requirement: Mixed-type lesson playback
The player SHALL play a lesson whose activities mix any of the six `actionType`s in sequence, advancing through them and finishing the lesson after the last activity regardless of each activity's type.

#### Scenario: Lesson mixes activity types
- **WHEN** a lesson contains a `count_tap` activity followed by a `match_pair` activity
- **THEN** the player renders each in turn through the container and proceeds to LessonComplete after the last one

#### Scenario: Unmappable activity does not block the lesson
- **WHEN** an activity cannot be mapped to a supported type
- **THEN** the player skips it (or shows a non-crashing fallback) and the lesson remains completable
