# paywall

## Purpose

Defines the subscription paywall: illustration zone, feature checklist, annual (highlighted) and monthly plan cards, and the 7-day trial CTA with dismiss.

## Requirements

### Requirement: Illustration zone with mascot
The system SHALL display a pastel-orange radial gradient zone (height 260pt mobile) with Đô Đô running mascot (kido-float), ✨ twinkling decorations, 💎 and ⭐ icons, and a radial gold glow behind the mascot.

#### Scenario: Illustration renders on open
- **WHEN** PaywallScreen mounts
- **THEN** illustration zone shows mascot with kido-float, twinkling elements, and gold glow circle

### Requirement: Feature checklist and plan lines follow the claim matrix
The paywall's feature checklist (✓ badges) and the access line under each plan name are claims to paying parents. Their text SHALL come from `docs/KIDO_MARKETING_CLAIMS.md`, the only source for claim wording, and SHALL be kept in `mobile/src/constants/planCopy.ts` (`PAYWALL_FEATURES`, `PLAN_ACCESS`), checked by `npm run test:paywall-claims` in `mobile/`. As of 2026-10-05:
- Features: "Toán tư duy, Tư duy ngôn ngữ & Tiếng Anh nền tảng" (C-03) and "Ba mẹ vẫn xem được báo cáo tuần khi con hoàn thành ngày học thứ 5" (C-42).
- Plan lines: C-11b. Each states that lessons play in order, only weeks already published, and only within the plan term ("trong thời hạn gói", R-3).

The paywall SHALL NOT say "48 tuần" (C-37: weeks are published gradually), "Không quảng cáo" (C-16 covers Khu Khám phá only) or "Tiếng Việt" as a pillar name (C-03), and SHALL NOT say a plan opens weeks ahead of the child, because the map opens one week at a time.

#### Scenario: Feature list renders the claim-matrix text
- **WHEN** PaywallScreen renders
- **THEN** each feature item appears with a ✓ icon and the text from `PAYWALL_FEATURES`, and each plan card shows its `PLAN_ACCESS` line

#### Scenario: A banned claim is reintroduced
- **WHEN** a paywall feature, plan line or other visible paywall string contains "48 tuần", "Không quảng cáo" or "Tiếng Việt", or a plan line drops "trong thời hạn gói"
- **THEN** `npm run test:paywall-claims` fails

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
