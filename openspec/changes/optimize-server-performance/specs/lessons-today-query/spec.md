## ADDED Requirements

### Requirement: findToday selects one canonical lesson without over-fetching
`GET /lessons/today` SHALL determine the next canonical lesson using a database-side filter and a single-document limit, so the number of documents populated does not grow with total published content. The selected lesson MUST be identical to the previous behavior (first canonical lesson by ascending week then day).

#### Scenario: Only the chosen lesson is populated
- **WHEN** the today cache misses and a canonical lesson is available
- **THEN** the query filters by imported status, non-empty contentVersion, exactly 8 activities, week within the entitlement window, and excludes completed lessons, sorted by week then day and limited to one document

#### Scenario: No canonical lesson yields the stub
- **WHEN** no lesson matches the canonical filter
- **THEN** the stub lesson (`{ isStub: true, rewardContext: { eligible: false, reason: 'stub' } }`) is returned

#### Scenario: Selection is unchanged
- **WHEN** several canonical lessons are available
- **THEN** the earliest by (week, day) that is not completed is returned, exactly as before
