## MODIFIED Requirements

### Requirement: Achievements Screen (Thành tích)
The app SHALL provide the Achievements screen from the existing bottom-nav route, containing the streak card, six cumulative badges, and a four-world sticker collection sourced from the canonical/local projected reward snapshot. The existing `StickerCollection` route key MAY remain for navigation compatibility.

#### Scenario: Open from bottom nav
- **WHEN** the child taps the Thành tích tab
- **THEN** the screen shows streak, badge milestones, and four sticker-world sections

### Requirement: Badge Grid
The screen SHALL render the six cumulative badges in fixed order. Earned badges SHALL use full-color art; locked badges SHALL use a dimmed/locked treatment. Once a badge is shown earned it MUST NOT become locked because current streak or a later lesson score changed.

#### Scenario: Locked badge appearance
- **WHEN** a cumulative threshold has not been reached
- **THEN** its badge uses the locked treatment and is not interactive

#### Scenario: Previously earned badge after streak reset
- **WHEN** current streak resets after `explorer_1` was earned
- **THEN** `explorer_1` remains full color and earned

### Requirement: Sticker Grid
The screen SHALL group exactly 48 catalog entries into four world sections of 12. Earned cells SHALL show their bundled sticker artwork and name/week context; locked cells SHALL show a consistent silhouette/locked treatment without revealing ownership. Mobile SHALL use 4 columns on phone and 6 on tablet for each world grid.

#### Scenario: Earned sticker shows local art
- **WHEN** `sticker-w13` is earned
- **THEN** world 2 renders its bundled week-13 artwork at full color

#### Scenario: Later world remains visible but locked
- **WHEN** the child has stickers only in world 1
- **THEN** worlds 2-4 remain discoverable with locked entries and correct counts

### Requirement: Tablet Layout
On tablet (>=768pt) the badge grid SHALL use 4 columns, each sticker world SHALL use 6 columns, and the streak card SHALL use its horizontal layout. Phone SHALL use 3 badge columns and 4 sticker columns.

#### Scenario: Tablet column counts
- **WHEN** the screen renders at tablet width
- **THEN** badges use 4 columns and each 12-sticker world renders as 6 columns x 2 rows

## ADDED Requirements

### Requirement: Achievements refreshes on focus and sync completion
The screen SHALL rederive from current local snapshot whenever it gains focus and SHALL update when reward sync changes the acknowledged snapshot or pending projections. A one-time effect keyed only by child ID is insufficient.

#### Scenario: Child earns sticker while tab remains mounted
- **WHEN** the child returns to an already-mounted Achievements tab after earning a sticker
- **THEN** the new sticker and milestone counts appear without restarting the app
