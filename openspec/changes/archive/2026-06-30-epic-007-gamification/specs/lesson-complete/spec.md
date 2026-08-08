## MODIFIED Requirements

### Requirement: Star-Earn Animation Reflects Real Score
The Lesson Complete screen SHALL render exactly the number of earned stars passed from the player (1–3), each animating in with a spring scale from 0→1 staggered by ~300ms. Unearned star slots (up to 3) SHALL appear as dimmed silhouettes so the child sees the target.

#### Scenario: Two stars earned
- **WHEN** the lesson awarded 2 stars
- **THEN** two stars animate in fully and the third slot shows as a dimmed silhouette

#### Scenario: Three stars earned
- **WHEN** the lesson awarded 3 stars
- **THEN** all three stars animate in, staggered, with no dimmed slots
