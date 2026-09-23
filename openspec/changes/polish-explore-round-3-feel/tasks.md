# Tasks — Đợt 3 slice 1: game feel (animation + audio), presentation only

## 1. Lật thẻ tìm cặp (`memory_match`) — card flip
- [x] 1.1 Real flip animation (rotateY 0↔180 with backface handling, or scaleX 1→0→1 with the face swapped at the mid-point if RN backface is unreliable) on turn-up and on a mismatched pair turning back down; matched cards settle without a stray flip
- [x] 1.2 Native driver; reduced-motion → instant swap, timings preserved so play feels identical (mirror the existing board-motion reduce-motion gate)
- [x] 1.3 Presentation only: no change to `memoryGame.ts` generator/validator/params or the `memoryState` reducer (replay byte-identical)
- [x] 1.4 Spec delta `specs/explore-memory-match-game/spec.md`; update `explore.memory-match.spec.ts` + `verify-explore-memory-contracts.cjs` renderer-source assertions

## 2. Verification
- [x] 2.1 `cd mobile && npx tsc --noEmit` clean; eslint clean on changed files
- [x] 2.2 `npm run test:explore-memory`, `test:explore-prompt-audio`, `test:explore-variety-buckets` green
- [x] 2.3 `cd kido-server && npx jest src/modules/explore` green
- [x] 2.4 `openspec validate polish-explore-round-3-feel --strict`
- [x] 2.5 Verify on the iOS Simulator: flip; reduced-motion path
