## ADDED Requirements

### Requirement: TodayFAB prompts child to start today's lesson
The TodayFAB SHALL render as a floating action button at the bottom center of HomeScreen (above DailyProgressChip), with minimum size 120×56px, brandOrange (#FF6B35) background. It SHALL pulse when today's lesson is not yet completed.

#### Scenario: FAB shows "Học hôm nay" and pulses before completion
- **WHEN** today's lesson has not been completed
- **THEN** the FAB displays "🎯 Học hôm nay", has a repeating pulse scale animation, and is tappable

#### Scenario: Tapping FAB navigates to today's lesson
- **WHEN** the child taps the FAB and today's lesson is not completed
- **THEN** the app navigates to LessonPlayerScreen with today's lesson parameters

#### Scenario: FAB changes to practice mode after completion
- **WHEN** today's lesson is already completed
- **THEN** the FAB displays "✅ Xong rồi! Ôn luyện nào", stops pulsing, and tapping navigates to PracticeBankScreen (stub)

#### Scenario: FAB is hidden when not applicable
- **WHEN** there is no lesson available for today (edge case: all lessons complete)
- **THEN** the FAB is not rendered
