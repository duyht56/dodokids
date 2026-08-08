## Why

`number_explorer` and `tap_count` already generate and validate exercises entirely on-device, but the repository has no bundled Explore audio and `speakCount()` does not play sound. Treating audio as a game-wide dependency currently hides valid offline visual gameplay and leaves audio-first modes without a production playback path.

## What Changes

- Introduce an explicit Explore offline-audio capability covering an approved Vietnamese number pack for 0–50, instruction/object-label audio, stable local lookup, preload and verified playback.
- Separate local gameplay availability from audio availability so non-audio modes can remain playable offline while audio-dependent modes are gated.
- Enable offline visual modes for `number_explorer`; enable `hear_select` only when the required local audio capability is ready.
- Enable `tap_count` offline with visual/icon instructions, while exposing audio replay only when its local prompt dependencies resolve.
- Replace the `speakCount()` placeholder path used by Explore with real bundled playback; no uncontrolled runtime TTS is introduced.
- Add airplane-mode, missing-asset, replay and capability-manifest tests before setting the final public offline/audio flags.

## Capabilities

### New Capabilities
- `explore-offline-audio`: Approved Vietnamese audio assets, stable local resolution, preload/playback behavior and capability verification for Explore.

### Modified Capabilities
- `explore-number-game`: Make offline availability mode-aware so visual number modes work without audio and hear-select is enabled only with local audio.
- `explore-count-game`: Allow visual tap-and-count play offline while gating optional prompt replay on locally resolved audio.

## Impact

- Mobile Explore game configuration, dependency manifests, provider mode selection and renderers.
- Mobile audio service and bundled asset map for Vietnamese number/instruction/object-label clips.
- App bundle size and release verification for Android/iOS airplane-mode playback.
- OpenSpec game capability contracts and conformance tests; no server exercise generation, progress tracking or play-history storage is added.
