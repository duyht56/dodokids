## ADDED Requirements

### Requirement: GET /parent/:childId/report
The BE SHALL expose `GET /parent/:childId/report?week={n}` returning the weekly report for the given child and week number. When `week` is omitted it SHALL default to the child's `currentWeek`. The response SHALL be derived server-side from the child's `progress` document and the static offline-task table; it SHALL NOT call any external LLM service.

Response shape:
```json
{
  "week": 2,
  "dateRange": "08/06 – 14/06",
  "locked": false,
  "subjectProgress": { "math": 80, "vietnamese": 70, "english": 60 },
  "strengths": "Bé học rất chăm môn Toán tư duy tuần này!",
  "growth": "Tuần tới mình cùng bé luyện thêm Tiếng Anh nhé.",
  "comparison": [
    { "week": 1, "average": 55 },
    { "week": 2, "average": 70 }
  ],
  "suggestions": [
    "Cùng bé đếm đồ vật trong nhà.",
    "Đọc một câu chuyện ngắn mỗi tối.",
    "Gọi tên màu sắc bằng Tiếng Anh."
  ]
}
```

#### Scenario: Existing child, unlocked week
- **WHEN** `:childId` matches an existing child and that week's day-5 lesson is completed
- **THEN** the endpoint returns HTTP 200 with `locked: false` and all report fields populated

#### Scenario: Unknown child
- **WHEN** `:childId` does not match any child
- **THEN** the endpoint returns HTTP 404

#### Scenario: Week defaults to current
- **WHEN** the `week` query parameter is omitted
- **THEN** the report is computed for the child's `currentWeek`

### Requirement: Report Lock Gate
The report SHALL be locked until the day-5 lesson of the requested week is completed. When locked, the endpoint SHALL return `locked: true` and SHALL omit or null out the AI-style copy (`strengths`, `growth`) and `suggestions`, while still returning `week` and `dateRange` so the client can render the locked preview.

#### Scenario: Week not yet complete
- **WHEN** the requested week's day-5 lesson is not in `completedLessons`
- **THEN** the endpoint returns HTTP 200 with `locked: true` and no `strengths`/`growth`/`suggestions` content

### Requirement: Templated Report Copy with Safety Filter
The `strengths` and `growth` text SHALL be generated from deterministic rule-based templates driven by `subjectProgress` (e.g. highest-scoring subject → strength, lowest-scoring subject → growth area), using positive, growth-mindset language. Generated text SHALL pass a forbidden-language check (no negative or comparative judgement words) before being returned.

#### Scenario: Strength reflects top subject
- **WHEN** `math` has the highest `subjectProgress` value
- **THEN** the `strengths` text references Toán tư duy

#### Scenario: Forbidden language filtered
- **WHEN** a generated string would contain a forbidden word
- **THEN** the response substitutes a safe fallback phrase and never returns the forbidden word

### Requirement: Comparison Series
For week 2 and later, the response SHALL include a `comparison` array of up to the last 4 weeks, each entry `{ week, average }` where `average` is the mean of that week's `subjectProgress` values (0–100). For week 1 the array MAY contain a single entry.

#### Scenario: Four-week window
- **WHEN** the requested week is 5
- **THEN** `comparison` contains entries for weeks 2, 3, 4, and 5

### Requirement: Next-Week Suggestions
The response SHALL include a `suggestions` array of exactly 3 activity suggestion strings drawn from the offline-task table and weighted toward the child's lowest-scoring subject.

#### Scenario: Three suggestions returned
- **WHEN** the report is unlocked
- **THEN** `suggestions` has length 3

### Requirement: Report Caching
The computed report for a given `(childId, week)` SHALL be cached server-side and reused on subsequent requests until the child's progress for that week changes.

#### Scenario: Repeat request served from cache
- **WHEN** the same `(childId, week)` report is requested twice with no intervening progress change
- **THEN** the second response is identical to the first
