## MODIFIED Requirements

### Requirement: Real Star Reporting
The Lesson Player SHALL accumulate real `activityResults` (activityId, attemptCount, outcome) during the session and compute `stars` from `correctFirstTry` before completing the lesson, replacing the hardcoded `stars: 3`. It SHALL send both `stars` and `activityResults` to `complete-lesson`, store the returned stars via `setLessonStars`, and pass the real star count to the Lesson Complete screen.

#### Scenario: Mixed performance reports correct stars
- **WHEN** the child finishes a lesson with 3 first-try correct answers
- **THEN** the player sends `stars: 2` (not 3) along with the activity results

#### Scenario: Results drive completion payload
- **WHEN** the lesson completes
- **THEN** `activityResults` reflects each activity's actual `attemptCount` and `outcome`
