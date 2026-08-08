## MODIFIED Requirements

### Requirement: Lesson player preloads current lesson assets before first activity
After lesson JSON is fetched, the Lesson Player SHALL prepare the assets required by the first activity before hiding the loading state, bounded by a critical-preparation time budget. It MUST NOT wait for assets used only by later activities before making the first activity interactive, and it MUST NOT hold the loading state longer than the time budget waiting for critical downloads: when the budget elapses, the first activity SHALL render using whatever URIs are already cached plus original remote URLs for the rest, while downloads continue in the background. Remaining lesson assets SHALL continue preloading in the background.

#### Scenario: First activity assets are cached
- **WHEN** the lesson JSON resolves and the first activity assets already exist locally
- **THEN** the first activity becomes interactive without waiting for cache checks or downloads for later activities

#### Scenario: First activity asset is missing
- **WHEN** a critical first-activity asset is not cached
- **THEN** the player attempts that critical download within the time budget and then renders using the cached URI or the original remote URL for assets that did not finish in time

#### Scenario: Slow network exceeds the budget
- **WHEN** critical downloads are still running when the time budget elapses
- **THEN** the loading state ends, the first activity renders with remote URLs where needed, and the in-flight downloads continue in the background for later hydration

#### Scenario: Later activity assets are missing
- **WHEN** assets for later activities are not cached
- **THEN** the first activity remains interactive while those assets preload in the background

## ADDED Requirements

### Requirement: Lesson fetch uses a cached query layer
The Lesson Player and Preparing Lesson flows SHALL fetch the current lesson through a shared cached query keyed by child, so that reopening the lesson within the configured staleness window does not issue a duplicate network request. The mock-lesson fallback on fetch failure SHALL be preserved.

#### Scenario: Lesson reopened while fresh
- **WHEN** the child opens the Lesson Player after the same lesson was fetched within the staleness window (for example right after Preparing Lesson)
- **THEN** the cached lesson is used without a new `/lessons/today` request

#### Scenario: Fetch fails
- **WHEN** the lesson request fails
- **THEN** the player falls back to the mock lesson exactly as before
