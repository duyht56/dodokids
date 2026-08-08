# parent-bottom-nav

## Purpose

Defines the bottom tab navigator for the parent area — four tabs hosting real screen components, with active/inactive styling, a badge on the Report tab, and routing that enters the parent area on the Dashboard tab.

## Requirements

### Requirement: Parent Bottom Tab Navigation
The parent area SHALL render a bottom tab navigator with exactly four tabs in order: `Dashboard` ("🏠 Tổng quan"), `Report` ("📊 Báo cáo"), `OfflineTasks` ("📋 Hoạt động"), and `Settings` ("⚙️ Cài đặt"). Each tab SHALL host its real screen component (no placeholder stubs).

#### Scenario: Four real tabs rendered
- **WHEN** the parent area mounts
- **THEN** the bottom tab bar shows the four labeled tabs and the `Dashboard` tab's real screen is the initial route

#### Scenario: Tab switch shows the target screen
- **WHEN** the parent taps the "📋 Hoạt động" tab
- **THEN** the `OfflineTasks` screen is shown (not a `PlaceholderScreen`)

### Requirement: Tab Active/Inactive Styling
The active tab SHALL use the brandOrange color (`colors.coral`) for its icon and label; inactive tabs SHALL use the muted gray (`colors.slate`). The tab bar background SHALL be white with a top shadow.

#### Scenario: Active tab colored
- **WHEN** the `Dashboard` tab is focused
- **THEN** its icon and label render in brandOrange while the other three render in muted gray

### Requirement: Report Tab Badge
The `Report` tab SHALL display a badge when a new weekly report is available (the current week's day-5 lesson is completed). The badge SHALL be hidden otherwise.

#### Scenario: New report available
- **WHEN** the current week's day-5 lesson is completed
- **THEN** the "📊 Báo cáo" tab shows a badge indicator

#### Scenario: No report yet
- **WHEN** the current week's day-5 lesson is not completed
- **THEN** the "📊 Báo cáo" tab shows no badge

### Requirement: Parent Area Entry Routing
Entering the parent area (after the parent gate unlocks) SHALL route to the `ParentTabs` navigator landing on the `Dashboard` tab, rather than to a standalone parent screen inside the child stack.

#### Scenario: Enter parent area
- **WHEN** the parent gate is unlocked and the parent area opens
- **THEN** the `ParentTabs` Dashboard tab is shown as the initial screen
