## MODIFIED Requirements

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

