## ADDED Requirements

### Requirement: Illustration zone with mascot
The system SHALL display a pastel-orange radial gradient zone (height 260pt mobile) with Đô Đô running mascot (kido-float), ✨ twinkling decorations, 💎 and ⭐ icons, and a radial gold glow behind the mascot.

#### Scenario: Illustration renders on open
- **WHEN** PaywallScreen mounts
- **THEN** illustration zone shows mascot with kido-float, twinkling elements, and gold glow circle

### Requirement: Feature checklist
The system SHALL list 4 features with coral ✓ badges on lavender circles:
- "48 tuần nội dung học"
- "Toán, Tiếng Việt & Tiếng Anh"
- "Báo cáo hàng tuần cho ba mẹ"
- "Không quảng cáo"

#### Scenario: Feature list renders completely
- **WHEN** PaywallScreen renders
- **THEN** all 4 feature items appear with ✓ icons and correct label text

### Requirement: Annual plan card (highlighted)
The system SHALL display the annual plan in a gradient-bordered card (gradient #A674FF→#FFD23F, 2.5pt border-radius 20pt) with "★ PHỔ BIẾN NHẤT" badge on top-right, plan name "👑 Gói Hàng năm", "Tiết kiệm 40%" in green, price "199k/tháng".

#### Scenario: Annual plan is visually highlighted
- **WHEN** PaywallScreen renders
- **THEN** annual plan card has gradient border and "PHỔ BIẾN NHẤT" badge; monthly plan has plain 2pt #F0ECE4 border

### Requirement: Monthly plan card (unselected)
The system SHALL display a monthly plan row with radio circle (unselected), label "Hàng tháng", price "299k/tháng" in gray.

#### Scenario: User can tap to select monthly plan
- **WHEN** user taps monthly plan row
- **THEN** radio circle fills with coral; CTA updates to monthly price context

### Requirement: Trial CTA and dismiss
The system SHALL display a coral "Bắt đầu dùng thử 7 ngày" button (56pt), a subtitle "Dùng thử 7 ngày miễn phí · Hủy bất cứ lúc nào", and an ✕ dismiss button (36pt, top-right).

#### Scenario: Dismiss closes paywall
- **WHEN** user taps ✕ button
- **THEN** PaywallScreen closes and user returns to previous screen

#### Scenario: Trial CTA triggers subscription flow
- **WHEN** user taps "Bắt đầu dùng thử 7 ngày"
- **THEN** app calls `subscriptionStore.startTrial()` and navigates to HomeScreen with trial active
