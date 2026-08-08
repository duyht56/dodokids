## ADDED Requirements

### Requirement: Public stateless catalog and config API
The server MAY provide catalog, versioned config, feature flags and dependency manifests. These endpoints SHALL NOT return recent-play, progress or resumable-session metadata.

#### Scenario: Mobile fetches catalog config
- **WHEN** the Explore catalog requests current configuration
- **THEN** the server returns game-level configuration without reading or creating child play records

### Requirement: Stateless server exercise generation
For a `server` runtime game, the server SHALL accept a non-historical generation request and return a bounded batch of validated exercises. It SHALL NOT create a session ID, attempt ID or child-scoped persistence.

#### Scenario: Server game requests exercises
- **WHEN** mobile requests a fresh batch for an enabled game and level
- **THEN** the server returns versioned validated exercises and stores no play record

### Requirement: No outcome submission
The Explore API SHALL NOT expose endpoints for submitting answers, tries, hints, completion, duration, exit state or progress. Mobile SHALL NOT send these values through generic analytics endpoints.

#### Scenario: Child finishes an exercise
- **WHEN** local validation produces an outcome
- **THEN** mobile advances the in-memory run without any network write containing the outcome

### Requirement: No Explore play persistence
The server data model SHALL NOT include Explore session, attempt, history, progress, adaptive evidence or report aggregates keyed directly or indirectly to a child/device/account.

#### Scenario: Privacy contract is tested
- **WHEN** server schema and route contract tests run
- **THEN** no Explore play-history collection or persistence path is present

