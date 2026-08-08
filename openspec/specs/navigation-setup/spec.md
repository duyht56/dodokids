# navigation-setup

## Purpose

Defines requirements for navigation architecture in the Kido app, covering the typed root stack, per-stack navigators, parent bottom tabs, and deep linking — all using React Navigation 6.

## Requirements

### Requirement: Root navigation stack defined
The system SHALL define a typed `RootStackParamList` with Auth, Child, and Parent navigation boundaries using the installed React Navigation version. Runtime stack boundaries that do not require JavaScript-card behavior SHALL use native-stack navigation. Existing onboarding selection, parent-gate entry, back behavior, and the `kido://paywall` deep link MUST remain functional.

#### Scenario: App starts at Splash when onboarded is false
- **WHEN** app launches and `isOnboarded === false`
- **THEN** user is routed to the Auth flow (Splash → Onboarding → Setup)

#### Scenario: App starts at Home when onboarded
- **WHEN** app launches and `isOnboarded === true`
- **THEN** user is routed to the Child flow with Home/Adventure Map selected

#### Scenario: Parent gate opens the Parent area
- **WHEN** the parent gate succeeds from the child area
- **THEN** the Parent area opens through the typed root boundary without creating duplicate Child roots

### Requirement: All stack navigators typed with TypeScript
Each navigator SHALL have a fully typed `ParamList` exported from `navigation/types.ts`.

#### Scenario: Navigation call is type-safe
- **WHEN** developer calls `navigation.navigate('LessonPlayer', { lessonId: 'x' })`
- **THEN** TypeScript errors if `lessonId` is missing or wrong type

### Requirement: Parent module uses bottom tab navigator
The ParentStack SHALL use a bottom tab navigator with 4 tabs: Tổng quan, Báo cáo, Hoạt động, Cài đặt.

#### Scenario: Bottom tabs render in ParentStack
- **WHEN** user navigates to ParentDashboard
- **THEN** bottom tab bar with 4 icons is visible

### Requirement: Deep linking configured for paywall
The app SHALL handle deep link `kido://paywall` to navigate directly to Paywall screen.

#### Scenario: Deep link opens paywall
- **WHEN** app receives deep link `kido://paywall`
- **THEN** Paywall screen is displayed

### Requirement: Five-item child bottom menu
The child area SHALL render a five-item bottom menu in this order: `Bài học`, `Khám phá`, `Đô Đô`, `Thành tích`, `Phụ huynh`. `Đô Đô` SHALL be the raised center action, SHALL open the existing Home/Adventure Map, and SHALL be the default active destination. The existing `ChildBottomNav` visual and accessibility contract SHALL be reused as the custom tab bar or equivalent stable destination controller.

Switching among child destinations MUST update stable tab state rather than append destination screens to a shared stack. Each destination MAY own a nested stack for its detail flows, and returning to a destination SHALL preserve the intended tab state without accumulating duplicate Home, Explore, Practice, or Achievement roots.

#### Scenario: Default child destination
- **WHEN** an onboarded child enters the child area
- **THEN** Home/Adventure Map is displayed and the center `Đô Đô` destination has the active state

#### Scenario: Existing destination remains available
- **WHEN** the optimized menu is rendered
- **THEN** `Bài học`, `Khám phá`, `Thành tích` and `Phụ huynh` still open their existing destinations and subscription/parent-gate rules remain unchanged

#### Scenario: Repeated destination switching keeps bounded state
- **WHEN** the child alternates between `Đô Đô` and `Khám phá` 20 times
- **THEN** navigation state contains one stable root for each destination rather than 20 additional stack routes

#### Scenario: Detail flow returns to its destination
- **WHEN** the child opens an Explore game or lesson detail and then goes back
- **THEN** the child returns to the owning destination without resetting or duplicating unrelated destination roots

### Requirement: Direct free Explore destination
The typed child navigation SHALL include an Explore catalog route and an Explore session route. Selecting `Khám phá` SHALL open the catalog directly without a subscription check or Paywall redirect.

#### Scenario: Child taps Explore
- **WHEN** the child selects `Khám phá` from the bottom menu
- **THEN** the Explore catalog opens and the Explore destination receives the active state

#### Scenario: Explore play navigation is typed
- **WHEN** code navigates to an Explore game
- **THEN** TypeScript requires the registered game code and exposes no resume or persisted-session identifier in `ChildStackParamList`

### Requirement: Child-safe bottom-menu interaction
Each bottom-menu destination SHALL have a minimum 64×64pt interactive allocation even when its visible icon or active pill is smaller. Active state SHALL use shape plus color, safe-area inset SHALL be respected, and reduced-motion mode SHALL disable the repeating mascot pulse without removing navigation feedback.

#### Scenario: Narrow phone renders menu
- **WHEN** the child area renders at a supported narrow phone width
- **THEN** all five destinations remain reachable without overlapping interactive regions or clipped labels

#### Scenario: Reduced motion is enabled
- **WHEN** the device requests reduced motion
- **THEN** the center mascot does not pulse continuously and active/navigation states remain visually clear
