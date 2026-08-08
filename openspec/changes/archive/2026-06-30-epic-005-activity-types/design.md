## Context

The mobile lesson player (EPIC-004) is hard-wired to one interaction: `src/types/lesson.ts` defines a `single_select`-only `LessonActivity`, `ActivityEngine.tsx` renders an emoji/image grid, and `LessonPlayerScreen.tsx` owns the select → reveal → advance flow. The curriculum schema (`docs/kido-activity-schema.ts`) and the design handoff (screens 03, 14, 15, 16) describe **six** activity types sharing one container shell (top progress + replay, middle content, bottom Đô Đô). EPIC-005 generalizes the player into that container plus six interchangeable activity components.

Constraints:
- Audience is 4–6 year olds → child-safe touch (≥88×88pt targets, <100ms feedback, double-tap guard) is mandatory, not optional.
- Already installed: `react-native-gesture-handler` 2.31, `react-native-reanimated` 4.3, `react-native-svg` 15.15, `expo-linear-gradient`. **Not** installed: `react-native-video`.
- Expo SDK 56 / RN 0.85 — per `mobile/AGENTS.md`, verify APIs against the v56 docs before coding.
- Must keep working offline: server lessons may be stubs, so a mock fallback per type is required (mirrors current `buildMockLesson`).

## Goals / Non-Goals

**Goals:**
- A reusable `ActivityContainer` that routes by `actionType`, owns mount audio, replay, attempt tracking, and the `onCorrect` / `onWrong` contract.
- Six activity components matching the schema payloads and the handoff visuals.
- A discriminated-union activity model + `mapServerLesson` covering all six types, with graceful per-type mock fallback.
- `LessonPlayerScreen` reduced to: fetch lesson, render container, react to outcomes, advance, finish.

**Non-Goals:**
- Feedback choreography (confetti, mascot Lottie reactions, hint/explain audio escalation) — that is EPIC-006. EPIC-005 only exposes the hooks and keeps the current minimal reveal.
- Gamification/XP changes (EPIC-007) and any backend/schema changes.
- Production video playback — WatchVideo ships a thumbnail + timed auto-advance placeholder until `react-native-video` is added.

## Decisions

### D1 — Discriminated-union activity model over a flat type
Replace the flat `LessonActivity` with `type Activity = ActivityBase & ({actionType:'single_select'; payload:SingleSelectPayload} | …)`, mirroring `docs/kido-activity-schema.ts`. `mapServerLesson` narrows by `actionType` and returns `null` for unmappable activities (filtered out, lesson stays playable). Type guards (`isSingleSelect`, …) drive the container's routing switch with exhaustive typing.
- *Alternative considered:* keep a loose `payload: unknown` and cast inside each component. Rejected — loses compile-time safety exactly where the six payloads diverge most.

### D2 — Container owns flow state; components are controlled and report outcomes
`ActivityContainer` holds attempt count, runs mount/replay audio, and renders the routed component. Each activity component is responsible only for its own interaction and calls `onResult('correct' | 'wrong')`; the container maps that to `onCorrect(attempt)` / `onWrong(attempt)` and exposes them to the screen. This keeps `LessonPlayerScreen` thin and makes EPIC-006 a matter of enriching the container's outcome handling.
- *Alternative considered:* each component talks straight to the screen. Rejected — duplicates attempt tracking and audio logic six times.

### D3 — Folder layout: `src/components/activities/`
Add `ActivityContainer.tsx` plus `SingleSelectActivity.tsx`, `MultiSelectActivity.tsx`, `SortSequenceActivity.tsx`, `MatchPairActivity.tsx`, `CountTapActivity.tsx`, `WatchVideoActivity.tsx` under `src/components/activities/`. Reuse and extend `OptionCard` (make it image-aware with emoji/placeholder fallback) for single/multi-select. `ActivityEngine.tsx` is removed once the container subsumes it.

### D4 — Gestures and lines with already-installed libs
- Sort sequence: Reanimated + Gesture Handler `Pan` with an 8pt activation threshold, lifted shared-value (scale/shadow), and slot snapping by nearest-center within 48pt. Use a measured-layout approach rather than pulling in `react-native-draggable-flatlist` to avoid a new dependency.
- Match pair: measure item dots with `ref.measure()` (or `onLayout`) and draw `<Line>`s in an absolutely-positioned `react-native-svg` overlay; track `selectedLeft` and `connections[]` in state.

### D5 — Audio via existing TTS path
Question audio and Vietnamese count words ("Một", "Hai"…) reuse the app's existing speech mechanism (Web Speech / expo-speech as already wired for prompts). No new audio dependency; if speech is unavailable the activities remain fully playable in silence.

### D6 — WatchVideo placeholder, isolated behind the component
WatchVideo renders `thumbnailUrl` + play affordance and auto-advances after `durationSeconds` (honoring `skipAllowedAfter`). When `react-native-video` is added later, only this component changes — the container contract is unaffected. A task flags the dependency decision for the user.

## Risks / Trade-offs

- **Drag-and-drop precision on small phones (sort_sequence)** → mitigate with generous 48pt snap tolerance, ≥80pt cards, and an explicit "Xáo lại" retry; validate only on "Kiểm tra thứ tự".
- **SVG line endpoints drift after layout/scroll (match_pair)** → recompute endpoints on `onLayout` and after orientation change; keep the matching zone non-scrolling so measured coordinates stay stable.
- **Reanimated 4 / RN 0.85 API drift** → verify gesture + worklet APIs against the Expo v56 docs before implementing (per AGENTS.md); keep animation logic thin.
- **Double-tap / rapid-tap causing double advance** → centralize the debounce + "locked after answer" guard in the container so every type inherits it.
- **WatchVideo placeholder ≠ real playback** → acceptable for MVP; isolated so the swap is low-risk. Flagged as an open question.

## Migration Plan

1. Introduce the new `Activity` discriminated-union model and `mapServerLesson` alongside the old types; add per-type mock builders.
2. Build `ActivityContainer` + the six components; port single-select behavior into `SingleSelectActivity` (parity with today's grid).
3. Switch `LessonPlayerScreen` to render `ActivityContainer`; wire `onCorrect`/`onWrong` to the existing advance/finish logic.
4. Delete `ActivityEngine.tsx` once parity is confirmed.
5. Rollback: revert the screen to `ActivityEngine` and the old `LessonActivity` type — both are isolated to the player module, no backend or persisted-state changes.

## Open Questions

- Add `react-native-video` now (full WatchVideo) or keep the placeholder for this epic? (Default: placeholder.)
- Should `multi_select` partial-correct count as a "wrong" attempt for escalation, or a neutral retry? Assumed **wrong** here; confirm when EPIC-006 feedback lands.
- Count-tap target hit areas: author-provided coordinates in the payload, or app-distributed positions over the scene? Current schema has no coordinates → assume app-distributed overlay targets for MVP.
