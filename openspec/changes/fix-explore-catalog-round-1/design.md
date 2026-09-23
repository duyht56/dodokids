## Context

Explore's shared layer (`variety.ts` round planner, `registry.ts` providers,
`ExplorePlayScreen`) is consumed by nine games and by kido-server jest specs
that import the mobile runtime directly. Every fix here must keep: deterministic
replay by seed, independent validators, offline operation, zero persisted play
state, best-effort audio, and the "no rewards / no streak / no lose state"
product decisions (BRD §3, §6.2). The mobile working tree carries unrelated
in-progress audio work; this change layers on top of it rather than reverting it.

## Goals / Non-Goals

**Goals:**

- Every mode a level can generate actually reaches the child in one-exercise
  batches, provably (contract script).
- No construct is solvable by a layout/distractor tell (middle card, visible
  number, reference number, badge total).
- One mascot (Đô Đô) and one feedback/run shape across all games; runs end.
- Parent static configuration (starting level, audio) is respected.
- Small, asset-free changes: no new clips are required for any behaviour; new
  sentences are added to the inventory mirror and play silently until exported.

**Non-Goals:**

- Level/range redesigns (number 5-level ladder), animations, Đô Đô voice
  feedback, supportLevel contract, new games, tracing re-enable — all Đợt 2/3.
- Server-side round planner (`kido-server/.../explore.variety.ts`) has the same
  first-bucket bias but serves no production game; left for the server change
  that next touches it.

## Decisions

- **Rotation + recent-bucket ordering instead of weighted sampling.**
  `orderExploreBuckets(bucketOrder, recentBucketKeys, rotation)` rotates the
  declared order and moves just-played buckets to the end. It is pure (tests pass
  a fixed rotation), needs no new config, and guarantees alternation with two
  buckets and near-uniform coverage with three. Runtime rotation is random (the
  provider already seeds generation with `Math.random`); the play screen passes
  the previous exercise's `bucketKey`.
- **Exclusion window is a registry constant (8)** applied by the provider
  (`slice(-8)`), so callers can append freely and a one-exercise batch no longer
  discards the window.
- **Distractor builder: window + one-sided pools.** Half of the time all
  distractors sit on one side of the target; otherwise they are drawn from a ±3
  window. The target is in the middle ≈30% of the time (uniform would be 33%)
  while every distractor stays "near" as the BRD requires. `exclude[]` is the
  generic hook for "values the child can already see".
- **Promotion window 5-of-7 replaces the streak.** `RangeProgress` becomes
  `{ level, recent: boolean[] }`. The UI shows only
  the range and forward-only progress dots (`correctCount / 8`). This changes the
  kido-server specs that asserted `{ level, correctStreak }`; they are updated in
  this change.
- **Natural end = 8 correct answers** for range runs and the Stage-5
  board for Route Planner: 2–5 minutes of play, then the existing
  "Mình luyện xong rồi!" screen with "Chơi lượt mới". Wrong answers do not count
  and never end a run.
- **Progressive runs start at the parent's level** via
  `progressiveRunLevels(levels, startingLevel, count)` (window clamped into the
  level list); memory runs 3 boards (`PROGRESSIVE_RUN_SIZE`), pattern keeps 5.
- **Mascot is an image component with mood motion**, not text: `ExploreMascot`
  hops on cheer and tilts on think; motion is skipped when reduce-motion is on.
- **Exercise renderer as a component** (`ExploreExerciseView`) rather than a
  render-time function call, so the React Compiler lint accepts the callbacks
  passed down and the screen can clear its transition timers safely.
- **Catalog grouping is UI-only.** Groups are a local table in the catalog
  screen; the contract (`ExploreGameConfig`) is unchanged. Order comes from the
  bundled `GAME_COPY` order, which server config cannot override.
- **Per-game work is split by file ownership** (one agent per game, shared files
  owned by the lead) so nine fixes can land concurrently in one working tree;
  shared kido-server specs (`explore.mobile-runtime.spec.ts`, …) are reconciled
  by the lead at the end.

## Risks / Trade-offs

- Changing progress shapes and distractor rules invalidates some existing
  server spec expectations; they are updated rather than the behaviour being
  preserved, because the old expectations encoded the defects.
- Pattern's five restored question clips are bundled but were absent from the
  generated registry; they are re-added by hand with a note. The next pipeline
  export will regenerate the file; the phrase mirror keeps both sides aligned.
- The restored pattern phrases play silently until the pipeline exports them —
  the on-screen sentence stays authoritative, as for every Explore prompt.
- Runtime bucket rotation uses `Math.random`; determinism is preserved at the
  exercise level (seed → exercise) and in contract scripts (explicit rotation).
