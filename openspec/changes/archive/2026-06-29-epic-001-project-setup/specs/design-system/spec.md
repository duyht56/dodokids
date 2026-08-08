## ADDED Requirements

### Requirement: Color tokens defined from Design Handoff
The system SHALL export a `colors` object in `constants/tokens.ts` with all brand colors exactly as specified in the Kido Design Handoff v1.0.

#### Scenario: All color tokens accessible from tokens
- **WHEN** component imports `colors` from `@/constants/tokens`
- **THEN** the following values are available:
  - `colors.coral` equals `'#FF6B35'`
  - `colors.sky` equals `'#4ECDC4'`
  - `colors.sun` equals `'#FFE66D'`
  - `colors.navy` equals `'#1A1A2E'`
  - `colors.slate` equals `'#6B7280'`
  - `colors.cream` equals `'#FFFBF5'`
  - `colors.lavender` equals `'#F0EBFF'`
  - `colors.green` equals `'#4CAF50'`
  - `colors.amber` equals `'#FFC107'`
  - `colors.red` equals `'#FF5252'`
  - `colors.diamond` equals `'#9C27B0'`

### Requirement: Typography tokens defined with Nunito + Inter fonts
The system SHALL export a `typography` object with all text styles from the Design Handoff. Fonts: Nunito (display/headings/body/caption), Inter (label), JetBrains Mono (mono).

#### Scenario: Typography scale accessible
- **WHEN** component imports `typography` from `@/constants/tokens`
- **THEN** the following styles are available:
  - `typography.display`: Nunito, weight 900, size 36
  - `typography.h1`: Nunito, weight 900, size 28
  - `typography.h2`: Nunito, weight 800, size 22
  - `typography.h3`: Nunito, weight 800, size 18
  - `typography.body`: Nunito, weight 600, size 15
  - `typography.caption`: Nunito, weight 700, size 13
  - `typography.label`: Inter, weight 600, size 12
  - `typography.mono`: JetBrains Mono, weight 400, size 13

#### Scenario: Nunito font loads before app renders
- **WHEN** app finishes loading fonts via `expo-font` or `@expo-google-fonts/nunito`
- **THEN** all Nunito text renders correctly without fallback font

### Requirement: Spacing and border radius tokens defined
The system SHALL export `spacing` and `radius` objects matching the Design Handoff scale exactly.

#### Scenario: Spacing values match handoff
- **WHEN** component imports `spacing` from `@/constants/tokens`
- **THEN** values are: `xs:4`, `sm:8`, `md:16`, `lg:24`, `xl:32`, `xxl:48`

#### Scenario: Border radius values match handoff
- **WHEN** component imports `radius` from `@/constants/tokens`
- **THEN** values are: `xs:8`, `sm:12`, `md:18`, `lg:24`, `xl:32`, `pill:9999`, `screenMobile:54`, `screenTablet:48`

### Requirement: Shadow presets defined in React Native format
The system SHALL export a `shadows` object with 3 presets: `card`, `btnCoral`, `btnGreen` — matching the exact RN shadow values from the Design Handoff.

#### Scenario: card shadow renders correctly
- **WHEN** component applies `shadows.card`
- **THEN** shadow renders with `shadowColor:'#000'`, `shadowOffset:{width:0,height:4}`, `shadowOpacity:0.08`, `shadowRadius:14`, `elevation:4`

#### Scenario: btnCoral shadow renders correctly
- **WHEN** component applies `shadows.btnCoral`
- **THEN** shadow renders with `shadowColor:'#FF6B35'`, `shadowOffset:{width:0,height:8}`, `shadowOpacity:0.32`, `shadowRadius:18`, `elevation:8`

### Requirement: Touch target minimum constant defined
The system SHALL export `MIN_HIT_AREA = 88` from `constants/tokens.ts`. All interactive elements SHALL have minimum 88×88px hit area per backlog spec.

#### Scenario: MIN_HIT_AREA constant available
- **WHEN** component imports `MIN_HIT_AREA` from `@/constants/tokens`
- **THEN** value equals `88`
