# Spec: Splash Screen

## Purpose

The app's entry screen, displayed on every launch. Shows branded UI while determining whether to route the user to Onboarding or directly to Home.

## Requirements

### Requirement: Splash screen displays branded UI on app launch
The system SHALL display a full-screen splash with navy background (`#1A1A2E`), Đô Đô mascot, "Kido" logo text (64px Nunito 900 white), and tagline "Học vui mỗi ngày" (22px Nunito 600, rgba white 65%).

#### Scenario: Splash renders correct visual elements
- **WHEN** app launches and SplashScreen mounts
- **THEN** background is `#1A1A2E`, mascot image is centered, logo "Kido" and tagline are visible

### Requirement: Splash auto-navigates after 2000ms
The system SHALL automatically navigate away from SplashScreen after 2000ms — to Onboarding if `isOnboarded === false`, to Home (ChildStack) if `isOnboarded === true`.

#### Scenario: First-time user goes to Onboarding
- **WHEN** SplashScreen mounts and `authStore.isOnboarded === false`
- **THEN** after 2000ms, app navigates to Onboarding screen

#### Scenario: Returning user goes to Home
- **WHEN** SplashScreen mounts and `authStore.isOnboarded === true`
- **THEN** after 2000ms, app navigates to Home screen

### Requirement: Dots loader animates during splash
The system SHALL show 3 animated dots below the mascot with staggered scale/opacity animation (scale 0.6→1, opacity 0.4→1, 600ms loop per dot, 200ms stagger).

#### Scenario: Dots are visible and animating
- **WHEN** SplashScreen is displayed
- **THEN** 3 dots are visible and pulsing with staggered timing
