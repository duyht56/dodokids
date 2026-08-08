## ADDED Requirements

### Requirement: GET /progress/:childId/achievements
The BE SHALL expose `GET /progress/:childId/achievements` returning the child's gamification state derived from their `progress` document. No additional persisted fields are required for badges — they are computed.

> Note: No JWT/auth infrastructure exists; child is identified by `:childId` path param, matching `ProgressController` convention.

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
The BE SHALL compute a fixed-order list of 6 badges with an `earned` flag, derived only from `progress` (no stored badge state): `first_week` (≥1 sticker), `super_star` (≥3 lessons at 3 stars), `diligent` (streak ≥7), `graduate` (≥4 stickers), `champion` (≥12 stickers), `diamond` (streak ≥30).

#### Scenario: New child has no badges
- **WHEN** a child has streak 0 and no stickers
- **THEN** every badge returns `earned: false`

#### Scenario: Streak unlocks diligent
- **WHEN** `streakCount >= 7`
- **THEN** the `diligent` badge returns `earned: true`

### Requirement: Week Dots State
`weekDots` SHALL contain 7 entries (T2..CN, Monday-first). Each day in the current calendar week prior to or equal to today with recorded activity is `done`, today is `today`, future days are `future`. The current-week boundary uses the existing `startOfWeek` helper.

#### Scenario: Today marked distinctly
- **WHEN** the achievements are fetched on a Friday with prior activity
- **THEN** Mon–Thu that had activity are `done`, Fri is `today`, Sat/Sun are `future`

### Requirement: Sticker Metadata Mapping
The BE SHALL map `stickersEarned` (week numbers) to a static `WEEK_STICKERS` table (`emoji` + pastel `bg`) covering at least weeks 1–12, returning earned stickers plus a few subsequent locked entries. Weeks without metadata fall back to a default emoji/bg.

#### Scenario: Earned and locked mix
- **WHEN** a child earned stickers for weeks 1 and 2
- **THEN** weeks 1–2 return `earned: true` and the next few weeks return `earned: false`
