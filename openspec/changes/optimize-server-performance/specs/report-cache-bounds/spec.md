## ADDED Requirements

### Requirement: Report cache is bounded and keyed on a bounded week
`ParentService` report cache SHALL enforce a maximum entry count with LRU eviction, and the `week` used in the cache key SHALL be range-checked (1..48) so the key space cannot grow unbounded.

#### Scenario: Oldest entry is evicted past the cap
- **WHEN** the number of distinct cached reports exceeds the maximum
- **THEN** the least-recently-used entry is evicted

#### Scenario: Out-of-range week is rejected
- **WHEN** `GET /parent/:childId/report` is called with a week outside 1..48
- **THEN** the request is rejected (400) before a cache entry is created

#### Scenario: Fingerprint invalidation preserved
- **WHEN** the underlying progress/tasks change for a cached (household, child, week)
- **THEN** the cached report is recomputed (fingerprint mismatch), exactly as before
