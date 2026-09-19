## ADDED Requirements

### Requirement: Window-driven size classes
The app SHALL derive every layout decision from the current **window** size rather than from the device model, because on iPadOS the app runs in a resizable window and in Split View. It SHALL expose exactly three size classes from a single shared module: `compact` below 700pt, `regular` from 700pt to 1023pt, and `large` at 1024pt and above. A single tablet breakpoint of 700pt SHALL be used everywhere; no component may inline its own breakpoint value. No layout value may be read from a viewport API captured at module scope, because such a value does not update on rotation or resize.

#### Scenario: iPad mini portrait is a tablet
- **WHEN** the window is 744pt wide
- **THEN** the size class is `regular` and tablet layouts apply

#### Scenario: One breakpoint across components
- **WHEN** the window is 720pt wide
- **THEN** every component reports the same tablet state, so no screen mixes tablet and phone layouts

#### Scenario: Phone rendering is unchanged
- **WHEN** the window is any iPhone portrait width
- **THEN** the size class is `compact` and the rendered geometry matches the phone design exactly

#### Scenario: Live resize
- **WHEN** the window is rotated, resized, or placed in Split View
- **THEN** layout re-derives from the new window size without relaunching

### Requirement: Bounded content columns
Content SHALL be laid out in a column with a maximum width appropriate to its role — navigation, form, reading measure, or play board — and centred once the window exceeds that maximum. A content column SHALL NOT stretch with the window. Screen-level chrome that reads as an edge-to-edge surface (a background, a bottom bar's surface, a modal scrim) MAY span the full window while the content inside it stays bounded.

#### Scenario: Wide window
- **WHEN** the window is wider than a column's maximum
- **THEN** the column stays at its maximum and is centred, leaving symmetric margins

#### Scenario: Scrim still covers the window
- **WHEN** a full-screen overlay is shown on a wide window
- **THEN** the scrim covers the whole window even though the card inside it is bounded

### Requirement: Grids resolve to point sizes
A wrapping grid SHALL resolve to a column count and an exact cell width in points, derived from the measured width of its container. A grid SHALL NOT combine a percentage cell width with a fixed aspect ratio, because that makes the row height grow with the window width and pushes later rows off the bottom of the screen. Column counts SHALL increase with the size class rather than staying fixed.

#### Scenario: Catalog columns follow the window
- **WHEN** the Khám phá catalog is shown at a `compact`, `regular` and `large` width
- **THEN** it lays out two, three and four columns respectively, with cards that stay close to square

#### Scenario: Option rows stay on screen
- **WHEN** an activity shows a wrapped grid of options on a wide, short window
- **THEN** every row remains within the viewport

### Requirement: Type, targets and boards scale with the size class
Type sizes, icon sizes, touch targets, mascots and play boards SHALL scale up with the size class so a 13-inch display does not render phone-sized chrome. Scaling SHALL be 1.0 at `compact`, so the phone design is untouched.

#### Scenario: Larger chrome on a large window
- **WHEN** a screen is shown at a `large` width
- **THEN** its headings, icons and touch targets are larger than at `compact`

#### Scenario: Play boards stay bounded
- **WHEN** a Khám phá game is played on a wide window
- **THEN** its board is sized against the capped play column, not the raw window width, so sprites placed at normalised positions stay a readable distance apart

### Requirement: Scroll position survives a geometry change
A screen that programmatically scrolls to a position of interest SHALL re-derive that position when its layout geometry changes, rather than guarding with a one-shot flag. Keeping a stale pixel offset after a resize silently moves the child away from where they were, and a screen detached by the navigator may not lay out again until its tab is focused.

#### Scenario: Map re-centres after a resize
- **WHEN** the window is rotated or resized while the lesson map is mounted
- **THEN** the map is centred on the current week the next time it lays out
