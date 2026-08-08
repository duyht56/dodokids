## MODIFIED Requirements

### Requirement: ChildStack navigator is fully defined with Home as root
The ChildStack SHALL have `HomeScreen` as its initial route and include stub routes for `LessonPlayerScreen`, `PracticeBankScreen`, `PaywallScreen`, and `ParentDashboardScreen` to enable navigation from EPIC-003 components without full implementations.

#### Scenario: Authenticated child lands on HomeScreen
- **WHEN** `authStore.isOnboarded` is `true`
- **THEN** the RootNavigator renders ChildStack with HomeScreen as the active screen

#### Scenario: Navigation to stub screens does not crash
- **WHEN** any component navigates to LessonPlayerScreen, PracticeBankScreen, PaywallScreen, or ParentDashboardScreen
- **THEN** a placeholder screen renders without crashing

#### Scenario: TypeScript navigation types include EPIC-003 routes
- **WHEN** any component uses `useNavigation<ChildStackNavigationProp>()`
- **THEN** TypeScript resolves `navigate('HomeScreen')`, `navigate('LessonPlayerScreen', { week })`, `navigate('PaywallScreen')`, `navigate('PracticeBankScreen')`, and `navigate('ParentDashboardScreen')` without type errors
