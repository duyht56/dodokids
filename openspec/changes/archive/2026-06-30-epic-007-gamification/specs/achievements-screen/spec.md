## ADDED Requirements

### Requirement: Achievements Screen (Thành tích)
The app SHALL provide an Achievements screen (Screen-06) reachable from the "🏆 Thành tích" bottom-nav tab, containing a streak card, a badge grid, and a sticker grid. It replaces the prior `StickerCollectionScreen` stub (the navigation route key `StickerCollection` is retained).

#### Scenario: Open from bottom nav
- **WHEN** the child taps the "Thành tích" tab
- **THEN** the Achievements screen is shown with header "Thành tích" and a back affordance

### Requirement: Streak Card
The screen SHALL render a coral-gradient (`#FF6B35→#FF8E53`) streak card showing the streak count (48pt) and a 7-day dot row (T2..CN): completed days show a filled ✓ dot, today shows a twinkling ★ dot, future days show a dimmed dot.

#### Scenario: Streak of 7
- **WHEN** `streakCount` is 7 and four prior weekdays are done
- **THEN** the card shows "7" with the corresponding dots filled and today twinkling

### Requirement: Badge Grid
The screen SHALL render badges from the achievements API in a grid: earned badges as white cards with shadow and full-color emoji; locked badges with grayscale emoji (opacity .4) and a "🔒 Khóa" label.

#### Scenario: Locked badge appearance
- **WHEN** a badge has `earned: false`
- **THEN** it renders grayscale with the "🔒 Khóa" label and is not interactive

### Requirement: Sticker Grid
The screen SHALL render the sticker grid with each cell as a pastel rounded square (bg from data) and the sticker emoji; locked cells show a dimmed 🔒.

#### Scenario: Earned sticker shows full color
- **WHEN** a sticker has `earned: true`
- **THEN** its cell renders the emoji on its pastel background at full opacity

### Requirement: Loading And Tablet Layout
The screen SHALL show `SkeletonLoader` while fetching. On tablet (≥768pt) the badge grid SHALL use 4 columns (vs 3), the sticker grid 6 columns (vs 4), and the streak card a horizontal layout.

#### Scenario: Tablet column counts
- **WHEN** the screen renders on a tablet
- **THEN** badges use 4 columns and stickers use 6 columns
