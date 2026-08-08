# Spec: Onboarding Slides

## Purpose

Displays a 3-slide onboarding flow that introduces the Kido app to new users before they set up their child's profile.

## Requirements

### Requirement: 3 onboarding slides displayed with swipe gesture
The system SHALL display exactly 3 full-bleed slides, navigable by swipe left/right (FlatList horizontal pagingEnabled) and by "Tiếp theo" button.

#### Scenario: User swipes to next slide
- **WHEN** user swipes left on slide 1
- **THEN** slide 2 becomes active and dot indicator updates

#### Scenario: Button advances slides
- **WHEN** user taps "Tiếp theo" on slide 1 or 2
- **THEN** next slide animates in and dot indicator updates

### Requirement: Slide content matches design spec
Each slide SHALL display: clay illustration (top ~55% of screen), title (h1 28px Nunito 900 navy), body text (17px Nunito 600 slate).

#### Scenario: Slide 1 content is correct
- **WHEN** slide 1 is displayed
- **THEN** title is "Chào bé! Mình là Đô Đô 🐵" and body describes the learning journey

#### Scenario: Slide 2 content is correct
- **WHEN** slide 2 is displayed
- **THEN** title is "Học Toán, Tiếng Việt & Tiếng Anh" with 3 subject icons

#### Scenario: Slide 3 content is correct
- **WHEN** slide 3 is displayed
- **THEN** rewards/achievements preview is shown, CTA changes to "Bắt đầu"

### Requirement: Dot indicator syncs with active slide
The system SHALL display 3 dots: active = coral `#FF6B35` filled (width 20px), inactive = `#DED1FA` (width 8px), all border-radius 9999px.

#### Scenario: Dot updates on slide change
- **WHEN** active slide changes from 1 to 2
- **THEN** dot 1 transitions to inactive color/size, dot 2 transitions to active

### Requirement: Skip button exits onboarding immediately
The system SHALL display "Bỏ qua" (slate, 15px) at top-right on slides 1 and 2. Tapping it SHALL navigate directly to ProfileSetup.

#### Scenario: Tapping skip goes to setup
- **WHEN** user taps "Bỏ qua" on any slide
- **THEN** app navigates to Setup screen

### Requirement: Last slide CTA navigates to ProfileSetup
On slide 3, the CTA button label SHALL change to "Bắt đầu" and navigate to Setup on tap.

#### Scenario: Bắt đầu navigates correctly
- **WHEN** user taps "Bắt đầu" on slide 3
- **THEN** app navigates to Setup screen
