## ADDED Requirements

### Requirement: speakCount plays Vietnamese number audio
`speakCount(n)` SHALL play an audio file for the number `n` (1–10) from the CDN bucket instead of only logging to console.

#### Scenario: Tap sprite plays count audio
- **WHEN** child taps a sprite in CountTapActivity or CompareTapActivity for the nth time
- **THEN** `speakCount(n)` is called and the audio file for that number plays

#### Scenario: Audio URL follows bucket convention
- **WHEN** `speakCount(3)` is called
- **THEN** the URL resolved is `<COUNT_AUDIO_BASE_URL>/3.mp3` (or equivalent bucket path)

#### Scenario: Out-of-range count is handled gracefully
- **WHEN** `speakCount(0)` or `speakCount(11)` is called
- **THEN** no audio plays and no error is thrown

#### Scenario: speakCount interrupts any in-flight audio
- **WHEN** child taps a new sprite while a previous count audio is still playing
- **THEN** the previous audio stops and the new count audio starts immediately
