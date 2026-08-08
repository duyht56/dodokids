## ADDED Requirements

### Requirement: Browsable complete tracing library
The workshop SHALL expose every enabled item in the installed reviewed tracing path pack through a browsable, scrollable library. Items SHALL be grouped by stable content tracks for basic strokes, routes, shapes, digits, Latin uppercase, Latin lowercase and Vietnamese-specific uppercase/lowercase glyphs. No enabled item SHALL require random generation or a play-history unlock before it can be selected.

#### Scenario: Child opens the workshop library
- **WHEN** the installed pack contains enabled items across multiple tracks
- **THEN** every enabled item is reachable as a local vector preview and the child can select any item directly

### Requirement: Explicit starting item and canonical auto-next
Selecting a tracing item SHALL start practice at that exact item. After successful completion, the workshop SHALL automatically advance to the next item in the same versioned canonical track order until the final track item is completed or the child exits.

#### Scenario: Child selects a middle letter
- **WHEN** the child selects Latin uppercase `M` and completes it
- **THEN** the next item is Latin uppercase `N`, followed by the remaining uppercase letters in canonical order

#### Scenario: Child completes the final track item
- **WHEN** the child completes the final enabled item in the selected track
- **THEN** the workshop shows a neutral end-of-track state and does not silently wrap or switch to another track

### Requirement: Track-length tracing run
A tracing workshop run SHALL be bounded by the remaining items in the selected finite track rather than by the generic Explore 5-8 interaction count. The child SHALL be able to exit or return to the library at any time without penalty.

#### Scenario: Selected track has more than eight remaining items
- **WHEN** the child continues completing items in that track
- **THEN** the workshop continues auto-advancing beyond eight items until track end or voluntary exit

### Requirement: Independent content and assistance selection
The selected content track/item SHALL be independent from the L1-L5 assistance profile. Assistance SHALL control corridor width, guide density, magnetism, snap radius and evaluation thresholds without hiding otherwise enabled content.

#### Scenario: Same glyph uses different support
- **WHEN** the same glyph is opened once with high assistance and once with low assistance
- **THEN** its reviewed vector/stroke order remains unchanged while only the configured guidance and tolerance differ

### Requirement: Current-visit completion indicators
The workshop MAY show neutral completion indicators for items completed while the current workshop route remains mounted. These indicators SHALL NOT unlock content, change assistance or survive route unmount, process death or later entry.

#### Scenario: Child returns to the library during the current visit
- **WHEN** the child completed several items without leaving the mounted workshop flow
- **THEN** those cards may show current-visit completion marks

### Requirement: Offline visual workshop
The complete visual tracing library, explicit-item generator, validator, evaluator and vector previews SHALL operate from installed local dependencies without a catalog or asset network request. Missing optional instruction audio MUST NOT block selection or visual tracing.

#### Scenario: Workshop starts in airplane mode
- **WHEN** the installed tracing pack and code versions are compatible but optional instruction audio is unavailable
- **THEN** the child can browse all enabled items, select one and continue through the track offline

### Requirement: Coherent child-appropriate letterforms
Latin and Vietnamese letter paths SHALL use a coherent monoline handwriting construction with consistent body height, baseline, ascender and descender proportions. Vietnamese derived glyphs SHALL preserve the reviewed base-letter body and add a visually balanced breve, circumflex, crossbar or horn. Geometric validation alone SHALL NOT be treated as visual approval.

#### Scenario: Vietnamese lowercase previews are shown
- **WHEN** the library renders `ă`, `â`, `đ`, `ê`, `ô`, `ơ` and `ư`
- **THEN** each glyph remains immediately recognizable as its base school letter and its added mark does not dominate, collide with or distort the base body

#### Scenario: Path geometry changes
- **WHEN** a release changes any reviewed letter path
- **THEN** the path-pack version changes and the complete letter contact sheet is visually reviewed before release

## MODIFIED Requirements

### Requirement: Tracing levels
The workshop SHALL provide L1-L5 assistance profiles with progressively reduced corridor width, guide density, magnetism and snap support. Content availability SHALL be defined by reviewed tracks and item enablement rather than being inseparably bound to the assistance level. All enabled digit, Latin and Vietnamese items SHALL be selectable with an appropriate reviewed assistance profile.

#### Scenario: L1 assistance is selected
- **WHEN** an enabled item starts with L1 assistance
- **THEN** it uses the widest configured corridor and strongest reviewed guidance without changing the selected item

#### Scenario: L5 assistance is selected
- **WHEN** an enabled letter or digit starts with L5 assistance
- **THEN** it uses the tightest reviewed corridor and fewest guides while retaining the same vector and stroke order
