## ADDED Requirements

### Requirement: The look never runs out unseen
When the run is paused (`paused`: the exit card is open or the app left the foreground) DURING the look window, the look window SHALL stop, and when play goes on the whole set SHALL show again for a full look window with its look line. Once the set is covered or being revealed, a pause SHALL NOT show the set again — that would put the taken object back where the child has seen, or is about to see, the gap (adversarial review C04): the board SHALL stay as it is behind the exit card and SHALL pick up from that step when play goes on, without a second look. A level-2 peek cut short by a pause SHALL be shown again in full. A pause while the child is answering SHALL change nothing on the board. (`upgrade-explore-peekaboo-cups` modifies this requirement for its cups boards and the why-replay; archive this change first.)

#### Scenario: Paused during the look window
- **WHEN** the child opens the exit card two seconds into the look window and comes back after any length of time
- **THEN** the set was never covered behind the card, and a new full look window starts with «Bé nhìn kỹ các món đồ nhé!»

#### Scenario: Paused under the cover
- **WHEN** the run is paused while Đô Đô covers the set, after a full look
- **THEN** the cover stays behind the exit card and after it, no second look or look line starts, and the gap is revealed and the question asked as usual
