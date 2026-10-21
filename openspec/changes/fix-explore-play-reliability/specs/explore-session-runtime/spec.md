## ADDED Requirements

### Requirement: Feedback voice belongs to its board
Spoken feedback SHALL be tied to the board it is about. A queued feedback line SHALL carry a `stillWanted` check that is evaluated when the line's turn comes (not when it is queued); a line whose check fails SHALL be dropped without starting. A line marked `dedupe` SHALL be merged into an identical line (same clip keys) that is queued and not yet started, taking the newer caller's checks. The play shell SHALL mark every retry/hint line it speaks with `dedupe` and a check that its board is still on screen, not yet solved, and not reported busy by its renderer (`onBoardBusy`: the renderer is playing out the right answer before it reports it, as Ô thiếu's worked solution and Ú òa's why do), and SHALL drop a renderer's line that is still waiting once that renderer's board has been replaced. Leaving Explore SHALL forget every waiting line. Praise, round lines and a renderer's own closing lines (which the renderer waits for before it reports) SHALL keep playing in call order as before.

#### Scenario: Quick misses, then the right answer
- **WHEN** the child taps several wrong options in quick succession and then the right one
- **THEN** each reminder that was still waiting when the board was solved is dropped, identical reminders queued together are said once, and the praise plays right after the line already sounding — no reminder of the old board plays over the next board

#### Scenario: Quick misses, then the right answer on Ô thiếu
- **WHEN** on an Ô thiếu board the child misses at 0 ms and 500 ms (the first reminder still sounding, the second queued) and taps the right option at 1000 ms
- **THEN** the board is busy from that tap while it works its solution, the queued reminder is dropped, and the praise follows the solution — not a second «Hãy nghe lại…» over the solved board

#### Scenario: Renderer line outlives its board
- **WHEN** a renderer asked for a line that has not started by the time the next board is shown
- **THEN** that line is dropped

### Requirement: A paused run holds still
The play shell SHALL pause the run while the exit card is open and while the app is not in the foreground (AppState `background` or iOS `inactive`). While paused the shell SHALL hold its own timers (a board solved just before the pause swaps in only after the pause, after the time it had left), stop Đô Đô's voice and drop every queued line, lock the board (`disabled`) and tell the renderer (`paused`). A renderer whose clock the child must watch SHALL stop it while paused; renderers built on the shared bus sequencer (Cân thăng bằng, Xe buýt hai tầng, Ô thiếu's worked solution) SHALL hold their scripted beats, and a closing line the pause cut off SHALL be said again once play goes on. When the pause ends the shell SHALL let its timers run on and, if the board is waiting for an answer, read its question again. A pause only holds a run that is still mounted; Explore SHALL still never offer to resume a run later.

#### Scenario: Child opens the exit card mid-board
- **WHEN** the child taps X and stays on the exit card for a while, then chooses "Ở lại chơi"
- **THEN** nothing on the board moved on behind the card, no voice played, and the question is read again

#### Scenario: Exit card during Ô thiếu's worked solution
- **WHEN** the child answers an Ô thiếu board and opens the exit card 0.3 s into the solution, for half a second or for a long while, then stays
- **THEN** no chime, praise or level line plays behind the card, the answered question is not read again, the mantra the pause cut off is said again, and the board is reported once the solution has played out

#### Scenario: App goes to the background
- **WHEN** the app leaves the foreground during a board and comes back
- **THEN** the run is held the same way and continues where it stopped
