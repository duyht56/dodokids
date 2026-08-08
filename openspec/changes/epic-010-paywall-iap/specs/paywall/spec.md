## MODIFIED Requirements

### Requirement: Annual plan card (highlighted)
The system SHALL display the annual plan in a gradient-bordered card (gradient #A674FF→#FFD23F, 2.5pt border-radius 20pt) with "★ PHỔ BIẾN NHẤT" badge on top-right, plan name "👑 Gói Năm Đồng Hành", price "999.000đ/năm", sub-label "Chỉ 83.000đ/tháng", and "Tiết kiệm 40%" in green.

#### Scenario: Annual plan is visually highlighted
- **WHEN** PaywallScreen renders
- **THEN** annual plan card has gradient border and "PHỔ BIẾN NHẤT" badge; monthly plan has plain 2pt #F0ECE4 border

### Requirement: Monthly plan card (unselected)
The system SHALL display a monthly plan row with radio circle (unselected), label "Gói Tháng Toàn Diện", price "139.000đ/tháng" in gray.

#### Scenario: User can tap to select monthly plan
- **WHEN** user taps monthly plan row
- **THEN** radio circle fills with coral; CTA updates to reflect monthly plan selection

### Requirement: Trial CTA and dismiss
The system SHALL display a coral "Bắt đầu học tiếp →" CTA button (56pt), an anchoring message "= Bằng 2 buổi học thêm tại trung tâm" below the plan cards, a "Hoàn tiền trong 7 ngày đầu" policy note, a "Khôi phục mua hàng" link (required by Apple), and an ✕ dismiss button (36pt, top-right).

#### Scenario: Dismiss closes paywall
- **WHEN** user taps ✕ button
- **THEN** PaywallScreen closes and user returns to previous screen

#### Scenario: CTA triggers IAP purchase flow
- **WHEN** user taps "Bắt đầu học tiếp →"
- **THEN** app calls `requestSubscription` for the selected product ID and initiates the native payment sheet

#### Scenario: Restore link triggers restore flow
- **WHEN** user taps "Khôi phục mua hàng"
- **THEN** app calls `getAvailablePurchases` and processes any found active subscriptions
