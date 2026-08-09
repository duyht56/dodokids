## 0. Preconditions

- [x] 0.1 Read `mobile/AGENTS.md` + pinned Expo SDK 56 `expo-audio` docs
      (`createAudioPlayer`, `player.volume`, `remove()`, `setAudioModeAsync`)
      before writing native audio code
- [x] 0.2 Confirm the SFX scope does not overlap `enable-explore-offline-audio`
      (spoken voice) and note the shared audio-mode/settings coordination point

## 1. Shared Sound Foundation

- [x] 1.1 Add `mobile/src/explore/sound.ts` exposing `playExploreSfx(name)` over a
      fixed typed union of approved SFX names (`select`, `correct`, `try_again`,
      `level_up`, `run_complete`)
- [x] 1.2 Read `useSettingsStore` at play time: skip all playback when
      `audioEnabled === false`, and scale player volume by `volume` (`0–100 → 0–1`)
- [x] 1.3 Resolve the `expo-audio` audio mode once (`playsInSilentMode: true`);
      keep SFX on a player set independent of the spoken-voice channel so SFX
      never truncates an instruction clip
- [x] 1.4 Make every call strictly best-effort: never throw, never block, swallow
      missing-asset/decode errors, debounce (`MIN_REPLAY_MS`) rapid repeats, and
      release players via `stopAllExploreSfx()` on Explore screen unmount
- [~] 1.5 Tests: static contract test added
      (`scripts/verify-explore-sound-contracts.cjs`, `npm run test:explore-sound`)
      asserting the settings gate, best-effort/no-throw shape and cue union. A
      behavioral test (mock `expo-audio` + settings store, assert no-play when
      disabled and volume scaling) is deferred until an approved clip exists — the
      empty clip map degrades every cue to silence, so play behavior cannot yet be
      exercised.

## 2. Approved SFX Asset Set — NOT STARTED (content gap; no audio files in repo)

- [ ] 2.1 Finalize and document the v1 SFX set: the five names, source/licensing,
      warm/no-shame review (soft `try_again`, no buzzer/lose stinger), size budget
- [ ] 2.2 Add the approved, compressed clips under
      `mobile/src/assets/audio/explore/`
- [ ] 2.3 Back the name union with static `require(...)` references so Metro
      bundles every clip (the `EXPLORE_SFX` map in `sound.ts` holds the commented
      slots); test that each name resolves in a production bundle

## 3. Run-Event Wiring (central funnel)

- [x] 3.1 In `ExplorePlayScreen`, play `correct` on a correct answer,
      `level_up` on a promotion (`promoted`), and `try_again` on a wrong answer, at
      the existing `answer` feedback branches (route/arithmetic/range/default)
- [x] 3.2 Play `run_complete` once when the run reaches the `complete` state
      (`runCompleteSfxRef` guard, re-arms on a new run)
- [x] 3.3 Ensure events fire exactly once per outcome (guarded effect for
      completion; explicit single call per branch for correct/try_again)

## 4. Selection Sound (renderer-local)

- [x] 4.1 Add an optional `onSelectSound?: () => void` to `ExploreRendererProps`,
      passed from `ExplorePlayScreen` as `() => playExploreSfx('select')` and
      forwarded to every renderer via `renderExploreExercise`
- [x] 4.2 Opt renderers into the `select` sound on their selection/interaction
      tap: canary + all child-visible game renderers (Number Explorer select &
      order, Tap Count, Memory Match, Quantity Compare, Pattern Finder, Number
      Bond ×2 modes, Arithmetic, Route Planner arrows). `onSelectSound` is
      memoized (`handleSelectSound`) for stable identity. Tracing is excluded
      (hidden catalog game, gesture/class-based, no discrete select tap).
      Contract test asserts every listed renderer opts in.
- [ ] 4.3 Confirm `select` layering does not cut off `correct`/instruction audio
      (verify once clips exist)

## 5. Verification & Rollout

- [x] 5.1 Static contract check of the run-event → cue mapping and single-fire
      wiring passes (`npm run test:explore-sound`)
- [x] 5.2 Confirm Explore still writes no attempts, history, analytics, reward or
      lesson progress, and no new persisted state beyond existing settings
      (contract asserts `sound.ts` has no `AsyncStorage`/`persist`)
- [ ] 5.3 Device checks: sound plays in iOS silent mode, is fully silenced by the
      parent `audioEnabled` toggle, and works offline (airplane mode) — needs
      assets + device
- [ ] 5.4 `cd mobile && npm run lint` — BLOCKED: `node_modules` not installed in
      `mobile/` (eslint unavailable). Code written to match existing
      `audio.ts`/`speech.ts` style; re-run after `npm install`.
- [x] 5.5 Verify removing the assets or short-circuiting the service leaves all
      nine games fully playable: the `EXPLORE_SFX` map is empty by default, so
      every cue no-ops silently (best-effort rollback switch)
