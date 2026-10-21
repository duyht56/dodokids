## ADDED Requirements

### Requirement: The board holds while the run is paused
The memory renderer's beats — a mismatched pair turning back (700ms), a matched pair settling (260ms), Đô Đô's hint peek closing (1100ms) and the report of a finished board (420ms) — SHALL run on the shared pausable clock (`useBusSequencer(paused)`). While the run is paused (exit card open, app away) the board SHALL stay as it is and nothing SHALL be reported; when play goes on each beat SHALL wait only what was left of it. A finished board SHALL be reported exactly once, through the latest `onAnswer`.

#### Scenario: Mismatch behind the exit card
- **WHEN** two different cards are face up and the child opens the exit card 300ms later, waits, then goes back to play
- **THEN** both cards stay face up while the card is open and turn back 400ms after play goes on

#### Scenario: Finished board behind the exit card
- **WHEN** the last pair is matched and the exit card opens before the report beat
- **THEN** `onAnswer(true)` is not called while it is open and is called once after play goes on
