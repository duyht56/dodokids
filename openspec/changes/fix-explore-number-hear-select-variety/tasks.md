## 1. Restore Number Round Planning

- [x] 1.1 Extend `VARIETY_CONFIGS.number_explorer.bucketKeysByLevel` so level 1 declares `hear_select` and `match_sample`, and level 2 declares `hear_select` and `before_after` (dropping the unreachable `match_sample`)
- [x] 1.2 Confirm the declared capacity for levels 1–2 still matches the reachable variant count for the union of modes, and leave levels 3–10 untouched
- [x] 1.3 Verify a level-1 run is created with the bundled `explore-audio-vi-v1` pack present (yields `hear_select`) and with an empty registry (yields the `match_sample` fallback)

## 2. Diagnosable Run-Creation Failures

- [x] 2.1 Capture the thrown error at the `createExploreRunBatch` call site in `ExplorePlayScreen` and record its code in development logging, keeping the child-facing message unchanged
- [x] 2.2 Confirm nothing beyond the error code is recorded — no exercise, seed, answer, level history or child/device identifier — so the stateless-play boundary is unaffected

## 3. Mode/Bucket Contract Coverage

- [x] 3.1 Add an offline contract assertion that, for every enabled Explore game and level, every mode generatable under an audio-available profile and under an audio-missing profile is present in that level's declared round-variety buckets
- [x] 3.2 Run the assertion across the whole registry and fix or record any other game/level that drifted the same way
- [x] 3.3 Wire the assertion into the existing `verify-explore-*` script set so it runs with the other Explore contract checks

## 4. Verification

- [x] 4.1 Run the Explore contract scripts plus `npx tsc --noEmit` and lint in `mobile/`
- [x] 4.2 Launch the app and confirm Khám phá → Khám phá số starts a run, speaks the number prompt and no longer shows "Chưa thể tạo lượt chơi mới"
