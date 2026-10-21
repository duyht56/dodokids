## ADDED Requirements

### Requirement: Every failed run is a miss
A run that does not end home with every declared objective satisfied in order — stopped by the board edge, an obstacle or the locked door, short of home, past home, or without the star or the checkpoints in order — SHALL report exactly one `onAnswer(false)` once Đô Đô has walked it, and the same board and command queue SHALL stay for revision. The "try again" chime SHALL come from the play shell's miss handling, not a second cue from the renderer; the renderer SHALL keep saying its own guidance for the failure. A winning run SHALL report `onAnswer(true)` once. A board SHALL count as right on the first try only when its first run wins.

#### Scenario: Run into an obstacle, then fix it
- **WHEN** the child's first run stops at an obstacle and the edited second run gets home
- **THEN** the shell receives `onAnswer(false)` then `onAnswer(true)` for that board, and it does not count toward the round's first-try total

#### Scenario: Run walks into the locked door
- **WHEN** a key-level run reaches the door without the key
- **THEN** one `onAnswer(false)` is reported and the guidance asks for the key

### Requirement: Leveled route progression
The five route levels (L1 short unobstructed routes, L2 turns and obstacles, L3 a star before home, L4 a key before its door, L5 two ordered checkpoints) SHALL be played in leveled rounds of 6 boards: at least 4 right on the first try moves up a level, otherwise one fresh round of the same level is played, and a failed extra round or a passed L5 ends the run. Moving up SHALL say what is new on the next level (`route_intro_2..5`). Completing a single board SHALL NOT change the level.

#### Scenario: Child passes level 4
- **WHEN** at least 4 of 6 L4 boards were right on the first try
- **THEN** Đô Đô says «Giỏi quá! Bé lên bậc mới nhé!» and «Bây giờ có điểm số một và số hai, bé đi đúng thứ tự nhé!», and the next round is 6 L5 boards

### Requirement: The walk holds while paused and has a still form
Đô Đô's step-by-step walk, the beat before the result and the guidance waiting for the chime SHALL be held while the run is paused (exit card, app in the background) and go on from the same step afterwards. A failed run's guidance that the pause cut off or dropped SHALL be said again once play goes on, unless the child has since changed the plan; guidance already heard out SHALL NOT be repeated. When the system asks for reduced motion the run SHALL NOT animate the walk: the whole path SHALL show at once (Đô Đô on the cell where the run ended, every cell passed tinted) and the result SHALL follow after a short hold. Cells passed SHALL be tinted in both forms so the run can be read back.

#### Scenario: Exit card mid-walk
- **WHEN** the child taps X while Đô Đô is walking and stays on the exit card
- **THEN** Đô Đô stays on the same cell and nothing is reported; after «Ở lại chơi» the walk continues and the run is reported

#### Scenario: Guidance cut by the exit card
- **WHEN** the exit card opens while Đô Đô is saying why the run failed, and the child stays
- **THEN** the same guidance is said again (and the board's question is not read over it)

#### Scenario: Reduced motion
- **WHEN** reduced motion is on and the child taps «Đô Đô đi thôi!»
- **THEN** the full path is shown at once and the result follows without a stepwise walk

## REMOVED Requirements

### Requirement: Five-level route progression
**Reason**: a completed board advanced a level even after many failed runs, and the run could not tell a board solved first time from one solved after hints (review A06).
**Migration**: replaced by "Leveled route progression".
