# count-tap-activity Specification

## Purpose
TBD - created by archiving change epic-005-activity-types. Update Purpose after archive.
## Requirements
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

### Requirement: Number answer selection (phase 2)
After all objects are tapped (or the child confirms), the system SHALL present `payload.answerOptions` as four large number buttons (minimum 80×80pt). Selecting a number SHALL compare it to `payload.targetCount` and report the outcome.

#### Scenario: Answer options appear after counting
- **WHEN** every scene object has been tapped
- **THEN** four number buttons from `answerOptions` are shown

#### Scenario: Correct number chosen
- **WHEN** the child selects the number equal to `targetCount`
- **THEN** a correct outcome is reported

### Requirement: Reset counting
The system SHALL provide a "Đếm lại 🔄" reset that clears all tapped objects and the counter so the child can count again.

#### Scenario: Reset clears progress
- **WHEN** the child taps "Đếm lại"
- **THEN** all object highlights and badges are removed and the counter returns to 0

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

The `count_tap` payload SHALL carry one `targetAsset` referencing a single isolated object and MAY carry a `surface` descriptor. In legacy or `surface.mode: 'scene'` content, `backgroundAsset` SHALL reference an object-free scene. In `surface.mode: 'pastel'` content, `backgroundAsset` MAY be absent and mobile/web SHALL render a deterministic pastel surface. Both modes SHALL clone `targetAsset` exactly `targetCount` times using a seeded non-overlapping layout; a legacy single `sceneImage` SHALL NOT substitute for the isolated target sprite. The mobile component and the kido-pipeline web replica SHALL consume this shape and render identically.

#### Scenario: Web replica matches mobile

- **WHEN** the same count_tap activity is opened in the kido-pipeline web player and on mobile
- **THEN** both render the same surface mode plus exactly `targetCount` tappable sprites with the same counting interaction and the same deterministic layout

#### Scenario: Scene mode preserves existing behavior

- **WHEN** a count-tap payload uses scene mode with `backgroundAsset` and `targetAsset`
- **THEN** mobile and web render the object-free scene plus exactly `targetCount` independent target sprites

#### Scenario: Pastel mode needs no generated scene

- **WHEN** a count-tap payload uses pastel mode with a transparent `targetAsset` and no `backgroundAsset`
- **THEN** mobile and web render a stable contrast-safe pastel surface plus exactly `targetCount` independent target sprites

#### Scenario: Old single-scene payload rejected by mapping

- **WHEN** an activity payload carries only the legacy `sceneImage` and no `targetAsset`
- **THEN** normalization does not silently render a wrong single image; it maps to the layered shape only when `targetAsset` is present

### Requirement: Pastel surfaces are stable and do not leak answers

Pastel selection SHALL be deterministic for one activity and algorithm version, SHALL exclude insufficient-contrast tokens using sprite color metadata, and SHALL remain stable across re-mounts/devices. Background selection SHALL NOT vary per cloned object or reveal the correct answer.

#### Scenario: Re-mount preserves pastel surface

- **WHEN** the same pastel count-tap activity is mounted again
- **THEN** it uses the same pastel token and sprite positions

### Requirement: Alpha sprites remove the default sticker chip

When `targetAsset` is verified as alpha-capable, mobile and web SHALL render the sprite directly with `contain`. The circular sticker chip SHALL remain only as a compatibility fallback for legacy/non-alpha assets.

#### Scenario: Verified sprite renders as a cutout

- **WHEN** an approved target sprite has verified alpha metadata
- **THEN** it renders without the white circular masking chip

