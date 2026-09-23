## Why

The 2026-08-23 review of the Khám phá catalog (report: "Soát game Khám phá")
found that every game has a sound engine but the shared play layer was quietly
undoing the pedagogy and the "vui" of the whole catalog:

- `takeBalanced` in `mobile/src/explore/variety.ts` served buckets round-robin
  from the first declared bucket and stopped after `count`. Continuous games ask
  for one exercise at a time, so they always got the FIRST bucket: "Khám phá số"
  never produced "sắp xếp thẻ".
- Distractors leaked answers: the nearest-values rule put the target in the
  middle of the sorted options most of the time; `missing_number` offered
  numbers already visible in the sequence; `before_after` offered the reference
  number.
- The mascot was an 🐘 emoji placeholder in every game, wrong/right feedback was
  text a 4–6 year old cannot read, continuous games never ended naturally, and
  the top bar showed a flame + streak that reset to zero on a miss (BRD §3.3
  forbids streaks; §6.2 forbids pressure).
- The parent's static `startingLevel` was ignored by every continuous and
  progressive game; spoken prompt audio ignored the parent's audio toggle.
- Per game: memory used 2/4/6/8/10 pairs against BRD §7.8's 2/3/4/6/8; the
  pattern row wrapped to two lines; the subtraction prompt asked "Có tất cả bao
  nhiêu?"; tracing dropped slow strokes after 192 raw points; Route Planner's run
  button could fall off an iPhone SE.

This change is "Đợt 1" of the approved roadmap: the small, asset-free fixes that
repair variety, construct validity, brand mascot and run completion for the
whole catalog before any new game is added.

## What Changes

- Round planner: serving order rotates per batch and recently played buckets are
  served last (`recentBucketKeys`, `bucketRotation` batch options); the replay
  exclusion window is kept whole (8 keys) instead of sliced to `count`. A
  contract script chains one-exercise rounds and requires every reachable mode
  to reach the child.
- Shared distractor builder accepts `exclude[]` and is no longer median-biased;
  number (missing/before-after) uses it.
- `ExploreMascot` (real Đô Đô image, idle/cheer/think) replaces every emoji
  mascot placeholder; emoji remain only as countable content.
- Play screen: continuous runs end naturally after 8 correct answers (Route
  Planner after the Stage-5 board) with the run-complete screen; the streak UI
  is replaced by the current range plus forward-only progress dots; promotion
  uses a 5-of-7 window instead of an all-or-nothing streak; a global 🔊 replay
  button sits in the top bar; transition timers are cleared on reload/unmount;
  hint copy reflects whether the prompt can be replayed.
- Parent configuration is honoured: continuous and progressive games start at
  the static `startingLevel`; progressive runs play a consecutive window of
  levels from there; spoken audio obeys `audioEnabled`/`volume`.
- Catalog: pedagogical order (numerals → pattern → memory → route), four
  child-facing groups, larger thumbnails, no parent-facing copy, badge only when
  a game cannot be played.
- Per game (Đợt 1 scope only): pattern restores per-family spoken questions,
  single-line sequence, vocabulary-only distractors; number excludes
  visible/reference values and reads tapped numbers; route planner fits an
  iPhone SE, uses a D-pad and a distinct clear icon, shows the real Đô Đô;
  tracing (still hidden) decimates raw points by distance; memory follows BRD
  pair counts and runs three boards.
- Tests: `verify-explore-number-contracts.cjs` added;
  variety script gains the one-exercise-round assertion; kido-server jest maps
  bundled media modules so explore specs that import mobile runtime run again.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `explore-session-runtime`: round variety for one-exercise batches, natural run
  end for continuous runs, no streak UI, windowed promotion, parent starting
  level, spoken audio honours parent settings, global replay control, mascot.
- `explore-catalog`: pedagogical order and grouping, child-facing copy and
  availability badge rules.
- `explore-number-game`, `explore-pattern-game`, `explore-memory-match-game`,
  `explore-tracing-workshop`, `explore-route-planner-game`: the per-game
  requirement changes listed above.

## Impact

- `mobile/src/explore/{variety,registry,audio,promptAudio}.ts`,
  `mobile/src/explore/games/{numberUtils,rangeProgress,memoryGame,…}.ts`,
  `mobile/src/explore/components/ExploreMascot.tsx`, all Explore renderers,
  `mobile/src/screens/child/Explore{Play,Catalog}Screen.tsx`, `mobile/src/types/explore.ts`.
- `mobile/scripts/verify-explore-*.cjs`, `mobile/package.json` test scripts.
- `kido-server/package.json` (jest moduleNameMapper), `kido-server/test/fileMock.js`,
  kido-server explore specs that assert mobile runtime behaviour.
- `kido-pipeline/src/explore/exploreAudioInventory.ts` (phrase mirror: subtraction
  question, restored pattern questions). New clips still go through
  generate → review → Human Gate → export; until then the app stays silent for
  those sentences (best-effort audio).
- `docs/KIDO_EXPLORE_BRD.md` and `docs/AI_CONTEXT.md`
  implementation map. No change to the lesson/activity contract, the server
  wire contract or the stateless-privacy rules.
