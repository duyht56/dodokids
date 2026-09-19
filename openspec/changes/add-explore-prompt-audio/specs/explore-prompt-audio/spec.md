## ADDED Requirements

### Requirement: Composable prompt-audio keys
Each enabled Explore game SHALL map its child-facing prompt to an ordered list of
stable audio keys drawn from a finite inventory of fixed-phrase clips and slot
clips (numbers, object labels, directions). The mapping SHALL be a pure function
of the exercise and MUST cover every prompt variant the game's generator can emit.
Number-name keys SHALL reuse the `enable-explore-offline-audio` pack rather than
defining a parallel set.

#### Scenario: Every emitted prompt is mappable
- **WHEN** a game generates any valid exercise
- **THEN** its prompt resolves to a fully populated ordered key list with no
  unmapped segment

#### Scenario: Slot reuse
- **WHEN** two different templates both include a number, label or direction slot
- **THEN** both reference the same shared slot clip key rather than a per-template
  recording

### Requirement: Offline stitched playback
Explore SHALL read a prompt aloud by resolving its key list against a bundled
static registry and playing the segments in order without network access. A key
that is absent or fails to play MUST fall back to the on-screen `promptVi` and
MUST NOT block or alter the game.

#### Scenario: Prompt is played in airplane mode
- **WHEN** an exercise with a mapped prompt is shown without connectivity
- **THEN** its segment clips play in order from the app bundle and no network
  request occurs

#### Scenario: A segment clip is missing
- **WHEN** one key in a prompt's list does not resolve to a bundled clip
- **THEN** the on-screen prompt remains visible and gameplay continues unchanged

### Requirement: Settings-aware, zero-history prompt audio
Prompt audio SHALL honor the global audio settings (silent when `audioEnabled` is
off, volume scaled by `volume`), play in a channel separate from feedback SFX so
it is not truncated by them, and write no play history, attempt, analytics or
persisted state. Playback SHALL be current-run only and released on unmount.

#### Scenario: Audio disabled
- **WHEN** a prompt would be read while `audioEnabled` is off
- **THEN** no prompt audio plays and the game is unaffected

#### Scenario: Run ends
- **WHEN** the child leaves the exercise or run
- **THEN** any prompt player is released and no prompt-audio history is written

### Requirement: Instruction-only scope
Prompt audio SHALL voice only the instruction/question. It MUST NOT read answer
options aloud and MUST NOT reveal the answer of an audio-dependent mode; gating of
`hear_select`-style modes remains governed by `enable-explore-offline-audio`.

#### Scenario: Answer is not revealed
- **WHEN** a prompt is read for any game
- **THEN** only the question is spoken and no answer option clip is played
