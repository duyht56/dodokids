## ADDED Requirements

### Requirement: Sticker assets are sized for their grid footprint
Bundled sticker assets SHALL be stored at a resolution close to their largest rendered grid footprint (384×384 covers the current 4–6 column grids at 3x density), not at generation resolution. Returning to the Achievements tab MUST show previously displayed sticker images immediately without a re-decode blank. The screen SHALL keep rendering local-first data (projected snapshot) while the remote refresh runs, so no full-screen loading state is introduced.

#### Scenario: Re-entering Achievements
- **WHEN** the child leaves the Thành tích tab and returns to it
- **THEN** sticker and badge images are visible immediately

#### Scenario: Remote refresh in flight
- **WHEN** the achievements fetch is still pending on focus
- **THEN** the grid renders from local data and updates in place when the fetch lands
