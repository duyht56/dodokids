## Why

The lesson player today renders only `single_select` (mocked as a counting question). The Kido curriculum schema (`docs/kido-activity-schema.ts`) defines **six** `actionType`s, and the design handoff ships flows for the interactive ones (Sort Sequence, Match Pair, Count Tap) plus the select/video variants. EPIC-005 builds the activity-type layer so a lesson can mix all six interaction styles and so the player stops being hard-wired to a single shape.

## What Changes

- **NEW** `ActivityContainer` base component: shared top (progress + replay) / middle (content) / bottom (Đô Đô) layout, routes by `actionType` to the correct activity component, plays `audioScript.question` on mount, tracks attempt count (1→2→3), exposes `onCorrect` / `onWrong`, and enforces the touch rules (≥88×88 hit area, double-tap guard, <100ms visual feedback).
- **NEW** six activity components driven by the schema payloads:
  - `SingleSelectActivity` — question image + option grid (`grid_2x2` / `grid_2x1` / `row_3`), tap-to-answer.
  - `MultiSelectActivity` — toggle multiple options, "Xong!" confirm, partial-correct reveal.
  - `SortSequenceActivity` — drag-and-drop reorder into numbered slots, horizontal + vertical, "Kiểm tra thứ tự" + "Xáo lại".
  - `MatchPairActivity` — tap left → tap right, SVG connection lines, per-pair correct/wrong feedback.
  - `CountTapActivity` — two-phase: tap-to-count objects in a scene, then pick the number answer.
  - `WatchVideoActivity` — auto-play short clip, skip after `skipAllowedAfter`, auto-advance on end.
- **NEW** activity domain model: replace the `single_select`-only `LessonActivity` with a discriminated union mirroring the schema (`actionType` + typed `payload`), plus `mapServerLesson` mapping for all six types and richer mock fallbacks.
- **MODIFIED** `LessonPlayerScreen` delegates question rendering to `ActivityContainer` instead of the single-purpose `ActivityEngine`; answer/attempt/advance flow moves behind the container's callbacks.
- **BREAKING** (internal) `ActivityEngine` is superseded by `ActivityContainer` + per-type components; the `LessonActivity` type shape changes.

Feedback choreography (confetti, mascot reactions, hint audio) is intentionally **out of scope** here — it is EPIC-006. This change only wires the `onCorrect` / `onWrong` hooks the feedback system will plug into, keeping the existing simple correct/wrong reveal as a placeholder.

## Capabilities

### New Capabilities
- `activity-container`: Base activity shell — layout zones, `actionType` routing, mount audio, attempt tracking, touch-rule enforcement, and `onCorrect`/`onWrong` contract.
- `single-select-activity`: One-correct-answer tap with `grid_2x2` / `grid_2x1` / `row_3` layouts, image options, and instant select feedback.
- `multi-select-activity`: Multi-toggle selection with confirm button and partial-correct reveal.
- `sort-sequence-activity`: Drag-and-drop ordering into numbered slots (horizontal + vertical) with order validation.
- `match-pair-activity`: Two-column tap-to-connect matching with SVG lines and per-pair validation.
- `count-tap-activity`: Tap-to-count scene objects then select the correct number from options.
- `watch-video-activity`: Auto-playing short video with delayed skip and auto-advance.

### Modified Capabilities
- `lesson-player`: The player now renders any of the six activity types via `ActivityContainer` rather than only `single_select`; advance/attempt flow is driven by container callbacks. Existing progress bar, mascot bubble, tablet split-panel, and auto-advance requirements are preserved.

## Impact

- **Code (mobile)**: `src/components/ActivityEngine.tsx` (replaced by `ActivityContainer` + activity components under `src/components/activities/`), `src/screens/child/LessonPlayerScreen.tsx`, `src/types/lesson.ts` (discriminated-union model + mapping), new shared `OptionCard` usage (image-aware).
- **Dependencies**: uses already-installed `react-native-gesture-handler`, `react-native-reanimated`, `react-native-svg`; `react-native-video` is **not** installed — WatchVideo will ship with a thumbnail + auto-advance placeholder until the dependency is added (flagged in tasks).
- **Assets**: activity images come from `assetRef` (`imageUrl`); offline/missing images fall back to emoji or gray placeholders, consistent with current behavior.
- **No backend changes**: consumes existing `GET /lessons/today` payloads; the new mapper reads the richer `payload` shapes the pipeline already produces.
