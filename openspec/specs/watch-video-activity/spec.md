# watch-video-activity Specification

## Purpose
TBD - created by archiving change epic-005-activity-types. Update Purpose after archive.
## Requirements
### Requirement: Auto-playing video with delayed skip
The system SHALL play `payload.videoUrl` filling the content zone, auto-playing on mount with a thumbnail (`payload.thumbnailUrl`) + spinner shown while loading and no pause/rewind controls. A "Bỏ qua →" skip control (small, top-right) SHALL appear only after `payload.skipAllowedAfter` seconds, and SHALL never appear when `skipAllowedAfter` is 0.

#### Scenario: Loading state
- **WHEN** the video has not yet started
- **THEN** the thumbnail and a spinner are shown

#### Scenario: Skip appears after delay
- **WHEN** `skipAllowedAfter` seconds have elapsed and it is greater than 0
- **THEN** the "Bỏ qua →" control becomes visible

### Requirement: Auto-advance on completion
When the video ends (or the child skips) the system SHALL report completion to the container so the lesson auto-advances to the next activity.

#### Scenario: Advance on end
- **WHEN** the video finishes playing
- **THEN** the container is notified to advance to the next activity

#### Scenario: Advance on skip
- **WHEN** the child taps "Bỏ qua →"
- **THEN** the container is notified to advance to the next activity

### Requirement: Video dependency fallback
Until `react-native-video` is available, the WatchVideo component SHALL render the thumbnail with a play affordance and honor the skip/auto-advance timing using `payload.durationSeconds`, so the lesson flow is never blocked.

#### Scenario: Fallback when video player is unavailable
- **WHEN** no native video player is installed
- **THEN** the thumbnail is shown and the activity auto-advances after `durationSeconds` (or on skip) without crashing

