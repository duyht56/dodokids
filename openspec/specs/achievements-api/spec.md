# achievements-api

## Purpose

Defines the backend endpoint that returns a child's gamification state (streak, week dots, derived badges, stickers), plus the equivalent local derivation used when the app runs offline.

## Requirements

### Requirement: GET /progress/:childId/achievements
The BE SHALL expose `GET /progress/:childId/achievements` returning the child's gamification state derived from their `progress` document, with no additional persisted fields for badges. Unknown child → `404`.

Response shape:
```json
{
  "streakCount": 7,
  "weekDots": [{ "day": "T2", "state": "done" }, { "day": "T6", "state": "today" }, { "day": "CN", "state": "future" }],
  "badges": [{ "id": "diligent", "emoji": "🔥", "label": "Chăm chỉ", "earned": true }],
  "stickers": [{ "week": 1, "emoji": "🐵", "bg": "#F0EBFF", "earned": true }]
}
```

#### Scenario: Existing child
- **WHEN** `:childId` matches an existing child
- **THEN** the endpoint returns HTTP 200 with the achievements object

#### Scenario: Unknown child
- **WHEN** `:childId` does not match any child
- **THEN** the endpoint returns HTTP 404

### Requirement: Derived Badges
The system SHALL compute a fixed-order list of 6 badges with an `earned` flag, derived only from `progress` (no stored badge state): `first_week` (≥1 sticker / week-5 done), `super_star` (≥3 lessons at 3 stars), `diligent` (streak ≥7), `graduate` (≥4 stickers), `champion` (≥12 stickers), `diamond` (streak ≥30).

#### Scenario: New child has no badges
- **WHEN** a child has streak 0 and no stickers
- **THEN** every badge returns `earned: false`

#### Scenario: Streak unlocks diligent
- **WHEN** `streakCount >= 7`
- **THEN** the `diligent` badge returns `earned: true`

### Requirement: Week Dots State
`weekDots` SHALL contain 7 entries (T2..CN, Monday-first). Each day in the current calendar week with recorded activity is `done`, today is `today`, future days are `future`.

#### Scenario: Today marked distinctly
- **WHEN** the achievements are fetched on a Friday with prior activity
- **THEN** Mon–Thu that had activity are `done`, Fri is `today`, Sat/Sun are `future`

### Requirement: Sticker Metadata Mapping
The system SHALL map `stickersEarned` (week numbers) to a static `WEEK_STICKERS` table (`emoji` + pastel `bg`) covering at least weeks 1–12, returning earned stickers plus a few subsequent locked entries.

#### Scenario: Earned and locked mix
- **WHEN** a child earned stickers for weeks 1 and 2
- **THEN** weeks 1–2 return `earned: true` and the next few weeks return `earned: false`

### Requirement: Offline Local Derivation
The mobile app SHALL derive the same achievements shape from the local `progress` store (`deriveAchievementsLocal`) so the Achievements screen works with no backend, using lesson-id matching to infer earned weeks (day-5 completed) and 3-star counts.

#### Scenario: Achievements render offline
- **WHEN** the backend is unreachable
- **THEN** the screen renders streak, badges, and stickers derived from the local store
