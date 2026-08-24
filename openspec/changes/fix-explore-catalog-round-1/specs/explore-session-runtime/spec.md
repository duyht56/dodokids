## MODIFIED Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run whose validated game-owned policy contains 5–10 interactions. Games without an explicit policy retain their existing run size, except that progressive games MAY declare a shorter run (memory match plays three boards). `number_bond` SHALL declare exactly 10 interactions: five for whole 5 followed by five for whole 10. A continuous game (range games, arithmetic) SHALL end its run naturally after 8 correct answers, and Route Planner after the Stage-5 board succeeds; wrong answers never count toward or end a run. Every run SHALL start from the parent's static starting level (or the game's first level) — continuous games carry that level into their in-memory progress and progressive games play a consecutive window of levels from it. Run state SHALL NOT be persisted to local storage, secure storage, database, analytics or a remote service.

#### Scenario: Number-bond run starts
- **WHEN** the registered `number_bond` game is opened
- **THEN** the shell resolves its ten-slot plan and displays progress against 10 rather than a global five-interaction constant

#### Scenario: Existing five-interaction game starts
- **WHEN** a registered game without the number-bond policy or a progressive run size is opened
- **THEN** its current run-size and level-selection behavior remain unchanged apart from starting at the parent's static level

#### Scenario: Continuous run reaches its natural end
- **WHEN** the child answers the eighth correct exercise of a range or arithmetic run
- **THEN** the shell shows the run-complete screen with "Chơi lượt mới" and "Chọn trò khác" instead of generating another exercise, and a new run starts fresh with no memory of the previous one

#### Scenario: Parent chose a starting level
- **WHEN** the static parent configuration names a level the game supports
- **THEN** a continuous run starts its range at that level and a progressive run plays consecutive levels beginning there, clamped so the window stays inside the game's levels

#### Scenario: Child exits during an interaction
- **WHEN** the child leaves the game and later opens it again
- **THEN** a new run starts at its initial interaction with a new random seed

#### Scenario: App process restarts
- **WHEN** the app is terminated during Explore and relaunched
- **THEN** no Explore run can be resumed or reconstructed

### Requirement: Neutral feedback and current-run support
The shell SHALL provide audio-first instruction, correctness feedback and escalating hints without a lose state or reward economy. The shell SHALL NOT display a streak, a counter that resets on a miss, or a flame/reward glyph; continuous runs show only the current range and forward-only progress toward the run's end. Range promotion SHALL use a window of recent answers (5 correct within the last 7) rather than an unbroken streak. The shell SHALL offer a replay control for any exercise that carries prompt audio, and spoken prompt/feedback audio SHALL obey the parent's audio settings (`audioEnabled`, `volume`). The mascot shown on every Explore surface SHALL be Đô Đô (the product mascot image), never an emoji placeholder. Any tries, hints or temporary difficulty adjustment SHALL exist only in the active run.

#### Scenario: Child needs repeated help
- **WHEN** multiple unsuccessful interactions occur in the active exercise
- **THEN** support increases locally and all evidence is discarded when the run ends

#### Scenario: Child misses once during a continuous run
- **WHEN** the child answers incorrectly after several correct answers
- **THEN** no visible counter resets to zero, the progress dots keep their filled count, and promotion still happens once 5 of the last 7 answers are correct

#### Scenario: Parent has turned audio off
- **WHEN** `audioEnabled` is false or `volume` is 0 in the parent settings
- **THEN** no prompt or feedback clip is played, while the on-screen prompt and the game remain fully playable

## ADDED Requirements

### Requirement: Mode variety in one-exercise batches
When a local game requests a batch of one exercise, the round planner SHALL rotate its serving order per batch and SHALL serve the buckets the child just played last, so that over a run every mode the level can generate reaches the child. The replay-exclusion window (most recent 8 variant keys) SHALL be applied whole rather than truncated to the batch size.

#### Scenario: Continuous game alternates modes
- **WHEN** 120 one-exercise batches are requested for a level that declares several reachable buckets, each passing the previous exercise's bucket and the exclusion window
- **THEN** every reachable bucket is served in at least 15% of the batches

#### Scenario: Exercise before last is not replayed immediately
- **WHEN** the play screen passes its recent variant keys to a one-exercise batch
- **THEN** none of those variants is served while the generator can produce another valid one
