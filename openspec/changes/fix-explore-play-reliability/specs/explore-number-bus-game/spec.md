## ADDED Requirements

### Requirement: The board moves on after its closing line
Stage `speak`/`say` SHALL settle when the line has been said (or was dropped). In `count_on` and `next_number` the scene SHALL report a correct answer only once the closing line («N! Có tất cả N bạn nhé.») has been said and its existing report beat has passed, and a scene that is gone SHALL never report.

#### Scenario: Child answers as soon as the cards appear
- **WHEN** the right card is chosen and the closing line takes longer than the report beat
- **THEN** the next board appears only after the line ends

### Requirement: Every tap counts once
Taps on the friends at the stop (and on seated friends during a recount) SHALL read who has boarded or been recounted from state updated at the moment of the tap, so two taps handled before the next render count a+1 and a+2 and the last one still brings the cards.

#### Scenario: Two fingers at once
- **WHEN** two waiting friends are tapped within the same render
- **THEN** Đô Đô counts «a+1, a+2», both friends board, and the number cards appear
