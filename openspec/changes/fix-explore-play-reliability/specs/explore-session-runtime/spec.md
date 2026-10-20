## ADDED Requirements

### Requirement: Feedback voice belongs to its board
Spoken feedback SHALL be tied to the board it is about. A queued feedback line SHALL carry a `stillWanted` check that is evaluated when the line's turn comes (not when it is queued); a line whose check fails SHALL be dropped without starting. A line marked `dedupe` SHALL be merged into an identical line (same clip keys) that is queued and not yet started, taking the newer caller's checks. The play shell SHALL mark every retry/hint line it speaks with `dedupe` and a check that its board is still on screen and not yet solved, and SHALL drop a renderer's line that is still waiting once that renderer's board has been replaced. Leaving Explore SHALL forget every waiting line. Praise, round lines and a renderer's own closing lines (which the renderer waits for before it reports) SHALL keep playing in call order as before.

#### Scenario: Quick misses, then the right answer
- **WHEN** the child taps several wrong options in quick succession and then the right one
- **THEN** each reminder that was still waiting when the board was solved is dropped, identical reminders queued together are said once, and the praise plays right after the line already sounding — no reminder of the old board plays over the next board

#### Scenario: Renderer line outlives its board
- **WHEN** a renderer asked for a line that has not started by the time the next board is shown
- **THEN** that line is dropped

### Requirement: A paused run holds still
The play shell SHALL pause the run while the exit card is open and while the app is not in the foreground (AppState `background` or iOS `inactive`). While paused the shell SHALL hold its own timers (a board solved just before the pause swaps in only after the pause, after the time it had left), stop Đô Đô's voice and drop every queued line, lock the board (`disabled`) and tell the renderer (`paused`). A renderer whose clock the child must watch SHALL stop it while paused; renderers built on the shared bus sequencer (Cân thăng bằng, Xe buýt hai tầng) SHALL hold their scripted beats. When the pause ends the shell SHALL let its timers run on and, if the board is waiting for an answer, read its question again. A pause only holds a run that is still mounted; Explore SHALL still never offer to resume a run later.

#### Scenario: Child opens the exit card mid-board
- **WHEN** the child taps X and stays on the exit card for a while, then chooses "Ở lại chơi"
- **THEN** nothing on the board moved on behind the card, no voice played, and the question is read again

#### Scenario: App goes to the background
- **WHEN** the app leaves the foreground during a board and comes back
- **THEN** the run is held the same way and continues where it stopped
