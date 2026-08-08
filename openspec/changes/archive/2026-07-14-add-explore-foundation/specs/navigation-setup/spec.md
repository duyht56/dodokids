## ADDED Requirements

### Requirement: Five-item child bottom menu
The child area SHALL render a five-item bottom menu in this order: `Bài học`, `Khám phá`, `Đô Đô`, `Thành tích`, `Phụ huynh`. `Đô Đô` SHALL be the raised center action, SHALL open the existing Home/Adventure Map, and SHALL be the default active destination. The redesign MUST preserve the existing lesson/practice, achievement and parent destinations.

#### Scenario: Default child destination
- **WHEN** an onboarded child enters the child area
- **THEN** Home/Adventure Map is displayed and the center `Đô Đô` destination has the active state

#### Scenario: Existing destination remains available
- **WHEN** the redesigned menu is rendered
- **THEN** `Bài học`, `Thành tích` and `Phụ huynh` still navigate to their existing destinations

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
