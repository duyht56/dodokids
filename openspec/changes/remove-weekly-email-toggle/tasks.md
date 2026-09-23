## 1. Mobile

- [x] 1.1 Remove the Thông báo section and its "Email tổng kết tuần" toggle row from `mobile/src/screens/parent/SettingsScreen.tsx`, along with the store bindings it used.
- [x] 1.2 Confirm nothing else in `mobile/` reads `weeklyEmailEnabled` or `setWeeklyEmailEnabled`, then remove both from `mobile/src/store/settingsStore.ts` and from `SettingsState` in `mobile/src/types/store.ts`.

## 2. Verification

- [x] 2.1 In `mobile/`, `npx tsc --noEmit` and scoped `npx eslint` (no `--fix`) on the changed files report 0 errors.
- [x] 2.2 Every `npm run test:*` contract script in `mobile/` passes.
- [x] 2.3 `openspec validate remove-weekly-email-toggle --strict` passes.
- [ ] 2.4 On a device, open the Settings tab and confirm there is no Thông báo section and the other sections keep their order and spacing.

## 3. Archive

- [ ] 3.1 When archiving, also edit the `settings-screen` Purpose line, which still lists "notification toggles". A delta cannot change a Purpose line because it is not a requirement.
