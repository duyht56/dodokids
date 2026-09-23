## Why

The Settings screen had a "Thông báo" section with one row, an "Email tổng kết tuần" toggle. The toggle only wrote a local `settingsStore.weeklyEmailEnabled` flag. The app never asks for a parent email address and nothing sends a weekly email. So the row promised a feature that does not exist, misled parents, and contradicted the Google Play Data safety answer that no email is collected. The toggle was removed from the mobile app before the Google Play closed-test build. This change updates the specs of record to match, so that no one re-adds the toggle by following the spec.

## What Changes

- Remove the "Thông báo" section and its "Email tổng kết tuần" toggle from `SettingsScreen`. The other sections keep their order.
- Remove `weeklyEmailEnabled` and `setWeeklyEmailEnabled` from `settingsStore` and from the `SettingsState` type. No other code read them.
- No storage migration. Installs that already saved the old flag keep an unused `weeklyEmailEnabled` key in the `kido-settings` AsyncStorage entry. Nothing reads it.
- A future weekly email needs its own change that covers collecting the address, consent, sending, and the Data safety and privacy policy updates.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `settings-screen`: drop the Thông báo section from the section list and remove the "Notification Toggle" requirement.
- `state-management`: replace the `settingsStore` requirement with one that drops `weeklyEmailEnabled`, `setWeeklyEmailEnabled` and their two scenarios. It is removed and re-added under a new name because OpenSpec does not let a MODIFIED block drop scenarios.

## Impact

- `mobile/src/screens/parent/SettingsScreen.tsx`: the Thông báo section, its toggle row and the store bindings it used are removed.
- `mobile/src/store/settingsStore.ts`: the default value and the setter are removed. The merge comment no longer names the field.
- `mobile/src/types/store.ts`: `SettingsState.weeklyEmailEnabled` and `setWeeklyEmailEnabled` are removed.
- `notificationsEnabled` and its setter are unchanged.
- No server, pipeline, API, analytics or content impact.
