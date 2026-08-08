## 1. State & Navigation Foundation

- [x] 1.1 Extend `authStore` with `progress` shape (`currentWeek`, `currentDay`, `completedLessons`, `streakCount`) and `parentUnlocked` boolean; exclude `parentUnlocked` from AsyncStorage persistence; add `setProgress` and `setParentUnlocked` actions
- [x] 1.2 Add `ChildStackParamList` type to `src/types/navigation.ts` with routes: `HomeScreen`, `LessonPlayerScreen` (params: `{ week: number }`), `PracticeBankScreen`, `PaywallScreen`, `ParentDashboardScreen`
- [x] 1.3 Create `ChildStack` in `src/navigation/index.tsx` using `createNativeStackNavigator<ChildStackParamList>` with `HomeScreen` as initial route
- [x] 1.4 Add stub screens for `LessonPlayerScreen`, `PracticeBankScreen`, `PaywallScreen`, `ParentDashboardScreen` in `src/screens/child/` (each renders a centered placeholder text)
- [x] 1.5 Wire `RootNavigator` so that `isOnboarded === true` renders `ChildStack` instead of the existing placeholder

## 2. WeekNode Component

- [x] 2.1 Create `src/components/WeekNode.tsx` accepting props: `week: number`, `state: 'COMPLETED' | 'CURRENT' | 'LOCKED' | 'PAYWALL'`, `stars?: 1 | 2 | 3`, `onPress?: () => void`
- [x] 2.2 Implement COMPLETED state: brandTeal fill, checkmark icon, star count label below
- [x] 2.3 Implement CURRENT state: brandOrange border, pulsing glow using `useSharedValue` + `useAnimatedStyle` (Reanimated 3), small Đô Đô mascot icon overlay
- [x] 2.4 Implement LOCKED state: gray (#A0AEC0) fill, lock icon, touch events disabled (`pointerEvents="none"`)
- [x] 2.5 Implement PAYWALL state: gray fill + crown icon (👑), tappable, calls `onPress`
- [x] 2.6 Ensure all nodes are 88×88px with 999 border radius (circle)

## 3. Adventure Map (HomeScreen)

- [x] 3.1 Create `src/screens/child/HomeScreen.tsx` with a `SectionList` where each section represents one island (Q1–Q4) with 12 week items
- [x] 3.2 Implement island section header with title (e.g., "Quần đảo 1 🏝️") and themed background color strip
- [x] 3.3 Render week nodes in a 3-column grid layout per island section using row grouping (groups of 3 nodes per row)
- [x] 3.4 Derive `WeekNode` state for each week from `authStore.progress`: completed if in `completedLessons`, current if equals `currentWeek`, paywall if `>= 3 && !subscribed`, locked otherwise
- [x] 3.5 Implement auto-scroll to current week on mount using `sectionListRef.scrollToLocation` inside `useEffect` after layout
- [x] 3.6 Add header bar with "Xin chào {childName}! 👋" text and 👨‍👩‍👧 icon (TouchableOpacity, min 88×88px hit area) that opens `ParentGateModal`
- [x] 3.7 Wire `WeekNode` `onPress` for CURRENT state to `navigation.navigate('LessonPlayerScreen', { week })` and for PAYWALL state to `navigation.navigate('PaywallScreen')`

## 4. DailyProgressChip Component

- [x] 4.1 Create `src/components/DailyProgressChip.tsx` rendering 5 dots (D1–D5) in a horizontal row
- [x] 4.2 Style each dot: completed → brandTeal filled circle; today → brandOrange with repeating pulse animation (Reanimated); future → gray outlined circle; all dots 16×16px with 8px gap
- [x] 4.3 Implement tap handler per dot that shows a brief `Tooltip` or `Alert` with the day's lesson status ("Đã hoàn thành", "Hôm nay", "Chưa học")
- [x] 4.4 Position chip as a fixed overlay at the bottom of HomeScreen (above TodayFAB), using `position: 'absolute'` or SafeAreaView bottom padding

## 5. TodayFAB Component

- [x] 5.1 Create `src/components/TodayFAB.tsx` as a `TouchableOpacity` with minimum size 120×56px, brandOrange background, border radius 28 (pill), shadow (md preset)
- [x] 5.2 Implement "not completed" state: label "🎯 Học hôm nay", repeating scale pulse animation using Reanimated
- [x] 5.3 Implement "completed" state: label "✅ Xong rồi! Ôn luyện nào", no pulse animation, navigates to `PracticeBankScreen`
- [x] 5.4 Wire tap in "not completed" state to `navigation.navigate('LessonPlayerScreen', { week: currentWeek })`
- [x] 5.5 Hide FAB (return null) when no lesson is available
- [x] 5.6 Place FAB in HomeScreen above DailyProgressChip using absolute positioning, centered horizontally

## 6. ParentGateModal Component

- [x] 6.1 Create `src/components/ParentGateModal.tsx` as a React Native `Modal` (transparent, animationType: 'fade') with a centered card
- [x] 6.2 On open, generate a random math question: `A + B` where A and B are random integers 1–9; display as large text "A + B = ?"
- [x] 6.3 Implement custom number pad: 10 digit buttons (0–9) + delete button, each min 64×64px with 16px gap, arranged in 3 rows (1-2-3, 4-5-6, 7-8-9, del-0)
- [x] 6.4 Implement answer input display showing entered digits (max 2 digits); auto-submit when 2 digits entered
- [x] 6.5 On correct answer: call `authStore.setParentUnlocked(true)`, close modal, navigate to `ParentDashboardScreen`
- [x] 6.6 On wrong answer: shake animation on input display (Reanimated translateX), show "Thử lại nhé!" briefly, reset to new random question, decrement `attemptsLeft`
- [x] 6.7 After 3 failed attempts: disable number pad, show "Thử lại sau {X} giây" with a 60-second countdown using `setInterval`; re-enable and reset after countdown
- [x] 6.8 Implement 30-second timeout countdown; on expiry auto-close the modal
- [x] 6.9 Implement `parentUnlocked` auto-expiry: in `setParentUnlocked(true)`, start a `setTimeout` for 10 minutes that calls `setParentUnlocked(false)`; store timer ID in a ref to clear on logout or re-lock

## 7. Integration & Polish

- [x] 7.1 Verify TypeScript: run `npx tsc --noEmit` — zero type errors across all new files
- [x] 7.2 Test on iOS simulator (iPhone 14): Adventure Map scrolls smoothly, CURRENT node pulse visible, ParentGate opens and accepts correct answer
- [x] 7.3 Test on Android emulator (Pixel 6): same scenarios, verify SectionList auto-scroll works, verify modal renders correctly
- [x] 7.4 Verify all touch targets are ≥ 88×88px (WeekNode, FAB, dot chip, number pad buttons, header icons)
- [x] 7.5 Confirm no animation janks at 60fps using React Native Performance Monitor
