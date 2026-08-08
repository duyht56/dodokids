## ADDED Requirements

### Requirement: Approved bundled Vietnamese audio pack
The mobile app SHALL bundle a versioned, approved Vietnamese Explore audio pack containing number names 0–50 and every finite instruction/object-label clip required by publicly enabled audio-dependent number/count modes. Every bundled clip MUST have a stable audio key and source/license metadata.

#### Scenario: Release pack is verified
- **WHEN** the Explore audio manifest is checked for release
- **THEN** every required key resolves to an approved bundled file and no required key resolves to a network URL

### Requirement: Static local audio resolution
Explore SHALL resolve bundled audio keys through a Metro-compatible static registry. A missing or unknown key MUST return an unavailable capability result and MUST NOT silently use network audio or reveal an audio-dependent answer visually.

#### Scenario: Required key is missing
- **WHEN** an audio-dependent mode requests a key absent from the bundled registry
- **THEN** that mode is unavailable and the visual offline modes remain available

### Requirement: Offline playback lifecycle
Explore SHALL preload and replay resolved clips through the approved mobile audio player while offline, and SHALL stop/release screen-scoped playback when the Explore session unmounts. Playback state MUST NOT be persisted as play history or progress.

#### Scenario: Child replays a number clip in airplane mode
- **WHEN** a bundled number clip is replayed without network connectivity
- **THEN** the clip plays from the app bundle and no server request, attempt record or progress write occurs

### Requirement: Audio capability verification
The app SHALL derive audio capability from the actual bundled manifest and SHALL expose enough typed state for game/mode selection to distinguish `available`, `missing` and `unsupported-version`. Public offline audio flags MUST NOT be enabled until automated manifest tests and Android/iOS airplane-mode checks pass.

#### Scenario: Pack version is unsupported
- **WHEN** public config requires an audio-pack version not installed in the app
- **THEN** audio-dependent modes remain disabled while compatible visual offline modes continue to run

