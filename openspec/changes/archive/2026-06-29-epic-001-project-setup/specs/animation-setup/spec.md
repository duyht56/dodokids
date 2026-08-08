## ADDED Requirements

### Requirement: React Native Animated API used for core animations
The system SHALL use the built-in React Native `Animated` API (not Reanimated) for the 4 animation patterns defined in the Design Handoff: Button Press, Node Pulse, Shake, Mascot Float.

#### Scenario: Button press animation runs correctly
- **WHEN** user presses a button
- **THEN** scale animates to 0.97 with spring (friction:8, tension:200, useNativeDriver:true), then back to 1.0 on release

#### Scenario: Node pulse animation loops
- **WHEN** a week node is in CURRENT state
- **THEN** scale loops: 1.0 → 1.06 (1000ms easeInOut) → 1.0 (1000ms)

#### Scenario: Shake animation plays on wrong answer
- **WHEN** user selects wrong answer
- **THEN** translateX sequences: -8 → 8 → -6 → 6 → -3 → 3 → 0 (each step 50ms)

#### Scenario: Mascot float animation loops
- **WHEN** mascot/Đô Đô is displayed
- **THEN** translateY loops: 0 → -10 (2000ms easeInOut sin) → 0 (2000ms easeInOut sin)

### Requirement: Reanimated 3 installed for gesture-driven animations
The system SHALL have `react-native-reanimated` 3.x installed with Babel plugin for complex gesture-driven interactions (drag-drop in SortSequence, etc.).

#### Scenario: Reanimated worklet runs on UI thread
- **WHEN** component uses `useSharedValue` and `useAnimatedStyle`
- **THEN** animation runs on UI thread without JS thread blocking

### Requirement: Gesture Handler installed and configured
The system SHALL have `react-native-gesture-handler` installed and `GestureHandlerRootView` wrapping the root component.

#### Scenario: Tap gesture recognized
- **WHEN** user taps a wrapped component
- **THEN** gesture handler fires callback within 100ms

### Requirement: Lottie installed for mascot animations
The system SHALL have `lottie-react-native` installed for Đô Đô mascot Lottie animations.

#### Scenario: Lottie animation renders
- **WHEN** component renders `<LottieView source={animationFile} autoPlay />`
- **THEN** animation plays without errors on iOS and Android

### Requirement: Animation token constants defined
The system SHALL export an `ANIMATION` constants object in `constants/tokens.ts` matching the Design Handoff timing reference.

#### Scenario: All animation constants accessible
- **WHEN** component imports `ANIMATION` from `@/constants/tokens`
- **THEN** the following values are available:
  - `ANIMATION.buttonPress.toValue` equals `0.97`
  - `ANIMATION.buttonPress.friction` equals `8`
  - `ANIMATION.buttonPress.tension` equals `200`
  - `ANIMATION.nodePulse.toValue` equals `1.06`
  - `ANIMATION.nodePulse.duration` equals `1000`
  - `ANIMATION.shake.step` equals `50`
  - `ANIMATION.mascotFloat.toValue` equals `-10`
  - `ANIMATION.mascotFloat.duration` equals `2000`
