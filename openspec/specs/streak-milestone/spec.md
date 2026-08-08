# streak-milestone

## Purpose

Defines the celebration modal shown when a lesson completion raises the daily streak to a milestone (7, 14, or 30 consecutive days).

## Requirements

### Requirement: Streak Milestone Modal
When a lesson completion raises the streak to a milestone (7, 14, or 30 consecutive days), the Lesson Complete screen SHALL present a celebration modal (`sheet-up` bottom sheet) with the Đô Đô mascot, the text "🔥 {n} ngày liên tiếp!", and a dismiss CTA.

#### Scenario: Reach 7-day milestone
- **WHEN** `completeLesson` returns a `newStreak` of 7
- **THEN** after the confetti, the milestone modal appears with "🔥 7 ngày liên tiếp!"

#### Scenario: Non-milestone streak
- **WHEN** `newStreak` is 5
- **THEN** no milestone modal is shown

#### Scenario: Shown once
- **WHEN** the milestone modal has been dismissed
- **THEN** returning to the Lesson Complete screen does not re-trigger it for the same completion
