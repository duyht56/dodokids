## ADDED Requirements

### Requirement: Display 3-star celebration
The system SHALL show three bobbing stars (kido-bob animation) with the large center star, Đô Đô celebrating mascot with kido-float, heading "Bé làm tốt lắm!", and subtitle "Đã xong bài học hôm nay 🌟". Background: linear gradient #F0EBFF→#FFEAEF.

#### Scenario: Stars animate on mount
- **WHEN** LessonCompleteScreen mounts
- **THEN** 3 stars bob with staggered delays (0ms, 100ms, 200ms); center star is larger (76pt vs 52pt)

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
