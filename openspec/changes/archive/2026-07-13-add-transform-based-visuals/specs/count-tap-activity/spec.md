# count-tap-activity Specification (delta)

## MODIFIED Requirements

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

## ADDED Requirements

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
