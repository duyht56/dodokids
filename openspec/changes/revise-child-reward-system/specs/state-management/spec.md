## ADDED Requirements

### Requirement: rewardSyncStore persists pending completion events
The mobile app SHALL maintain a fully typed persisted `rewardSyncStore` containing pending completion events per child, queue status, retry metadata, and reveal-consumed state. It SHALL deep-merge safe defaults when hydrating storage from versions before the store existed.

#### Scenario: Pending event hydrates after restart
- **WHEN** AsyncStorage contains a queued event and the app cold-starts
- **THEN** the typed event is restored and remains eligible for sync

#### Scenario: Legacy app state has no queue
- **WHEN** storage predates `rewardSyncStore`
- **THEN** hydration produces an empty queue rather than `undefined` or an error

### Requirement: Canonical snapshot replaces incremental reward mutations
On successful completion sync, the state layer SHALL atomically replace canonical progress fields from the returned snapshot. The lesson completion path MUST NOT independently call additive/incremental actions such as `addXp`, locally increment streak, or separately advance completed-day state for the same canonical event.

#### Scenario: First completion sync succeeds
- **WHEN** the server returns revision N with XP total, streak, position, stars, and stickers
- **THEN** local canonical progress equals snapshot N after one atomic reconciliation

#### Scenario: Replay returns zero completion rewards
- **WHEN** a replay response contains only a higher best-star
- **THEN** local XP/streak/position/stickers remain equal to the server snapshot and are not incremented optimistically

### Requirement: Local reward projection is explicitly pending
While offline, the state layer MAY project the result of a queued canonical event for immediate UX, but SHALL track that projection separately from the last acknowledged server snapshot. When sync completes, the snapshot plus any still-pending later events SHALL be reprojected deterministically.

#### Scenario: Offline sticker projection
- **WHEN** the queued event locally completes the frozen required lesson set
- **THEN** the UI may reveal the sticker while the event remains marked pending

#### Scenario: Server snapshot arrives with another device’s progress
- **WHEN** sync returns a newer revision containing additional canonical progress
- **THEN** local state starts from that snapshot and reapplies only unresolved later events
