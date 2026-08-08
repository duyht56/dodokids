## ADDED Requirements

### Requirement: DailyProgressChip shows 5-dot weekly progress fixed at bottom of HomeScreen
The DailyProgressChip component SHALL render 5 dots representing D1–D5 of the current week, fixed at the bottom of the screen above the TodayFAB. Each dot SHALL reflect the completion state of the corresponding day.

#### Scenario: Completed day dot is teal
- **WHEN** a day's lesson is completed (day index < currentDay)
- **THEN** the corresponding dot is filled with brandTeal (#4ECDC4)

#### Scenario: Today's dot pulses orange
- **WHEN** a dot corresponds to today's lesson day (currentDay)
- **THEN** the dot shows brandOrange (#FF6B35) with a pulsing animation

#### Scenario: Future day dots are gray outline
- **WHEN** a dot corresponds to a day after today
- **THEN** the dot renders as a gray (#A0AEC0) outlined circle (unfilled)

#### Scenario: Tapping a dot shows lesson status tooltip
- **WHEN** the user taps any dot
- **THEN** a brief tooltip appears indicating whether that day's lesson is complete, today, or pending
