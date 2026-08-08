## MODIFIED Requirements

### Requirement: Look-ahead prefetch is deferred and single-flight
Look-ahead manifest retrieval and asset downloads SHALL start only after active navigation interactions complete. The cache service SHALL coalesce concurrent look-ahead requests for the same child into one in-flight operation regardless of the caller's current week/day parameters; week/day SHALL influence only download priority, not operation identity. After a look-ahead sweep for a child completes, subsequent requests for the same scope within the configured refresh interval SHALL be no-ops instead of launching a new sweep in the same app session.

#### Scenario: Home enters during a transition
- **WHEN** Home mounts while its navigation transition is active
- **THEN** manifest retrieval and downloads wait until the interaction completes

#### Scenario: Multiple callers request the same manifest
- **WHEN** Home, Preparing Lesson, Lesson Player, or Lesson Complete request look-ahead for the same child while a matching prefetch is running — even with different week/day parameters
- **THEN** they share the existing operation instead of starting duplicate API requests and downloads

#### Scenario: Sweep already completed this session
- **WHEN** a look-ahead sweep for the child completed within the refresh interval and a screen requests it again (including after completing a lesson)
- **THEN** no new manifest request or download sweep starts

### Requirement: Asset prefetch uses lesson priority
The prefetch scheduler SHALL prioritize critical assets for the current lesson and next lesson before farther look-ahead lessons. Farther-week downloads SHALL run as background work and MUST NOT block navigation or first activity interaction. Background-tier downloads SHALL NOT be part of the promise chain awaited by the critical/warm tiers: the operation callers await SHALL resolve once critical and warm tiers finish, while the background tier continues independently. Background work SHALL yield to user interactions between download batches, SHALL stop while the app is not in the foreground, and SHALL respect a per-session file budget.

#### Scenario: Current and future assets are uncached
- **WHEN** a manifest contains uncached assets for the current lesson, next lesson, and later weeks
- **THEN** current-lesson assets are processed first, next-lesson assets second, and later-week assets only as background work

#### Scenario: Cached asset is encountered
- **WHEN** an asset has valid cache metadata and a valid local file
- **THEN** it is reused without downloading the bytes again

#### Scenario: Navigation starts mid-sweep
- **WHEN** the child starts a navigation transition while background-tier downloads are in progress
- **THEN** the next background batch waits for the interaction to complete instead of competing with the transition

#### Scenario: App leaves foreground during background downloads
- **WHEN** the app state changes away from `active` while background-tier downloads remain
- **THEN** the background loop stops and remaining assets are left for a later scheduled prefetch

#### Scenario: Session budget is exhausted
- **WHEN** background-tier downloads reach the per-session file budget
- **THEN** the loop stops without failing the operation and the remaining assets are not downloaded this session

## ADDED Requirements

### Requirement: Cache metadata writes are debounced
The asset cache SHALL NOT rewrite its metadata file after every download batch. Metadata persistence SHALL be debounced so bursts of downloads produce a bounded number of writes, and pending metadata SHALL be flushed when a prefetch operation finishes and when cache maintenance runs. Batches that only confirm already-cached files SHALL NOT trigger a metadata write.

#### Scenario: Burst of downloads
- **WHEN** a prefetch operation downloads many files across consecutive batches
- **THEN** metadata is persisted a bounded number of times (debounced), not once per batch, and is flushed by the time the operation completes

#### Scenario: Cached-only batch
- **WHEN** a batch finds all of its files already cached and valid
- **THEN** no metadata write occurs
