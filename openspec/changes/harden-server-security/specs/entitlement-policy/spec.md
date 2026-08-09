## ADDED Requirements

### Requirement: Legacy lesson completion is gated by entitlement and lesson existence
The legacy (`eventId`-less) `PATCH /progress/:childId/complete-lesson` path SHALL NOT credit a completion or advance `progress.currentWeek` unless (a) the lesson exists as an `imported` lesson AND (b) the lesson's week is within the child's effective entitlement window. Read access derived from `currentWeek` MUST NOT be inflatable via this path.

#### Scenario: Fabricated lessonId is rejected
- **WHEN** a client sends a legacy completion with a `lessonId` that has no `imported` lesson in the database
- **THEN** the server responds 404 (`Lesson not found`) and does not modify `progress`

#### Scenario: Completing a lesson beyond the entitlement window is forbidden
- **WHEN** an active `monthly` subscriber at current week W sends a legacy completion for a lesson whose week `> maxUnlockedWeek(effective entitlement, W)`
- **THEN** the server responds 403 `{ requiresUpgrade: true }` and `progress.currentWeek`, `completedLessons`, and `stickersEarned` are unchanged

#### Scenario: Completing an in-window lesson still works
- **WHEN** a child sends a legacy completion for an existing `imported` lesson whose week is within the effective entitlement window
- **THEN** the completion is credited and `currentWeek` advances by the normal rolling amount (at most `accessibleWeek + 1`)

#### Scenario: Effective entitlement matches read gating
- **WHEN** the entitlement window is computed for a legacy completion
- **THEN** it uses `EntitlementService.viewForChild` (including any active campaign overlay), identical to `EntitlementGuard`, so the write side cannot grant access the read side would deny

#### Scenario: Canonical path is unchanged
- **WHEN** a completion carries a valid `eventId` (canonical path)
- **THEN** existing frozen-week-plan and membership validation applies unchanged; this requirement adds no new restriction to the canonical path
