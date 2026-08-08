## ADDED Requirements

### Requirement: Root navigation stack defined
The system SHALL define a typed `RootStackParamList` with AuthStack, ChildStack, and ParentStack navigators using React Navigation 6.

#### Scenario: App starts at Splash when onboarded is false
- **WHEN** app launches and `isOnboarded === false`
- **THEN** user is routed to `AuthStack` (Splash → Onboarding → Setup)

#### Scenario: App starts at Home when onboarded
- **WHEN** app launches and `isOnboarded === true`
- **THEN** user is routed to `ChildStack` (Home)

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
