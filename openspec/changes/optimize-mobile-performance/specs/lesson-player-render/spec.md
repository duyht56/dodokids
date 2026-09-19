## ADDED Requirements

### Requirement: LessonPlayer subscribes with selectors and memoizes the activity shell
`LessonPlayerScreen` SHALL read the auth store via field selectors rather than the whole store, and `ActivityContainer` SHALL be memoized so unrelated store changes do not reconcile it.

#### Scenario: Field-scoped store subscription
- **WHEN** LessonPlayer reads child/progress
- **THEN** it uses `useAuthStore(s => s.child)` and `useAuthStore(s => s.progress)`, so an unrelated store change (e.g. the parent-unlock timer) does not re-render it

#### Scenario: ActivityContainer is memoized
- **WHEN** the parent re-renders without a change to the activity/props
- **THEN** `ActivityContainer` (wrapped in `React.memo`) is not reconciled; a new `activity` identity still re-renders it as before
