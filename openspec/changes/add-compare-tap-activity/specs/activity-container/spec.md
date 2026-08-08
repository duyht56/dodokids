# activity-container Specification (delta)

## MODIFIED Requirements

### Requirement: Route by actionType
The container SHALL receive a single `Activity` object and render the matching component for its `actionType`: `single_select` → SingleSelectActivity, `multi_select` → MultiSelectActivity, `sort_sequence` → SortSequenceActivity, `match_pair` → MatchPairActivity, `count_tap` → CountTapActivity, `compare_tap` → CompareTapActivity, `watch_video` → WatchVideoActivity.

#### Scenario: Correct component selected
- **WHEN** the container receives an activity with `actionType: 'match_pair'`
- **THEN** the MatchPairActivity component is rendered with the activity's `payload`

#### Scenario: Compare_tap routes to its component
- **WHEN** the container receives an activity with `actionType: 'compare_tap'`
- **THEN** the CompareTapActivity component is rendered with the activity's `payload` and the activity id as layout seed

#### Scenario: Unknown actionType is handled gracefully
- **WHEN** the container receives an activity whose `actionType` has no matching component
- **THEN** the container renders a non-crashing fallback (skip/advance affordance) rather than throwing
