## MODIFIED Requirements

### Requirement: GET /parent/:childId/report
The BE SHALL expose `GET /parent/:childId/report?week={n}` returning the weekly report for the given child and week number. When `week` is omitted it SHALL default to the child's `currentWeek`. The response SHALL be derived server-side from the child's progress and imported Lesson offline-task content; it SHALL NOT read a static offline-task table or call an external LLM service.

#### Scenario: Existing child, unlocked week
- **WHEN** `:childId` belongs to the authenticated household and that week's day-5 lesson is completed
- **THEN** the endpoint returns HTTP 200 with `locked: false` and all report fields populated

#### Scenario: Unknown child
- **WHEN** `:childId` does not belong to the authenticated household
- **THEN** the endpoint returns HTTP 404

#### Scenario: Week defaults to current
- **WHEN** the `week` query parameter is omitted
- **THEN** the report is computed for the child's `currentWeek`

### Requirement: Next-Week Suggestions
The response SHALL include exactly three suggestion strings. The server SHALL select from imported Lesson `offlineTaskBody` values for week N+1, fall back to imported week-N values when the next week has no reviewed task content, prefer tasks matching the child's lowest-scoring subject, and use the existing safe generic subject fallback only to fill missing slots. It SHALL NOT use the retired static offline-task table.

#### Scenario: Reviewed next-week tasks available
- **WHEN** at least three imported week-N+1 Lesson tasks exist
- **THEN** suggestions are selected deterministically from those reviewed task bodies with the lowest subject preferred

#### Scenario: Next week is not published
- **WHEN** no imported week-N+1 Lesson task exists
- **THEN** the selector falls back to imported week-N task bodies

#### Scenario: Fewer than three reviewed tasks
- **WHEN** the selected imported task pool has fewer than three usable bodies
- **THEN** safe generic subject suggestions fill the array to exactly length 3

### Requirement: Report Caching
The computed report for a given household, child, and week SHALL be cached and reused only while both the week's progress fingerprint and the suggestion-source Lesson content fingerprint remain unchanged. The content fingerprint SHALL change when relevant Lesson identity, revision/import timestamp, or offline-task text changes.

#### Scenario: Repeat request served from cache
- **WHEN** the same report is requested twice with no progress or relevant Lesson content change
- **THEN** the second response is identical and may be served from cache

#### Scenario: Offline task hotfix invalidates report
- **WHEN** a relevant imported Lesson's offline-task content is republished between requests
- **THEN** the cached report is not reused and suggestions are recomputed
