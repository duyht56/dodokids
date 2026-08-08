## ADDED Requirements

### Requirement: Two-phase weekly sticker reveal
Lesson Complete SHALL show the normal star celebration first and then transition to a sticker-reveal phase only when the current canonical event newly earned a sticker. The reveal SHALL use the bundled catalog asset, show the sticker name/week, and require a “Cất vào bộ sưu tập” acknowledgement before the final navigation CTAs.

#### Scenario: Final required lesson earns sticker
- **WHEN** the current event completes the frozen week plan and returns/projects a newly earned sticker
- **THEN** stars appear first and the sticker reveal appears once afterward

#### Scenario: Ordinary day or replay
- **WHEN** the event does not newly add a sticker
- **THEN** Lesson Complete skips the sticker phase and shows normal CTAs after stars

### Requirement: Sticker reveal is consumed once per event
The app SHALL persist whether the reveal for a queued event was consumed. App restart, response retry, duplicate sync, or revisiting Lesson Complete MUST NOT show the same sticker reveal again.

#### Scenario: App restarts after sticker acknowledgement
- **WHEN** the child already tapped “Cất vào bộ sưu tập” and the event later retries sync
- **THEN** the sticker remains earned but its reveal animation is not replayed

### Requirement: Show streak without child-facing XP
Lesson Complete SHALL display the current/projected streak in encouraging language but MUST NOT display earned XP, XP total, “Điểm thưởng”, or an XP balance. Internal XP fields MAY remain in API/state for compatibility.

#### Scenario: Completion internally awards XP
- **WHEN** canonical completion returns `xpEarned: 100` and streak 7
- **THEN** the child-facing screen may show “7 ngày” but contains no `+100 XP` or “Điểm thưởng” text

## REMOVED Requirements

### Requirement: Show XP and streak reward card
**Reason**: XP has no child-facing economy or purpose in V1 and competes with stars as the meaning of “điểm”.

**Migration**: Keep XP calculation/storage/API fields for compatibility, remove XP from Lesson Complete navigation/display, and retain a streak-only presentation.
