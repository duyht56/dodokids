## Why

EPIC-001 (project setup) and EPIC-002 (auth & onboarding) are complete. The child now lands on the Home screen after setup — but the Home screen doesn't exist yet. EPIC-003 builds the core child-facing navigation hub: the Adventure Map, week node states, daily progress chip, today's FAB, and the parent gate.

## What Changes

- Add `HomeScreen` (Adventure Map) as the main post-login destination for the child module
- Implement `WeekNode` component with 4 states: COMPLETED, CURRENT, LOCKED, PAYWALL
- Add `DailyProgressChip` (5-dot strip) fixed at bottom of Home screen
- Add `TodayFAB` floating action button to start today's lesson
- Add `ParentGateModal` — math challenge gate protecting the parent section
- Wire `ChildStack` navigator: Home → LessonPlayer (stub), Home → Paywall (stub)
- Update `authStore` to include `parentUnlocked` (in-memory only)

## Capabilities

### New Capabilities
- `adventure-map`: Scrollable map showing 4 island groups (Q1–Q4), 48 week nodes with state-driven rendering and auto-scroll to current week
- `week-node`: Week node component with COMPLETED/CURRENT/LOCKED/PAYWALL state variants, animated pulse on CURRENT, sticker display
- `daily-progress-chip`: Fixed bottom 5-dot progress indicator for D1–D5 with today pulsing animation
- `today-fab`: Floating action button to launch today's lesson, pulse animation, changes to "Ôn luyện" after completion
- `parent-gate`: Modal with random math challenge, 3-attempt lock, 60-second cooldown, 10-minute parentUnlocked timeout

### Modified Capabilities
- `navigation-setup`: Add `ChildStack` with Home screen as root; add stub routes for LessonPlayer and PracticeBank
- `state-management`: Add `parentUnlocked` to authStore (non-persisted); add `progress` shape to child object

## Impact

- New screens: `src/screens/child/HomeScreen.tsx`
- New components: `src/components/WeekNode.tsx`, `src/components/DailyProgressChip.tsx`, `src/components/TodayFAB.tsx`, `src/components/ParentGateModal.tsx`
- Modified: `src/navigation/index.tsx` (add ChildStack), `src/store/authStore.ts` (parentUnlocked + progress)
- No backend API calls in this EPIC (progress data will be mocked/stubbed until EPIC-011 is ready)
- Depends on: design-system tokens, animation-setup (Reanimated 3), state-management (Zustand authStore)
