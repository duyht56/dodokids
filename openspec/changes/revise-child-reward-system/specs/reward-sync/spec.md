## ADDED Requirements

### Requirement: Durable completion-event queue
The mobile app SHALL persist each canonical lesson completion as a versioned reward event before navigating away from the lesson. Pending events SHALL survive app restart, SHALL be scoped to the active child, and SHALL be removed only after a successful canonical response or a surfaced terminal validation result.

#### Scenario: App closes before sync
- **WHEN** a canonical lesson completion is queued while offline and the app is terminated
- **THEN** the same event remains pending after restart with the same `eventId` and completion payload

#### Scenario: Queue write precedes result navigation
- **WHEN** the child completes the last activity of a canonical lesson
- **THEN** the durable event write completes before Lesson Complete is shown

### Requirement: Only canonical lessons create durable rewards
A completion event SHALL be reward-eligible only when the played lesson has a server-issued `lessonId`, `contentVersion`, and frozen `weekPlanVersion`. Stub, mock, demo, Explore, Practice Bank, and unmappable lessons MUST NOT update canonical completed lessons, stars, streak, XP, stickers, or badges.

#### Scenario: Cached canonical lesson completes offline
- **WHEN** an imported lesson with valid reward context was cached before the device went offline and is completed offline
- **THEN** the app queues a reward-eligible event and may project its result immediately

#### Scenario: Mock fallback completes
- **WHEN** a built-in mock lesson is played because canonical content is unavailable
- **THEN** the session may show demo feedback but no durable reward event or canonical progress mutation is created

### Requirement: Idempotent server event processing
The server SHALL process reward events idempotently per household, child, and `eventId`. Duplicate delivery MUST NOT add XP, advance position, change streak, add a sticker, or replay a milestone more than once. Different events for the same child SHALL be serialized through a monotonic reward revision or equivalent atomic concurrency guard.

#### Scenario: Same event is delivered twice
- **WHEN** the mobile retries an event after the first response was lost
- **THEN** the server returns the stored/canonical result without applying first-completion effects again

#### Scenario: Two devices complete the same lesson
- **WHEN** two distinct events for the same child and lesson arrive concurrently
- **THEN** only one event applies first-completion effects and the other is treated as replay/duplicate for reward purposes

### Requirement: Canonical reward snapshot reconciliation
Every successful event response SHALL include the event result plus a canonical progress snapshot containing position, completed lesson IDs, streak, internal XP total, lesson best-stars, earned stable sticker IDs, last completion date, and reward revision. Mobile SHALL replace canonical local fields from this snapshot and MUST NOT reconcile them using independent increment or unrestricted union operations.

#### Scenario: Offline projection differs from server
- **WHEN** a pending local projection is later synced and the server returns a different canonical streak or position
- **THEN** mobile adopts the server snapshot while preserving only still-pending events as projections

#### Scenario: Snapshot already includes pending event
- **WHEN** app restart fetches a snapshot whose revision includes an event still present locally
- **THEN** the queue recognizes the event as applied and removes it without adding rewards again

### Requirement: Single-flight ordered queue drain
The app SHALL run at most one reward sync drain per child at a time, process events in creation order, retry transient network/server failures with bounded backoff, and stop on authentication/session invalidation until session recovery succeeds.

#### Scenario: Multiple screens request sync
- **WHEN** app bootstrap and Lesson Complete request sync simultaneously
- **THEN** both callers join the same active drain instead of posting duplicate parallel events

#### Scenario: Transient network failure
- **WHEN** event sync fails due to timeout or unavailable server
- **THEN** the event stays queued and is retried later without blocking the child from leaving the result screen
