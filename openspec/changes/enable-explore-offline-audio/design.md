## Context

The Explore number/count generators and validators are local and deterministic. Their public configs are nevertheless `offlineCapable=false` because audio is represented as a required remote dependency, the repository contains no approved bundled number clips, and `speakCount()` is a non-playing placeholder. The design uses audio-first controls, but a game-wide boolean cannot distinguish visual modes that are complete offline from modes such as `hear_select` whose answer depends on sound.

The mobile app already depends on `expo-audio`. Explore remains stateless: exercise batches, answers, hints and playback state are memory-only and no attempt, history, analytics or lesson progress is introduced.

## Goals / Non-Goals

**Goals:**

- Make offline availability depend on the requirements of the selected mode, not on whether any optional audio exists anywhere in the game.
- Bundle and verify an approved Vietnamese audio pack for numbers 0–50 and the finite instruction/object-label phrases required by enabled Explore modes.
- Resolve and play audio locally through stable versioned keys with no network dependency in airplane mode.
- Keep visual number modes and visual tap-count available offline while safely gating audio-dependent modes.
- Provide tests and release checks that make missing audio visible before public capability flags change.

**Non-Goals:**

- Runtime generation of arbitrary speech or uncontrolled device/cloud TTS.
- Per-exercise authored recordings, server-side exercise generation or streamed audio as an offline fallback.
- Progress, history, analytics, rewards or lesson-side effects.
- Enabling future games that are not part of `number_explorer` or `tap_count`.

## Decisions

### Separate game, mode and audio capability

The catalog keeps a game-level offline declaration for navigation, while each enabled mode declares required capabilities. Visual modes require only bundled generator/validator/config/assets. `hear_select` additionally requires the local audio-pack capability. The generator filters unavailable modes before seed selection so it never emits an unplayable exercise.

This is preferred over keeping both games online-only because it preserves valid offline gameplay. It is also preferred over silently falling back from hear-select to visible-answer text because that changes the learning construct.

### Use a static, versioned audio registry

Audio keys such as `explore-audio:vi:number:name:7:v1` resolve through a generated TypeScript registry containing static `require(...)` references that Metro can bundle. The registry records pack version, covered keys and optional checksums/source metadata. Missing keys fail capability verification and disable only affected modes.

Dynamic filesystem paths were rejected because Metro cannot guarantee they are packaged. Network URLs were rejected for the offline contract.

### Use approved recordings with `expo-audio`

Explore playback uses the existing `expo-audio` dependency. The pack contains consistent approved Vietnamese recordings for 0–50 plus a finite phrase/object-label inventory. Playback state is scoped to the mounted Explore screen; unmount stops/releases players.

Device TTS was rejected as the primary implementation because voice availability, pronunciation and offline installation vary by device. It can be reconsidered only as a separately specified non-required accessibility fallback.

### Visual fallback remains construct-preserving

`tap_count` may show an icon and child-facing visual target label when prompt audio is unavailable because the counting construct remains unchanged. Number visual modes continue normally. `hear_select` is not emitted without local audio because revealing the target visually would invalidate the listening task.

### Roll out in capability phases

First ship the capability model and visual-offline mode filtering. Then add the approved pack and playback. Only after automated manifest tests plus physical Android/iOS airplane-mode checks pass does public config enable audio-dependent modes offline.

## Risks / Trade-offs

- [Bundle size grows with recordings] → Keep a finite key inventory, compress approved clips consistently and record pack size in release checks.
- [A manifest claims coverage while a file is absent] → Generate the registry from the pack and test that every static module resolves in a production bundle.
- [Audio playback differs between platforms] → Require Android and iOS airplane-mode smoke tests including replay, rapid navigation and interruption recovery.
- [Mode filtering changes deterministic selection] → Include the capability set in the generation context/version and preserve replay tests per capability profile.
- [Visual labels assume reading ability] → Pair labels with canonical target icons; audio remains preferred when available.

## Migration Plan

1. Add typed audio/mode capability contracts without changing public flags.
2. Make visual-only mode profiles offline-capable and test generation with audio absent.
3. Add the approved v1 pack, static registry, local resolver and playback lifecycle.
4. Enable audio-dependent modes for the bundled capability profile and run automated plus physical airplane-mode verification.
5. Update public manifests/flags. Roll back by disabling the audio capability or affected mode without disabling visual offline gameplay.

## Open Questions

- Which approved voice, recording source and licensing metadata will be used for the v1 Vietnamese pack?
- Which finite instruction and object-label phrases are mandatory for the first release beyond number names 0–50?
- What maximum compressed pack size is acceptable for the mobile release?

