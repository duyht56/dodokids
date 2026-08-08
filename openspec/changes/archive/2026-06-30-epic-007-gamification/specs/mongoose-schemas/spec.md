## MODIFIED Requirements

### Requirement: Child Progress Schema
The `ChildProgress` sub-schema SHALL include a `lessonStars` map (lessonId → star count 1–3) in addition to the existing fields (`currentWeek`, `currentDay`, `completedLessons`, `streakCount`, `xp`, `lastLessonDate`, `stickersEarned`). It SHALL be declared `@Prop({ type: Map, of: Number, default: {} })` and default to an empty map.

#### Scenario: New child default
- **WHEN** a child document is created
- **THEN** `progress.lessonStars` is an empty map (no stored stars yet)

#### Scenario: Persisting a star score
- **WHEN** a lesson is completed with 2 stars
- **THEN** `progress.lessonStars` contains an entry mapping that lessonId to 2
