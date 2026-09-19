## Context

Explore is stateless and offline-first. Every game generates, validates and
completes on-device through `LocalExploreProvider`, and all run state (tries,
hints, level, variant keys) is memory-only per `docs/EXPLORE_ZERO_HISTORY.md` and
the `explore-stateless-privacy` capability. The play route
(`mobile/src/screens/child/ExplorePlayScreen.tsx`) already funnels every outcome
through a single `answer` callback and a terminal `complete` state:

- correct, no promotion → `setFeedback('Đúng rồi!')`
- correct, promotion → `setFeedback('Giỏi quá! …')`
- wrong → `setFeedback('Con thử lại nhé.' | 'Mình nhìn kỹ lại nhé.')`
- run finished → `complete` screen (`'Mình luyện xong rồi!'`)

This single funnel is the natural attachment point for run-level feedback sound;
per-option "tap" feedback is the only event that lives inside the nine
renderers.

Two audio facts constrain the design. First, `mobile/src/explore/audio.ts`
already fixes the contract for Explore audio: only approved BUNDLED clips ever
play, a missing/failed clip is swallowed, and audio is NEVER a required or remote
dependency — "the Tracing failure mode we must not repeat." Second, spoken
instruction/number audio is a separate, not-yet-implemented concern owned by
`enable-explore-offline-audio`; `mobile/src/services/speech.ts` shows the
`expo-audio` (SDK 56) pattern used elsewhere, including
`setAudioModeAsync({ playsInSilentMode: true })`. The global parent audio
settings (`useSettingsStore.audioEnabled`, `.volume`, persisted, shown in
`SettingsScreen`) exist but are read by no audio path today.

## Goals / Non-Goals

**Goals:**

- Give all nine Explore games a shared, warm, low-pressure sound-effect layer for
  selection, correctness, promotion and run completion.
- Reuse the existing single feedback funnel so wiring touches the play route, not
  every renderer.
- Make sound honor `audioEnabled`/`volume` and remain strictly best-effort:
  absence, error, or a disabled setting must never change gameplay, availability,
  timing-critical flow or completion.
- Establish the shared best-effort playback foundation that this SFX layer and
  the future voice pack both use, without duplicating the voice pack's content
  work.
- Preserve Explore's zero-history and no-side-effect guarantees and the neutral,
  no-shame feedback rule.

**Non-Goals:**

- Spoken Vietnamese number/instruction voice content — owned by
  `enable-explore-offline-audio`.
- Haptics or any non-audio feedback channel (documented as future).
- Background music, per-exercise authored sound, streamed/remote audio, or a new
  per-game audio dependency.
- Any progress, history, analytics, reward, streak or lesson side effect, and any
  new persisted state beyond the settings that already exist.
- A child-facing in-game mute control (the parent `audioEnabled` toggle governs).

## Decisions

### Wire feedback sound at the run funnel, not in nine renderers

Run outcomes (`correct`, `level_up`, `try_again`, `run_complete`) are emitted
once from the `ExplorePlayScreen` `answer`/`complete` path. Only the
option-selection `select` sound is renderer-local, so `ExploreRendererProps`
gains an optional `onSelectSound?: () => void` (or an equivalent shared hook)
that renderers may call on a tap; renderers that ignore it simply stay silent.

This is preferred over duplicating playback in each renderer (nine drift-prone
copies) and over inferring events from state diffs (fragile, and would double-fire
on re-render).

### One shared best-effort sound service, separate SFX and voice channels

A single module (e.g. `mobile/src/explore/sound.ts`) exposes a tiny typed API —
`playExploreSfx(name)` over a fixed union of approved SFX names — backed by static
`require(...)` of bundled assets so Metro packages them. It resolves the audio
mode once (shared with the voice path, `playsInSilentMode: true`), reads
`audioEnabled`/`volume` at play time, and maps volume `0–100 → 0–1`. Short SFX use
their own lightweight player(s) and do NOT serialize on the spoken-voice channel,
so a `correct` sound never cancels an instruction clip. The existing
`playExploreAudio` voice path in `audio.ts` is left intact and continues to own
spoken clips.

