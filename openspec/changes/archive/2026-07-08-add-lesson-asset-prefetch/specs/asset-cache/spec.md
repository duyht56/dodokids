## ADDED Requirements

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
The asset cache SHALL prune entries older than 30 days.

#### Scenario: Old entry is deleted
- **WHEN** a cache entry is older than the TTL
- **THEN** the local file and metadata entry are removed
