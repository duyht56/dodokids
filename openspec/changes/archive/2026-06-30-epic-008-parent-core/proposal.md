## Why

EPIC-006 shipped a single Parent Dashboard screen reached via `goBack`, with the 4-tab parent navigation still wired to placeholder stubs and only an inline 3-row settings block. EPIC-008 (Parent Module — Core) turns the parent area into a real, navigable module: a proper 4-tab bottom navigation, a dashboard aligned to the Screen-05 design (per-subject progress + weekly-report lock + offline task), and a full dedicated Settings screen. This is the P0 foundation the Reports & Tasks work (EPIC-009) and Paywall (EPIC-010) depend on.

## What Changes

- **Parent bottom navigation becomes real**: the 4 placeholder tabs (`Dashboard`, `Report`, `OfflineTasks`, `Settings`) in `ParentStack.tsx` are replaced with real screens, brandOrange active / muted inactive styling, white tab bar with top shadow, and a badge on **Báo cáo** when a new weekly report is available.
- **Parent entry routes into the tab navigator**: entering the parent area lands on the `ParentTabs` Dashboard tab instead of the standalone `ParentDashboard` screen in the child stack.
- **Dashboard aligned to Screen-05**: progress card shows the three subject bars (Toán / Tiếng Việt / Tiếng Anh) with percentages, a weekly-report locked card ("Mở vào Chủ nhật"), the today offline-task card, and (tablet) a streak summary card in a 2-column layout.
- **Full Settings screen (new)**: sections for Thông tin bé (edit name + age), Subscription (plan/trial status, manage, restore purchases), Âm thanh (music toggle + volume slider), Thông báo (weekly-email toggle), and Về ứng dụng (version, privacy, terms, contact).
- **BE — parent summary gains per-subject progress** and a **child profile update** path so Settings can persist name/age.
- **Tablet layouts** for dashboard (2-col) and settings, per the always-BE-and-tablet convention.

## Capabilities

### New Capabilities
- `parent-bottom-nav`: The 4-tab parent bottom navigation (tabs, active/inactive styling, report badge, white tab bar) and parent-area entry routing.
- `settings-screen`: The full parent Settings screen — child info editing, subscription status, sound controls, notification toggle, and about section, with tablet layout.

### Modified Capabilities
- `parent-dashboard`: Re-aligned to Screen-05 (per-subject progress bars, weekly-report locked card, offline-task card) and hosted as the `Dashboard` tab rather than a child-stack screen.
- `parent-api`: `GET /parent/:childId/summary` adds per-subject progress; a child profile update endpoint persists name/age from Settings.
- `state-management`: settings store extends with volume + weekly-email-notification preference; child profile edits persist.

## Impact

- **Mobile**: `src/navigation/ParentStack.tsx` (real tabs), `src/navigation/RootNavigator.tsx` / parent entry routing, `src/screens/parent/` (new SettingsScreen, Report/OfflineTasks tab hosts), `src/screens/child/ParentDashboardScreen.tsx` → moved/adapted into the Dashboard tab, `src/store/settingsStore.ts`, `src/services/parentApi.ts`, `src/services/childrenApi.ts`.
- **Server**: `kido-server/src/modules/parent/parent.service.ts` & `parent.controller.ts` (subject progress in summary), child profile update endpoint (`children` or `parent` module).
- **Dependencies**: `@react-navigation/bottom-tabs` (already installed), `@react-native-community/slider` (volume) — verify availability.
- **Design source**: `Kido UI design/screens/Screen-05-Parent-Dashboard.html`.
