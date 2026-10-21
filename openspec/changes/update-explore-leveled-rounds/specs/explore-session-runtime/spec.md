## MODIFIED Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run whose validated game-owned policy contains 5–10 interactions. Games without an explicit policy retain their existing run size, except that progressive games MAY declare a shorter run (memory match plays three boards). A game played in leveled rounds SHALL run as a sequence of rounds, each a validated batch of 5–10 boards at one level (see "Leveled rounds"). A continuous game (range games) SHALL end its run naturally after 8 correct answers, and Route Planner after the Stage-5 board succeeds; wrong answers never count toward or end a run. Every run SHALL start from the parent's static starting level (or the game's first level) — continuous games carry that level into their in-memory progress, progressive games play a consecutive window of levels from it, and leveled games play their first round at it. Run state SHALL NOT be persisted to local storage, secure storage, database, analytics or a remote service.

#### Scenario: Existing five-interaction game starts
- **WHEN** a registered game without an explicit run policy, a progressive run size or leveled rounds is opened
- **THEN** its current run-size and level-selection behavior remain unchanged apart from starting at the parent's static level

#### Scenario: Continuous run reaches its natural end
- **WHEN** the child answers the eighth correct exercise of a range run
- **THEN** the shell shows the run-complete screen with "Chơi lượt mới" and "Chọn trò khác" instead of generating another exercise, and a new run starts fresh with no memory of the previous one

#### Scenario: Parent chose a starting level
- **WHEN** the static parent configuration names a level the game supports
- **THEN** a continuous run starts its range at that level, a progressive run plays consecutive levels beginning there, clamped so the window stays inside the game's levels, and a leveled game plays its first round at that level

#### Scenario: Child exits during an interaction
- **WHEN** the child leaves the game and later opens it again
- **THEN** a new run starts at its initial interaction with a new random seed

#### Scenario: App process restarts
- **WHEN** the app is terminated during Explore and relaunched
- **THEN** no Explore run can be resumed or reconstructed

### Requirement: Validated game-owned run plan
A game-owned run plan SHALL declare an ordered finite list of generation slots whose level/range/mode constraints can be validated before rendering. The shell SHALL derive batch size and progress from this plan and MUST NOT mutate slot selection from child performance. Between two rounds of a leveled game, the shell MAY choose the next round's level from the current run's first-try count; the boards inside a round SHALL NOT change with performance.

#### Scenario: Run plan and batch disagree
- **WHEN** a provider returns fewer or more exercises than the validated slot plan or an exercise violates its slot constraints
- **THEN** run creation fails closed with the neutral unavailable state rather than presenting a partial or misordered run

#### Scenario: A leveled round is under way
- **WHEN** the child misses boards in the middle of a round
- **THEN** the remaining boards of that round stay as planned; only support rises, and the level is decided once the round ends

## ADDED Requirements

### Requirement: Leveled rounds
A game whose renderer reports every miss to the shell (`onAnswer(false)` before success) MAY opt into leveled rounds with a round size, a pass mark and a maximum number of extra rounds; the default rule SHALL be 6 boards, 4 right on the first try and 1 extra round. After a round, the shell SHALL move up to the next level when the pass mark is reached, otherwise play one fresh round of the same level that avoids the boards of the round just played; a failed last extra round or a passed top level SHALL end the run naturally ("Bé luyện xong rồi!"). A round SHALL contain no board twice and SHALL split its modes evenly where the pool allows. The next round's first board SHALL stay locked until the round lines ("Giỏi quá! Bé lên bậc mới nhé!", followed on a move up by the game's line saying what is new on the new level when it has one, or "Bé luyện thêm bậc này nhé!") have been said, its question SHALL be read after them, and any timed look window SHALL start only once the board is playable. The round level, first-try count and extra-round count SHALL exist only in the mounted play screen and SHALL NOT be written to parent configuration, requests, storage or analytics. A game that never reports a miss SHALL NOT opt in.

#### Scenario: Child does well on a round
- **WHEN** at least 4 of the 6 boards of a round at level 2 were right on the first try
- **THEN** Đô Đô says "Giỏi quá! Bé lên bậc mới nhé!" then what is new at level 3 (Ú òa: "Bây giờ có bốn món đồ, bé nhìn thật kỹ nhé!") and the next round is 6 new boards at level 3, with the header showing "Bậc 3/5"

#### Scenario: Child needs more practice
- **WHEN** fewer than 4 boards of a round were right on the first try and no extra round has been played at that level
- **THEN** Đô Đô says "Bé luyện thêm bậc này nhé!" and a fresh round of the same level starts with none of the previous round's boards

#### Scenario: Extra round fails too
- **WHEN** the extra round of a level also ends below the pass mark
- **THEN** the run ends with the run-complete screen instead of another round

#### Scenario: Look window after a level-up
- **WHEN** Ú òa's first board of a new round appears while Đô Đô is still saying the round line
- **THEN** the set stays visible with a full sand timer, and the look window starts only once the board unlocks

#### Scenario: Game without a miss signal
- **WHEN** a game's boards only ever end in `onAnswer(true)` (memory match, tracing; route planner reports its failed runs since change update-explore-route-mirror-leveled, and stack tower its wrong placements since 2026-10-21 but stays out because the owner has not turned it on yet)
- **THEN** it keeps its existing run model and is not listed in the leveled-rounds table
