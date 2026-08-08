## ADDED Requirements

### Requirement: Forty-eight stable sticker definitions
The system SHALL define exactly 48 sticker entries with stable IDs `sticker-w01` through `sticker-w48`. Every entry SHALL contain `week`, `world`, `nameVi`, and `assetKey`; weeks SHALL be unique and contiguous from 1 through 48.

#### Scenario: Catalog validation succeeds
- **WHEN** the sticker catalog validation runs
- **THEN** it finds exactly 48 unique IDs, every week 1-48 once, and no missing required metadata

### Requirement: Four twelve-week worlds
The catalog SHALL group weeks 1-12, 13-24, 25-36, and 37-48 into worlds 1, 2, 3, and 4 respectively. Each world SHALL contain exactly 12 distinct sticker definitions.

#### Scenario: Week maps to world
- **WHEN** the catalog resolves `sticker-w25`
- **THEN** the definition reports week 25 and world 3

### Requirement: Sticker assets are bundled locally
Every catalog entry SHALL resolve to a statically bundled local image using the fixed path contract `mobile/src/assets/images/stickers/world-{NN}/week-{WW}.png`. Missing files, duplicate asset keys, or remote-only URLs MUST fail catalog verification.

#### Scenario: Sticker reveal while offline
- **WHEN** a cached canonical completion earns a sticker with no network
- **THEN** Lesson Complete renders the sticker from the bundled asset without a download

#### Scenario: Asset file is missing
- **WHEN** the validation script checks a catalog entry whose required PNG does not exist
- **THEN** validation fails with the missing sticker ID and expected path

### Requirement: Sticker ownership uses stable IDs
Canonical reward state SHALL store earned sticker IDs with set semantics. Legacy week-number ownership MAY be read and migrated, but new reward writes MUST use stable IDs and MUST NOT depend on emoji or background-color metadata.

#### Scenario: Legacy week is migrated
- **WHEN** a child has legacy `stickersEarned: [1, 2]`
- **THEN** canonical reads expose `sticker-w01` and `sticker-w02` as earned without duplicating them on later sync
