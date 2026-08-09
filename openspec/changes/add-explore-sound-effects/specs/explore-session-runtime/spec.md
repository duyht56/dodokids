## MODIFIED Requirements

### Requirement: Neutral feedback and current-run support
The shell SHALL provide audio-first instruction, correctness feedback and
escalating hints without a lose state or reward economy. Any tries, hints or
temporary difficulty adjustment SHALL exist only in the active run. Correctness,
promotion and run completion MAY additionally be reinforced with best-effort
feedback sound; that sound MUST remain neutral and encouraging (no buzzer, lose
state or reward economy), MUST honor the global audio settings, and MUST NOT
affect run flow when unavailable.

#### Scenario: Child needs repeated help
- **WHEN** multiple unsuccessful interactions occur in the active exercise
- **THEN** support increases locally and all evidence is discarded when the run ends

#### Scenario: Feedback sound reinforces an outcome
- **WHEN** a correct, promotion, retry or completion outcome occurs and audio is
  enabled
- **THEN** a neutral best-effort sound may play, and the outcome, timing and run
  state are identical to when sound is unavailable