Device/OS system sounds were rejected (inconsistent across devices, not
child-tuned). A single serialized player shared with voice was rejected because a
feedback sound would truncate instruction audio.

### Strictly best-effort, never gameplay-affecting

`playExploreSfx` never throws, never returns a value the caller must await, and
never participates in generation, validation, availability, run advancement or
completion. A missing asset, a decode error, `audioEnabled === false`, or
`volume === 0` all resolve to silence. This mirrors the `audio.ts` contract and
keeps sound removable at any time without breaking a game.

### Gentle, neutral correctness feedback

Per the `explore-session-runtime` "Neutral feedback" rule and the no-shame
content principle, the `correct` and `level_up` sounds are warm and celebratory
and the `try_again` sound is a soft, encouraging cue — never a harsh buzzer, and
never a "lose"/failure stinger. Sound reinforces retry, it does not punish.

### Honor existing settings; no new persisted state

The service reads `useSettingsStore` at play time. `audioEnabled` gates all
Explore sound (SFX and, going forward, voice); `volume` scales it. No Explore
component writes settings, and no play-derived value is ever persisted — the
settings store holds parent preferences only, never evidence of how a child
played, so honoring it does not violate the zero-history contract.

### Roll out behind bundled assets, verify before shipping loud

Land the service, settings honoring and event mapping first with a placeholder or
first approved SFX set, then swap in the final approved set. Because sound is
best-effort, an incomplete set degrades to silence rather than blocking release;
the release gate is that every mapped SFX name resolves to a bundled file and the
audio-off / silent-mode / airplane-mode checks pass.

## Risks / Trade-offs

- [Feedback sound feels punitive or noisy] → Keep the set tiny and warm; wrong is
  a soft cue, not a buzzer; review clips against the no-shame principle before
  approval.
- [Sound cancels instruction voice] → Keep SFX on a channel independent of the
  spoken-voice player; verify a `correct` sound does not stop an in-flight clip.
- [A mapped SFX name has no bundled file] → Enumerate names as a typed union and
  test that every name resolves through a static `require` in a production bundle;
  unresolved names degrade to silence, never a crash.
- [Rapid taps stack overlapping sounds] → Debounce/replace short SFX per event so
  fast tapping cannot pile up players; release players on unmount.
- [Settings ignored, or plays while muted] → Unit-test `audioEnabled === false`
  and `volume === 0` produce no playback; test volume scaling.
- [Bundle size grows] → Small finite set, compressed consistently; record SFX set
  size in release checks.

## Migration Plan

1. Add the shared sound service and typed SFX-name union, reading
   `audioEnabled`/`volume`, with no assets yet (all calls degrade to silence).
2. Wire run events at the `ExplorePlayScreen` funnel and expose the optional
   `select` hook through `ExploreRendererProps`; renderers opt in incrementally.
3. Add the approved bundled SFX set under `mobile/src/assets/audio/explore/` and
   the static registry.
4. Verify settings honoring, best-effort no-throw behavior, event mapping,
   unmount cleanup, and no history/side-effect writes; run silent-mode /
   audio-off / airplane-mode device checks.
5. Roll back by removing assets or short-circuiting the service — gameplay is
   unaffected either way.

## Open Questions

- Which approved SFX set (source, licensing, and the exact five names) ships in
  v1, and what is its maximum compressed size budget?
- Should the `select` (tap) sound be on by default for all renderers, or only for
  answer-committing taps to avoid over-triggering on exploratory touches?
- Should the shared audio-mode setup and the settings-honoring wrapper be factored
  into a common helper now so `enable-explore-offline-audio` consumes it, or kept
  Explore-SFX-local until that change lands?
- Haptics as a future paired channel: confirmed out of scope now — revisit as a
  separate change once `expo-haptics` is a dependency?
