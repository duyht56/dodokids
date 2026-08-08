# lesson-player

## Purpose

Defines the in-lesson activity player: header/progress, mascot speech bubble, the question image zone, single-select answer options with correct/wrong states, tablet split-panel layout, and auto-advance behavior.
## Requirements
### Requirement: Display activity with progress bar
The system SHALL display a header with back button, lesson title (e.g. "Tuần 3 · Bài 2"), a teal progress bar showing current question index out of total (e.g. 4/8), and a counter label.

#### Scenario: Progress bar fills proportionally
- **WHEN** user is on question 4 of 8
- **THEN** progress bar fills to 50% with sky/teal color (#4ECDC4)

### Requirement: Show mascot speech bubble
The system SHALL display Đô Đô mascot (dodo.png, 66pt mobile / 240pt tablet) with a teal speech bubble containing the question prompt text.

#### Scenario: Speech bubble renders with tail
- **WHEN** LessonPlayerScreen mounts
- **THEN** dodo image appears left of a teal (#4ECDC4) rounded bubble with a left-pointing tail

### Requirement: Render question image zone
The system SHALL display a pastel-pink radial gradient image zone (mobile: 208pt height, tablet: 230pt) containing the subject images for the current question (e.g. 4 clay-leaf tiles).

#### Scenario: Image zone shows correct count of subject images
- **WHEN** question has 4 answer objects
- **THEN** 4 images render in a wrapped grid inside the image zone with rounded corners and soft shadow

### Requirement: Single-select answer options (2×2 grid)
The system SHALL delegate rendering of the current activity's content to `ActivityContainer`, which routes to the matching activity component by `actionType` (`single_select`, `multi_select`, `sort_sequence`, `match_pair`, `count_tap`, `watch_video`). The player no longer renders the option grid directly; single-select's 2×2 / 2×1 / row layouts are provided by the `single-select-activity` capability. The player passes the active `Activity` to the container and reacts to its `onCorrect` / `onWrong` outcomes.

#### Scenario: Player delegates to container
- **WHEN** the player renders the current activity
- **THEN** it mounts `ActivityContainer` with that activity, and the container renders the component matching the activity's `actionType`

#### Scenario: Single-select still renders as a grid
- **WHEN** the current activity is `single_select`
- **THEN** the container routes to SingleSelectActivity, which renders the option grid for the payload's `layout`

#### Scenario: Outcome drives the player flow
- **WHEN** the container reports a correct outcome
- **THEN** the player records the result and advances (auto-advance timing unchanged)

### Requirement: Tablet split-panel layout
The system SHALL render a two-column layout on screens ≥768pt: left panel (38% width) with Đô Đô floating + speech bubble (kido-float), right panel (62%) with question image and options grid.

#### Scenario: Tablet renders Đô Đô fixed panel
- **WHEN** screen width ≥ 768pt
- **THEN** left panel shows dodo with kido-float animation and teal speech card; right panel shows question + 2×2 options

### Requirement: Auto-advance on correct answer
The system SHALL auto-advance to next question after 1200ms delay when correct answer is selected.

#### Scenario: Auto-advance timing
- **WHEN** correct answer selected
- **THEN** after 1200ms the next question renders (or LessonComplete if last question)

### Requirement: Mixed-type lesson playback
The player SHALL play a lesson whose activities mix any of the six `actionType`s in sequence, advancing through them and finishing the lesson after the last activity regardless of each activity's type.

#### Scenario: Lesson mixes activity types
- **WHEN** a lesson contains a `count_tap` activity followed by a `match_pair` activity
- **THEN** the player renders each in turn through the container and proceeds to LessonComplete after the last one

#### Scenario: Unmappable activity does not block the lesson
- **WHEN** an activity cannot be mapped to a supported type
- **THEN** the player skips it (or shows a non-crashing fallback) and the lesson remains completable

### Requirement: Real Star Reporting
The Lesson Player SHALL accumulate real `activityResults` (activityId, attemptCount, outcome) during the session and compute `stars` from `correctFirstTry` before completing the lesson, replacing the hardcoded `stars: 3`. It SHALL send both `stars` and `activityResults` to `complete-lesson`, store the returned stars via `setLessonStars`, and pass the real star count to the Lesson Complete screen.

#### Scenario: Mixed performance reports correct stars
- **WHEN** the child finishes a lesson with 3 first-try correct answers
- **THEN** the player sends `stars: 2` (not 3) along with the activity results

#### Scenario: Results drive completion payload
- **WHEN** the lesson completes
- **THEN** `activityResults` reflects each activity's actual `attemptCount` and `outcome`

### Requirement: Lesson player preloads current lesson assets before first activity
After lesson JSON is fetched, the Lesson Player SHALL prepare the assets required by the first activity before hiding the loading state. It MUST NOT wait for assets used only by later activities before making the first activity interactive. Remaining lesson assets SHALL continue preloading in the background.

#### Scenario: First activity assets are cached
- **WHEN** the lesson JSON resolves and the first activity assets already exist locally
- **THEN** the first activity becomes interactive without waiting for cache checks or downloads for later activities

#### Scenario: First activity asset is missing
- **WHEN** a critical first-activity asset is not cached
- **THEN** the player attempts that critical download and then renders using the cached URI or original remote URL if download fails

#### Scenario: Later activity assets are missing
- **WHEN** assets for later activities are not cached
- **THEN** the first activity remains interactive while those assets preload in the background

### Requirement: Lesson player opportunistically prefetches look-ahead assets
The app SHALL request entitlement-aware look-ahead manifests while the app is open without blocking normal navigation. Current and next lesson assets SHALL receive higher priority than farther weeks, manifest requests SHALL be single-flight per child/scope, and callers SHALL not independently launch duplicate look-ahead downloads.

#### Scenario: Look-ahead prefetch runs after interaction
- **WHEN** the child reaches Home or completes a lesson
- **THEN** one deferred prefetch operation may begin after navigation interactions complete

#### Scenario: Lesson Player already has an active prefetch
- **WHEN** another screen requests the same look-ahead scope
- **THEN** it joins or reuses the existing operation rather than downloading the same manifest assets again
