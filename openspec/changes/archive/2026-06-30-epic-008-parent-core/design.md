## Context

The parent area was scaffolded in EPIC-006: `ParentStack.tsx` already defines a `createBottomTabNavigator` with four tab names (`Dashboard`, `Report`, `OfflineTasks`, `Settings`), but every tab renders the same `PlaceholderScreen`. The real dashboard built in EPIC-006 lives at `src/screens/child/ParentDashboardScreen.tsx` and is reached from the child stack via a parent gate + `goBack`, not through these tabs. Settings is a 3-row inline block inside that dashboard. The BE `parent` module already serves `GET /parent/:childId/summary` and `PATCH /parent/:childId/offline-task`.

EPIC-008 makes the parent module real and navigable, using `Kido UI design/screens/Screen-05-Parent-Dashboard.html` as the visual source. Report and OfflineTasks full screens are EPIC-009 — in EPIC-008 those tabs get lightweight real hosts, not the full feature.

## Goals / Non-Goals

**Goals:**
- Replace the 4 placeholder tabs with real screens, brandOrange active styling, white tab bar + top shadow, and a report-available badge.
- Route parent-area entry into `ParentTabs` (Dashboard initial), retiring the child-stack `goBack` path.
- Align the dashboard Progress Card to Screen-05 (Toán / Tiếng Việt / Tiếng Anh subject bars).
- Ship a full dedicated Settings screen (child info edit, subscription, sound, notifications, about) with tablet layout.
- BE: add `subjectProgress` to the summary and a `PATCH /parent/:childId/profile` endpoint.

**Non-Goals:**
- Full Weekly Report screen with AI sections / charts (EPIC-009).
- Full Offline Tasks list screen with week filters (EPIC-009).
- Real IAP / restore-purchases wiring (EPIC-010) — Settings shows status + deep-links only.
- Token-based auth (still `:childId` path param, per existing parent-api).

## Decisions

- **Reuse the existing `ParentTabParamList` + `ParentStack` shell.** The tab names and types already exist; we only swap `PlaceholderScreen` for real components and add `screenOptions`/`tabBarIcon`/`tabBarBadge`. Alternative (new navigator) rejected — types and routing are already correct.
- **Move the dashboard into `src/screens/parent/`.** The dashboard is a parent screen; hosting it under the `child` stack was incidental. Adapt it into the `Dashboard` tab and drop the in-screen back button. The child→parent entry navigates to the `Parent` root (`ParentTabs`) instead of pushing `ParentDashboard`. Keep the old route temporarily only if other navigators reference it; otherwise remove.
- **Subject progress derived, not a new persisted field.** `subjectProgress` is computed server-side from existing progress data (lessons completed per subject within the current week), mirroring the derived-badges approach in EPIC-007. Mobile keeps a local derivation fallback so the card is never blank offline.
- **Settings child-edit persists locally first, syncs best-effort.** Save updates `authStore.child` immediately (source of truth) and fires `PATCH /parent/:childId/profile`; failure is tolerated (offline-first), consistent with the offline-task pattern.
- **`weeklyEmailEnabled` is a new settings field with default `true`.** Reusing `notificationsEnabled` would conflate push and email; a dedicated field is clearer. A persist `merge`/default guard ensures legacy persisted settings hydrate to `true` not `undefined`.
- **Report badge derives from day-5 completion.** Reuse the `weekOf`/`dayOf` lesson-id helpers from EPIC-007 to detect the current week's day-5 completion rather than adding state.
- **Volume slider via `@react-native-community/slider`.** Standard Expo-compatible component; verify it is installed (check before adding a dependency, per Expo v56 docs requirement in AGENTS.md).

## Risks / Trade-offs

- [Removing/relocating `ParentDashboard` from `ChildStackParamList` may break existing navigation references] → Grep all `navigate('ParentDashboard'` / `ParentDashboard` usages and update the parent-gate entry to target the `Parent` root before deleting the old route.
- [`subjectProgress` mapping of lessons→subjects may be ambiguous if lessons aren't subject-tagged] → Use a deterministic mapping from the lesson/day index to a subject bucket; if data is insufficient, fall back to an even split so values stay 0–100 and never crash.
- [`@react-native-community/slider` not installed] → If absent, gate the volume control behind a simpler stepper or add the dependency per Expo v56 install docs; do not hand-roll a gesture slider.
- [Two settings surfaces (dashboard inline + Settings tab) could drift] → Both bind to the same `settingsStore`; the Settings tab is canonical and the dashboard inline rows remain a Screen-05 convenience bound to identical state.
- [Tablet layout regressions] → Reuse `useIsTablet()` and the existing 2-column dashboard pattern; verify both orientations.

## Migration Plan

1. Extend `settingsStore` (+`weeklyEmailEnabled`, default-guard) and `parentApi`/`childrenApi` clients (subjectProgress type, profile PATCH).
2. BE: add `subjectProgress` to summary + `PATCH /parent/:childId/profile` (validation, 404/400 cases).
3. Build real tab screens: relocate/adapt Dashboard, new `SettingsScreen`, lightweight `Report`/`OfflineTasks` hosts.
4. Wire `ParentStack` tab options (icons, active color, badge, white bar + shadow); point parent entry at `ParentTabs`.
5. Update/remove the old `ParentDashboard` child-stack route and references.
6. Tablet layouts for dashboard + settings.
7. Typecheck + on-device verify (mobile + tablet).

Rollback: revert the EPIC-008 commits per repo; the EPIC-006 dashboard path remains intact in history.

## Open Questions

- Subject→lesson tagging: is there an authoritative subject field per lesson on the BE, or should `subjectProgress` use the day-index heuristic? (Default to heuristic if no field exists.)
- Should the dashboard keep its inline settings card once a full Settings tab exists, or slim it to a single "Cài đặt →" deep link? (Default: keep per Screen-05.)
