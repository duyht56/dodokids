## 1. Activity domain model

- [x] 1.1 Verify Reanimated 4 / Gesture Handler / SVG APIs against the Expo v56 docs (per `mobile/AGENTS.md`) before coding
- [x] 1.2 Replace `single_select`-only `LessonActivity` in `src/types/lesson.ts` with an `Activity` discriminated union (`actionType` + typed `payload`) mirroring `docs/kido-activity-schema.ts`, plus `ActivityBase` and `AudioScript`
- [x] 1.3 Add type guards (`isSingleSelect`, `isMultiSelect`, `isSortSequence`, `isMatchPair`, `isCountTap`, `isWatchVideo`)
- [x] 1.4 Extend `mapServerLesson` to map all six `actionType`s from server `payload` shapes; return `null` for unmappable activities so they are filtered out
- [x] 1.5 Add per-type mock builders so `buildMockLesson` can produce a mixed-type playable lesson offline

## 2. ActivityContainer (base)

- [x] 2.1 Create `src/components/activities/ActivityContainer.tsx` with the three zones (top: progress + replay, middle: content, bottom: Đô Đô + bubble)
- [x] 2.2 Play `audioScript.question` on mount; wire the replay button to replay it without changing answer state
- [x] 2.3 Route by `actionType` to the matching activity component; render a non-crashing fallback for unknown types
- [x] 2.4 Track attempt count (1→2→3), reset on activity change, and expose `onCorrect(attempt)` / `onWrong(attempt)`
- [x] 2.5 Enforce touch rules centrally: ≥88×88pt hit areas (hitSlop/padding), <100ms press feedback, and a double-tap/locked-after-answer guard inherited by all types

## 3. Select activities

- [x] 3.1 Make `OptionCard` image-aware: render `assetRef.imageUrl` ≥120×120pt with loading indicator and gray placeholder fallback (keep emoji/number fallback)
- [x] 3.2 Build `SingleSelectActivity` with `grid_2x2` / `grid_2x1` / `row_3` layouts, scale-0.95 tap feedback, disable-others on select, validate against `correctAnswer`, report outcome (parity with current player)
- [x] 3.3 Build `MultiSelectActivity`: multi-toggle (teal border + checkmark), gated "Xong!" confirm (brandOrange, 56pt), validate against `correctAnswers`/`minCorrect`, partial-correct green/soft-red reveal

## 4. Interactive activities

- [x] 4.1 Build `SortSequenceActivity`: scrambled draggable cards + numbered slots (horizontal & vertical), 8pt drag threshold, lifted state, 48pt snap tolerance
- [x] 4.2 Sort: "Kiểm tra thứ tự" validates slot index vs `correctPosition`, sequential green light-up, amber+shake on wrong, "Xáo lại" reshuffle
- [x] 4.3 Build `MatchPairActivity`: two columns (left + shuffled right), connection dots, tap-left-then-right, `react-native-svg` connection lines from measured dot positions, `x/total cặp` counter
- [x] 4.4 Match: validate each pair vs `correctPairs` (green line + dim on correct, red flash + line removed on wrong), report correct when all pairs matched
- [x] 4.5 Build `CountTapActivity` phase 1: scene image + overlaid tappable targets, coral highlight + numbered badge, live counter, Vietnamese count-word audio, no double-count, "Đếm lại" reset
- [x] 4.6 Count-tap phase 2: reveal four `answerOptions` number buttons (≥80×80pt), validate selection vs `targetCount`, report outcome
- [x] 4.7 Build `WatchVideoActivity`: thumbnail + spinner, auto-play placeholder, "Bỏ qua →" after `skipAllowedAfter` (hidden when 0), auto-advance on end/skip using `durationSeconds`

## 5. Player integration

- [x] 5.1 Switch `LessonPlayerScreen` to render `ActivityContainer` and react to `onCorrect`/`onWrong` for the existing reveal/advance/finish flow
- [x] 5.2 Preserve header/progress, mascot bubble, tablet split-panel, and 1200ms auto-advance; confirm mixed-type lessons play end-to-end
- [x] 5.3 Remove `src/components/ActivityEngine.tsx` once single-select parity is confirmed

## 6. Verification

- [x] 6.1 `npm run lint` and TypeScript typecheck pass with no new errors
- [ ] 6.2 Manually verify each of the six activity types renders and reports correct/wrong on device/simulator (mobile + tablet layouts), including offline mock fallback
- [ ] 6.3 Decide with the user whether to add `react-native-video` now or keep the WatchVideo placeholder (open question from design.md)
