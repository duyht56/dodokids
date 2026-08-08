## MODIFIED Requirements

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
