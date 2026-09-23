# explore-session-runtime

## Purpose

Defines the transient hybrid Explore play runtime shared by local/offline and
stateless server-provided games.

## Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run whose validated game-owned policy contains 5–10 interactions. Games without an explicit policy retain their existing run size. Run state SHALL NOT be persisted to local storage, secure storage, database, analytics or a remote service.

#### Scenario: Existing five-interaction game starts
- **WHEN** a registered game without an explicit run policy is opened
- **THEN** its current run-size and level-selection behavior remain unchanged

#### Scenario: Child exits during an interaction
- **WHEN** the child leaves the game and later opens it again
- **THEN** a new run starts at its initial interaction with a new random seed

#### Scenario: App process restarts
- **WHEN** the app is terminated during Explore and relaunched
- **THEN** no Explore run can be resumed or reconstructed

### Requirement: Validated game-owned run plan
A game-owned run plan SHALL declare an ordered finite list of generation slots whose level/range/mode constraints can be validated before rendering. The shell SHALL derive batch size and progress from this plan and MUST NOT mutate slot selection from child performance.

#### Scenario: Run plan and batch disagree
- **WHEN** a provider returns fewer or more exercises than the validated slot plan or an exercise violates its slot constraints
- **THEN** run creation fails closed with the neutral unavailable state rather than presenting a partial or misordered run

### Requirement: Hybrid exercise provider
The runtime SHALL dispatch exercise creation through the registered game's `runtimeMode`. Local games SHALL generate and validate on-device without network access; server games SHALL consume stateless validated exercise batches without creating a server session.

#### Scenario: Local game starts offline
- **WHEN** all declared local dependencies are installed and the device has no network
- **THEN** the game generates a valid fresh run without an API call

#### Scenario: Server game starts online
- **WHEN** an enabled server game is selected with connectivity
- **THEN** mobile obtains validated exercises without sending prior outcomes or creating resumable state

### Requirement: Deterministic correctness within a run
Every exercise SHALL be generated from a versioned rule and seed and SHALL pass an independent validator before display. Determinism is required for automated testing but SHALL NOT authorize persistence of a child's seed or outcome.

#### Scenario: Generated exercise is invalid
- **WHEN** validation fails before presentation
- **THEN** the provider retries within a bounded limit or returns a neutral unavailable state

### Requirement: Neutral feedback and current-run support
The shell SHALL provide audio-first instruction, correctness feedback and escalating hints without a lose state or reward economy. Any tries, hints or temporary difficulty adjustment SHALL exist only in the active run.

#### Scenario: Child needs repeated help
- **WHEN** multiple unsuccessful interactions occur in the active exercise
- **THEN** support increases locally and all evidence is discarded when the run ends

### Requirement: No lesson side effects
Explore SHALL NOT call lesson completion, XP, star, streak, achievement, unlock or subscription-progress services.

#### Scenario: Explore run ends
- **WHEN** the child completes or exits a run
- **THEN** all lesson and reward state remains unchanged and Explore run state is discarded
