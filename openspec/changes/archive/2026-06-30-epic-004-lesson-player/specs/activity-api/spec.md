## ADDED Requirements

### Requirement: Lesson fetch reuses existing endpoints
The mobile client SHALL fetch the active lesson via the existing `GET /lessons/today?childId=<id>` endpoint (returns the lesson at the child's current week/day with populated activities, or a stub). Lessons remain day-level documents with activities in the separate Activity collection — no schema rewrite.

#### Scenario: Today endpoint returns active lesson
- **WHEN** client requests GET /lessons/today?childId=abc
- **THEN** response 200 with the lesson for the child's current (week, day) including activities, or a stub when none is imported

#### Scenario: Client falls back to mock on stub or error
- **WHEN** the lessons endpoint returns a stub or the request fails
- **THEN** the mobile LessonPlayer renders a built-in mock activity set so the flow remains playable

### Requirement: Complete-lesson awards XP (extends existing endpoint)
The existing `PATCH /progress/:childId/complete-lesson` SHALL additionally award a flat 100 XP per newly completed lesson, persist it on `child.progress.xp`, and include `xpEarned` and `xpTotal` in the response. Existing behavior (idempotency, streak, day/week advance, sticker on day 5) is preserved.

#### Scenario: First completion awards XP
- **WHEN** PATCH /progress/abc/complete-lesson is called for a not-yet-completed lessonId
- **THEN** child.progress.xp increases by 100 and the response includes xpEarned=100 and the new xpTotal

#### Scenario: Repeat completion is idempotent for XP
- **WHEN** the same lessonId is completed again
- **THEN** no additional XP is awarded and xpEarned=0

### Requirement: Streak calculation logic (existing, retained)
The system SHALL calculate streak as consecutive calendar days with at least one completed lesson. If the last completion was yesterday, streak increments; if the gap is greater than 1 day, streak resets to 1; same-day repeat does not change it.

#### Scenario: Consecutive day increments streak
- **WHEN** child completes a lesson today and lastLessonDate was yesterday
- **THEN** streakCount = previous + 1

#### Scenario: Gap resets streak
- **WHEN** child completes a lesson today and lastLessonDate was 2+ days ago
- **THEN** streakCount = 1

### Requirement: Weekly report endpoint and opt-out
The system SHALL expose `GET /progress/:childId/weekly-report` returning `{ lessonsThisWeek, streak, xpThisWeek, hasActivity }` for the current calendar week, and SHALL store a per-child `weeklyReportEnabled` flag (default true). A report-dispatch routine (callable on a Sunday schedule) SHALL skip children with `weeklyReportEnabled === false`, and use an encouraging reminder tone when `hasActivity === false`.

#### Scenario: Report reflects week activity
- **WHEN** GET /progress/abc/weekly-report is called after 3 completions this week
- **THEN** response includes lessonsThisWeek=3 and hasActivity=true

#### Scenario: Opt-out skips dispatch
- **WHEN** the report routine runs and weeklyReportEnabled === false for a child
- **THEN** no notification is produced for that child
