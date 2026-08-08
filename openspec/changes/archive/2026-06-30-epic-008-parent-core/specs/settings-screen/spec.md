## ADDED Requirements

### Requirement: Settings Screen Sections
The `SettingsScreen` (the `Settings` tab) SHALL render five sections in order: Thông tin bé, Subscription, Âm thanh, Thông báo, and Về ứng dụng. The screen SHALL use `Inter_600SemiBold` for body text to match the calmer parent tone.

#### Scenario: All sections present
- **WHEN** the Settings tab is opened
- **THEN** the screen shows Thông tin bé, Subscription, Âm thanh, Thông báo, and Về ứng dụng sections

### Requirement: Child Info Editing
The Thông tin bé section SHALL show an editable child name text input and an editable age selector pre-filled from `authStore.child`. A Save action SHALL persist the edits to the auth store and best-effort sync to the BE child profile endpoint.

#### Scenario: Edit and save name
- **WHEN** the parent changes the name field and taps Save
- **THEN** `authStore.child.name` updates and persists across restart, and a child-profile update request is sent (failure tolerated offline)

#### Scenario: Pre-filled from store
- **WHEN** the section mounts with an existing child
- **THEN** the name input and age selector show the child's current name and age

### Requirement: Subscription Status Display
The Subscription section SHALL display the current plan from `subscriptionStore`: an annual/monthly plan with expiry ("Gói Năm — hết hạn DD/MM/YYYY") or a trial state with remaining days ("Đang dùng thử — còn {X} ngày"). It SHALL provide a "Quản lý subscription" action (opens the store subscription URL) and a "Khôi phục mua hàng" action.

#### Scenario: Trial state shown
- **WHEN** `subscriptionStore.status === 'trial'`
- **THEN** the section shows "Đang dùng thử — còn {X} ngày" with the computed remaining days

#### Scenario: Manage subscription opens store
- **WHEN** the parent taps "Quản lý subscription"
- **THEN** `Linking.openURL` opens the platform store subscription-management URL

### Requirement: Sound Controls
The Âm thanh section SHALL provide a background-music toggle bound to `settingsStore.audioEnabled` and a volume slider (0–100) bound to `settingsStore.volume`. Both SHALL persist to AsyncStorage.

#### Scenario: Volume persists
- **WHEN** the parent drags the volume slider to 50 and restarts the app
- **THEN** `settingsStore.volume` is 50 on next launch

### Requirement: Notification Toggle
The Thông báo section SHALL provide a "Email tổng kết tuần" toggle bound to `settingsStore.weeklyEmailEnabled`, persisted to AsyncStorage.

#### Scenario: Weekly email toggle persists
- **WHEN** the parent disables "Email tổng kết tuần" and restarts the app
- **THEN** `settingsStore.weeklyEmailEnabled` is `false`

### Requirement: About Section
The Về ứng dụng section SHALL show the app version number and provide "Chính sách bảo mật", "Điều khoản sử dụng" (opened via webview/URL), and "Liên hệ hỗ trợ" (opens an email composer).

#### Scenario: Contact support
- **WHEN** the parent taps "Liên hệ hỗ trợ"
- **THEN** `Linking.openURL` opens a `mailto:` composer to the support address

### Requirement: Settings Tablet Layout
On tablet (`useIsTablet() === true`), the Settings sections SHALL render in a wider, centered/2-column-friendly layout consistent with the dashboard tablet treatment.

#### Scenario: Tablet rendering
- **WHEN** `useIsTablet()` returns true
- **THEN** the settings content uses the tablet layout (constrained width / multi-column groups) rather than the single mobile column
