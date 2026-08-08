## MODIFIED Requirements

### Requirement: Offline Task Seeding
The parent module SHALL maintain a static offline-task table providing five tasks per week (one per learning day) for weeks 1–12 minimum, each entry containing `day`, `title`, `body` (instructions + parent script), and `safetyNote`. `GET /parent/:childId/summary` SHALL look up `currentWeek` and `currentDay` in this table to populate the `offlineTask` field with the task for the current day.

#### Scenario: Week in table
- **WHEN** `currentWeek` is 3, `currentDay` is 2, and tasks exist for week 3
- **THEN** the summary's `offlineTask` is week 3 / day 2's task text

#### Scenario: Week beyond table
- **WHEN** `currentWeek` exceeds the table length
- **THEN** the response includes `offlineTask: null` (no crash)

### Requirement: Stale Task Reset
When the stored offline-task records belong to a previous week (their `taskId` week prefix does not match the current week), `GET /parent/:childId/summary` SHALL return the current day's task with `status: "pending"` and `completedAt: null`, rather than carrying over the old status.

#### Scenario: Week advanced since last completion
- **WHEN** the child completed a week-2 task and `currentWeek` is now 3
- **THEN** the summary returns the week-3 task as `pending` (not `done`)
