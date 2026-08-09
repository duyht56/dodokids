## ADDED Requirements

### Requirement: Asset disk cache is bounded with LRU eviction
The asset cache SHALL enforce a maximum entry count with least-recently-used eviction, in addition to the 30-day TTL sweep. Entries record a last-accessed time used to order eviction.

#### Scenario: TTL sweep still runs
- **WHEN** cache maintenance runs
- **THEN** entries older than the TTL are deleted (file + metadata) as before

#### Scenario: Over-cap entries are evicted LRU-first
- **WHEN** after the TTL sweep the entry count exceeds the maximum
- **THEN** the least-recently-accessed entries (by `lastAccessedAt`, falling back to `cachedAt`) are evicted until the count is within the cap

#### Scenario: Access updates recency
- **WHEN** a cached URI is resolved or (re)downloaded
- **THEN** its `lastAccessedAt` is updated so actively-used assets are not evicted
