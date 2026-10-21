## ADDED Requirements

### Requirement: Both blanks are filled in the worksheet's order
A Máy nối tiếp board SHALL be a two-machine chain `start →(op1 k1)→ mid →(op2 k2)→ end` with exactly two blanks that the child fills one after the other: forward boards show the start and ask for the middle, then the end; reverse boards show the end and ask for the middle (undoing machine 2), then the start (undoing machine 1). The renderer SHALL report every wrong card with `onAnswer(false)`, SHALL report nothing for the right first blank, and SHALL report `onAnswer(true)` exactly once, after the second blank and the replay. A board SHALL count as right on the first try only when both blanks were.

#### Scenario: Forward board
- **WHEN** a forward board `9 →−3→ □ →−2→ □` is shown
- **THEN** the middle is the cell being asked («Cho số chạy qua hai máy nhé. Ô giữa là số mấy?»), and once 6 is tapped it keeps its number, the end becomes the cell being asked («Còn ô cuối là số mấy?») with its own four cards

#### Scenario: A miss on the second blank
- **WHEN** the child taps a wrong card on the second blank
- **THEN** the card shakes and locks, `onAnswer(false)` is reported, and the board no longer counts as right on the first try

#### Scenario: Reverse board
- **WHEN** a reverse board `□ →+2→ □ →+3→ 8` is shown
- **THEN** the child fills the middle (5) first and then the start (3)

