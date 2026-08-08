# count-tap-activity Specification (delta)

## MODIFIED Requirements

### Requirement: Scene with tappable objects (phase 1)
The system SHALL render the scene as two layers: a static `payload.backgroundAsset` filling the content zone (a scene that contains NO countable objects), and exactly `payload.targetCount` independent tappable sprites, each rendered from `payload.targetAsset` (a single isolated object image), overlaid on the background. A live counter ("n {targetObject}") SHALL be shown. Tapping an untapped sprite SHALL highlight it (coral outline + numbered badge), increment the counter, and play the next count word ("Một", "Hai", "Ba"… via Vietnamese TTS). The same sprite SHALL NOT be counted twice. The component SHALL NOT fall back to a hardcoded emoji when a real asset is present.

#### Scenario: Tap counts an object
- **WHEN** the child taps an untapped sprite
- **THEN** the sprite gets a coral outline and a numbered badge, the counter increments, and the corresponding count word is spoken

#### Scenario: Re-tap ignored
- **WHEN** the child taps an already-counted sprite
- **THEN** the counter does not change and no new badge is added

#### Scenario: Object matches the target
- **WHEN** an activity for `targetObject` "con bướm" with `targetCount` 5 is rendered from real assets
- **THEN** the background shows the object-free scene and exactly 5 butterfly sprites are shown (not a leaf emoji)

## ADDED Requirements

### Requirement: Non-overlapping seeded sprite layout
The system SHALL position the `targetCount` sprites using a safe-zone layout that guarantees no two sprites overlap for any `targetCount` up to the layout's capacity, and that keeps every sprite clear of the counter badge and the scene footer. Positions SHALL be derived deterministically from the activity id (a seeded pseudo-random layout), so that the layout is stable across re-mounts of the same activity but differs between different activities. The system SHALL NOT reuse a fixed slot list that collides when `targetCount` exceeds the number of slots.

#### Scenario: Positions stable across re-mount
- **WHEN** the same activity is rendered, unmounted, and rendered again
- **THEN** the sprites appear in the same positions both times

#### Scenario: No collision at high counts
- **WHEN** an activity has a `targetCount` larger than the old fixed slot count (e.g. 10)
- **THEN** all sprites occupy distinct, non-overlapping positions and each can be tapped independently

#### Scenario: Different activities differ
- **WHEN** two different count_tap activities with the same `targetCount` are rendered
- **THEN** their sprite layouts are not identical

### Requirement: Layered count_tap payload contract
The `count_tap` payload SHALL carry `backgroundAsset` (an `AssetReference` to an object-free scene) and `targetAsset` (an `AssetReference` to a single isolated object) instead of a single `sceneImage`. The mobile component and the kido-pipeline web replica SHALL both consume this layered shape and render identically.

#### Scenario: Web replica matches mobile
- **WHEN** the same count_tap activity is opened in the kido-pipeline web player
- **THEN** it renders the background layer plus `targetCount` tappable sprites with the same counting interaction as the mobile component

#### Scenario: Old single-scene payload rejected by mapping
- **WHEN** an activity payload carries only the legacy `sceneImage` and no `targetAsset`
- **THEN** the normalization does not silently render a wrong single image; it maps to the layered shape only when `targetAsset` is present
