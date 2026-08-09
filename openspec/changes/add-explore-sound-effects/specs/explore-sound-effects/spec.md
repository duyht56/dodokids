## ADDED Requirements

### Requirement: Approved bundled Explore SFX set
The mobile app SHALL bundle a small, approved, versioned Explore sound-effect set
covering selection, correctness, gentle retry, promotion and run completion. Every
sound-effect name used by Explore MUST resolve to an approved bundled file through
a static, Metro-packaged reference, and MUST NOT resolve to a network URL. The
correctness and promotion sounds SHALL be warm and celebratory and the retry sound
SHALL be a soft, encouraging cue — Explore MUST NOT play a harsh buzzer or any
"lose"/failure stinger.

#### Scenario: SFX set is verified for release
- **WHEN** the Explore sound-effect set is checked for release
- **THEN** every mapped sound-effect name resolves to an approved bundled file and
  no name resolves to a network URL

#### Scenario: Retry sound is non-punitive
- **WHEN** a wrong answer triggers the retry sound
- **THEN** the sound is a soft encouraging cue and no buzzer, lose state or shame
  cue is played

### Requirement: Settings-aware playback
Explore sound SHALL honor the existing global audio settings at play time. When
`audioEnabled` is off, Explore MUST play no sound. When enabled, playback volume
MUST be scaled by the `volume` setting. Explore MUST NOT introduce a separate
child-facing mute control or write any audio setting.

#### Scenario: Audio is disabled in settings
- **WHEN** a run event or selection occurs while `audioEnabled` is off
- **THEN** no Explore sound is played and gameplay is unaffected

#### Scenario: Volume is scaled
- **WHEN** an Explore sound plays while `audioEnabled` is on
- **THEN** its playback volume reflects the current `volume` setting

### Requirement: Strictly best-effort feedback sound
Explore sound SHALL be best-effort and non-blocking: a missing asset, a playback
error, a disabled setting or zero volume MUST resolve to silence and MUST NOT
throw into, delay, or alter exercise generation, validation, availability, run
advancement or completion. Sound MUST play in iOS silent mode consistent with
instruction audio, and MUST NOT cancel or truncate an in-flight spoken instruction
clip.

#### Scenario: A sound asset is missing or fails
- **WHEN** a mapped sound cannot be resolved or fails to play
- **THEN** the game continues unchanged and no error surfaces to the child

#### Scenario: Feedback sound during instruction audio
- **WHEN** a feedback sound plays while a spoken instruction clip is playing
- **THEN** the instruction clip is not stopped or truncated by the feedback sound

### Requirement: Zero-history feedback sound
Explore sound SHALL introduce no play history, attempt record, counter, analytics
event or persisted state beyond the parent audio settings that already exist.
Playback state MUST be current-run only and released when the Explore screen
unmounts.

#### Scenario: Run ends
- **WHEN** the child completes or exits an Explore run
- **THEN** no sound-related attempt, history, analytics or progress is written and
  any active players are released

### Requirement: Run-event and selection sound mapping
Explore SHALL map run outcomes to feedback sounds at the play route: a correct
answer plays the correctness sound, a promotion plays the promotion sound, a wrong
answer plays the retry sound, and reaching run completion plays the completion
sound. A selection sound MAY be played on an answer-committing tap by renderers
that opt in. Each mapped run outcome MUST play its sound at most once per
occurrence.

#### Scenario: Child answers correctly and is promoted
- **WHEN** a correct answer advances the child to a higher range/level
- **THEN** the promotion sound plays exactly once and the run continues normally

#### Scenario: Child finishes a run
- **WHEN** the run reaches its completion screen
- **THEN** the completion sound plays exactly once
