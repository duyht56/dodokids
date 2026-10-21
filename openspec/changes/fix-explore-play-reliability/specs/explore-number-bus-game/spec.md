## ADDED Requirements

### Requirement: The board moves on after its closing line
Stage `speak`/`say` SHALL settle when the line has been said (or was dropped). In `count_on` and `next_number` the scene SHALL report a correct answer only once the closing line («N! Có tất cả N bạn nhé.») has been said and its existing report beat has passed, and a scene that is gone SHALL never report.

#### Scenario: Child answers as soon as the cards appear
- **WHEN** the right card is chosen and the closing line takes longer than the report beat
- **THEN** the next board appears only after the line ends

### Requirement: A pause keeps the scene's words and timing
While the run is paused, a scene SHALL NOT report its answer: an animation that ends during the pause (the bus driving off) SHALL report only once play goes on. A closing total cut off by a pause («N! Có tất cả N bạn nhé.» in `count_on` and `next_number`) SHALL be said again once play goes on, and the board SHALL report only after it. In `board_all`, a pause before Đô Đô's model count is over SHALL drop the rest of it; once play goes on and the question is read again, the count SHALL start over from one after the question, never over it. A mantra («Gộp A và B được N», «N gồm A và B») whose words a pause cut off SHALL be said and lit again from the start once play goes on, and the scene SHALL move on (drive off, hold, the next turn) only after that reading; a pause after its words were said only holds the beats left. A scene SHALL move on from a mantra exactly once: once it has moved on (its words may still be waiting behind another line), a pause SHALL NOT have the mantra said again nor the scene move on a second time.

#### Scenario: Exit card during the drive-off
- **WHEN** the child opens the exit card while the bus drives off and the drive ends behind it
- **THEN** no chime or praise plays and the board is reported only after "Ở lại chơi"

#### Scenario: Pause during the closing total
- **WHEN** the run is paused while the closing total is said
- **THEN** after the pause Đô Đô says the total again, then the board moves on

#### Scenario: Pause during the mantra
- **WHEN** the run is paused while Đô Đô says the mantra
- **THEN** after the pause the mantra is said again from the start, and only then does the bus drive off

#### Scenario: Pause after free_split has moved to the second turn
- **WHEN** the child presses Xong right after «Tầng nào cũng cần có bạn nha!», so the mantra waits behind it, and the run is paused after turn 2 has opened
- **THEN** after the pause «Còn cách chia nào nữa nhỉ?» is said once, the mantra of turn 1 is not said again, and the bus drives off and the board is reported once

#### Scenario: Pause during the question of board_all
- **WHEN** the run is paused while the question is read, before the model count
- **THEN** after the pause the count starts from one once the question has been read again

### Requirement: A board closing itself is not asked again
From the moment the child's answer is in — the last friend boards (`board_all`), a split is confirmed with Xong (`free_split`), the curtain opens on the right count (`missing_part`), the right card is chosen (`count_on`, `next_number`) — until the board is reported correct, the renderer SHALL report the board busy to the play screen (`onBoardBusy`), so a pause anywhere in the closing ritual (the total, the mantra, the gap before it, the drive, the hold before «Bài tiếp theo») does not have the question read again on the way back. The busy report SHALL be cleared before the correct answer is reported, and when `free_split` opens its second turn.

#### Scenario: Pause between the mantra's words and the drive
- **WHEN** the run is paused after the mantra has been said but before the bus drives off
- **THEN** after the pause the question is not read again, and «nb_go» plays and the bus drives off

#### Scenario: Pause while missing_part waits for the arrow
- **WHEN** the run is paused after the curtain has opened and the mantra has been said, while the board waits for «Bài tiếp theo»
- **THEN** after the pause the question is not read again and the arrow is still there

### Requirement: Every tap counts once
Taps on the friends at the stop (and on seated friends during a recount) SHALL read who has boarded or been recounted from state updated at the moment of the tap, so two taps handled before the next render count a+1 and a+2 and the last one still brings the cards.

#### Scenario: Two fingers at once
- **WHEN** two waiting friends are tapped within the same render
- **THEN** Đô Đô counts «a+1, a+2», both friends board, and the number cards appear
