## MODIFIED Requirements

### Requirement: Progress Card
`ParentDashboardScreen` SHALL render a Progress Card at the top showing per-subject weekly progress as labeled progress bars: Toán, Tiếng Việt, and Tiếng Anh, each with its percentage (from `GET /parent/:childId/summary` `subjectProgress`). The card SHALL also surface a week label. Subject bars SHALL use the design's subject colors (Toán coral, Tiếng Việt teal, Tiếng Anh amber). While the summary is loading, `SkeletonLoader` placeholders SHALL stand in for the bars.

#### Scenario: Subject bars rendered from summary
- **WHEN** `GET /parent/:childId/summary` resolves with `subjectProgress: { math, vietnamese, english }`
- **THEN** the card renders three labeled bars (Toán / Tiếng Việt / Tiếng Anh) filled to the respective percentages

#### Scenario: Loading state
- **WHEN** the summary request is in-flight
- **THEN** skeleton placeholders are shown in place of the subject bars (no blank area)

#### Scenario: Offline fallback
- **WHEN** the summary request fails and no server data is available
- **THEN** the card derives subject percentages from the local `progress` store so the card is never blank

## ADDED Requirements

### Requirement: Dashboard Hosted As Tab
The parent dashboard SHALL be hosted as the `Dashboard` tab of the parent bottom tab navigator (initial route), not as a standalone screen reached via `goBack` from the child stack.

#### Scenario: Dashboard is the initial parent tab
- **WHEN** the parent area opens
- **THEN** the dashboard renders as the focused `Dashboard` tab with no in-screen back button to the child stack
