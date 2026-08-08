## ADDED Requirements

### Requirement: Home derives week presentation in one progress pass
The Home screen SHALL derive completed days and displayed best stars for all weeks from `completedLessons` and `lessonStars` in a single memoized pass per relevant progress change. Rendering an individual week node SHALL use constant-time lookups and MUST NOT rescan the full completion or star collection.

The optimization MUST preserve the existing product semantics: a completed week displays the highest lesson-star value recorded in that week, clamped to 1–3 with a minimum of 1, and day completion is derived from distinct completed lesson days.

#### Scenario: Progress change rebuilds derived maps once
- **WHEN** `completedLessons` or `lessonStars` changes
- **THEN** Home rebuilds its week-indexed derived data once and all week nodes read from that result

#### Scenario: Star behavior remains unchanged
- **WHEN** a completed week contains lesson scores `3, 1, 2, 1, 1`
- **THEN** the week node displays 3 stars, matching the behavior before this performance change

### Requirement: Adventure Map uses bounded rendering
The 48-week Adventure Map SHALL use a virtualized or equivalently bounded rendering strategy so that entering Home does not mount every week node and all of its day-dot descendants at once. The child SHALL still be able to scroll to every week, and the current week SHALL remain the initial visible target.

#### Scenario: Home opens near the current week
- **WHEN** Home mounts for a child at week 24
- **THEN** the map opens near week 24 without first mounting all 48 week nodes

#### Scenario: Child scrolls across the full curriculum
- **WHEN** the child scrolls toward an off-window week
- **THEN** the required week nodes are rendered on demand and remain visually equivalent to the existing Adventure Map

### Requirement: Week nodes avoid unrelated rerenders
Week nodes SHALL be memoized with stable data and event inputs so an unrelated Home state change, such as opening the parent gate, does not rerender every visible week node.

#### Scenario: Parent gate visibility changes
- **WHEN** Home changes only the parent-gate visibility state
- **THEN** unchanged visible week nodes are not rerendered

### Requirement: Performance regression checks cover repeated navigation
The mobile verification suite SHALL include a deterministic navigation-state check and a release-build profiling checklist for repeated child destination switching.

#### Scenario: Home and Explore are switched repeatedly
- **WHEN** an automated or instrumented check switches Home and Explore 20 times
- **THEN** the number of tab roots remains constant, no duplicate Home or Explore route instances accumulate, and the app remains responsive

