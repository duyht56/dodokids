## ADDED Requirements

### Requirement: The look never runs out unseen
When the run is paused (`paused`: the exit card is open or the app left the foreground) before the question is asked — while the set is shown, covered or being revealed — the look window SHALL stop, and when play goes on the whole set SHALL show again for a full look window with its look line. A level-2 peek cut short by a pause SHALL be shown again in full. A pause while the child is answering SHALL change nothing on the board.

#### Scenario: Paused during the look window
- **WHEN** the child opens the exit card two seconds into the look window and comes back after any length of time
- **THEN** the set was never covered behind the card, and a new full look window starts with «Bé nhìn kỹ các món đồ nhé!»

#### Scenario: Paused under the cover
- **WHEN** the run is paused while Đô Đô covers the set
- **THEN** coming back shows the whole set again for a full look before the gap is revealed
