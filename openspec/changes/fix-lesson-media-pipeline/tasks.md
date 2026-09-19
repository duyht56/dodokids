## 1. One audio plan for both paths

- [x] 1.1 Add `src/services/lesson-audio.ts`: `narrationClipPlan`, `optionClipPlan`, `audioLangForField`, `audioLangForOptions`, `LESSON_CLIP_KEY_MODE`
- [x] 1.2 Point `steps/4-audio.ts` at it instead of its own inline rules
- [x] 1.3 Extend `MediaJobData` with `lang`, `optionId`, `audioRefType`
- [x] 1.4 `audio.worker.ts` honours `lang` instead of hardcoding `'vi'`
- [x] 1.5 `audio.worker.ts` generates option clips and writes them into the matching `payload.options[].audioRef`
- [x] 1.6 `generate.worker.ts` enqueues option-clip jobs and stamps the language at enqueue time

## 2. Clip keys that survive Vietnamese

- [x] 2.1 Add `toDiacriticSafeWordKey`, leaving `toWordKey` untouched for the approved Explore pack
- [x] 2.2 Add `keyMode` to `getOrCreateLibraryClip`, defaulting to the existing ASCII behaviour
- [x] 2.3 Lesson clips opt into `diacritic-safe`
- [x] 2.4 Add the Northern-accent directive to the narration prefix

## 3. Publish fails closed

- [x] 3.1 Add `src/publish/media-complete.ts`: missing images, empty narration slots, unvoiced answer options
- [x] 3.2 Call it from `buildPublishPayload`, dry-run included
- [x] 3.3 Upload option-clip URLs from the payload at publish
- [x] 3.4 `checkWeekComplete` counts all five days

## 4. Generation correctness

- [x] 4.1 `normalizePayload` no longer bails out when there is no question image
- [x] 4.2 Omit the `questionImage` key entirely when absent, rather than emitting `undefined`

## 5. Runtime

- [x] 5.1 Dockerfile copies `assets/` so mascot conditioning is not silently off
- [x] 5.2 Shared `media_staging` volume across admin and all four workers
- [x] 5.3 Redis gains append-only persistence and a volume

## 6. Contract

- [x] 6.1 Add `isCompareTap` to `docs/kido-activity-schema.ts`

## 7. Tests

- [x] 7.1 Diacritic key separates every tone set, leaves ASCII words and `toWordKey` untouched
- [x] 7.2 Per-slot language for all three subjects; option plan shape and fallbacks
- [x] 7.3 Media gate: missing image, empty and whitespace URLs, absent audio, unvoiced options, week-level refusal
- [x] 7.4 Normalisation of language activities that have no question image
- [x] 7.5 kido-pipeline and kido-server suites green, no new failures
