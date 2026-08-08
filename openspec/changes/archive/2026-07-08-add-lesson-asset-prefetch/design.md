# Design: Lesson Asset Prefetch

## Approach

The server returns a manifest of public bucket URLs. The mobile app downloads
those URLs directly into Expo's cache directory with a 30-day TTL. Runtime
rendering/audio playback resolves a remote URL to the cached local URI when
available and falls back to the remote URL on any cache miss or failure.

## Server

`GET /lessons/prefetch-manifest?childId=&lookaheadWeeks=4` resolves the child,
applies the existing entitlement policy, fetches imported lessons in the allowed
week range, populates activities, and recursively extracts `imageUrl`,
`thumbnailUrl`, `videoUrl`, and `audioFiles.*`.

## Mobile

`assetCache` owns file-system writes, metadata, dedupe, TTL pruning, current
lesson preloading, and manifest prefetch. `LessonPlayerScreen` blocks briefly on
current lesson preload with a timeout. `HomeScreen` and `LessonPlayerScreen`
trigger look-ahead prefetch opportunistically.

## Failure Behavior

Cache failures never block lesson completion. The visual/audio layers use the
original remote URL whenever a local file is missing or stale.
