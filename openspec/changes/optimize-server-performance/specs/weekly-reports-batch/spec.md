## ADDED Requirements

### Requirement: Weekly-report batch is indexed, streamed, and free of N+1
`runWeeklyReports` SHALL query eligible children on an indexed field, stream them with a lean cursor, and compute each report inline from the already-loaded child — never re-querying per child.

#### Scenario: Eligible children queried on an index
- **WHEN** the batch selects children
- **THEN** it filters on the indexed `weeklyReportEnabled` field and selects only the fields it needs, using `.lean()`

#### Scenario: No per-child re-fetch
- **WHEN** the batch produces each child's report
- **THEN** it computes the report from the streamed child's progress via a shared helper, issuing no additional per-child database read

#### Scenario: getWeeklyReport result unchanged
- **WHEN** `GET /progress/:childId/weekly-report` is called
- **THEN** it returns the same shape (`lessonsThisWeek`, `streak`, `xpThisWeek`, `hasActivity`) computed by the shared helper
