## MODIFIED Requirements

### Requirement: Settings Screen Sections
The `SettingsScreen` (the `Settings` tab) SHALL render the sections Thông tin bé, Subscription, Âm thanh, and Về ứng dụng, in that relative order. It SHALL NOT render a Thông báo section or an "Email tổng kết tuần" toggle. The screen SHALL use `Inter_600SemiBold` for body text to match the calmer parent tone.

#### Scenario: All sections present
- **WHEN** the Settings tab is opened
- **THEN** the screen shows the Thông tin bé, Subscription, Âm thanh, and Về ứng dụng sections, in that order

#### Scenario: No weekly email toggle
- **WHEN** the Settings tab is opened
- **THEN** the screen shows no Thông báo section and no "Email tổng kết tuần" toggle

## REMOVED Requirements

### Requirement: Notification Toggle
**Reason**: The toggle only stored a local `settingsStore.weeklyEmailEnabled` flag. The app never asks for a parent email address and nothing sends a weekly summary email. The row misled parents and contradicted the Data safety answer that no email is collected.

**Migration**: Nothing to migrate for users. The Thông báo section and its toggle are removed from `SettingsScreen`. The `state-management` delta removes the store field. A future weekly email feature needs its own change that covers collecting the address, consent, sending, and the Data safety and privacy policy updates.
