## Context

EPICs 001 and 002 delivered a fully configured React Native project with design system, navigation scaffolding, state management (Zustand), and the auth/onboarding flow (Splash → Onboarding → Setup). After setup completes the app navigates to `Home` — which is the Adventure Map. This EPIC implements everything the child sees in the Home module and the parent gate.

Current state: `ChildStack` is a stub pointing to a placeholder screen. `authStore` has `child.name` and `child.age` but no progress shape.

## Goals / Non-Goals

**Goals:**
- Implement the Adventure Map (HomeScreen) with 4 island sections and 48 week nodes
- Implement all 4 week node states (COMPLETED, CURRENT, LOCKED, PAYWALL) driven by progress data
- Fixed DailyProgressChip and TodayFAB at bottom of Home screen
- Parent Gate modal with math challenge, attempt counting, and 10-min session timeout
- Wire navigation so the child flow is: Home → LessonPlayer (stub), Home → Paywall (stub), Home → ParentDashboard (stub)

**Non-Goals:**
- Actual lesson data from API (mocked/stubbed progress for now)
- LessonPlayer implementation (EPIC-004)
- Paywall implementation (EPIC-010)
- Parent Dashboard (EPIC-008)
- Sticker collection screen (EPIC-007)

## Decisions

### D1: Progress data is mocked locally
Until the backend API (EPIC-011) is ready, progress will be hardcoded in the store as `{ currentWeek: 1, currentDay: 1, completedLessons: [], streakCount: 0 }`. When the API lands, the store's `fetchProgress()` action will populate this. This avoids blocking EPIC-003 on EPIC-011.

### D2: Island layout via flat SectionList, not nested ScrollViews
Using React Native's `SectionList` with `stickySectionHeadersEnabled={false}` gives us a single scroll container for all 48 nodes across 4 islands. Alternative (FlatList of FlatLists) causes nested scroll issues on Android.

### D3: Week nodes rendered as a 3-column grid per island
Each island section renders its 12 week nodes in a 3-column grid using a simple nested row layout (groups of 3). This matches the Adventure Map design and keeps layout logic simple — no complex path/zigzag rendering in this phase.

### D4: parentUnlocked stored only in-memory (not persisted)
`parentUnlocked` is a runtime flag in `authStore`. It resets on app restart and after 10 minutes via a `setTimeout` cleared on the parent section exit. Persisting it would be a security risk.

### D5: ParentGate uses custom number pad (not native keyboard)
Native keyboard cannot be controlled for child-safe UX. A custom 10-button number pad prevents children from typing anything unexpected and matches the design.

## Risks / Trade-offs

- [Island auto-scroll to current week on mount] → Use `SectionList.scrollToLocation` after layout. May need a small setTimeout(0) to ensure the list has measured. Mitigation: measure on `onLayout`, then scroll.
- [Animated pulse on CURRENT node and TodayFAB running simultaneously] → Both use `useAnimatedStyle` with independent `useSharedValue`. No shared state, no conflict.
- [parentUnlocked 10-minute timeout] → Timer ID stored in a ref; cleared on app background via AppState listener. Mitigation: register AppState listener in the gate component's effect.
