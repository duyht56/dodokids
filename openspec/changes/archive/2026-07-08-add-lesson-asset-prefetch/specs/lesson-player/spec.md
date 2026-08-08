## ADDED Requirements

### Requirement: Lesson player preloads current lesson assets before first activity
The Lesson Player SHALL attempt to preload all current lesson image/SVG/audio
assets into local cache after the lesson JSON is fetched and before hiding the
loading state.

#### Scenario: Preload failure falls back to remote URLs
- **WHEN** one or more asset downloads fail or time out
- **THEN** the lesson still renders and those assets use their original remote URLs

### Requirement: Lesson player opportunistically prefetches look-ahead assets
The app SHALL request the lesson prefetch manifest while the app is open and
download returned URLs into cache without blocking normal navigation.

#### Scenario: Look-ahead prefetch runs in app
- **WHEN** the child reaches Home or starts a lesson
- **THEN** the app starts a non-blocking prefetch for current week plus next 4 weeks
