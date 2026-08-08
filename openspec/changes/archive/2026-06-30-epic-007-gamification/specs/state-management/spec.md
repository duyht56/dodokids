## MODIFIED Requirements

### Requirement: Lesson Stars In Auth Store
The `authStore.progress` shape SHALL include `lessonStars: Record<string, number>` (default `{}`), persisted via `partialize`. A `setLessonStars(lessonId, stars)` action SHALL update an entry only when the new value exceeds the stored one (local best-score mirror).

#### Scenario: Best-score local mirror
- **WHEN** `setLessonStars('w1d1', 1)` is called while the store already holds 3 for `w1d1`
- **THEN** the stored value remains 3

#### Scenario: Higher score updates
- **WHEN** `setLessonStars('w1d2', 2)` is called and no value exists
- **THEN** the store records 2 for `w1d2`
