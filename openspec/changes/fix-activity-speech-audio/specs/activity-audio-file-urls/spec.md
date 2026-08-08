## ADDED Requirements

### Requirement: Carry audioFiles bucket URLs from server into the Activity

`mapServerLesson`/`mapActivity` SHALL carry the server's `audioFiles.*` bucket URLs onto the mapped `Activity` so the player can access them, without disturbing the existing `audioScript` text used for the mascot bubble.

#### Scenario: Server audioFiles are mapped

- **WHEN** a server activity includes `audioFiles` with bucket URLs (`question`, `hint1`, `hint2`, `explain`, `correct`)
- **THEN** the mapped `Activity.audio.files` contains those same URLs

#### Scenario: Bubble text is preserved

- **WHEN** an activity is mapped
- **THEN** `activity.prompt` and the bubble text still come from `audioScript`/payload text, not from a bucket URL

#### Scenario: Activity without audioFiles maps cleanly

- **WHEN** a server activity (or a local mock) has no `audioFiles`
- **THEN** `activity.audio.files` is `undefined` and the activity still maps and plays normally
