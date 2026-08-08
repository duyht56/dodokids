# lesson-complete

## Purpose

Defines the lesson-completion celebration screen: 3-star animation, mascot, XP/streak reward card, confetti, and the next-lesson / back-to-map navigation.

## Requirements

### Requirement: Display 3-star celebration
The system SHALL show three bobbing stars (kido-bob animation) with the large center star, Đô Đô celebrating mascot with kido-float, heading "Bé làm tốt lắm!", and subtitle "Đã xong bài học hôm nay 🌟". Background: linear gradient #F0EBFF→#FFEAEF.

#### Scenario: Stars animate on mount
- **WHEN** LessonCompleteScreen mounts
- **THEN** the earned stars bob with staggered delays; center star is larger (76pt vs 52pt)

### Requirement: Star-Earn Animation Reflects Real Score
The Lesson Complete screen SHALL render exactly the number of earned stars passed from the player (1–3), each animating in with a spring scale from 0→1 staggered by ~300ms, then settling into a bob loop. Unearned star slots (up to 3) SHALL appear as dimmed silhouettes so the child sees the target.

#### Scenario: Two stars earned
- **WHEN** the lesson awarded 2 stars
- **THEN** two stars animate in fully and the third slot shows as a dimmed silhouette

#### Scenario: Three stars earned
- **WHEN** the lesson awarded 3 stars
- **THEN** all three stars animate in, staggered, with no dimmed slots

### Requirement: Streak Milestone Celebration
When a lesson completion raises the streak to a milestone (7, 14, or 30 days), the Lesson Complete screen SHALL present a `sheet-up` bottom-sheet modal with the Đô Đô mascot, "🔥 {n} ngày liên tiếp!", and a dismiss CTA, shown once for that completion.

#### Scenario: Reach 7-day milestone
- **WHEN** completion returns a `newStreak` of 7
- **THEN** after the confetti the milestone modal appears with "🔥 7 ngày liên tiếp!"

#### Scenario: Non-milestone streak
- **WHEN** `newStreak` is 5
- **THEN** no milestone modal is shown

### Requirement: Show XP and streak reward card
The system SHALL display a teal card (#4ECDC4) with 🔥 streak count (e.g. "7 ngày") on the left and "+100 XP" on the right with teal shadow.

#### Scenario: Streak and XP display correct values
- **WHEN** lesson completed with streak=7 and xp earned=100
- **THEN** card shows "7 ngày" and "+100 XP"

### Requirement: Confetti particle overlay
The system SHALL render emoji/shape confetti (🎉, ✨, colored squares/circles) scattered across the screen on mount, fading in via fade-in animation.

#### Scenario: Confetti renders on mount
- **WHEN** LessonCompleteScreen mounts
- **THEN** confetti elements appear at fixed positions across the screen background

### Requirement: Next lesson and map navigation CTAs
The system SHALL show a coral "Bài tiếp theo →" primary button (56pt height) and a ghost "Về bản đồ" secondary button. Pressing primary navigates to next lesson; pressing secondary navigates back to HomeScreen (map).

#### Scenario: Primary CTA navigates to next lesson
- **WHEN** user taps "Bài tiếp theo →"
- **THEN** app navigates to LessonPlayerScreen with week = current week, next day

#### Scenario: Secondary CTA returns to map
- **WHEN** user taps "Về bản đồ"
- **THEN** app navigates back to HomeScreen
