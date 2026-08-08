## 1. State & API clients

- [x] 1.1 Extend `settingsStore` with `weeklyEmailEnabled` (default `true`) + `setWeeklyEmailEnabled`, and add a persist default-guard so legacy persisted settings hydrate to `true` not `undefined`. Update `SettingsState` type in `src/types/store.ts`.
- [x] 1.2 Add `subjectProgress` to `ParentSummary` type and the `fetchParentSummary` response in `src/services/parentApi.ts`.
- [x] 1.3 Add `updateChildProfile(childId, { name?, age? })` calling `PATCH /parent/:childId/profile` in `src/services/parentApi.ts` (or `childrenApi.ts`).

## 2. Backend — parent summary & profile

- [x] 2.1 Compute per-subject progress (`math`, `vietnamese`, `english`, 0–100) in `parent.service.ts` and include `subjectProgress` in the `GET /parent/:childId/summary` response; bound values to 0–100.
- [x] 2.2 Add `PATCH /parent/:childId/profile` controller route + DTO (`name?` non-empty, `age?` in supported range) with 200 / 400 / 404 handling; persist to the child document.
- [x] 2.3 Verify route ordering (static `profile` route does not shadow existing dynamic routes) and 404 for unknown child.

## 3. Parent bottom navigation

- [x] 3.1 Replace the 4 `PlaceholderScreen` tabs in `ParentStack.tsx` with real screen components (Dashboard, Report, OfflineTasks, Settings).
- [x] 3.2 Add tab `screenOptions`: emoji/icon + label per tab, active color `colors.coral`, inactive `colors.slate`, white tab bar with top shadow, headers hidden.
- [x] 3.3 Add a badge on the `Report` tab when the current week's day-5 lesson is completed (reuse `weekOf`/`dayOf` helpers).
- [x] 3.4 Route parent-area entry to the `Parent` root (`ParentTabs`, Dashboard initial); update the parent-gate navigation and remove the child-stack `goBack` dependency.

## 4. Dashboard (Dashboard tab)

- [x] 4.1 Move/adapt `ParentDashboardScreen` into `src/screens/parent/` and host it as the `Dashboard` tab; drop the in-screen back button.
- [x] 4.2 Replace the Progress Card stats with Screen-05 subject bars (Toán coral / Tiếng Việt teal / Tiếng Anh amber) driven by `subjectProgress`, with `SkeletonLoader` while loading and a local-derivation fallback offline.
- [x] 4.3 Keep the weekly-report locked card and offline-task card per Screen-05; confirm tablet 2-column layout (incl. streak summary card) still renders.

## 5. Settings screen (Settings tab)

- [x] 5.1 Create `src/screens/parent/SettingsScreen.tsx` with five sections: Thông tin bé, Subscription, Âm thanh, Thông báo, Về ứng dụng (Inter body font).
- [x] 5.2 Thông tin bé: editable name input + age selector pre-filled from `authStore.child`; Save persists to store and best-effort `updateChildProfile`.
- [x] 5.3 Subscription: show plan/expiry or trial remaining-days from `subscriptionStore`; "Quản lý subscription" (store URL) + "Khôi phục mua hàng" actions.
- [x] 5.4 Âm thanh: background-music toggle (`audioEnabled`) + volume slider (`volume`, 0–100); verify `@react-native-community/slider` is installed before use.
- [x] 5.5 Thông báo: "Email tổng kết tuần" toggle bound to `weeklyEmailEnabled`.
- [x] 5.6 Về ứng dụng: version number, privacy/terms (webview/URL), "Liên hệ hỗ trợ" (`mailto:`).
- [x] 5.7 Settings tablet layout (constrained width / grouped) via `useIsTablet()`.

## 6. Report & OfflineTasks tab hosts

- [x] 6.1 Add lightweight real `Report` and `OfflineTasks` tab screens (EPIC-009 builds the full features) so no placeholder remains — minimal header + "sắp ra mắt"/preview content.

## 7. Verification

- [x] 7.1 `tsc --noEmit` (mobile) and `tsc` build (kido-server) pass with no new errors.
- [ ] 7.2 On-device: tab switching, active-color/badge, dashboard subject bars (online + offline), settings persistence (name/age, volume, weekly-email), subscription deep-link.
- [ ] 7.3 Tablet: dashboard 2-column and settings tablet layout verified.
- [ ] 7.4 Git: one commit per repo `feat(epic-008): parent module core` (mobile + kido-server separately).
