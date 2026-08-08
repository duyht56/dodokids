# asset-cache Specification

## Purpose
TBD - created by archiving change add-lesson-asset-prefetch. Update Purpose after archive.
## Requirements
### Requirement: Asset cache resolves remote URLs to local files
The mobile app SHALL cache remote image, SVG, audio, and video URLs on disk and
return the local URI for rendering/playback when the file exists.

#### Scenario: Cached file is used
- **WHEN** a visual or audio URL has a valid cached file
- **THEN** the renderer/player uses the local URI

#### Scenario: Cache miss uses remote URL
- **WHEN** no cached file exists for a URL
- **THEN** the renderer/player uses the original remote URL

### Requirement: Asset cache prunes stale entries
The asset cache SHALL prune entries older than 30 days. Pruning SHALL be scheduled outside active navigation transitions and throttled so normal Home remounts, progress changes, or lesson completion do not repeat a full metadata scan within the configured maintenance interval.

#### Scenario: Old entry is deleted
- **WHEN** scheduled cache maintenance encounters an entry older than the TTL
- **THEN** the local file and metadata entry are removed

#### Scenario: Navigation occurs after recent maintenance
- **WHEN** Home mounts or progress changes after cache maintenance already ran within the interval
- **THEN** the app skips another full prune scan

### Requirement: Look-ahead prefetch is deferred and single-flight
Look-ahead manifest retrieval and asset downloads SHALL start only after active navigation interactions complete. The cache service SHALL coalesce concurrent requests for the same child and look-ahead scope into one in-flight operation.

#### Scenario: Home enters during a transition
- **WHEN** Home mounts while its navigation transition is active
- **THEN** manifest retrieval and downloads wait until the interaction completes

#### Scenario: Multiple callers request the same manifest
- **WHEN** Home, Lesson Player, or Lesson Complete request the same child/scope while a matching prefetch is running
- **THEN** they share the existing operation instead of starting duplicate API requests and downloads

### Requirement: Asset prefetch uses lesson priority
The prefetch scheduler SHALL prioritize critical assets for the current lesson and next lesson before farther look-ahead lessons. Farther-week downloads SHALL run as background work and MUST NOT block navigation or first activity interaction.

#### Scenario: Current and future assets are uncached
- **WHEN** a manifest contains uncached assets for the current lesson, next lesson, and later weeks
- **THEN** current-lesson assets are processed first, next-lesson assets second, and later-week assets only as background work

#### Scenario: Cached asset is encountered
- **WHEN** an asset has valid cache metadata and a valid local file
- **THEN** it is reused without downloading the bytes again
