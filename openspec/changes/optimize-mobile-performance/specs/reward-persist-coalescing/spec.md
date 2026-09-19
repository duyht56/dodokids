## ADDED Requirements

### Requirement: Reward queue persistence is coalesced without losing enqueue durability
The reward sync store SHALL persist the initial enqueue synchronously (durable before result navigation), while coalescing the writes that occur during a drain into a debounced flush.

#### Scenario: Enqueue stays durable before navigation
- **WHEN** `enqueueLessonReward` runs
- **THEN** the queued event is written to disk before the promise resolves (LessonPlayer awaits it before `navigation.replace`)

#### Scenario: Drain writes are coalesced
- **WHEN** a drain applies multiple responses/retries in quick succession
- **THEN** the per-mutation disk writes are coalesced (debounced) into roughly one write, and a final flush runs when the drain finishes

#### Scenario: No data loss on a coalesced write lost to a crash
- **WHEN** a debounced write is lost to a crash mid-drain
- **THEN** the still-pending event re-sends on next launch and the server (idempotent by `eventId`) returns a duplicate, which is reconciled — no reward is lost
