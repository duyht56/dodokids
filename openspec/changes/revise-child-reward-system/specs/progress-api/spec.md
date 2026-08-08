## MODIFIED Requirements

### Requirement: GET /progress/:childId trả về progress hiện tại
`GET /progress/:childId` SHALL return a household-owned canonical reward/progress snapshot with position, completed lessons, streak, internal XP total, lesson best-stars, stable earned sticker IDs, last lesson date, reward revision, and entitlement. During migration it SHALL also expose or derive legacy week-number stickers without duplicating ownership. Response SHALL remain cacheable and completion sync SHALL invalidate the matching cache.

#### Scenario: Lấy canonical progress thành công
- **WHEN** an authorized session requests an existing child
- **THEN** response is `200 OK` with all snapshot fields including `rewardRevision` and `stickerIdsEarned`

#### Scenario: Legacy sticker data is readable
- **WHEN** a child has `stickersEarned: [1]` but no migrated stable IDs
- **THEN** response exposes `sticker-w01` as earned exactly once

#### Scenario: childId không tồn tại hoặc không thuộc household
- **WHEN** the requested child is absent from the authenticated household
- **THEN** the endpoint returns `404 Not Found`

### Requirement: PATCH /progress/:childId/complete-lesson cập nhật progress sau khi hoàn thành lesson
`PATCH /progress/:childId/complete-lesson` SHALL accept an additive versioned event payload containing `eventId`, `lessonId`, `contentVersion`, `weekPlanVersion`, `completedAt`, and canonical `activityResults`. It SHALL verify canonical identity, recompute stars, apply first-completion effects once, raise best-star on replay, award a stable sticker only after all frozen required lessons are complete, atomically advance reward revision, invalidate caches, and return `{ eventId, applied, eventResult, progress }`. Legacy payloads MAY be accepted during rollout but SHALL NOT be used for offline canonical sync.

#### Scenario: First completion stores rewards once
- **WHEN** a valid new event completes a not-yet-completed canonical lesson
- **THEN** completed lessons, internal XP, streak, position, stars, and revision update once and the response reports `applied: first_completion`

#### Scenario: Replay raises stars only
- **WHEN** a completed lesson is replayed with a higher verified score
- **THEN** best-stars increase while XP, streak, position, and stickers remain unchanged

#### Scenario: Duplicate event is idempotent
- **WHEN** the same `eventId` is sent again
- **THEN** no reward field changes and the response reports the stored/canonical duplicate result

#### Scenario: Catch-up completion earns sticker
- **WHEN** an event completes the last missing lesson in the frozen week plan regardless of day/order
- **THEN** `eventResult.stickerEarned` contains that week’s stable sticker and ownership is added once

#### Scenario: D5 alone is insufficient
- **WHEN** D5 completes but another required lesson in the frozen week plan is incomplete
- **THEN** no sticker is awarded

#### Scenario: Canonical identity mismatch
- **WHEN** `contentVersion`, `weekPlanVersion`, or activity membership is invalid
- **THEN** the endpoint returns a structured conflict/validation error and applies no reward state

#### Scenario: Concurrent events retry on revision conflict
- **WHEN** two events attempt to update the same child revision
- **THEN** the server serializes them by bounded compare-and-swap retry so first-completion effects occur once

### Requirement: GET /progress/:childId/achievements
`GET /progress/:childId/achievements` SHALL return streak/week dots, six monotonic cumulative badges, and all 48 catalog sticker entries with stable ID/week/world/name and earned state. Unknown or non-owned child SHALL return `404`.

#### Scenario: Existing child
- **WHEN** the child exists in the authenticated household
- **THEN** response is `200 OK` with 6 badges and 48 sticker entries

#### Scenario: Badge cannot relock
- **WHEN** a child once earned a world milestone and later current streak resets
- **THEN** the world badge remains earned because its cumulative sticker condition is unchanged
