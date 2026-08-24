# Tasks — Đợt 3 slice 2D: memory pool 32–40 + internal hint

## 1. Bigger asset pool
- [x] 1.1 `MEMORY_ASSETS` 16 → 37, each single/background-free/recognizable with a distinct `similarityGroup` and unique `objectCode`/glyph
- [x] 1.2 Bump `generatorVersion` `memory-match-v3` → `v4` (generate + validate check + config + dependency manifest generator dep `3`→`4`, front-primitives asset `1`→`2`); validator/config versions unchanged
- [x] 1.3 Mirror the bump in kido-server `explore.registry.ts` (realign the drifted `memory-match-v2`/`validator-v2` to `v4`/`validator-v3`)
- [x] 1.4 Contract stays green: `MEMORY_ASSETS.length` reachable across the corpus, L1–L2 no same-similarityGroup pair, replay byte-identical within v4

## 2. In-board support hint
- [x] 2.1 After `HINT_AFTER_MISMATCHES` mismatches in a row, peek ONE still-hidden matching pair (`hintPair`) for `HINT_PEEK_MS`; reset the streak on a match or after a hint
- [x] 2.2 Presentation only — armed from the resolve timeout (deferred setState via a `mismatchCountRef`), never touches the `memoryState` reducer's matched set; no lose state, never ends the board, persists nothing
- [x] 2.3 Warm helper styling (`cardHint`, amber), Đô Đô "think" mood + helper line while peeking; input locked during the peek; reduced-motion friendly

## 3. Contracts + docs
- [x] 3.1 `verify-explore-memory-contracts.cjs`: assert the hint source (`HINT_AFTER_MISMATCHES`, `hintPair`); update the stale-version tamper example to `memory-match-v3`
- [x] 3.2 kido-server `explore.memory-match.spec.ts`: assert the hint renderer source
- [x] 3.3 BRD §7.8 + AI_CONTEXT note

## 4. Verification
- [x] 4.1 `cd mobile && npx tsc --noEmit`; eslint clean on changed files
- [x] 4.2 `npm run test:explore-memory` (37-sprite pool) + `test:explore-variety-buckets` green
- [x] 4.3 `cd kido-server && npx jest src/modules/explore` green
- [x] 4.4 `openspec validate expand-explore-memory-pool-add-hint --strict`
