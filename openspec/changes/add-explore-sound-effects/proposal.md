## Why

The Khám Phá (Explore) section renders nine on-device games, but none of them
play a single sound effect. Correctness, promotion and run completion are
communicated only by on-screen Vietnamese text in `ExplorePlayScreen`
(`'Đúng rồi!'`, `'Giỏi quá! …'`, `'Con thử lại nhé.'`, `'Mình luyện xong rồi!'`).
For non-reading children age 4–6, a silent, text-only feedback loop under-delivers
on the product's audio-first, low-pressure, playful principle.

Spoken audio is also only a stub: `mobile/src/explore/audio.ts` is a best-effort
bundled-clip player with an empty clip map, wired into a single renderer
(`RoutePlannerRenderer`). The Vietnamese number/instruction *voice* pack is
already owned by the separate change `enable-explore-offline-audio` and is out of
scope here. What is missing — and what this change adds — is the sound-effect
(SFX) feedback layer shared by all nine games, plus the small best-effort
playback foundation that both the SFX layer and the future voice pack build on.
There is no `audioEnabled`/`volume` honoring today either: the global settings
already exist (`useSettingsStore`, surfaced in parent Settings) but no Explore or
lesson audio path reads them.

## What Changes

- Introduce an Explore sound-effect capability: a small, approved, bundled,
  offline SFX set — `select` (tap), `correct`, gentle `try_again`, `level_up`
  (promotion) and `run_complete` (celebration).
- Add one shared Explore sound service that plays short, one-shot SFX
  best-effort: honors `useSettingsStore` `audioEnabled` and `volume`, plays in
  iOS silent mode consistent with instruction audio, and never blocks, throws
  into, or gates game generation, validation, availability or completion.
- Wire the run lifecycle centrally at the existing `ExplorePlayScreen` feedback
  funnel (correct → `correct`; promotion → `level_up`; wrong → `try_again`; run
  end → `run_complete`) instead of editing nine renderers, plus one shared
  option-selection `select` hook available to renderers.
- Keep wrong-answer sound gentle and neutral — no buzzer, no lose state, no
  reward economy — consistent with the existing "Neutral feedback" runtime rule
  and the no-shame content principle.
- Keep the SFX channel independent of the spoken-voice channel so a feedback
  sound never truncates an instruction clip, and coordinate a single
  `expo-audio` audio-mode setup shared with `enable-explore-offline-audio`.
- Add no haptics (documented as a future channel), no history, no analytics, no
  persistence beyond the already-persisted parent audio setting.

## Capabilities

### New Capabilities
- `explore-sound-effects`: Approved bundled Explore SFX set, settings-aware
  best-effort one-shot playback, run-event-to-sound mapping, and the zero-history
  guarantees for the feedback-sound layer.

### Modified Capabilities
- `explore-session-runtime`: Extend "Neutral feedback and current-run support"
  so run outcomes MAY trigger best-effort feedback sound, while preserving
  neutrality (no lose state, no reward economy) and current-run-only state.

## Impact

- Mobile Explore only: a new shared sound service (e.g. `mobile/src/explore/
  sound.ts`), bundled SFX assets under `mobile/src/assets/audio/explore/`,
  central wiring in `mobile/src/screens/child/ExplorePlayScreen.tsx`, an optional
  `select` hook exposed through `ExploreRendererProps`, and settings honoring via
  `useSettingsStore`.
- App bundle size (a small finite SFX set) and release verification for
  silent-mode, audio-off and airplane-mode playback.
- No server, pipeline, schema, curriculum or progress change. No Explore play
  history, analytics or reward side effects are introduced
  (`docs/EXPLORE_ZERO_HISTORY.md`, `explore-stateless-privacy`).
- Coordinates with, and does not modify, `enable-explore-offline-audio` (spoken
  Vietnamese number/instruction voice pack).
