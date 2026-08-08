## ADDED Requirements

### Requirement: Child tab switching is warm and immediate
Switching between already-visited child tabs SHALL be a visibility change, not a render burst: the destination tab's tree stays mounted and its native views stay attached while blurred, so focusing it MUST NOT trigger a synchronous re-render of its whole tree and MUST NOT re-decode images that were already on screen. Blurred tabs MUST stay cheap through low per-node cost (animation resources allocated only by nodes that animate), not through freezing — freezing was tried and reverted because unfreezing re-renders the entire tab tree before the switch becomes visible.

#### Scenario: Returning to a previously visited tab
- **WHEN** the child returns to `Khám phá` or `Thành tích` after visiting another tab
- **THEN** thumbnails and sticker images that were previously displayed appear immediately, without a blank interval while images re-decode

#### Scenario: Switching to the home tab
- **WHEN** the child taps `Đô Đô` from any other tab after Home has already mounted
- **THEN** the map appears without a multi-second pause; no full re-render of the 48-week tree runs as part of the switch

#### Scenario: First visit to a tab
- **WHEN** the child opens a tab for the first time in the session
- **THEN** the tab may mount lazily, and any content still preparing is represented by placeholder UI rather than an empty region

### Requirement: Tab bar persists across detail flows
The child tab bar SHALL be hidden via styling — not unmounted — when a nested detail screen (Explore game, tracing workshop, lesson player, lesson complete) is in front. Its local state, including the parent-gate modal state, SHALL survive entering and leaving detail flows, and returning to a tab root SHALL NOT remount the tab bar component tree.

#### Scenario: Child enters and leaves an Explore game
- **WHEN** the child opens an Explore game and then returns to the catalog
- **THEN** the tab bar reappears without its component tree having been unmounted and remounted

#### Scenario: Tab bar is hidden during detail flow
- **WHEN** a nested detail screen is focused
- **THEN** the tab bar is not visible and does not intercept touches, matching the current visual behavior
