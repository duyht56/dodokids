## ADDED Requirements

### Requirement: Unscored warm-up before the first round
A leveled game MAY declare a warm-up: a number of boards drawn at a generator level that is NOT one of the game's levels, the number of them Đô Đô shows first (passed to the renderer as `demo`), and a line said when it ends. The play screen SHALL put the warm-up boards before the first round only on the first run of the visit (the mounted play screen; "Chơi lượt mới" has none) and only when that run starts at the game's lowest level. Warm-up boards SHALL NOT count towards the round: they are not among the round's boards, a first-try answer on them is not counted, and they never end a round. The header SHALL show «Làm quen» with the warm-up's own board count and dots while they last, and the round's «Bậc N/max» with only the round's boards afterwards. After the last warm-up board the first round SHALL start like a move up: «Giỏi quá! Bé lên bậc mới nhé!» shown and said, then the warm-up's line said, the round's first board locked until both have been said and its question read after them. A warm-up that fails to generate SHALL be skipped. A game that declares no warm-up SHALL play exactly as before. Whether the warm-up was played SHALL exist only in the mounted play screen.

#### Scenario: A first visit at the lowest level
- **WHEN** a child opens Ô thiếu with no starting level set
- **THEN** the header shows «Làm quen 1/2», two 2×2 boards are played (the first shown by Đô Đô), and then «Bậc 1/3» with six 3×3 boards

#### Scenario: Warm-up boards are not counted
- **WHEN** both warm-up boards were right on the first try and 3 of the 6 round boards were
- **THEN** the round is played again at L1 ("Bé luyện thêm bậc này nhé!"), with no warm-up

#### Scenario: The round after the warm-up passes
- **WHEN** 4 of the 6 round boards were right on the first try, whatever happened on the warm-up
- **THEN** the next round is L2

#### Scenario: The parent starts the game higher
- **WHEN** Ô thiếu's starting level is 2 or 3
- **THEN** the run starts with that level's round and no warm-up

#### Scenario: A new run in the same visit
- **WHEN** the run ends and the child taps "Chơi lượt mới"
- **THEN** the new run starts with its round at the starting level and no warm-up

#### Scenario: A game without a warm-up
- **WHEN** a leveled game other than Ô thiếu starts at its lowest level
- **THEN** its first round starts at once, as before