### Requirement: Level 1 is already two real steps and each level changes one thing
Levels 1–4 SHALL keep all numbers in 0–10 (the worksheet's range) and level 5 in 0–20, and every board SHALL use two machines of 2 to 4 whose chain does not come back to its start. Level 1 SHALL be forward with dots on both machines; each next level SHALL change exactly one thing: level 2 adds reverse boards, level 3 keeps dots only on the machine worked first, level 4 removes all dots, level 5 widens the range to 20. Numbers above 10 SHALL only appear on levels without dots. No machine run alone from a shown number SHALL give the second answer, and the second answer SHALL NOT be among the first blank's cards. From level 2 a round of six boards SHALL hold two forward boards, two reverse boards whose machine 2 adds and two whose machine 2 takes away.

#### Scenario: Level 1 board
- **WHEN** any level-1 board is generated
- **THEN** it is forward, has two blanks (middle, end), both machines move the number by 2 to 4, and neither machine alone reaches the end from the start

#### Scenario: Dots are only taken away
- **WHEN** the levels are compared in order
- **THEN** exactly one of direction, dots, machine size, range or card count changes from one level to the next, dots never come back at a higher level, and the range goes past 10 only on level 5 (no dots)

#### Scenario: Reverse boards are the majority of a round
- **WHEN** a level-2 round is planned
- **THEN** it holds two forward boards and four reverse boards (two undoing an adding machine, two undoing a taking-away machine)

### Requirement: Wrong cards are real child errors and no card trick beats guessing
Each blank SHALL offer four distinct cards with exactly one card that fits its machine, none that is a number shown on the machine at that moment and none that is the number going into the machine. The cards SHALL be the answer, the sign card (the answer mirrored through the number going into the machine: the opposite sign, or on reverse boards running the machine forward instead of undoing it) and one card one off (two off when one off is not allowed) beside each of them. Whether each off card sits toward or away from the number going in SHALL be drawn evenly and independently for the answer pair and the sign pair, and whether the two machines share a sign SHALL be drawn evenly, before the chain is chosen. The first blank's cards SHALL hold neither the second blank's answer nor its sign card. Played through the real round planner (a board counts only when both blanks are right):
- the answer SHALL be each size rank (smallest to largest) in 25% ± 3% of blanks;
- tricks that need no knowledge (largest, smallest, middle by size, farther from the middle of the range, nearest or farthest from the number going in or a shown number, most or fewest neighbours, a fixed position, avoiding or preferring cards seen in the previous row) SHALL be right on at most 15% of boards and pass at most 1% of 4-of-6 rounds (2% with the extra round);
- knowing only the direction of a machine without using how far the cards are from the number going in (any card that way, the nearest, the farthest — "biggest for +, smallest for −" —, the one with a neighbour, the outermost) or only the number of steps (count k and ignore the sign, then pick at random, the larger, the smaller, the one nearer or farther from the known number, the card not yet seen, by where its off card sits, always up, always down) SHALL be right on at most 56% of blanks and 30% of boards and pass at most 7% of rounds (13% with the extra round);
- never undoing a machine on reverse boards SHALL get no reverse blank right, and a child who solves forward boards but ignores the sign on reverse boards SHALL pass at most 33% of rounds (52% with the extra round).

The first blank (the middle) is the input of machine 2, so on levels 1–4 its answer is never farther from 5 than its sign card. Removing this cue would need a content change (a wider range, a ±1 machine, or letting the second blank lose its sign card). The owner approved on 2026-10-21 (direction A) keeping machines of 2–4 without ±1, levels 1–4 in 0–10 with 0 and level 5 up to 20, and keeping this cue on levels 1–4 as a known gap, to be reviewed after playtesting; level 5 is the gate that checks reverse reasoning. The tricks built on it SHALL stay at the levels measured on 2026-10-21 (2000 rounds per level) and not get worse:
- nearest the middle of the range with no knowledge: at most 19% of boards, 1.5% of rounds (2.5% with the extra round); level 5 at most 12% of boards;
- direction, then the card nearest the middle: at most 62% of blanks, 39% of boards, 16% of rounds (27%); level 5 at most 58%, 33%, 10% (17%);
- count k ignoring the sign, then the card nearest the middle: at most 75% of blanks, 50% of boards, 33% of rounds (55%); level 5 at most 62%, 37%, 14% (23%);
- solving forward boards and on reverse boards counting k toward the middle: at most 70% of rounds (94%) on levels 2–4 and 45% (69%) on level 5.

Knowing the direction and looking at how far each card on that side is from the number going in is a limit of the pick-one-of-four format with numbers 0–10 and machines of 2–4: a card next to the number going in is never the answer (no ±1 machine) and neither is one more than 4 away. Generator tuning stops here (2026-10-21); these tricks SHALL stay at the levels measured on 2026-10-21 and not get worse:
- direction, drop the card next to the number going in, take the nearest card that way: on levels 1–4 at most 73% of first blanks, 91% of second blanks, 64% of boards, 61% of rounds (86%); on level 5 at most 60%, 82%, 48%, 29% (48%);
- the best of all direction-and-distance rules (an empirical Bayes ceiling over mode, blank and the two distances on that side): on levels 1–4 at most 79% of first blanks, 91% of second blanks, 70% of boards, 75% of rounds (96%); on level 5 at most 76%, 84%, 62%, 57% (82%).

#### Scenario: Card checks
- **WHEN** any board of any level is validated
- **THEN** each blank has one fitting card, the sign card is among the cards, the number going in is not, the answer and the sign card each have exactly one other card within two on their side of the number going in at the same distance, no card equals the known number (nor the filled middle on the second blank), and every other card is a real error

#### Scenario: Shortcut measurement
- **WHEN** 2000 planner rounds per level (plus the extra round) are scored for each trick
- **THEN** each trick stays within its class limits above, and never-undoing passes no round

### Requirement: Dots anchor the numbers on the lower levels
On a step with dots the board SHALL show the dot group (10 pt in rows of five up to 10, 6 pt for numbers up to 20) of the step's known input, the machine's own dots (teal dots that drop in for "+k", struck rings that leave for "−k"), and the dot group of the step's output once it is filled. The cell being asked SHALL never show dots. At support level 1 the dots SHALL come back for the step being worked (and stay for the rest of the board); at support level 2 one wrong card not yet tapped SHALL be dimmed, never the answer and never the last wrong card.

#### Scenario: Support on level 4
- **WHEN** a child misses the first blank of a level-4 board
- **THEN** the known number and the first machine show their dots again, the second machine and the asked cell show none, and the hint line says «Bé đếm chấm rồi xem máy thêm hay bớt nhé.»

### Requirement: The machine replays the chain after a right board
After the second blank is right the board SHALL lock its cards and replay the chain forward, one machine at a time — the output cell shows the input's dots with the machine's dots dropping in or leaving — while Đô Đô says the mantra («Qua máy thêm thì nhiều lên, qua máy bớt thì ít đi.»; reverse boards «Đi ngược: máy thêm thì bớt, máy bớt thì thêm.»). `onAnswer(true)` SHALL come only after both the replay and the line have finished. Cards the child tapped wrong SHALL keep their faded look until the row of cards is replaced, through the advance to the second blank and through the replay. Under reduced motion the same steps SHALL be shown still, one at a time, with no animation started. While the run is paused the replay SHALL hold.

#### Scenario: Success waits for the replay
- **WHEN** the right card for the second blank is tapped
- **THEN** no success is reported until machine 1 and machine 2 have run and the mantra has been said

#### Scenario: Paused during the replay
- **WHEN** the exit card opens during the replay
- **THEN** no success is reported while it is open, and the replay finishes after play goes on

### Requirement: The renderer cues each blank's question
Máy nối tiếp SHALL be a renderer-cued prompt game: the play screen SHALL NOT read the prompt on mount; the renderer SHALL cue the first blank's question on mount and the second blank's question when it becomes the cell being asked, so the replay button repeats the question of the cell being asked. Every line SHALL be a fixed phrase in the clip inventory (audio v8) whose text is the on-screen text; a missing clip SHALL leave the text and dots enough to play.

#### Scenario: Replay button on the second blank
- **WHEN** the child taps the replay button while the end is being asked
- **THEN** «Còn ô cuối là số mấy?» is played, not the first question

#### Scenario: Paused just after the first blank
- **WHEN** play is paused in the short beat between the right first card and the second question
- **THEN** the second blank's question is cued at once (only remembered while paused), so the play screen reads it on the way back instead of the first question, and it is not cued a second time when the beat goes on

### Requirement: Versions and the server mirror move together
The generator, validator, config and manifest SHALL be version 2 (`number-chain-v2`, `number-chain-validator-v2`, `number-chain-config-v2`, `number-chain-manifest-v2`) and kido-server SHALL advertise the same versions for `number_chain`. A version-1 board (one blank, single `answer.value`) SHALL be rejected.

#### Scenario: Catalog mirror
- **WHEN** the server catalog entry for `number_chain` is compared with the mobile bundled game
- **THEN** config, generator and validator versions, levels and dependency manifest are equal
